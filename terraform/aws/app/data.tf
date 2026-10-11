# Read outputs from AWS core stack (read-only; guaranteed exact IDs)
data "terraform_remote_state" "core" {
  backend = "local"

  config = {
    path = "../core/terraform.tfstate"
  }
}

locals {
  core = data.terraform_remote_state.core.outputs

  vpc_id                = var.vpc_id != "" ? var.vpc_id : local.core.vpc_id
  public_subnet_ids     = length(var.public_subnet_ids) > 0 ? var.public_subnet_ids : local.core.public_subnet_ids
  private_subnet_ids    = length(var.private_subnet_ids) > 0 ? var.private_subnet_ids : local.core.private_subnet_ids
  alb_security_group_id = var.alb_security_group_id != "" ? var.alb_security_group_id : local.core.alb_security_group_id
  ecs_security_group_id = var.ecs_security_group_id != "" ? var.ecs_security_group_id : local.core.ecs_security_group_id
}
