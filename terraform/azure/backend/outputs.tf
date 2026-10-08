output "resource_group_name" {
  description = "Name of the backend resource group."
  value       = azurerm_resource_group.backend.name
}

output "vm_id" {
  description = "ID of the Microsoft Cobalt 100 Linux VM."
  value       = azurerm_linux_virtual_machine.backend.id
}

output "vm_name" {
  description = "Name of the Cobalt 100 Linux VM."
  value       = azurerm_linux_virtual_machine.backend.name
}

output "private_ip" {
  description = "Private IP address of the backend service within the Azure VNet."
  value       = azurerm_network_interface.backend.private_ip_address
}

output "service_url" {
  description = "Private HTTP service URL reachable over the Multicloud Interconnect from AWS."
  value       = "http://${azurerm_network_interface.backend.private_ip_address}:8080"
}

output "vm_size" {
  description = "Azure VM SKU."
  value       = azurerm_linux_virtual_machine.backend.size
}

output "processor_architecture" {
  description = "CPU Architecture of the backend compute."
  value       = "ARM64 (Microsoft Cobalt 100)"
}

output "ssh_private_key_pem" {
  description = "Generated private SSH key (if no public key was supplied)."
  value       = var.admin_ssh_public_key == "" ? tls_private_key.ssh[0].private_key_pem : null
  sensitive   = true
}
