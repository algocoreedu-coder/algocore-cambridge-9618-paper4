param([string]$WorkspaceRoot)
$ErrorActionPreference = 'Stop'
if (-not $WorkspaceRoot) { $WorkspaceRoot = (Get-Location).Path }
$stageRoot = Join-Path $WorkspaceRoot 'A_Level_CS_page/planning/paper1/stage-0'
$appRoot = Join-Path $WorkspaceRoot 'A_Level_CS_page/algocore-fumadocs'
$baseline = @(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'APP_BASELINE_HASHES.json') -Raw | ConvertFrom-Json)
$appDifferences = @()
foreach ($entry in $baseline) {
    $target = Join-Path $appRoot $entry.path
    if (-not (Test-Path -LiteralPath $target)) { $appDifferences += "MISSING: $($entry.path)"; continue }
    if ((Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower() -ne $entry.sha256) { $appDifferences += "CHANGED: $($entry.path)" }
}
$currentAppPaths = @(& rg --files --hidden $appRoot -g '!node_modules' -g '!.next' | ForEach-Object { $_.Substring($appRoot.Length+1).Replace('\','/') })
foreach ($currentPath in $currentAppPaths) { if ($currentPath -notin $baseline.path) { $appDifferences += "ADDED: $currentPath" } }
$manifestPath = Join-Path $stageRoot 'evidence/a2/SOURCE_MANIFEST.json'
$sourceChecks = @()
if (Test-Path -LiteralPath $manifestPath) {
    $sourceManifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    foreach ($entry in $sourceManifest.primary_sources) {
        $target = Join-Path $WorkspaceRoot $entry.path
        $actualHash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLower()
        $sourceChecks += [pscustomobject]@{id=$entry.id; hash_matches=($actualHash -eq $entry.sha256)}
    }
}
$required = @('COURSE_SETTINGS.md','SOURCE_BASELINE.md','LEARNING_PAGE_CONTRACT.md','SCOPE_AND_COVERAGE_PLAN.md','DEFINITION_OF_DONE.md','DECISIONS.md','GATE_REVIEW.md','README.md')
$missingRequired = @($required | Where-Object { -not (Test-Path -LiteralPath (Join-Path $stageRoot $_)) })
$brokenLinks = @()
foreach ($file in Get-ChildItem -LiteralPath $stageRoot -Filter '*.md' -File) {
    $body = Get-Content -LiteralPath $file.FullName -Raw
    foreach ($linkMatch in [regex]::Matches($body, '\]\(([^)]+)\)')) {
        $linkTarget = $linkMatch.Groups[1].Value.Trim('<','>').Split('#')[0]
        if (-not $linkTarget -or $linkTarget -match '^https?://') { continue }
        $resolved = if ([IO.Path]::IsPathRooted($linkTarget)) { $linkTarget } else { Join-Path $file.DirectoryName $linkTarget }
        if (-not (Test-Path -LiteralPath $resolved)) { $brokenLinks += [pscustomobject]@{file=$file.Name; target=$linkTarget} }
    }
}
$report = [pscustomobject]@{
    generated_at=(Get-Date).ToUniversalTime().ToString('o')
    purpose='Filesystem integrity and top-level link checks only; not semantic or browser QA'
    app_baseline_files=$baseline.Count
    app_differences=$appDifferences
    primary_source_hash_checks=$sourceChecks
    source_hash_mismatches=@($sourceChecks | Where-Object { -not $_.hash_matches })
    missing_required_top_level_files=$missingRequired
    broken_top_level_local_links=$brokenLinks
    pass=($appDifferences.Count -eq 0 -and $sourceChecks.Count -gt 0 -and @($sourceChecks | Where-Object { -not $_.hash_matches }).Count -eq 0 -and $missingRequired.Count -eq 0 -and $brokenLinks.Count -eq 0)
}
$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $PSScriptRoot 'INTEGRITY_CHECK.json') -Encoding utf8
[pscustomobject]@{pass=$report.pass; app_files=$baseline.Count; app_differences=$appDifferences.Count; source_checks=$sourceChecks.Count; source_mismatches=$report.source_hash_mismatches.Count; missing_required=$missingRequired.Count; broken_links=$brokenLinks.Count} | ConvertTo-Json
if (-not $report.pass) { exit 1 }
