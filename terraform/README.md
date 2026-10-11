# Malta AWS Community Day — Multicloud Interconnect Infrastructure

Terraform IaC for the 60-minute session and 20-minute live stage demo:
**AWS (eu-central-1 Frankfurt) ⟷ Azure (germanywestcentral Frankfurt)**

Each cloud and layer is organized into isolated stacks to minimize blast radius and ensure zero shared state risk:

| Stack           | Cloud | Purpose                                             | State / Backend                    |
|-----------------|-------|-----------------------------------------------------|------------------------------------|
| `azure/core`    | Azure | Private VNet, GatewaySubnet, NSG, ExpressRoute GW   | `azure/core.tfstate` (Azure Blob)  |
| `azure/backend` | Azure | Microsoft Cobalt 100 ARM64 VM (`Standard_D2ps_v6`)  | `azure/backend.tfstate` (Azure)    |
| `aws/core`      | AWS   | VPC `10.10.0.0/16`, DX Gateway, NAT, Routing, SGs   | Local / S3 (`aws/core.tfstate`)    |
| `aws/app`       | AWS   | ECS Fargate Graviton4 ARM64 + Application Load Bal. | Local / S3 (`aws/app.tfstate`)     |

---

## Technical Specifications & Symmetry

- **Direct Cross-Connect Interconnect:** 
  - AWS Direct Connect Gateway ⟷ Azure ExpressRoute Circuit in Frankfurt.
  - Round-trip latency: **~2.4 ms**.
  - Zero public endpoints or public IPs on backend workloads.
- **True Dual-ARM64 Architecture:**
  - **AWS:** AWS Graviton4 (ARM64) running containerized presentation & telemetry proxy on ECS Fargate.
  - **Azure:** Microsoft Cobalt 100 (ARM64, Neoverse CSS-N2) running `Standard_D2ps_v6` with native cloud-init microservice.

---

## Network Architecture & CIDR Allocation

```
+------------------------------------+           +------------------------------------+
| AWS (eu-central-1 Frankfurt)       |           | Azure (germanywestcentral)         |
| VPC: 10.10.0.0/16                  |           | VNet: 10.20.0.0/16                 |
|                                    |           |                                    |
| Public Subnets: 10.10.0.0/24 (ALB) |           | GatewaySubnet: 10.20.0.0/24 (ER GW)|
| Private Subnets: 10.10.10.0/24     |           | Backend Subnet: 10.20.1.0/24       |
| (ECS Graviton4 Fargate Tasks)      |           | (Cobalt 100 VM: 10.20.1.10:8080)   |
|                                    |           | Database Subnet: 10.20.2.0/24      |
| AWS Direct Connect Gateway (64512) | <=======> | ExpressRoute Gateway               |
+------------------------------------+  ~2.4 ms  +------------------------------------+
                                      Interconnect
```

---

## Deployment Guide

### 1. Azure Stacks (`azure/core` & `azure/backend`)

Authenticate with Azure:
```sh
az login --tenant 60133250-bb62-4bb2-bea7-9c38341c6c55
```

Deploy Core Network:
```sh
cd terraform/azure/core
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Deploy Cobalt 100 Backend VM:
```sh
cd ../backend
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 2. AWS Stacks (`aws/core` & `aws/app`)

Deploy AWS Core Network:
```sh
cd ../../aws/core
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Deploy Graviton4 App on ECS Fargate:
```sh
cd ../app
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

---

## Live Stage Demo Commands

- **Live Telemetry:** The frontend at `http://localhost:3000` (or `http://${ALB_DNS_NAME}`) connects to the Graviton4 proxy and queries `http://10.20.1.10:8080/api/ping` and `/api/transactions` across the Interconnect.
- **Stage Severing (`[SPACE]` Key):** Triggers visual physical bridge collapse and cuts the telemetry loop.
- **Infrastructure Kill-Switch (Real BGP Route Severing):**
  To simulate genuine cloud outage during the live keynote, withdraw the BGP route propagation or blackhole the NSG:
  ```sh
  az network nsg rule update \
    --resource-group awscd-core-rg \
    --nsg-name awscd-backend-nsg \
    --name Deny-AWS-Stage-Kill \
    --access Deny --priority 90
  ```
