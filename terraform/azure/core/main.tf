# Core network foundation for the AWS <-> Azure interconnect demo.
# Private only: nothing in this stack gets a public IP or public endpoint.

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

# TODO: subnets (GatewaySubnet, backend, private endpoints)
# TODO: NSGs denying inbound from Internet
# TODO: VPN gateway + local network gateway towards AWS
# TODO: private DNS zones
