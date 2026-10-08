variable "subscription_id" {
  description = "Azure subscription ID."
  type        = string
  default     = "a0e62bfe-75b0-4d8f-9113-bd311e76a222"
}

variable "tenant_id" {
  description = "Azure tenant ID."
  type        = string
  default     = "60133250-bb62-4bb2-bea7-9c38341c6c55"
}

variable "location" {
  description = "Azure region for all core resources. Paired with AWS eu-central-1 for multicloud interconnect."
  type        = string
  default     = "germanywestcentral"
}

variable "prefix" {
  description = "Name prefix applied to all core infrastructure resources."
  type        = string
  default     = "awscd"
}

variable "vnet_address_space" {
  description = "Address space for the private Azure VNet. Must strictly not overlap with AWS VPC CIDR."
  type        = list(string)
  default     = ["10.20.0.0/16"]
}

variable "aws_vpc_cidr" {
  description = "CIDR block of the paired AWS VPC in Frankfurt (eu-central-1)."
  type        = string
  default     = "10.10.0.0/16"
}

variable "enable_gateway" {
  description = "Whether to provision the Virtual Network Gateway for multicloud interconnect."
  type        = bool
  default     = true
}

variable "gateway_type" {
  description = "Type of gateway to deploy: ExpressRoute (for Multicloud Interconnect) or Vpn (for site-to-site backup/test)."
  type        = string
  default     = "ExpressRoute"
  validation {
    condition     = contains(["ExpressRoute", "Vpn"], var.gateway_type)
    error_message = "gateway_type must be either 'ExpressRoute' or 'Vpn'."
  }
}

variable "gateway_sku" {
  description = "SKU of the Virtual Network Gateway."
  type        = string
  default     = "Standard"
}

variable "tags" {
  description = "Tags applied to all core resources."
  type        = map(string)
  default = {
    project     = "malta-aws-community-day"
    stack       = "core"
    environment = "demo"
    cloud       = "azure"
    region      = "germanywestcentral"
  }
}
