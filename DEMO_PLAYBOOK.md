# 🎙️ Malta AWS Community Day 2026: Live Stage Demo Playbook
## Dual-ARM64 High-Performance Multicloud Interconnect
### AWS Graviton4 (`eu-central-1`) &harr; Azure Cobalt 100 (`germanywestcentral`)

---

## 🖥️ Recommended Triple-Window Stage Layout

Arrange your monitor so the audience sees both the visual simulation, the real-time cloud terminal, and your live cloud shell proofs:

| Left Half (50%) | Top-Right Quarter (25%) | Bottom-Right Quarter (25%) |
| :--- | :--- | :--- |
| **3D Isometric Harbour Scene** | **Dual-Cloud Live Terminal** | **PowerShell Shell** |
| `index.html` (3D World) | `terminal.html` (Real-time logs) | Live verification commands |
| `http://awscd-presentation-frontend-419361886508.s3-website.eu-central-1.amazonaws.com/index.html` | `http://awscd-presentation-frontend-419361886508.s3-website.eu-central-1.amazonaws.com/terminal.html` | Local PowerShell Console |

> **Pro Tip:** Press **`[L]`** on the 3D scene at any time to instantly open the terminal in a new tab.

---

## ⚡ Step 0: Pre-Flight Environment Setup (Run Once Before Walking on Stage)

Open PowerShell and paste this exact block (uses absolute paths so it works from any folder):

```powershell
Set-Location "c:\Users\darkj\Desktop\eks\malta-aws-community-day"
$env:AWS_CA_BUNDLE = "$PWD\trusted_bundle.pem"
$env:REQUESTS_CA_BUNDLE = "$PWD\trusted_bundle.pem"
$ALB = "http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com"
```

---

## 🚀 ACT 1: Proving AWS Graviton4 Infrastructure

> 🗣️ **Speaker Script:**  
> *"Let's prove this isn't just a 3D animation. On the AWS side in Frankfurt, we have our Graviton4 ARM64 container running on ECS Fargate inside a private VPC subnet. Let's inspect the live task definition and our Direct Connect Gateway peering."*

### 1.1 Verify Graviton4 ARM64 Compute
```powershell
aws ecs describe-tasks --cluster awscd-graviton-cluster --tasks (aws ecs list-tasks --cluster awscd-graviton-cluster --service-name awscd-malta-service --query "taskArns[0]" --output text) --query "tasks[0].{Architecture:attributes[?name=='ecs.cpu-architecture'].value|[0], CPU:cpu, Memory:memory, Status:lastStatus, IP:containers[0].networkInterfaces[0].privateIpv4Address}" --output table
```

**Expected Output:**
```text
--------------------------------------------------------------
|                        DescribeTasks                       |
+---------------+------+----------------+---------+----------+
| Architecture  | CPU  |      IP        | Memory  | Status   |
+---------------+------+----------------+---------+----------+
|  arm64        |  512 |  10.10.11.104  |  1024   |  RUNNING |
+---------------+------+----------------+---------+----------+
```

### 1.2 Verify Direct Connect Gateway & BGP ASN 64512
```powershell
aws directconnect describe-direct-connect-gateways --query "directConnectGateways[*].{Name:directConnectGatewayName, ASN:amazonSideAsn, State:directConnectGatewayState}" --output table
```

**Expected Output:**
```text
---------------------------------------
|    DescribeDirectConnectGateways    |
+-------+---------------+-------------+
|  ASN  |     Name      |    State    |
+-------+---------------+-------------+
|  64512|  awscd-dx-gw  |  available  |
+-------+---------------+-------------+
```

---

## 🌐 ACT 2: Proving Azure Cobalt 100 Infrastructure

> 🗣️ **Speaker Script:**  
> *"Now let's look at the other side of the bridge: Microsoft Azure in Frankfurt (germanywestcentral). Here we have a Cobalt 100 ARM64 container deployed into a completely private, zero-trust virtual network with no public IP address."*

### 2.1 Verify Azure Cobalt 100 Container Instance
```powershell
az container show -g awscd-backend-rg -n awscd-cobalt-container --query "{Container:name, State:containers[0].instanceView.currentState.state, IP:ipAddress.ip, OS:osType, CPU:containers[0].resources.requests.cpu, RAM_GB:containers[0].resources.requests.memoryInGb}" -o table
```

**Expected Output:**
```text
Container               State    IP         OS     CPU    RAM_GB
----------------------  -------  ---------  -----  -----  --------
awscd-cobalt-container  Running  10.20.1.4  Linux  1.0    1.0
```

### 2.2 Verify Azure VNet & Gateway Subnet
```powershell
az network vnet show -g awscd-core-rg -n awscd-core-vnet --query "{VNet:name, AddressSpace:addressSpace.addressPrefixes[0], Subnets:subnets[*].name}" -o table
```

---

## ⚡ ACT 3: Transmitting Live Multicloud Transactions

> 🗣️ **Speaker Script:**  
> *"Now let's push real data across the cross-cloud interconnect. Watch the 3D bridge on the left: packets turn gold in flight, cross the harbour, and turn emerald green as Cobalt 100 commits each one to disk. In the terminal on the right, you can see live SQLite commits at 2.2 milliseconds latency."*

### 3.1 Send 5 Real Transactions from PowerShell (or press `[T]` in UI)
```powershell
1..5 | ForEach-Object { Invoke-RestMethod -Uri "$ALB/api/transactions" -Method POST -Body (@{ source = "aws-graviton4-fargate"; region = "eu-central-1"; chip = "ARM64-Neoverse-V2"; amount = 1000 + $_ * 200 } | ConvertTo-Json) -ContentType "application/json" | Select-Object tx_id, status, target_chip }
```

**Expected Output:**
```text
tx_id status    target_chip     
----- ------    -----------     
   50 COMMITTED Cobalt 100 ARM64
   51 COMMITTED Cobalt 100 ARM64
   52 COMMITTED Cobalt 100 ARM64
   53 COMMITTED Cobalt 100 ARM64
   54 COMMITTED Cobalt 100 ARM64
```

### 3.2 Check Total Verified Commits in Azure Database
```powershell
Invoke-RestMethod -Uri "$ALB/api/status" | Format-Table
```

---

## 💥 ACT 4: The Disaster — Severing the Interconnect

> 🗣️ **Speaker Script:**  
> *"In 2017, Malta lost its iconic Azure Window arch to a violent storm. Today, we're going to simulate a catastrophic fibre cut and BGP withdrawal live on stage!"*  
> *(Press **`[SPACE]`** on the 3D scene, or run the command below)*

### 4.1 Sever Interconnect via API (or hit `[SPACE]`)
```powershell
Invoke-RestMethod -Uri "$ALB/api/interconnect/cut" -Method POST
```

### 4.2 Proof: Healthcheck shows `SEVERED` and `null` Latency
```powershell
Invoke-RestMethod -Uri "$ALB/health" | Select-Object interconnect_status, interconnect_rtt_ms, processor | Format-Table
```

**Expected Output:**
```text
interconnect_status interconnect_rtt_ms processor                  
------------------- ------------------- ---------                  
SEVERED                                 AWS Graviton4 ARM64 (Fargate)
```

### 4.3 Proof: Transactions are instantly rejected with HTTP 502 Bad Gateway
```powershell
try { Invoke-RestMethod -Uri "$ALB/api/transactions" -Method POST -Body '{"payload":"storm_tx"}' -ContentType "application/json" } catch { Write-Host "-> REJECTED BY GRAVITON4: $($_.Exception.Message) (BGP Withdrawn)" -ForegroundColor Red }
```

* **What the audience sees:**
  * **3D Scene:** Thunder, lightning flash, the Azure Window arch shatters into the sea, bridge spans collapse, red data packets plummet into the water.
  * **Terminal:** AWS logs display `💥 BGP WITHDRAWAL: Link severed by operator` and `[ERROR] 502 Bad Gateway [DROPPED: Interconnect SEVERED]`. Azure logs show `[DROP] 0 transactions received across Interconnect`.
  * **PowerShell:** Real HTTP 502 error and RTT `= null`.

---

## 🔄 ACT 5: Self-Healing & Traffic Recovery

> 🗣️ **Speaker Script:**  
> *"Now let's engage the redundant interconnect path and restore our BGP peering. Watch how quickly the architecture reconverges."*  
> *(Press **`[SPACE]`** again on the 3D scene, or run the command below)*

### 5.1 Restore the Interconnect (or hit `[SPACE]`)
```powershell
Invoke-RestMethod -Uri "$ALB/api/interconnect/restore" -Method POST
```

### 5.2 Proof: Healthcheck returns to `ONLINE` with 2.1–2.3 ms RTT
```powershell
Invoke-RestMethod -Uri "$ALB/health" | Select-Object interconnect_status, interconnect_rtt_ms, paired_backend | Format-Table
```

**Expected Output:**
```text
interconnect_status interconnect_rtt_ms paired_backend        
------------------- ------------------- --------------        
ONLINE                             2.18 http://10.20.1.4:8080 
```

### 5.3 Proof: Transactions resume with sequential `tx_id` commits
```powershell
Invoke-RestMethod -Uri "$ALB/api/transactions" -Method POST -Body (@{ source = "aws-graviton4-fargate"; region = "eu-central-1"; chip = "ARM64-Neoverse-V2"; amount = 99999 } | ConvertTo-Json) -ContentType "application/json" | Select-Object tx_id, status, target_chip | Format-Table
```

**Expected Output:**
```text
tx_id status    target_chip     
----- ------    -----------     
   55 COMMITTED Cobalt 100 ARM64
```

---

## 🎮 Stage Hotkeys Quick Reference

| Key | Action | What Happens |
| :---: | :--- | :--- |
| **`[SPACE]`** | **Cut / Restore Interconnect** | Collapses the bridge, withdraws BGP, plays storm audio & flash |
| **`[T]`** | **Send Batch SQL** | Sends 10 real HTTP transactions across the multicloud bridge |
| **`[L]`** | **Open Dual Terminal** | Opens `terminal.html` in a new browser tab |
| **`[K]`** | **Alternative Cut/Restore** | Backup key if spacebar is used for slide advancer |
| **Left Click + Drag** | **3D Camera Orbit** | Rotates the 2.5D isometric world around Valletta & Gozo |
| **Mouse Scroll** | **Zoom In / Out** | Inspects Valletta Citadel, MACsec bridge, or Gozo Citadel |

---

## 🔬 Under the Hood: Exactly What Happens During "Cut" and "Restore"

When you invoke `POST /api/interconnect/cut` or `POST /api/interconnect/restore` (or trigger it via hotkey `[SPACE]` or PowerShell), a multi-tier orchestration occurs across both clouds and the frontend:

### 1. What Happens When We Call "CUT" (`POST /api/interconnect/cut`)

1. **State Mutation on Graviton4 (ECS Fargate)**:
   - The in-memory link state `interconnect_alive` flips to `False`.
   - The Graviton4 telemetry daemon simulates a **BGP Route Withdrawal** across the Direct Connect Gateway (`AS 64512`) and the Azure ExpressRoute Gateway (`AS 64513`).

2. **Active Traffic Blackholing**:
   - Any transaction (`POST /api/transactions`) or ping (`GET /api/azure-ping`) reaching the AWS Application Load Balancer is **immediately intercepted and terminated** at the Graviton4 compute tier.
   - Graviton4 logs: `[AWS-GRAVITON4] [ERROR] POST /api/transactions -> 502 Bad Gateway [DROPPED: Interconnect SEVERED / BGP Withdrawn]`.
   - The ALB returns `HTTP 502 Bad Gateway` to clients. Zero packets cross the transit link.

3. **Complete Isolation of Azure Cobalt 100**:
   - Because no packets cross the transit link, the Azure container at `10.20.1.4:8080` receives **zero incoming requests**.
   - The SQLite database `/tmp/transactions.db` on Cobalt 100 **completely freezes**. No new rows are inserted into `tx_log`.
   - Azure logs in the terminal reflect this silence: `[AZURE-COBALT100] [DROP] 0 transactions received across Interconnect (BGP withdrawn)`.

4. **Health Check & Telemetry Metrics**:
   - The `/health` endpoint transitions:
     - `"interconnect_status": "SEVERED"`
     - `"interconnect_rtt_ms": null` (the round-trip time is undefined / infinite)
   - ALB Target Group CloudWatch metrics log a spike in `HTTPCode_Target_5XX_Count`.

5. **Automatic 3D Scene Synchronization**:
   - The 3D scene (`game.js`) continuously checks the backend `/health` endpoint every 1 second.
   - When it detects `SEVERED` (even if triggered remotely via PowerShell), it **instantly triggers the disaster sequence**:
     - Web Audio API synthesizes a thunderclap and acoustic sea crash.
     - Camera shakes with a trauma impulse of 1.5.
     - Directional sunlight flashes white (lightning strike).
     - Physics engine calculates gravity and angular momentum: the Azure Window arch breaks off at Dwejra, and the central spans of the Great Harbour Bridge collapse into the sea.
     - Any in-flight data packets turn bright red (`#EF4444`) and dive into the water.
     - Disaster HUD modal opens with incident diagnostics.

---

### 2. What Happens When We Call "RESTORE" (`POST /api/interconnect/restore`)

1. **BGP Reconvergence & Route Re-advertisement**:
   - In Graviton4, `interconnect_alive` flips back to `True`.
   - The daemon re-advertises prefix `10.10.0.0/16` across the BGP session and restores route propagation into the private route table (`aws_route_table.private`).

2. **Unblocking the Transit Bridge**:
   - Inbound transaction payloads from the ALB are once again accepted, encapsulated, and forwarded across the private cross-connect to `http://10.20.1.4:8080`.
   - Azure Cobalt 100 resumes committing transactions into SQLite with autoincrementing `tx_id`.

3. **Heartbeat Oscilloscope Resumption**:
   - Real-time telemetry pings resume every 1.8 seconds.
   - Measured round-trip latency returns to **2.1 – 2.3 ms** (the Frankfurt metro cross-connect benchmark).
   - `/health` endpoint returns `"interconnect_status": "ONLINE"` and `"interconnect_rtt_ms": 2.21`.

4. **Automatic 3D World Reconstruction**:
   - The 3D scene's background synchronizer detects `"interconnect_status": "ONLINE"`.
   - It plays the harmonic restoration chime (`playRestore()`).
   - The collapsed bridge spans and Azure Window arch are smoothly interpolated back to their structural anchor points.
   - The HUD status dot returns to pulsating emerald green (`#10B981`), and the disaster overlay dismisses.
   - In-flight packets turn gold in transit and green upon confirmed Azure SQLite commit.

