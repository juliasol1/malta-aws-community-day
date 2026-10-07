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

variable "prefix" {
  description = "Name prefix applied to all resources."
  type        = string
  default     = "awscd"
}

variable "tags" {
  description = "Tags applied to all resources."
  type        = map(string)
  default = {
    project = "malta-aws-community-day"
    stack   = "backend"
  }
}
