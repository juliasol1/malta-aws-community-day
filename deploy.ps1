# Malta AWS Community Day — Multicloud Interconnect Deployment Script
# Automatically handles environment variables, Norton CA bundle, and cloud logins.

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Malta AWS Community Day: Multicloud Interconnect Deploy " -ForegroundColor Cyan
Write-Host " AWS Account:  419361886508 (eu-central-1 Frankfurt)    " -ForegroundColor Yellow
Write-Host " Azure Sub:    d418ba35-2077-43ac-b95e-8f37adbe9f4f      " -ForegroundColor Blue
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Environment & SSL setup
$env:PATH += ";C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin"
$bundlePath = "$HOME\.custom-ca-bundle.pem"

if (-not (Test-Path $bundlePath)) {
    Write-Host "`nGenerating CA bundle with Norton local intercept certificate..." -ForegroundColor Yellow
    $nortonCert = Get-ChildItem Cert:\LocalMachine\Root | Where-Object { $_.Thumbprint -eq "2065BF67DC9902FCDD3FAF98F5FD311397277E66" } | Select-Object -First 1
    if ($nortonCert) {
        $nortonPem = "-----BEGIN CERTIFICATE-----`r`n" + [Convert]::ToBase64String($nortonCert.RawData, 'InsertLineBreaks') + "`r`n-----END CERTIFICATE-----`r`n"
        $baseCacert = Get-Content "C:\Program Files\Amazon\AWSCLIV2\awscli\botocore\cacert.pem" -Raw -ErrorAction SilentlyContinue
        Set-Content -Path $bundlePath -Value ($baseCacert + "`r`n" + $nortonPem) -Encoding Ascii
    }
}

$env:AWS_CA_BUNDLE = $bundlePath
$env:REQUESTS_CA_BUNDLE = $bundlePath
$env:SSL_CERT_FILE = $bundlePath

# 2. Azure Login
Write-Host "`n--- [Step 1/4] Azure Authentication ---" -ForegroundColor Cyan
$currentAz = az account show 2>$null | ConvertFrom-Json -ErrorAction SilentlyContinue
if (-not $currentAz -or $currentAz.id -ne "d418ba35-2077-43ac-b95e-8f37adbe9f4f") {
    Write-Host "Please complete the Azure login in the browser window..." -ForegroundColor Yellow
    az login --subscription "d418ba35-2077-43ac-b95e-8f37adbe9f4f"
}
$azAccount = az account show | ConvertFrom-Json
Write-Host "SUCCESS: Connected to Azure Subscription '$($azAccount.name)' ($($azAccount.id))" -ForegroundColor Green

# 3. AWS Login
Write-Host "`n--- [Step 2/4] AWS Authentication ---" -ForegroundColor Cyan
$awsIdentity = $null
try {
    $awsIdentity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
} catch {}

if (-not $awsIdentity) {
    Write-Host "Please complete the AWS login in the browser window..." -ForegroundColor Yellow
    aws login
    $awsIdentity = aws sts get-caller-identity | ConvertFrom-Json
}
Write-Host "SUCCESS: Connected to AWS Account '$($awsIdentity.Account)' as $($awsIdentity.Arn)" -ForegroundColor Green

# 4. Actions Menu
function Show-Menu {
    Write-Host "`n================ Deployment Menu ================" -ForegroundColor Cyan
    Write-Host "1. Deploy Azure Core (VNet 10.20.0.0/16, GatewaySubnet, NSG)"
    Write-Host "2. Deploy Azure Backend (Cobalt 100 ARM64 VM)"
    Write-Host "3. Deploy AWS Core (VPC 10.10.0.0/16, DX Gateway, NAT, SGs)"
    Write-Host "4. Deploy AWS App (Graviton4 ECS Fargate, ALB)"
    Write-Host "5. Deploy ALL Stacks in Sequence"
    Write-Host "6. Start Local 3D Presentation Frontend (Port 3000)"
    Write-Host "Q. Exit"
    Write-Host "=================================================" -ForegroundColor Cyan
}

$root = $PSScriptRoot

while ($true) {
    Show-Menu
    $choice = Read-Host "Select an option [1-6, Q]"
    switch ($choice) {
        "1" {
            Write-Host "`nDeploying Azure Core..." -ForegroundColor Cyan
            Push-Location "$root\terraform\azure\core"
            terraform init
            terraform apply
            Pop-Location
        }
        "2" {
            Write-Host "`nDeploying Azure Backend..." -ForegroundColor Cyan
            Push-Location "$root\terraform\azure\backend"
            terraform init
            terraform apply
            Pop-Location
        }
        "3" {
            Write-Host "`nDeploying AWS Core..." -ForegroundColor Cyan
            Push-Location "$root\terraform\aws\core"
            terraform init
            terraform apply
            Pop-Location
        }
        "4" {
            Write-Host "`nDeploying AWS App..." -ForegroundColor Cyan
            Push-Location "$root\terraform\aws\app"
            terraform init
            terraform apply
            Pop-Location
        }
        "5" {
            Write-Host "`nDeploying ALL stacks sequentially..." -ForegroundColor Cyan
            Push-Location "$root\terraform\azure\core"
            terraform init; terraform apply
            Pop-Location
            Push-Location "$root\terraform\azure\backend"
            terraform init; terraform apply
            Pop-Location
            Push-Location "$root\terraform\aws\core"
            terraform init; terraform apply
            Pop-Location
            Push-Location "$root\terraform\aws\app"
            terraform init; terraform apply
            Pop-Location
        }
        "6" {
            Write-Host "`nLaunching frontend on http://localhost:3000 ..." -ForegroundColor Cyan
            Start-Process python -ArgumentList "-m", "http.server", "3000", "--directory", "$root\frontend"
            Start-Process "http://localhost:3000"
        }
        "Q" {
            Write-Host "Exiting." -ForegroundColor Yellow
            return
        }
        "q" {
            Write-Host "Exiting." -ForegroundColor Yellow
            return
        }
        default {
            Write-Host "Invalid option. Please choose 1-6 or Q." -ForegroundColor Red
        }
    }
}
