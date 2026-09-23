$ErrorActionPreference = 'Stop'

$ProjectRoot = Join-Path $PSScriptRoot 'A_Level_CS_page\algocore-fumadocs'
if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'package.json'))) {
    throw "Không tìm thấy package.json tại $ProjectRoot"
}

Push-Location $ProjectRoot
try {
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        npm ci
        if ($LASTEXITCODE -ne 0) { throw 'npm ci thất bại.' }
    }

    npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw 'Typecheck thất bại.' }

    npm run verify:paper4:v2-app
    if ($LASTEXITCODE -ne 0) { throw 'Paper 4 v2 verification thất bại.' }
}
finally {
    Pop-Location
}
