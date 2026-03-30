import {
  SymptomAnalysisInput,
  SymptomAnalysisResult,
  symptomAnalysisResultSchema,
  validateSchemaSync,
} from "@/lib/validators";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export class AiProviderError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "AiProviderError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function buildDentalPrompt(input: SymptomAnalysisInput) {
  return [
    "Anda adalah AI triage gejala gigi untuk klinik dokter gigi.",
    "Tugas Anda hanya melakukan edukasi awal dan triage, bukan diagnosis final.",
    "Jangan pernah menyatakan kepastian diagnosis.",
    "Utamakan keselamatan pasien dan eskalasi jika ada tanda bahaya.",
    "Jawaban HARUS valid JSON tanpa markdown, tanpa backticks, tanpa teks lain.",
    "Gunakan Bahasa Indonesia yang ringkas dan mudah dipahami.",
    "Nilai urgency hanya boleh salah satu dari: darurat, segera, terjadwal, observasi.",
    "Jika ada pembengkakan besar, demam, kesulitan menelan, sulit membuka mulut, trauma berat, atau nanah, pertimbangkan urgency lebih tinggi.",
    "Sertakan disclaimer yang menegaskan ini bukan diagnosis dan tetap perlu pemeriksaan dokter gigi.",
    "Format JSON:",
    JSON.stringify({
      summary: "string",
      urgency: "darurat | segera | terjadwal | observasi",
      recommendedAction: "string",
      possibleConditions: [{ name: "string", reason: "string" }],
      selfCare: ["string"],
      redFlags: ["string"],
      followUpQuestions: ["string"],
      bookingSuggestion: "string",
      disclaimer: "string",
    }),
    "Data pasien:",
    JSON.stringify(input),
  ].join("\n");
}

function stripJsonFences(value: string) {
  return value.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function normalizeResultShape(payload: unknown) {
  if (!payload || typeof payload !== "object") return payload;

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.redFlags)) {
    record.redFlags = record.redFlags.slice(0, 6);
  }

  if (Array.isArray(record.followUpQuestions)) {
    record.followUpQuestions = record.followUpQuestions.slice(0, 5);
  }

  if (Array.isArray(record.selfCare)) {
    record.selfCare = record.selfCare.slice(0, 6);
  }

  if (Array.isArray(record.possibleConditions)) {
    record.possibleConditions = record.possibleConditions.slice(0, 4);
  }

  return record;
}

function buildFallbackAnalysis(input: SymptomAnalysisInput): SymptomAnalysisResult {
  const urgentSignals = [
    input.hasSwelling,
    input.hasFever,
    input.hasDifficultyOpeningMouth,
    input.hasDifficultySwallowing,
    input.hasPus,
    input.hasTrauma,
  ].filter(Boolean).length;

  const urgency: SymptomAnalysisResult["urgency"] =
    input.hasDifficultySwallowing || input.hasDifficultyOpeningMouth
      ? "darurat"
      : input.hasSwelling || input.hasFever || input.hasPus || input.hasTrauma || input.painScale >= 8
        ? "segera"
        : input.painScale >= 4 || input.hasBleeding || input.hasToothSensitivity
          ? "terjadwal"
          : "observasi";

  const conditionPool = [
    {
      when: input.hasToothSensitivity || input.painScale >= 4,
      item: {
        name: "Karies atau iritasi pulpa",
        reason: "Ada nyeri atau ngilu yang sering berkaitan dengan gigi berlubang atau iritasi pada saraf gigi.",
      },
    },
    {
      when: input.hasSwelling || input.hasPus || input.hasFever,
      item: {
        name: "Infeksi gigi atau abses dental",
        reason: "Bengkak, nanah, atau demam bisa mengarah ke infeksi yang memerlukan evaluasi dokter gigi lebih cepat.",
      },
    },
    {
      when: input.hasBleeding || input.hasBadBreath,
      item: {
        name: "Radang gusi atau masalah periodontal",
        reason: "Perdarahan gusi dan bau mulut sering muncul pada peradangan gusi atau jaringan penyangga gigi.",
      },
    },
    {
      when: input.hasTrauma,
      item: {
        name: "Cedera gigi atau jaringan mulut",
        reason: "Benturan atau trauma dapat menyebabkan retak gigi, goyang, atau cedera jaringan sekitar.",
      },
    },
  ].filter((entry) => entry.when).map((entry) => entry.item);

  const possibleConditions = conditionPool.length > 0
    ? conditionPool.slice(0, 4)
    : [{
        name: "Masalah gigi atau gusi yang perlu evaluasi",
        reason: "Keluhan yang Anda isi tetap perlu diperiksa langsung untuk memastikan sumber nyerinya.",
      }];

  const redFlags = [
    input.hasDifficultySwallowing ? "Sulit menelan atau napas terasa terganggu." : null,
    input.hasDifficultyOpeningMouth ? "Sulit membuka mulut secara normal." : null,
    input.hasSwelling ? "Bengkak pada wajah, gusi, atau rahang." : null,
    input.hasFever ? "Demam yang menyertai nyeri gigi." : null,
    input.hasPus ? "Ada nanah atau cairan berbau dari gusi." : null,
    input.hasTrauma ? "Riwayat benturan atau trauma pada gigi atau mulut." : null,
  ].filter((item): item is string => Boolean(item)).slice(0, 6);

  const followUpQuestions = [
    "Apakah nyeri muncul sendiri atau hanya saat makan dan minum?",
    "Apakah gigi terasa ngilu terhadap dingin, panas, atau manis?",
    "Apakah ada pembengkakan yang membesar sejak awal keluhan?",
    "Apakah nyeri sampai mengganggu tidur atau aktivitas sehari-hari?",
    "Apakah ada riwayat tambalan, gigi patah, atau perawatan sebelumnya pada gigi yang sama?",
  ].slice(0, 5);

  const selfCare = [
    "Jaga area mulut tetap bersih dan sikat gigi dengan lembut.",
    "Hindari makanan terlalu keras, terlalu panas, terlalu dingin, atau terlalu manis.",
    "Berkumur air garam hangat bila gusi terasa tidak nyaman.",
    "Jangan menempelkan obat atau bahan keras langsung ke gigi atau gusi.",
    urgentSignals > 0 ? "Segera cari pemeriksaan dokter gigi bila gejala bertambah berat." : "Pantau gejala dan lakukan booking jika keluhan tidak membaik.",
  ].slice(0, 6);

  const recommendedAction =
    urgency === "darurat"
      ? "Segera periksa ke dokter gigi atau fasilitas kesehatan hari ini, terutama bila bengkak mengganggu menelan, membuka mulut, atau napas."
      : urgency === "segera"
        ? "Disarankan periksa ke dokter gigi secepatnya dalam waktu dekat, idealnya hari ini atau besok."
        : urgency === "terjadwal"
          ? "Buat janji pemeriksaan dokter gigi terjadwal untuk evaluasi dan penanganan lebih lanjut."
          : "Pantau gejala, jaga kebersihan mulut, dan lakukan pemeriksaan bila keluhan menetap atau memburuk.";

  const bookingSuggestion =
    urgency === "darurat" || urgency === "segera"
      ? "Sebaiknya lakukan booking pemeriksaan sesegera mungkin atau datang langsung bila gejala memburuk cepat."
      : "Anda dapat melanjutkan ke halaman booking untuk memilih jadwal pemeriksaan yang tersedia.";

  return {
    summary: `Analisa awal menunjukkan keluhan Anda perlu diperlakukan sebagai ${urgency}. Hasil ini adalah triage dasar berbasis aturan saat AI utama tidak memberikan respons yang valid.`,
    urgency,
    recommendedAction,
    possibleConditions,
    selfCare,
    redFlags: redFlags.length > 0 ? redFlags : ["Segera periksa bila nyeri memburuk, muncul bengkak, demam, atau sulit menelan."],
    followUpQuestions,
    bookingSuggestion,
    disclaimer:
      "Ini hanya triage awal berbasis aturan dan bukan diagnosis final. Pemeriksaan langsung oleh dokter gigi tetap diperlukan untuk memastikan kondisi dan penanganan yang tepat.",
  };
}

function extractRetryAfterSeconds(response: Response, payload: unknown) {
  const header = response.headers.get("retry-after");
  if (header) {
    const parsed = Number(header);
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (!payload || typeof payload !== "object") return undefined;
  const error = (payload as { error?: { message?: string } }).error;
  const message = error?.message;
  if (!message) return undefined;

  const match = message.match(/retry in\s+([\d.]+)s/i);
  return match ? Math.ceil(Number(match[1])) : undefined;
}

function formatProviderError(response: Response, payload: unknown, model: string) {
  const status = response.status;
  const fallback = `Groq request gagal dengan status ${status}.`;
  const message = payload && typeof payload === "object"
    ? (payload as { error?: { message?: string } }).error?.message?.trim()
    : undefined;
  const retryAfterSeconds = extractRetryAfterSeconds(response, payload);

  if (status === 429) {
    return new AiProviderError(
      retryAfterSeconds
        ? `Kuota atau rate limit Groq untuk model ${model} sedang terlampaui. Coba lagi dalam sekitar ${retryAfterSeconds} detik.`
        : `Kuota atau rate limit Groq untuk model ${model} sedang terlampaui. Periksa usage dan billing Groq Anda.`,
      status,
      retryAfterSeconds,
    );
  }

  if (status === 401 || status === 403) {
    return new AiProviderError(
      "GROQ_API_KEY tidak valid atau tidak punya akses ke model yang dipilih.",
      status,
    );
  }

  return new AiProviderError(message || fallback, status, retryAfterSeconds);
}

export async function analyzeDentalSymptoms(input: SymptomAnalysisInput) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  if (!apiKey) {
    return buildFallbackAnalysis(input);
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "Anda adalah AI triage gejala gigi yang hanya memberi edukasi awal dan prioritas tindakan, bukan diagnosis final.",
          },
          {
            role: "user",
            content: buildDentalPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      let payload: unknown;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      const providerError = formatProviderError(response, payload, model);
      void providerError;
      return buildFallbackAnalysis(input);
    }

    const payload = await response.json();
    const text = payload?.choices?.[0]?.message?.content;

    if (!text || typeof text !== "string") {
      return buildFallbackAnalysis(input);
    }

    try {
      const parsed = JSON.parse(stripJsonFences(text));
      const normalized = normalizeResultShape(parsed);
      const validated = validateSchemaSync(symptomAnalysisResultSchema, normalized);
      return validated.success ? validated.data : buildFallbackAnalysis(input);
    } catch {
      return buildFallbackAnalysis(input);
    }
  } catch {
    return buildFallbackAnalysis(input);
  }
}
