# ============================================================
#  deploy.ps1  -  Push perubahan ke GitHub dengan satu perintah
#  Cara pakai:
#    .\deploy.ps1                          -> pesan otomatis (timestamp)
#    .\deploy.ps1 "fix: perbaiki loading"  -> pesan custom
# ============================================================

param(
    [string]$Message = ""
)

# Pesan commit default pakai timestamp WIB
if ($Message -eq "") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $Message = "chore: update $timestamp"
}

Write-Host ""
Write-Host "=== DEPLOY KE GITHUB ===" -ForegroundColor Cyan
Write-Host "Pesan commit: $Message" -ForegroundColor Yellow
Write-Host ""

# Cek ada perubahan atau tidak
$status = git status --porcelain
if (-not $status) {
    Write-Host "Tidak ada perubahan untuk di-commit." -ForegroundColor Green
    exit 0
}

Write-Host "File yang berubah:" -ForegroundColor White
git status --short
Write-Host ""

# Stage semua perubahan
git add -A
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: git add gagal." -ForegroundColor Red; exit 1 }

# Commit
git commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: git commit gagal." -ForegroundColor Red; exit 1 }

# Push
Write-Host ""
Write-Host "Mendorong ke GitHub..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: git push gagal." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "BERHASIL! Perubahan sudah tersimpan di GitHub." -ForegroundColor Green
Write-Host "Repo: https://github.com/aliefneutron/realisasi_anggaran" -ForegroundColor Cyan
Write-Host ""
