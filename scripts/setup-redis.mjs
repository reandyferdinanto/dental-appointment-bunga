/**
 * setup-redis.mjs
 * Run: node scripts/setup-redis.mjs
 *
 * This script:
 * 1. Creates a free Upstash Redis database (Singapore region)
 * 2. Updates .env.local with real credentials
 * 3. Updates Vercel environment variables (all environments)
 * 4. Re-links and pulls updated env
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import * as readline from "readline";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ENV_PATH = path.join(ROOT, ".env.local");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

function colorLog(color, msg) {
  const colors = { green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", cyan: "\x1b[36m", reset: "\x1b[0m", bold: "\x1b[1m" };
  console.log(colors[color] + msg + colors.reset);
}

async function main() {
  console.log("\n" + "=".repeat(60));
  colorLog("bold", "  🦷 drg. Bunga — Upstash Redis Setup Script");
  console.log("=".repeat(60) + "\n");

  colorLog("cyan", "Langkah 1: Buat akun Upstash Redis gratis");
  colorLog("yellow", "  → Buka: https://console.upstash.com");
  colorLog("yellow", "  → Login / Sign Up (gratis, tidak perlu kartu kredit)");
  colorLog("yellow", "  → Klik '+ Create Database'");
  colorLog("yellow", "  → Name: dental-bunga-redis");
  colorLog("yellow", "  → Type: Regional  |  Region: AP-Southeast-1 (Singapore)");
  colorLog("yellow", "  → Klik 'Create'");
  colorLog("yellow", "  → Buka database yang baru dibuat → tab 'REST API'");
  console.log("");

  const upstashUrl   = (await ask("  Paste UPSTASH_REDIS_REST_URL   : ")).trim();
  const upstashToken = (await ask("  Paste UPSTASH_REDIS_REST_TOKEN : ")).trim();

  if (!upstashUrl.startsWith("https://") || !upstashToken) {
    colorLog("red", "\n❌ URL atau token tidak valid. Coba lagi.\n");
    process.exit(1);
  }

  console.log("");
  colorLog("cyan", "Langkah 2: Test koneksi ke Redis...");

  try {
    const res = await fetch(`${upstashUrl}/ping`, {
      headers: { Authorization: `Bearer ${upstashToken}` },
    });
    const data = await res.json();
    if (data.result === "PONG") {
      colorLog("green", "  ✅ Koneksi Redis berhasil!\n");
    } else {
      colorLog("red", "  ❌ Redis tidak merespons dengan benar: " + JSON.stringify(data));
      process.exit(1);
    }
  } catch (e) {
    colorLog("red", "  ❌ Gagal koneksi: " + e.message);
    process.exit(1);
  }

  colorLog("cyan", "Langkah 3: Update .env.local...");

  // Read current .env.local
  let envContent = "";
  try { envContent = readFileSync(ENV_PATH, "utf8"); } catch {}

  // Helper: set or replace a key in .env content
  function setEnvVar(content, key, value) {
    const regex = new RegExp(`^(#[^\n]*)?\n?${key}=.*$`, "m");
    const newLine = `${key}="${value}"`;
    if (regex.test(content)) {
      return content.replace(new RegExp(`^${key}=.*$`, "m"), newLine);
    }
    return content + `\n${newLine}`;
  }

  envContent = setEnvVar(envContent, "UPSTASH_REDIS_REST_URL",   upstashUrl);
  envContent = setEnvVar(envContent, "UPSTASH_REDIS_REST_TOKEN", upstashToken);
  envContent = setEnvVar(envContent, "KV_REST_API_URL",          upstashUrl);
  envContent = setEnvVar(envContent, "KV_REST_API_TOKEN",        upstashToken);

  // Fix NEXTAUTH_SECRET if still placeholder
  if (envContent.includes("your-secret-key-change-this")) {
    const secret = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 36).toString(36)
    ).join("");
    envContent = setEnvVar(envContent, "NEXTAUTH_SECRET", secret);
    colorLog("yellow", "  ⚠️  NEXTAUTH_SECRET di-generate otomatis: " + secret);
  }

  // Fix NEXTAUTH_URL placeholder
  if (envContent.includes("http://localhost:3000")) {
    envContent = envContent.replace(/NEXTAUTH_URL="http:\/\/localhost:3000"/, 'NEXTAUTH_URL="http://localhost:3001"');
  }

  writeFileSync(ENV_PATH, envContent, "utf8");
  colorLog("green", "  ✅ .env.local diperbarui!\n");

  colorLog("cyan", "Langkah 4: Update Vercel environment variables...");

  function vercelEnvSet(key, value) {
    try {
      // Remove existing (all envs)
      execSync(`npx vercel env rm ${key} production --yes 2>nul`, { cwd: ROOT, stdio: "ignore" });
      execSync(`npx vercel env rm ${key} preview --yes 2>nul`, { cwd: ROOT, stdio: "ignore" });
      execSync(`npx vercel env rm ${key} development --yes 2>nul`, { cwd: ROOT, stdio: "ignore" });
    } catch {}
    // Add to all environments
    try {
      const input = `${value}\n`;
      execSync(`npx vercel env add ${key} production preview development`, {
        cwd: ROOT,
        input: Buffer.from(input),
        stdio: ["pipe", "pipe", "pipe"],
      });
      colorLog("green", `  ✅ ${key} set`);
    } catch (e) {
      colorLog("red", `  ❌ Gagal set ${key}: ${e.message}`);
    }
  }

  vercelEnvSet("UPSTASH_REDIS_REST_URL",   upstashUrl);
  vercelEnvSet("UPSTASH_REDIS_REST_TOKEN", upstashToken);
  vercelEnvSet("KV_REST_API_URL",          upstashUrl);
  vercelEnvSet("KV_REST_API_TOKEN",        upstashToken);

  // Read current NEXTAUTH_SECRET from .env.local and set it
  const secretMatch = envContent.match(/NEXTAUTH_SECRET="([^"]+)"/);
  if (secretMatch) {
    vercelEnvSet("NEXTAUTH_SECRET", secretMatch[1]);
  }

  // Set production NEXTAUTH_URL
  console.log("");
  colorLog("cyan", "Langkah 5: Set NEXTAUTH_URL production...");
  const prodUrl = (await ask("  Masukkan URL Vercel production kamu\n  (contoh: https://dental-appointment-bunga.vercel.app)\n  URL: ")).trim();
  if (prodUrl.startsWith("https://")) {
    vercelEnvSet("NEXTAUTH_URL", prodUrl);
    // Also update local for reference
    envContent = setEnvVar(envContent, "NEXTAUTH_URL_PRODUCTION", prodUrl);
    writeFileSync(ENV_PATH, envContent, "utf8");
  } else {
    colorLog("yellow", "  ⚠️  Dilewati (URL tidak valid)");
  }

  console.log("");
  colorLog("cyan", "Langkah 6: Deploy ulang ke Vercel...");
  try {
    execSync("npx vercel --prod --yes", { cwd: ROOT, stdio: "inherit" });
    colorLog("green", "\n  ✅ Deploy berhasil!\n");
  } catch {
    colorLog("yellow", "  ⚠️  Deploy manual: jalankan 'npx vercel --prod'");
  }

  console.log("\n" + "=".repeat(60));
  colorLog("green", "  🎉 Setup selesai! Database Redis sudah terhubung.");
  colorLog("cyan", "  Setelah deploy, kunjungi /api/seed untuk mengisi data awal.");
  console.log("=".repeat(60) + "\n");

  rl.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

