$ErrorActionPreference = 'Stop'

$ProjectRoot = Join-Path $PSScriptRoot 'A_Level_CS_page\algocore-fumadocs'
if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot 'package.json'))) {
    throw "Không tìm thấy package.json tại $ProjectRoot"
}

$NodeVersion = (& node --version 2>$null)
if (-not $NodeVersion) {
    throw 'Chưa cài Node.js. Dự án yêu cầu Node.js 22 trở lên.'
}

$NodeMajor = [int](($NodeVersion -replace '^v', '').Split('.')[0])
if ($NodeMajor -lt 22) {
    throw "Node.js hiện tại là $NodeVersion. Dự án yêu cầu Node.js 22 trở lên."
}

Push-Location $ProjectRoot
try {
    if (-not (Test-Path -LiteralPath 'node_modules')) {
        npm ci
        if ($LASTEXITCODE -ne 0) { throw 'npm ci thất bại.' }
    }
    npm run dev
    if ($LASTEXITCODE -ne 0) { throw 'Không thể khởi động development server.' }
}
finally {
    Pop-Location
}

