# Remote state for the core (network) stack.
# Each stack uses its own key so state is isolated per stack.
terraform {
  backend "azurerm" {
    subscription_id      = "a0e62bfe-75b0-4d8f-9113-bd311e76a222"
    tenant_id            = "60133250-bb62-4bb2-bea7-9c38341c6c55"
    resource_group_name  = "test"
    storage_account_name = "tfbackend12"
    container_name       = "tfbackend"
    key                  = "azure/core.tfstate"
    use_azuread_auth     = true
  }
}
