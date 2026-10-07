# Private backend service consumed by the AWS-hosted frontend over the interconnect.

resource "azurerm_resource_group" "backend" {
  name     = "${var.prefix}-backend-rg"
  location = local.core.location
  tags     = var.tags
}

# TODO: backend compute (VM / App Service / Container Apps) with private networking only
