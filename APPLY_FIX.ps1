$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$files = @(
  'src\App.tsx',
  'src\ai\stabilizer.ts',
  'src\ai\usePoseCamera.ts'
)
if (-not (Test-Path (Join-Path $root 'package.json'))) {
  throw 'Khong tim thay package.json. Hay giai nen ban va vao THU MUC GOC cua du an.'
}
foreach ($rel in $files) {
  $dest = Join-Path $root $rel
  $src = Join-Path $root (Join-Path 'fix_files' $rel)
  if (-not (Test-Path $dest)) { throw "Thieu file du an: $dest" }
  if (-not (Test-Path $src)) { throw "Thieu file ban va: $src" }
  $backup = "$dest.bak_$timestamp"
  Copy-Item -LiteralPath $dest -Destination $backup -Force
  Copy-Item -LiteralPath $src -Destination $dest -Force
  Write-Host "OK: $rel (backup: $backup)"
}
Write-Host ''
Write-Host 'Da cai ban va 0.1.2. Tiep theo chay npm.cmd run build va npm.cmd run dev.'
