# ============================================================
# inject-env.ps1 - Setup Upstash Redis untuk drg. Bunga App
# Jalankan dari PowerShell: .\scripts\inject-env.ps1
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  drg. Bunga - Setup Upstash Redis & Vercel Env Vars" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "LANGKAH 1: Buat Upstash Redis Database Gratis" -ForegroundColor Yellow
Write-Host "  1. Buka: https://console.upstash.com" -ForegroundColor White
Write-Host "  2. Login/Sign Up (gratis, tanpa kartu kredit)" -ForegroundColor White
Write-Host "  3. Klik [+ Create Database]" -ForegroundColor White
Write-Host "  4. Name: dental-bunga-redis" -ForegroundColor White
Write-Host "  5. Type: Regional | Region: AP-Southeast-1 (Singapore)" -ForegroundColor White
Write-Host "  6. Klik [Create]" -ForegroundColor White
Write-Host "  7. Buka database -> scroll ke bagian REST API" -ForegroundColor White
Write-Host "  8. Copy UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN" -ForegroundColor White
Write-Host ""

$UPSTASH_URL   = Read-Host "Paste UPSTASH_REDIS_REST_URL"
$UPSTASH_TOKEN = Read-Host "Paste UPSTASH_REDIS_REST_TOKEN"

if (-not $UPSTASH_URL.StartsWith("https://") -or -not $UPSTASH_TOKEN) {
    Write-Host "ERROR: URL atau token tidak valid!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "LANGKAH 2: Test koneksi Redis..." -ForegroundColor Yellow

try {
    $headers = @{ "Authorization" = "Bearer $UPSTASH_TOKEN" }
    $resp = Invoke-RestMethod -Uri "$UPSTASH_URL/ping" -Headers $headers -Method GET
    if ($resp.result -eq "PONG") {
        Write-Host "  Koneksi Redis berhasil! (PONG)" -ForegroundColor Green
    } else {
        Write-Host "  Redis tidak merespons dengan benar: $($resp | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "  GAGAL koneksi ke Redis: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Generate NEXTAUTH_SECRET
$NEXTAUTH_SECRET = -join ((48..57) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

Write-Host ""
Write-Host "LANGKAH 3: Update .env.local..." -ForegroundColor Yellow

$envContent = @"
# Created by inject-env.ps1
ADMIN_EMAIL="bunga@dentist.com"
ADMIN_PASSWORD="admin123"
UPSTASH_REDIS_REST_URL="$UPSTASH_URL"
UPSTASH_REDIS_REST_TOKEN="$UPSTASH_TOKEN"
KV_REST_API_URL="$UPSTASH_URL"
KV_REST_API_TOKEN="$UPSTASH_TOKEN"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="http://localhost:3001"
"@

Set-Content -Path "$PSScriptRoot\..\\.env.local" -Value $envContent -Encoding UTF8
Write-Host "  .env.local diperbarui!" -ForegroundColor Green

Write-Host ""
Write-Host "LANGKAH 4: Set Vercel environment variables..." -ForegroundColor Yellow

# Make sure project is linked
Set-Location "$PSScriptRoot\.."
npx vercel link --project dental-appointment-bunga --yes 2>&1 | Out-Null

$envVars = @{
    "UPSTASH_REDIS_REST_URL"   = $UPSTASH_URL
    "UPSTASH_REDIS_REST_TOKEN" = $UPSTASH_TOKEN
    "KV_REST_API_URL"          = $UPSTASH_URL
    "KV_REST_API_TOKEN"        = $UPSTASH_TOKEN
    "NEXTAUTH_SECRET"          = $NEXTAUTH_SECRET
    "ADMIN_EMAIL"              = "bunga@dentist.com"
    "ADMIN_PASSWORD"           = "admin123"
}

foreach ($key in $envVars.Keys) {
    $val = $envVars[$key]
    # Remove old values first (ignore errors)
    npx vercel env rm $key production --yes 2>&1 | Out-Null
    npx vercel env rm $key preview --yes 2>&1 | Out-Null
    npx vercel env rm $key development --yes 2>&1 | Out-Null
    # Add to all environments
    $val | npx vercel env add $key production preview development 2>&1 | Out-Null
    Write-Host "  Set: $key" -ForegroundColor Green
}

# Set NEXTAUTH_URL for production
Write-Host ""
$PROD_URL = Read-Host "Masukkan URL Vercel kamu (contoh: https://dental-appointment-bunga.vercel.app)"
if ($PROD_URL.StartsWith("https://")) {
    $PROD_URL | npx vercel env add NEXTAUTH_URL production 2>&1 | Out-Null
    "http://localhost:3001" | npx vercel env add NEXTAUTH_URL development 2>&1 | Out-Null
    "http://localhost:3001" | npx vercel env add NEXTAUTH_URL preview 2>&1 | Out-Null
    Write-Host "  NEXTAUTH_URL set!" -ForegroundColor Green
}

Write-Host ""
Write-Host "LANGKAH 5: Deploy ke Vercel..." -ForegroundColor Yellow
npx vercel --prod --yes

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SELESAI! Setup database Redis berhasil." -ForegroundColor Green
Write-Host "  Setelah deploy, buka /api/seed untuk isi data awal." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

