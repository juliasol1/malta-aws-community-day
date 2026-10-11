output "resource_group_name" {
  description = "Name of the backend resource group."
  value       = azurerm_resource_group.backend.name
}

output "container_group_id" {
  description = "ID of the Cobalt 100 ACI Container Group."
  value       = azurerm_container_group.backend.id
}

output "container_group_name" {
  description = "Name of the Cobalt 100 Container Group."
  value       = azurerm_container_group.backend.name
}

output "private_ip" {
  description = "Private IP address of the backend service within the Azure VNet."
  value       = azurerm_container_group.backend.ip_address
}

output "service_url" {
  description = "Private HTTP service URL reachable over the Multicloud Interconnect from AWS."
  value       = "http://${azurerm_container_group.backend.ip_address}:8080"
}

output "processor_architecture" {
  description = "CPU Architecture of the backend compute."
  value       = "ARM64 (Microsoft Cobalt 100)"
}
