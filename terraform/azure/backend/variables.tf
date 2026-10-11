variable "subscription_id" {
  description = "Azure subscription ID."
  type        = string
  default     = "d418ba35-2077-43ac-b95e-8f37adbe9f4f"
}

variable "tenant_id" {
  description = "Azure tenant ID."
  type        = string
  default     = "60133250-bb62-4bb2-bea7-9c38341c6c55"
}

variable "prefix" {
  description = "Name prefix applied to all backend resources."
  type        = string
  default     = "awscd"
}

variable "vm_size" {
  description = "Azure VM SKU powered by Microsoft Cobalt 100 ARM64 processor (Frankfurt / germanywestcentral)."
  type        = string
  default     = "Standard_D2ps_v6"
}

variable "admin_username" {
  description = "Administrator username for the Linux VM."
  type        = string
  default     = "azureuser"
}

variable "admin_ssh_public_key" {
  description = "Optional public SSH key. If left blank, a dedicated TLS key pair will be generated."
  type        = string
  default     = ""
}

variable "backend_private_ip" {
  description = "Static private IP within the backend subnet (10.20.1.0/24) for deterministic routing from AWS."
  type        = string
  default     = "10.20.1.10"
}

variable "tags" {
  description = "Tags applied to all backend resources."
  type        = map(string)
  default = {
    project     = "malta-aws-community-day"
    stack       = "backend"
    cloud       = "azure"
    arch        = "arm64"
    processor   = "cobalt-100"
    environment = "demo"
  }
}
