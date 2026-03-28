/**
 * SATUSEHAT API Integration Library
 * 
 * Handles OAuth2 authentication and Patient resource queries
 * following the MPI (Master Patient Index) REST API specification.
 * 
 * Docs: https://satusehat.kemkes.go.id/platform/docs/id/master-data/master-patient-index/rest-api-mpi/
 */

// ── Config ────────────────────────────────────────────────────────────────────
const SATUSEHAT_AUTH_URL = process.env.SATUSEHAT_AUTH_URL || "https://api-satusehat-stg.dto.kemkes.go.id/oauth2/v1";
const SATUSEHAT_FHIR_URL = process.env.SATUSEHAT_FHIR_URL || "https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1";
const CLIENT_ID = process.env.SATUSEHAT_CLIENT_ID || "";
const CLIENT_SECRET = process.env.SATUSEHAT_CLIENT_SECRET || "";

// ── Token cache (in-memory, server-side) ──────────────────────────────────────
let cachedToken: string | null = null;
let tokenExpiresAt = 0; // epoch ms

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SatuSehatTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: string;
  issued_at: string;
  status: string;
}

export interface PatientIdentifier {
  system: string;
  use: string;
  value: string;
}

export interface PatientName {
  text: string;
  use: string;
}

export interface PatientResource {
  resourceType: "Patient";
  id: string;
  active?: boolean;
  identifier?: PatientIdentifier[];
  name?: PatientName[];
  gender?: string;
  birthDate?: string;
  address?: Array<{
    use?: string;
    line?: string[];
    city?: string;
    postalCode?: string;
    country?: string;
    extension?: Array<{
      url: string;
      valueCode?: string;
      extension?: Array<{
        url: string;
        valueCode?: string;
      }>;
    }>;
  }>;
  telecom?: Array<{
    system: string;
    value: string;
    use?: string;
  }>;
  maritalStatus?: {
    coding?: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  multipleBirthInteger?: number;
  meta?: {
    lastUpdated: string;
    versionId: string;
    profile?: string[];
  };
  deceasedBoolean?: boolean;
  extension?: Array<{
    url: string;
    valueCode?: string;
    valueString?: string;
  }>;
  communication?: Array<{
    language: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    preferred?: boolean;
  }>;
}

export interface PatientSearchBundle {
  resourceType: "Bundle";
  type: "searchset";
  total: number;
  entry?: Array<{
    fullUrl: string;
    resource: PatientResource;
  }>;
}

export interface SatuSehatError {
  resourceType: "OperationOutcome";
  issue: Array<{
    severity: string;
    code: string;
    details?: {
      text: string;
    };
  }>;
}

// ── Get Access Token ──────────────────────────────────────────────────────────
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("SATUSEHAT_CLIENT_ID dan SATUSEHAT_CLIENT_SECRET belum dikonfigurasi");
  }

  const url = `${SATUSEHAT_AUTH_URL}/accesstoken?grant_type=client_credentials`;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMsg = errorData?.issue?.[0]?.details?.text || response.statusText;
    throw new Error(`Gagal mendapatkan token SATUSEHAT: ${errorMsg}`);
  }

  const data: SatuSehatTokenResponse = await response.json();

  // Cache the token
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + parseInt(data.expires_in) * 1000;

  return data.access_token;
}

// ── Search Patient by NIK ──────────────────────────────────────────────────────
export async function searchPatientByNIK(nik: string): Promise<PatientSearchBundle> {
  const token = await getAccessToken();

  const identifier = `https://fhir.kemkes.go.id/id/nik|${nik}`;
  const url = `${SATUSEHAT_FHIR_URL}/Patient?identifier=${encodeURIComponent(identifier)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.issue?.[0]?.details?.text ||
      `Gagal mencari pasien: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ── Search Patient by Name, Birthdate, Gender ──────────────────────────────────
export async function searchPatientByNameDOBGender(
  name: string,
  birthdate: string,
  gender: "male" | "female"
): Promise<PatientSearchBundle> {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    name,
    birthdate,
    gender,
  });

  const url = `${SATUSEHAT_FHIR_URL}/Patient?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.issue?.[0]?.details?.text ||
      `Gagal mencari pasien: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ── Get Patient Detail by IHS Number (Patient ID) ─────────────────────────────
export async function getPatientDetail(patientId: string): Promise<PatientResource> {
  const token = await getAccessToken();

  const url = `${SATUSEHAT_FHIR_URL}/Patient/${patientId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.issue?.[0]?.details?.text ||
      `Gagal mengambil detail pasien: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// ── Helper: Extract readable info from Patient resource ──────────────────────
export function extractPatientInfo(patient: PatientResource) {
  const nik = patient.identifier?.find(
    (id) => id.system === "https://fhir.kemkes.go.id/id/nik"
  )?.value;

  const ihsNumber = patient.identifier?.find(
    (id) => id.system === "https://fhir.kemkes.go.id/id/ihs-number"
  )?.value;

  const name = patient.name?.[0]?.text || "Tidak Diketahui";

  const gender = patient.gender === "male" ? "Laki-laki" : 
                 patient.gender === "female" ? "Perempuan" : 
                 patient.gender || "Tidak Diketahui";

  const birthDate = patient.birthDate || null;

  const address = patient.address?.[0];
  const addressText = address
    ? [address.line?.join(", "), address.city, address.postalCode, address.country]
        .filter(Boolean)
        .join(", ")
    : null;

  const phone = patient.telecom?.find((t) => t.system === "phone")?.value || null;
  const email = patient.telecom?.find((t) => t.system === "email")?.value || null;

  const maritalStatus = patient.maritalStatus?.text || 
                        patient.maritalStatus?.coding?.[0]?.display || null;

  return {
    id: patient.id,
    nik,
    ihsNumber,
    name,
    gender,
    birthDate,
    addressText,
    phone,
    email,
    maritalStatus,
    active: patient.active ?? null,
    lastUpdated: patient.meta?.lastUpdated || null,
  };
}
