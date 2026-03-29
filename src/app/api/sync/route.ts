/**
 * GET /api/sync
 *
 * One-time migration: copies all data from Google Sheets → MongoDB.
 * Safe to run multiple times — uses upsert so it won't duplicate data.
 *
 * Usage: visit /api/sync in the browser while logged in, or call it manually.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { gsheet } from "@/lib/gsheet";
import { getDb, COLLECTIONS } from "@/lib/mongodb";

export async function GET() {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (role !== "superadmin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const db = await getDb();
        const results: Record<string, unknown> = {};

        // 1. Sync appointments
        try {
            const appointments = await gsheet.call("apt_list") as Array<Record<string, unknown>> | null;
            if (appointments && Array.isArray(appointments) && appointments.length > 0) {
                let synced = 0;
                for (const apt of appointments) {
                    if (!apt.id) continue;
                    await db.collection(COLLECTIONS.appointments).updateOne(
                        { id: apt.id },
                        { $set: apt },
                        { upsert: true }
                    );
                    synced++;
                }
                results.appointments = { synced, total: appointments.length };
            } else {
                results.appointments = { synced: 0, message: "No data in GSheet" };
            }
        } catch (e) {
            results.appointments = { error: String(e) };
        }

        // 2. Sync logbook
        try {
            const logbook = await gsheet.call("log_list", { koasId: "bunga" }) as Array<Record<string, unknown>> | null;
            if (logbook && Array.isArray(logbook) && logbook.length > 0) {
                let synced = 0;
                for (const entry of logbook) {
                    if (!entry.id) continue;
                    await db.collection(COLLECTIONS.logbook).updateOne(
                        { id: entry.id },
                        { $set: entry },
                        { upsert: true }
                    );
                    synced++;
                }
                results.logbook = { synced, total: logbook.length };
            } else {
                results.logbook = { synced: 0, message: "No data in GSheet" };
            }
        } catch (e) {
            results.logbook = { error: String(e) };
        }

        // 3. Sync schedules (current + next 4 weeks)
        try {
            let scheduleSynced = 0;
            const today = new Date();
            for (let w = -1; w < 5; w++) {
                const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1 + (w * 7));
                const y = weekStart.getFullYear();
                const m = String(weekStart.getMonth() + 1).padStart(2, "0");
                const d = String(weekStart.getDate()).padStart(2, "0");
                const weekStr = `${y}-${m}-${d}`;

                const weekData = await gsheet.call("sch_get_week", { koasId: "bunga", weekStart: weekStr }) as Array<Record<string, unknown>> | null;
                if (weekData && Array.isArray(weekData)) {
                    for (const sch of weekData) {
                        if (!sch.date) continue;
                        const slots = Array.isArray(sch.slots) ? sch.slots : [];
                        if (slots.length === 0) continue;
                        await db.collection(COLLECTIONS.schedules).updateOne(
                            { koasId: "bunga", date: sch.date },
                            { $set: { koasId: "bunga", date: sch.date, slots } },
                            { upsert: true }
                        );
                        scheduleSynced++;
                    }
                }
            }
            results.schedules = { synced: scheduleSynced };
        } catch (e) {
            results.schedules = { error: String(e) };
        }

        // 4. Sync settings
        try {
            const settings = await gsheet.call("settings_get") as Record<string, unknown> | null;
            if (settings && typeof settings === "object" && !("error" in settings)) {
                await db.collection(COLLECTIONS.settings).updateOne(
                    { _id: "main" as unknown as import("mongodb").ObjectId },
                    { $set: settings },
                    { upsert: true }
                );
                results.settings = { synced: true };
            } else {
                results.settings = { synced: false, message: "No settings in GSheet" };
            }
        } catch (e) {
            results.settings = { error: String(e) };
        }

        // 5. Sync admins
        try {
            const admins = await gsheet.call("admin_list") as Array<Record<string, unknown>> | null;
            if (admins && Array.isArray(admins) && admins.length > 0) {
                let synced = 0;
                for (const admin of admins) {
                    if (!admin.id) continue;
                    await db.collection(COLLECTIONS.admins).updateOne(
                        { id: admin.id },
                        { $set: admin },
                        { upsert: true }
                    );
                    synced++;
                }
                results.admins = { synced, total: admins.length };
            } else {
                results.admins = { synced: 0, message: "No admins in GSheet" };
            }
        } catch (e) {
            results.admins = { error: String(e) };
        }

        return NextResponse.json({
            success: true,
            message: "Sync dari Google Sheets ke MongoDB selesai",
            results,
        });
    } catch (error) {
        console.error("[sync]", error);
        return NextResponse.json({ error: "Gagal sync data" }, { status: 500 });
    }
}
