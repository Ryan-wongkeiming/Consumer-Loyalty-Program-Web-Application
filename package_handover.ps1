# ============================================================
# CareHub — package a clean handover zip
# ============================================================
# Run this from the PROJECT ROOT (PowerShell):
#   .\package_handover.ps1
#
# Creates: ..\carehub_handover_<date>.zip
# (next to the project folder, so it is never inside the zip)
#
# Excludes: node_modules, .env (SECRETS), .git, build artifacts,
#           logs, and other generated files.
# Includes: the handover/ folder (HANDOVER.md, DEPLOY.md).
# ============================================================

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$stamp = Get-Date -Format "yyyyMMdd_HHmm"
$zipName = "carehub_handover_$stamp.zip"
$zipPath = Join-Path (Split-Path -Parent $root) $zipName

Write-Host "Packaging CareHub handover -> $zipPath"

# Build the file list, excluding junk and secrets
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
    $rel = $_.FullName.Substring($root.Length + 1)
    $exclude = $false

    # Exclude directories / patterns
    if ($rel -match '^node_modules[\\/]') { $exclude = $true }
    if ($rel -match '^\.git[\\/]') { $exclude = $true }
    if ($rel -match '^dist[\\/]') { $exclude = $true }
    if ($rel -match '^\.vite[\\/]') { $exclude = $true }
    if ($rel -eq '.env') { $exclude = $true }          # SECRET — never ship
    if ($rel -match '\.tsbuildinfo$') { $exclude = $true }
    if ($rel -match '\.log$') { $exclude = $true }
    if ($rel -match '\.zip$') { $exclude = $true }

    -not $exclude
}

if (-not $files) {
    Write-Error "No files to package."
}

# Create the zip (compressed)
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) "carehub_pack_$PID"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy preserving the root folder name inside the zip
$baseName = Split-Path -Parent $root | Split-Path -Leaf
$destRoot = Join-Path $tempDir $baseName
New-Item -ItemType Directory -Path $destRoot | Out-Null

foreach ($f in $files) {
    $rel = $f.FullName.Substring($root.Length + 1)
    $dest = Join-Path $destRoot $rel
    New-Item -ItemType Directory -Path (Split-Path -Parent $dest) -Force | Out-Null
    Copy-Item $f.FullName $dest -Force
}

Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $zipPath -CompressionLevel Optimal

Remove-Item $tempDir -Recurse -Force

$sizeKB = [Math]::Round((Get-Item $zipPath).Length / 1KB)
$count = $files.Count
Write-Host "Done: $count files -> $zipPath ($sizeKB KB)"
Write-Host ""
Write-Host "NOTE: client must create their OWN Supabase project and run"
Write-Host "rebuild_all.sql there (see handover/HANDOVER.md section 5)."