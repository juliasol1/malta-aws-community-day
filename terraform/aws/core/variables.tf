variable "aws_region" {
  description = "AWS region paired with Azure germanywestcentral for Multicloud Interconnect."
  type        = string
  default     = "eu-central-1"
}

variable "prefix" {
  description = "Name prefix applied to all AWS resources."
  type        = string
  default     = "awscd"
}

variable "vpc_cidr" {
  description = "CIDR block for the AWS VPC. Strictly isolated from Azure VNet (10.20.0.0/16)."
  type        = string
  default     = "10.10.0.0/16"
}

variable "azure_vnet_cidr" {
  description = "CIDR block of the paired Azure VNet in Frankfurt (germanywestcentral)."
  type        = string
  default     = "10.20.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to distribute subnets across."
  type        = list(string)
  default     = ["eu-central-1a", "eu-central-1b"]
}

variable "tags" {
  description = "Tags applied to all AWS core resources."
  type        = map(string)
  default = {
    project     = "malta-aws-community-day"
    stack       = "core"
    cloud       = "aws"
    region      = "eu-central-1"
    environment = "demo"
  }
}
