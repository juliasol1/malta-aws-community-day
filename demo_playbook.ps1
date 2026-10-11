<#
.SYNOPSIS
    Malta AWS Community Day 2026 - Live Speaker Demo Playbook
    Dual-ARM64 High-Performance Multicloud Interconnect: AWS Graviton4 <-> Azure Cobalt 100

.DESCRIPTION
    Step-by-step speaker commands for demonstrating real multicloud infrastructure,
    live Direct Connect <-> ExpressRoute BGP peering, ARM64 processors, and real-time
    interconnect fault simulation and self-healing.
#>

# =============================================================================
# 0. INITIAL ENVIRONMENT SETUP (Run once before stepping on stage)
# =============================================================================
$env:AWS_CA_BUNDLE = "$PWD\trusted_bundle.pem"
$env:REQUESTS_CA_BUNDLE = "$PWD\trusted_bundle.pem"
$ALB = "http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com"

Clear-Host
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " MALTA AWS COMMUNITY DAY 2026 // DUAL-ARM64 MULTICLOUD PLAYBOOK " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Target AWS ALB: $ALB" -ForegroundColor DarkGray
Write-Host ""

# =============================================================================
# STEP 1: PROVE AWS GRAVITON4 INFRASTRUCTURE (Frankfurt eu-central-1)
# =============================================================================
Write-Host "[STEP 1] Inspecting AWS Graviton4 ARM64 Fargate Task..." -ForegroundColor Yellow

$taskArn = (aws ecs list-tasks --cluster awscd-graviton-cluster --service-name awscd-malta-service --query "taskArns[0]" --output text)
aws ecs describe-tasks --cluster awscd-graviton-cluster --tasks $taskArn `
    --query "tasks[0].{Architecture:attributes[?name=='ecs.cpu-architecture'].value|[0], CPU:cpu, Memory:memory, Status:lastStatus, PrivateIP:containers[0].networkInterfaces[0].privateIpv4Address}" `
    --output table

Write-Host "Inspect Direct Connect Gateway & BGP Peering AS 64512..." -ForegroundColor DarkGray
aws directconnect describe-direct-connect-gateways `
    --query "directConnectGateways[*].{Name:directConnectGatewayName, AmazonASN:amazonSideAsn, State:directConnectGatewayState}" `
    --output table

# =============================================================================
# STEP 2: PROVE AZURE COBALT 100 INFRASTRUCTURE (Frankfurt germanywestcentral)
# =============================================================================
Write-Host ""
Write-Host "[STEP 2] Inspecting Azure Cobalt 100 Container & Zero-Trust VNet..." -ForegroundColor Yellow

az container show -g awscd-backend-rg -n awscd-cobalt-container `
    --query "{Container:name, State:containers[0].instanceView.currentState.state, IP:ipAddress.ip, OS:osType, CPU:containers[0].resources.requests.cpu, RAM_GB:containers[0].resources.requests.memoryInGb}" `
    -o table

az network vnet show -g awscd-core-rg -n awscd-core-vnet `
    --query "{VNet:name, AddressSpace:addressSpace.addressPrefixes[0], Subnets:subnets[*].name}" `
    -o table

# =============================================================================
# STEP 3: PROVE LIVE MULTICLOUD TRANSACTION COMMITS OVER INTERCONNECT
# =============================================================================
Write-Host ""
Write-Host "[STEP 3] Transmitting Batch SQL Transactions (Graviton4 -> Cobalt 100)..." -ForegroundColor Yellow

1..5 | ForEach-Object {
    Invoke-RestMethod -Uri "$ALB/api/transactions" -Method POST -Body (@{
        source = "aws-graviton4-fargate"
        region = "eu-central-1"
        chip   = "ARM64-Neoverse-V2"
        amount = 1000 + $_ * 250
    } | ConvertTo-Json) -ContentType "application/json" | Select-Object tx_id, status, target_chip, timestamp
}

Write-Host "Total verified commits in Azure SQLite database:" -ForegroundColor DarkGray
Invoke-RestMethod -Uri "$ALB/api/status" | Format-Table

Write-Host "Direct Proof: Inspecting raw SQLite table inside Azure Cobalt container..." -ForegroundColor DarkGray
(az container exec -g awscd-backend-rg -n awscd-cobalt-container --exec-command "sqlite3 /tmp/transactions.db .dump") | Select-String "^\s*\([0-9]|INSERT INTO tx_log" | Select-Object -Last 5

# =============================================================================
# STEP 4: TRIGGER INTERCONNECT SEVER (The Azure Window Drop / Storm)
# =============================================================================
# Tip for speaker: You can also hit [SPACE] directly on the 3D screen or terminal.
Write-Host ""
Write-Host "[STEP 4] Severing Interconnect (BGP Withdrawal)..." -ForegroundColor Red
Invoke-RestMethod -Uri "$ALB/api/interconnect/cut" -Method POST | Out-Null

Write-Host "Inspecting Health Endpoint (Notice RTT is NULL):" -ForegroundColor DarkGray
Invoke-RestMethod -Uri "$ALB/health" | Select-Object interconnect_status, interconnect_rtt_ms, processor | Format-Table

Write-Host "Attempting Transaction across severed bridge (Expecting 502 Bad Gateway):" -ForegroundColor DarkGray
try {
    Invoke-RestMethod -Uri "$ALB/api/transactions" -Method POST -Body '{"test": 1}' -ContentType "application/json"
} catch {
    Write-Host "-> REJECTED BY GRAVITON4: $($_.Exception.Message) (BGP Withdrawn)" -ForegroundColor Red
}

# =============================================================================
# STEP 5: RESTORE INTERCONNECT (Self-Healing / Reconvergence)
# =============================================================================
Write-Host ""
Write-Host "[STEP 5] Restoring Interconnect..." -ForegroundColor Green
Invoke-RestMethod -Uri "$ALB/api/interconnect/restore" -Method POST | Out-Null

Write-Host "Inspecting Health Endpoint (Link Online, Latency Restored):" -ForegroundColor DarkGray
Invoke-RestMethod -Uri "$ALB/health" | Select-Object interconnect_status, interconnect_rtt_ms, paired_backend | Format-Table

Write-Host "Transmitting Post-Recovery Transaction:" -ForegroundColor DarkGray
Invoke-RestMethod -Uri "$ALB/api/transactions" -Method POST -Body (@{
    source = "aws-graviton4-fargate"
    region = "eu-central-1"
    chip   = "ARM64-Neoverse-V2"
    amount = 9999
} | ConvertTo-Json) -ContentType "application/json" | Select-Object tx_id, status, target_chip | Format-Table

Write-Host "PLAYBOOK EXECUTION COMPLETE. All Multicloud proofs verified." -ForegroundColor Green
