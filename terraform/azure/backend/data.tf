# Read outputs from the core stack (read-only; this stack can never modify core state).
data "terraform_remote_state" "core" {
  backend = "local"

  config = {
    path = "../core/terraform.tfstate"
  }
}

locals {
  core = data.terraform_remote_state.core.outputs
}
