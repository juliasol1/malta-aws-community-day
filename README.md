# The Great Maltese Sky Bridge: Multicloud Interconnect
### Malta AWS Community Day — Keynote Session & Live Demo
**Dual-ARM64 High-Performance Architecture: AWS Graviton4 ⟷ Microsoft Cobalt 100**

---

## 🏛️ Project Overview

This repository contains the presentation frontend and multi-cloud infrastructure for the **Malta AWS Community Day** keynote. The live demo models an enterprise multicloud bridge connecting **AWS Cloud (Valletta Citadel)** in `eu-central-1` (Frankfurt) and **Azure Cloud (Gozo Outpost)** in `germanywestcentral` (Frankfurt).

The keynote features a live 2.5D isometric Three.js interactive world with honest physics, ambient Mediterranean audio, leaping dolphins, and an on-stage physical bridge collapse simulation demonstrating network partition behavior in distributed cross-cloud architectures.

---

## 🌍 Live Endpoints

- **Live Presentation (AWS Graviton4 ALB)**:  
  [http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com](http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com)
- **Live Health Endpoint (JSON Telemetry)**:  
  [http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com/health](http://awscd-presentation-alb-947133463.eu-central-1.elb.amazonaws.com/health)
- **Static Cloud CDN (AWS S3 Website)**:  
  [http://awscd-presentation-frontend-419361886508.s3-website.eu-central-1.amazonaws.com](http://awscd-presentation-frontend-419361886508.s3-website.eu-central-1.amazonaws.com)
- **Local Dev Server**:  
  `http://localhost:3000`

---

## 🏗️ Architecture Matrix

| Dimension | AWS Cloud (Valletta Citadel) | Azure Cloud (Gozo Outpost) |
| :--- | :--- | :--- |
| **Region** | `eu-central-1` (Frankfurt) | `germanywestcentral` (Frankfurt) |
| **Processor** | **AWS Graviton4 ARM64** (Neoverse-V2) | **Microsoft Cobalt 100 ARM64** (Neoverse-CSS-N2 Profile) |
| **Compute Tier** | AWS ECS Fargate Cluster (`awscd-graviton-cluster`) | Azure Container Instances (`awscd-cobalt-container`) |
| **Private CIDR** | `10.10.0.0/16` (Isolated) | `10.20.0.0/16` (Isolated) |
| **Ingress** | Application Load Balancer (`awscd-presentation-alb`) | Zero-Trust Private VNet (0% Public Exposure) |
| **Gateway Tier** | Direct Connect Gateway (`ASN 64512`) + VPG | Virtual Network Gateway Subnet + Delegated Snet |
| **Latency SLA** | **< 2.5 ms RTT** (Direct Connect Metro Interconnect) | **< 2.5 ms RTT** (ExpressRoute Metro Interconnect) |

---

## 📁 Repository Structure

```
├── frontend/                              # 2.5D Isometric Maltese Presentation Engine
│   ├── index.html                         # Fullscreen viewport and HUD telemetry
│   ├── styles.css                         # JetBrains Mono styling, AoE badges, disaster overlay
│   ├── textures.js                        # Procedural canvas textures (limestone, terracotta, water)
│   ├── audio.js                           # Procedural Web Audio API sound synthesis (waves, thunder)
│   └── game.js                            # Three.js scene, physics, bridge collapse, live telemetry
│
├── terraform/
│   ├── aws/
│   │   ├── core/                          # VPC 10.10.0.0/16, subnets, Direct Connect GW (ASN 64512), NAT
│   │   └── app/                           # Graviton4 ECS Fargate service, ALB, CloudWatch logging
│   └── azure/
│       ├── core/                          # VNet 10.20.0.0/16, subnets, ACI delegation, Zero-Trust NSG
│       └── backend/                       # Cobalt 100 microservice container on private IP 10.20.1.4:8080
│
├── INTERCONNECT_VERIFICATION_GUIDE.md    # Irrefutable proof guide, AWS/Azure Console paths & CLI one-liners
└── README.md                              # This file
```

---

## 🎮 Stage Controls & Live Demo Interaction

- **`[SPACE]` or `[K]`**: Sever the Interconnect. Shatters the grand viaduct into the sea with realistic gravity and splash physics, transitions HUD to `TIMEOUT (∞) LINK DOWN`, and presents the Azure Window historical disaster card.
- **`[R]`**: Repair / Restore the bridge and re-establish live cloud telemetry.
- **`[T]`**: Send a batch of 10 SQL transactions across the cross-cloud bridge to the live backend.
- **Mouse Drag / Scroll**: Rotate and zoom around the Maltese coastline, Valletta battlements, and Dwejra Blue Hole.
- **`🎯 Reset Cam`**: Realign camera to the default 2.5D isometric presentation viewpoint.

---

## 🔍 Verification & Proofs

For complete instructions on demonstrating live AWS/Azure resource authenticity during your presentation, see [INTERCONNECT_VERIFICATION_GUIDE.md](file:///c:/Users/darkj/Desktop/eks/malta-aws-community-day/INTERCONNECT_VERIFICATION_GUIDE.md).
