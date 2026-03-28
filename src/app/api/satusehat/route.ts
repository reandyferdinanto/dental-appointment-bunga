import { NextRequest, NextResponse } from "next/server";
import {
  searchPatientByNIK,
  searchPatientByNameDOBGender,
  getPatientDetail,
  extractPatientInfo,
} from "@/lib/satusehat";

export const dynamic = "force-dynamic";

// GET /api/satusehat?type=nik&nik=XXXXXXX
// GET /api/satusehat?type=search&name=XXX&birthdate=YYYY-MM-DD&gender=male|female
// GET /api/satusehat?type=detail&patientId=XXXXXXX
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { error: "Parameter 'type' diperlukan (nik | search | detail)" },
        { status: 400 }
      );
    }

    // ── Search by NIK ────────────────────────────────────────────────────────
    if (type === "nik") {
      const nik = searchParams.get("nik");
      if (!nik) {
        return NextResponse.json(
          { error: "Parameter 'nik' diperlukan" },
          { status: 400 }
        );
      }

      // Validate NIK format (16 digits)
      if (!/^\d{16}$/.test(nik)) {
        return NextResponse.json(
          { error: "NIK harus berupa 16 digit angka" },
          { status: 400 }
        );
      }

      const bundle = await searchPatientByNIK(nik);
      const patients = bundle.entry?.map((e) => extractPatientInfo(e.resource)) || [];

      return NextResponse.json({
        total: bundle.total,
        patients,
        raw: bundle, // include raw FHIR bundle for debugging
      });
    }

    // ── Search by Name, Birthdate, Gender ───────────────────────────────────
    if (type === "search") {
      const name = searchParams.get("name");
      const birthdate = searchParams.get("birthdate");
      const gender = searchParams.get("gender") as "male" | "female" | null;

      if (!name || !birthdate || !gender) {
        return NextResponse.json(
          { error: "Parameter 'name', 'birthdate', dan 'gender' diperlukan" },
          { status: 400 }
        );
      }

      if (!["male", "female"].includes(gender)) {
        return NextResponse.json(
          { error: "Parameter 'gender' harus 'male' atau 'female'" },
          { status: 400 }
        );
      }

      const bundle = await searchPatientByNameDOBGender(name, birthdate, gender);
      const patients = bundle.entry?.map((e) => extractPatientInfo(e.resource)) || [];

      return NextResponse.json({
        total: bundle.total,
        patients,
        raw: bundle,
      });
    }

    // ── Get Patient Detail ──────────────────────────────────────────────────
    if (type === "detail") {
      const patientId = searchParams.get("patientId");
      if (!patientId) {
        return NextResponse.json(
          { error: "Parameter 'patientId' diperlukan" },
          { status: 400 }
        );
      }

      const patient = await getPatientDetail(patientId);
      const info = extractPatientInfo(patient);

      return NextResponse.json({
        patient: info,
        raw: patient,
      });
    }

    return NextResponse.json(
      { error: "Tipe pencarian tidak valid. Gunakan: nik | search | detail" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[SATUSEHAT API Error]:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Terjadi kesalahan pada server",
      },
      { status: 500 }
    );
  }
}
