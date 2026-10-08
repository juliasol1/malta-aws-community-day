# Dynamic lookup of core stack resources if not passed directly via variables

data "aws_vpc" "core" {
  count = var.vpc_id == "" ? 1 : 0
  tags = {
    Name = "${var.prefix}-vpc"
  }
}

data "aws_subnets" "public" {
  count = length(var.public_subnet_ids) == 0 ? 1 : 0
  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }
  tags = {
    Tier = "public"
  }
}

data "aws_subnets" "private" {
  count = length(var.private_subnet_ids) == 0 ? 1 : 0
  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }
  tags = {
    Tier = "private"
  }
}

data "aws_security_group" "alb" {
  count = var.alb_security_group_id == "" ? 1 : 0
  tags = {
    Name = "${var.prefix}-alb-sg"
  }
}

data "aws_security_group" "ecs" {
  count = var.ecs_security_group_id == "" ? 1 : 0
  tags = {
    Name = "${var.prefix}-graviton-ecs-sg"
  }
}

locals {
  vpc_id                = var.vpc_id != "" ? var.vpc_id : data.aws_vpc.core[0].id
  public_subnet_ids     = length(var.public_subnet_ids) > 0 ? var.public_subnet_ids : data.aws_subnets.public[0].ids
  private_subnet_ids    = length(var.private_subnet_ids) > 0 ? var.private_subnet_ids : data.aws_subnets.private[0].ids
  alb_security_group_id = var.alb_security_group_id != "" ? var.alb_security_group_id : data.aws_security_group.alb[0].id
  ecs_security_group_id = var.ecs_security_group_id != "" ? var.ecs_security_group_id : data.aws_security_group.ecs[0].id
}
