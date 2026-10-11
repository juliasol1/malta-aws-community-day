# Core network foundation for the AWS <-> Azure multicloud interconnect demo.
# Private only: no public IPs or public ingress on workloads or databases.

resource "azurerm_resource_group" "core" {
  name     = "${var.prefix}-core-rg"
  location = var.location
  tags     = var.tags
}

resource "azurerm_virtual_network" "core" {
  name                = "${var.prefix}-core-vnet"
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
  address_space       = var.vnet_address_space
  tags                = var.tags
}

# -----------------------------------------------------------------------------
# Subnets
# -----------------------------------------------------------------------------

# GatewaySubnet is strictly reserved for the Virtual Network / ExpressRoute Gateway.
# Azure enforces this exact subnet name and standard /24 prefix.
resource "azurerm_subnet" "gateway" {
  name                 = "GatewaySubnet"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.core.name
  address_prefixes     = [cidrsubnet(var.vnet_address_space[0], 8, 0)] # 10.20.0.0/24
}

# Backend subnet for Azure Cobalt 100 ARM64 workloads and microservices.
resource "azurerm_subnet" "backend" {
  name                 = "${var.prefix}-backend-snet"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.core.name
  address_prefixes     = [cidrsubnet(var.vnet_address_space[0], 8, 1)] # 10.20.1.0/24

  delegation {
    name = "aci-delegation"

    service_delegation {
      name = "Microsoft.ContainerInstance/containerGroups"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/action"
      ]
    }
  }
}

# Dedicated subnet for PostgreSQL Flexible Server or data persistence tier.
resource "azurerm_subnet" "database" {
  name                 = "${var.prefix}-database-snet"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.core.name
  address_prefixes     = [cidrsubnet(var.vnet_address_space[0], 8, 2)] # 10.20.2.0/24

  delegation {
    name = "postgresql-flexible-server-delegation"

    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action"
      ]
    }
  }
}

# Subnet for Private Endpoints (Key Vault, Storage, Container Registry).
resource "azurerm_subnet" "private_endpoints" {
  name                 = "${var.prefix}-pe-snet"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.core.name
  address_prefixes     = [cidrsubnet(var.vnet_address_space[0], 8, 3)] # 10.20.3.0/24
}

# -----------------------------------------------------------------------------
# Network Security Groups (Strictly Zero-Trust / No Internet Inbound)
# -----------------------------------------------------------------------------

resource "azurerm_network_security_group" "backend" {
  name                = "${var.prefix}-backend-nsg"
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
  tags                = var.tags

  # Allow HTTP service requests across AWS Interconnect from AWS Frankfurt VPC
  security_rule {
    name                       = "Allow-AWS-HTTP-Inbound"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_ranges    = ["80", "8080"]
    source_address_prefix      = var.aws_vpc_cidr
    destination_address_prefix = "*"
  }

  # Allow ICMP ping for live latency oscilloscope telemetry in presentation HUD
  security_rule {
    name                       = "Allow-AWS-ICMP-Inbound"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Icmp"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = var.aws_vpc_cidr
    destination_address_prefix = "*"
  }

  # Allow internal VNet communication
  security_rule {
    name                       = "Allow-VNet-Internal"
    priority                   = 200
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "VirtualNetwork"
    destination_address_prefix = "VirtualNetwork"
  }

  # Explicitly deny all inbound from the public Internet
  security_rule {
    name                       = "Deny-Internet-Inbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "backend" {
  subnet_id                 = azurerm_subnet.backend.id
  network_security_group_id = azurerm_network_security_group.backend.id
}

resource "azurerm_network_security_group" "database" {
  name                = "${var.prefix}-database-nsg"
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
  tags                = var.tags

  security_rule {
    name                       = "Allow-Postgres-From-Backend"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5432"
    source_address_prefix      = azurerm_subnet.backend.address_prefixes[0]
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Allow-Postgres-From-AWS"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5432"
    source_address_prefix      = var.aws_vpc_cidr
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "Deny-Internet-Inbound"
    priority                   = 4096
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "Internet"
    destination_address_prefix = "*"
  }
}

resource "azurerm_subnet_network_security_group_association" "database" {
  subnet_id                 = azurerm_subnet.database.id
  network_security_group_id = azurerm_network_security_group.database.id
}

# -----------------------------------------------------------------------------
# Gateway Infrastructure (ExpressRoute / VPN Gateway for Interconnect)
# -----------------------------------------------------------------------------

# Public IP required when Gateway is Vpn; ExpressRoute gateways connect privately and do not use a public IP.
resource "azurerm_public_ip" "gateway" {
  count               = var.enable_gateway && var.gateway_type == "Vpn" ? 1 : 0
  name                = "${var.prefix}-gw-pip"
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = var.tags
}

resource "azurerm_virtual_network_gateway" "interconnect" {
  count               = var.enable_gateway ? 1 : 0
  name                = "${var.prefix}-interconnect-gw"
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
  type                = var.gateway_type
  sku                 = var.gateway_sku
  tags                = var.tags

  dynamic "ip_configuration" {
    for_each = var.gateway_type == "Vpn" ? [1] : []
    content {
      name                          = "vnetGatewayConfig"
      public_ip_address_id          = azurerm_public_ip.gateway[0].id
      private_ip_address_allocation = "Dynamic"
      subnet_id                     = azurerm_subnet.gateway.id
    }
  }

  dynamic "ip_configuration" {
    for_each = var.gateway_type == "ExpressRoute" ? [1] : []
    content {
      name                          = "vnetGatewayConfig"
      private_ip_address_allocation = "Dynamic"
      subnet_id                     = azurerm_subnet.gateway.id
    }
  }
}

