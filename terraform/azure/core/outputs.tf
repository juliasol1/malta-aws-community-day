output "resource_group_name" {
  description = "Name of the core resource group."
  value       = azurerm_resource_group.core.name
}

output "resource_group_id" {
  description = "ID of the core resource group."
  value       = azurerm_resource_group.core.id
}

output "location" {
  description = "Azure location where core resources are deployed."
  value       = azurerm_resource_group.core.location
}

output "vnet_id" {
  description = "ID of the core virtual network."
  value       = azurerm_virtual_network.core.id
}

output "vnet_name" {
  description = "Name of the core virtual network."
  value       = azurerm_virtual_network.core.name
}

output "vnet_address_space" {
  description = "Address space of the core virtual network."
  value       = azurerm_virtual_network.core.address_space
}

output "gateway_subnet_id" {
  description = "ID of the GatewaySubnet reserved for the interconnect gateway."
  value       = azurerm_subnet.gateway.id
}

output "backend_subnet_id" {
  description = "ID of the backend subnet for Cobalt 100 ARM64 workloads."
  value       = azurerm_subnet.backend.id
}

output "database_subnet_id" {
  description = "ID of the delegated database subnet."
  value       = azurerm_subnet.database.id
}

output "private_endpoints_subnet_id" {
  description = "ID of the private endpoints subnet."
  value       = azurerm_subnet.private_endpoints.id
}

output "backend_nsg_id" {
  description = "ID of the backend network security group."
  value       = azurerm_network_security_group.backend.id
}

output "gateway_id" {
  description = "ID of the Virtual Network Gateway (null if enable_gateway is false)."
  value       = var.enable_gateway ? azurerm_virtual_network_gateway.interconnect[0].id : null
}

output "gateway_public_ip" {
  description = "Public IP address of the gateway (null if enable_gateway is false)."
  value       = var.enable_gateway ? azurerm_public_ip.gateway[0].ip_address : null
}
