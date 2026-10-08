# Core AWS VPC and Multicloud Interconnect infrastructure in Frankfurt (eu-central-1)
# Paired with Azure germanywestcentral for direct 1 Gbps edge cross-connect.

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = merge(var.tags, {
    Name = "${var.prefix}-vpc"
  })
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags = merge(var.tags, {
    Name = "${var.prefix}-igw"
  })
}

# -----------------------------------------------------------------------------
# Subnets
# -----------------------------------------------------------------------------

locals {
  az_map = {
    "eu-central-1a" = 0
    "eu-central-1b" = 1
  }
}

resource "aws_subnet" "public" {
  for_each                = local.az_map
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, each.value) # 10.10.0.0/24, 10.10.1.0/24
  availability_zone       = each.key
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.prefix}-public-${each.key}"
    Tier = "public"
  })
}

resource "aws_subnet" "private" {
  for_each          = local.az_map
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, each.value + 10) # 10.10.10.0/24, 10.10.11.0/24
  availability_zone = each.key

  tags = merge(var.tags, {
    Name = "${var.prefix}-private-${each.key}"
    Tier = "private"
  })
}

# -----------------------------------------------------------------------------
# NAT Gateway (Outbound Egress for Graviton4 ECS Tasks)
# -----------------------------------------------------------------------------

resource "aws_eip" "nat" {
  domain = "vpc"
  tags = merge(var.tags, {
    Name = "${var.prefix}-nat-eip"
  })
}

resource "aws_nat_gateway" "this" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public["eu-central-1a"].id

  tags = merge(var.tags, {
    Name = "${var.prefix}-nat-gw"
  })

  depends_on = [aws_internet_gateway.this]
}

# -----------------------------------------------------------------------------
# Routing
# -----------------------------------------------------------------------------

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = merge(var.tags, {
    Name = "${var.prefix}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this.id
  }

  tags = merge(var.tags, {
    Name = "${var.prefix}-private-rt"
  })
}

resource "aws_route_table_association" "private" {
  for_each       = aws_subnet.private
  subnet_id      = each.value.id
  route_table_id = aws_route_table.private.id
}

# -----------------------------------------------------------------------------
# AWS Direct Connect Gateway (Multicloud Interconnect Edge Cross-Connect)
# -----------------------------------------------------------------------------

resource "aws_dx_gateway" "interconnect" {
  name            = "${var.prefix}-dx-gw"
  amazon_side_asn = "64512"
}

resource "aws_vpn_gateway" "this" {
  vpc_id          = aws_vpc.this.id
  amazon_side_asn = "64513"

  tags = merge(var.tags, {
    Name = "${var.prefix}-vpg"
  })
}

# Automatically propagate Azure BGP routes (10.20.0.0/16) into AWS private route table
resource "aws_vpn_gateway_route_propagation" "private" {
  vpn_gateway_id = aws_vpn_gateway.this.id
  route_table_id = aws_route_table.private.id
}

resource "aws_dx_gateway_association" "this" {
  dx_gateway_id         = aws_dx_gateway.interconnect.id
  associated_gateway_id = aws_vpn_gateway.this.id
  allowed_prefixes      = [var.vpc_cidr]
}

# -----------------------------------------------------------------------------
# Security Groups
# -----------------------------------------------------------------------------

# Public ALB Security Group (Internet Inbound for Audience & Stage Screens)
resource "aws_security_group" "alb" {
  name        = "${var.prefix}-alb-sg"
  description = "Allows public HTTP/HTTPS traffic to the keynote presentation ALB"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Forward to ECS tasks"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [var.vpc_cidr]
  }

  tags = merge(var.tags, {
    Name = "${var.prefix}-alb-sg"
  })
}

# ECS Graviton4 Security Group
resource "aws_security_group" "ecs" {
  name        = "${var.prefix}-graviton-ecs-sg"
  description = "Security group for AWS Graviton4 ECS Fargate tasks"
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "Traffic from public ALB"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  # Outbound across Interconnect to Azure Cobalt 100 backend service
  egress {
    description = "HTTP commits to Azure Cobalt backend"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.azure_vnet_cidr]
  }

  egress {
    description = "ICMP ping RTT oscilloscope telemetry to Azure"
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = [var.azure_vnet_cidr]
  }

  # Outbound Internet via NAT Gateway for ECR pulls and updates
  egress {
    description = "Outbound HTTPS for ECR / packages"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.prefix}-graviton-ecs-sg"
  })
}
