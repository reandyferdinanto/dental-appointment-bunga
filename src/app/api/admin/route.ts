import { NextRequest, NextResponse } from "next/server";
import { auth, hashPassword } from "@/lib/auth";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { gsheet } from "@/lib/gsheet";

function getSessionRole(session: Awaited<ReturnType<typeof auth>>) {
  return (session?.user as { role?: string } | undefined)?.role;
}

// GET — list all admins (names + emails only, no hashes) from MongoDB
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (getSessionRole(session) !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const db = await getDb();
    const raw = await db.collection(COLLECTIONS.admins).find({}).toArray();
    // Strip password hashes before returning
    const safe = raw.map(a => ({ id: a.id, name: a.name, email: a.email, role: a.role, createdAt: a.createdAt }));
    return NextResponse.json(safe);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST — create admin, update password, or delete
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = getSessionRole(session);
  const currentUserId = (session.user as { id?: string } | undefined)?.id ?? "";

  const body = await req.json();
  const { action } = body;

  const db = await getDb();

  // ── Add new admin ───────────────────────────────────────────────────────────
  if (action === "add") {
    if (role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { name, email, password, role = "admin" } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, dan password wajib diisi" }, { status: 400 });
    }
    const passwordHash = hashPassword(password);
    const { v4: uuidv4 } = await import("uuid");
    const admin = { id: uuidv4(), name, email, passwordHash, role, createdAt: new Date().toISOString() };

    await db.collection(COLLECTIONS.admins).insertOne({ ...admin, _id: admin.id as unknown as import("mongodb").ObjectId });

    // Backup to GSheet
    gsheet.call("admin_create", { name, email, passwordHash, role }).catch(err => {
      console.error("[admin] GSheet backup error:", err);
    });

    return NextResponse.json({ id: admin.id, name, email, role });
  }

  // ── Change own password ─────────────────────────────────────────────────────
  if (action === "change_password") {
    const { id, newPassword } = body;
    if (!id || !newPassword) {
      return NextResponse.json({ error: "id dan newPassword wajib diisi" }, { status: 400 });
    }
    if (role !== "superadmin" && id !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    const passwordHash = hashPassword(newPassword);
    await db.collection(COLLECTIONS.admins).updateOne({ id }, { $set: { passwordHash } });

    // Backup to GSheet
    gsheet.call("admin_update_password", { id, passwordHash }).catch(err => {
      console.error("[admin] GSheet backup error:", err);
    });

    return NextResponse.json({ success: true });
  }

  // ── Update name/email ───────────────────────────────────────────────────────
  if (action === "update") {
    if (role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id, name, email } = body;
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    const updateData: Record<string, string> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    await db.collection(COLLECTIONS.admins).updateOne({ id }, { $set: updateData });

    // Backup to GSheet
    gsheet.call("admin_update", { id, name, email }).catch(err => {
      console.error("[admin] GSheet backup error:", err);
    });

    return NextResponse.json({ success: true });
  }

  // ── Delete admin ────────────────────────────────────────────────────────────
  if (action === "delete") {
    if (role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    await db.collection(COLLECTIONS.admins).deleteOne({ id });

    // Backup to GSheet
    gsheet.call("admin_delete", { id }).catch(err => {
      console.error("[admin] GSheet backup error:", err);
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
