import { NextRequest, NextResponse } from "next/server";
import { auth, hashPassword } from "@/lib/auth";
import { gsheet } from "@/lib/gsheet";

// GET — list all admins (names + emails only, no hashes)
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const raw = await gsheet.call("admin_list") as Array<Record<string, string>> | null;
    if (!raw || !Array.isArray(raw)) return NextResponse.json([]);
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

  const body = await req.json();
  const { action } = body;

  // ── Add new admin ───────────────────────────────────────────────────────────
  if (action === "add") {
    const { name, email, password, role = "admin" } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ error: "name, email, dan password wajib diisi" }, { status: 400 });
    }
    const passwordHash = hashPassword(password);
    const result = await gsheet.call("admin_create", { name, email, passwordHash, role });
    return NextResponse.json(result);
  }

  // ── Change own password ─────────────────────────────────────────────────────
  if (action === "change_password") {
    const { id, newPassword } = body;
    if (!id || !newPassword) {
      return NextResponse.json({ error: "id dan newPassword wajib diisi" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    const passwordHash = hashPassword(newPassword);
    const result = await gsheet.call("admin_update_password", { id, passwordHash });
    return NextResponse.json(result);
  }

  // ── Update name/email ───────────────────────────────────────────────────────
  if (action === "update") {
    const { id, name, email } = body;
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    const result = await gsheet.call("admin_update", { id, name, email });
    return NextResponse.json(result);
  }

  // ── Delete admin ────────────────────────────────────────────────────────────
  if (action === "delete") {
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    const result = await gsheet.call("admin_delete", { id });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

