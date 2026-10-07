output "resource_group_name" {
  value = azurerm_resource_group.core.name
}

output "location" {
  value = azurerm_resource_group.core.location
}

output "vnet_id" {
  value = azurerm_virtual_network.core.id
}

output "vnet_name" {
  value = azurerm_virtual_network.core.name
}
