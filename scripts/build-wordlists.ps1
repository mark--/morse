$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$enUrl = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/en/en_50k.txt'
$deUrl = 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt'

$enContent = (Invoke-WebRequest -Uri $enUrl -UseBasicParsing).Content
$deContent = (Invoke-WebRequest -Uri $deUrl -UseBasicParsing).Content

function ConvertTo-PlainWord([string]$w) {
  $x = $w.ToLower()
  $x = $x -replace 'ä','ae' -replace 'ö','oe' -replace 'ü','ue' -replace 'ß','ss'
  $x = $x -replace "[^a-z]", ''
  return $x.ToUpper()
}

function Get-TopWords([string]$content, [int]$target) {
  $set = New-Object 'System.Collections.Generic.HashSet[string]'
  $result = New-Object 'System.Collections.Generic.List[string]'

  foreach ($line in ($content -split "`n")) {
    $trim = $line.Trim()
    if ([string]::IsNullOrWhiteSpace($trim)) { continue }
    $parts = $trim -split '\s+'
    $w = ConvertTo-PlainWord $parts[0]
    if ($w.Length -lt 3 -or $w.Length -gt 8) { continue }
    if ($w -notmatch '^[A-Z]+$') { continue }
    if ($set.Add($w)) { [void]$result.Add($w) }
    if ($result.Count -ge $target) { break }
  }

  if ($result.Count -lt $target) {
    throw "Not enough words after filtering. Got $($result.Count), need $target"
  }

  return @($result | Select-Object -First $target)
}

$en = Get-TopWords -content $enContent -target 5000
$de = Get-TopWords -content $deContent -target 5000

$payload = [ordered]@{ words = [ordered]@{ en = $en; de = $de } } | ConvertTo-Json -Depth 6
Set-Content -Path 'c:\git\morsen\data\word-list.json' -Value $payload -Encoding UTF8

Write-Output "DONE EN=$($en.Count) DE=$($de.Count)"
