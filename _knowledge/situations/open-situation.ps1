param(
  [Parameter(Mandatory=$true)][string]$Situation,
  [string]$Snapshot = "",
  [switch]$PrepareOnly
)
$ErrorActionPreference = "Stop"
function FileHash([string]$file) {
  $stream = [System.IO.File]::OpenRead($file)
  $algorithm = [System.Security.Cryptography.SHA256]::Create()
  try { return ([System.BitConverter]::ToString($algorithm.ComputeHash($stream))).Replace("-", "").ToLower() }
  finally { $stream.Dispose(); $algorithm.Dispose() }
}
try {
  $catalog = [System.IO.Path]::GetFullPath($PSScriptRoot)
  $situationDir = (Resolve-Path -LiteralPath (Join-Path $catalog $Situation)).Path
  if (-not $situationDir.StartsWith($catalog + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Situation must be inside this catalog." }
  $manifest = Get-Content -LiteralPath (Join-Path $situationDir "manifest.json") -Raw | ConvertFrom-Json
  if (-not $Snapshot) { $Snapshot = $manifest.defaultSnapshot }
  $entry = $manifest.snapshots.PSObject.Properties[$Snapshot].Value
  if (-not $entry) { throw "Unknown snapshot: $Snapshot" }
  $snapshotFile = Join-Path $situationDir $entry.file
  if ((FileHash $snapshotFile) -ne $entry.sha256) { throw "Snapshot checksum mismatch." }
  $buildZip = [System.IO.Path]::GetFullPath((Join-Path $situationDir $manifest.build.archive))
  if ((FileHash $buildZip) -ne $manifest.build.sha256) { throw "Preserved build checksum mismatch." }
  $cache = Join-Path $catalog ("_cache/" + $manifest.build.package + "-" + $manifest.build.sha256.Substring(0,12))
  $marker = Join-Path $cache "READY"
  if (-not (Test-Path -LiteralPath $marker)) {
    # Unique extraction path avoids overwriting an incomplete or running build.
    if (Test-Path -LiteralPath $cache) { $cache += "-" + [guid]::NewGuid().ToString("N") }
    New-Item -ItemType Directory -Path $cache -Force | Out-Null
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($buildZip, $cache)
    [System.IO.File]::WriteAllText((Join-Path $cache "READY"), $manifest.build.sha256)
  }
  $appDir = Join-Path $cache "Astrata"
  $exe = Join-Path $appDir "Astrata.exe"
  if (-not (Test-Path -LiteralPath $exe)) { throw "Preserved executable missing." }
  $sessionId = [guid]::NewGuid().ToString()
  $profile = Join-Path $catalog ("_sessions/" + $manifest.id + "/" + $Snapshot + "/" + $sessionId)
  New-Item -ItemType Directory -Path $profile -Force | Out-Null
  $save = Get-Content -LiteralPath $snapshotFile -Raw | ConvertFrom-Json
  $save | Add-Member -NotePropertyName history -NotePropertyValue @() -Force
  $save | Add-Member -NotePropertyName log -NotePropertyValue @() -Force
  $save | Add-Member -NotePropertyName uiMeta -NotePropertyValue @{runId=$sessionId;elapsed=0} -Force
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Join-Path $profile "save.json"), ($save | ConvertTo-Json -Depth 100), $utf8)
  [System.IO.File]::WriteAllText((Join-Path $profile "settings.json"), '{"width":1440,"fast":false,"fullscreen":false}', $utf8)
  $origin = @{situation=$manifest.id;snapshot=$Snapshot;sourceRun=$manifest.runId;seed=$manifest.seed;build=$manifest.build.package;createdAt=[DateTime]::UtcNow.ToString("o")}
  [System.IO.File]::WriteAllText((Join-Path $profile "puzzle-origin.json"), ($origin | ConvertTo-Json), $utf8)
  $prepared = @{executable=$exe;workingDirectory=$appDir;profile=$profile;snapshot=$Snapshot;sessionId=$sessionId}
  if ($PrepareOnly) { $prepared | ConvertTo-Json -Compress; exit 0 }
  Write-Host "Opening $($manifest.title): $Snapshot. Choose Continue."
  Write-Host "Practice session: $profile"
  Start-Process -FilePath $exe -ArgumentList @("--user-data-dir=" + '"' + $profile + '"') -WorkingDirectory $appDir -WindowStyle Normal
} catch {
  Write-Error $_
  exit 1
}
