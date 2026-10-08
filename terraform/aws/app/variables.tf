variable "aws_region" {
  description = "AWS region for deployment."
  type        = string
  default     = "eu-central-1"
}

variable "prefix" {
  description = "Name prefix applied to all application resources."
  type        = string
  default     = "awscd"
}

variable "vpc_id" {
  description = "VPC ID from core stack. If empty, will be looked up by tag."
  type        = string
  default     = ""
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for the ALB."
  type        = list(string)
  default     = []
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for Graviton4 ECS tasks."
  type        = list(string)
  default     = []
}

variable "alb_security_group_id" {
  description = "Security group ID for the ALB from core stack."
  type        = string
  default     = ""
}

variable "ecs_security_group_id" {
  description = "Security group ID for the ECS tasks from core stack."
  type        = string
  default     = ""
}

variable "app_image" {
  description = "Docker image for the Malta keynote presentation frontend & telemetry service."
  type        = string
  default     = "public.ecr.aws/nginx/nginx:alpine-slim"
}

variable "container_port" {
  description = "Port exposed by the presentation application container."
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS Graviton4 task replicas to run."
  type        = number
  default     = 2
}

variable "cpu" {
  description = "CPU units allocated to each Fargate task (512 = 0.5 vCPU)."
  type        = number
  default     = 512
}

variable "memory" {
  description = "Memory allocated to each Fargate task in MiB."
  type        = number
  default     = 1024
}

variable "azure_backend_url" {
  description = "Private URL of the Azure Cobalt 100 backend across the Multicloud Interconnect."
  type        = string
  default     = "http://10.20.1.10:8080"
}

variable "tags" {
  description = "Tags applied to all application resources."
  type        = map(string)
  default = {
    project     = "malta-aws-community-day"
    stack       = "app"
    cloud       = "aws"
    arch        = "arm64"
    processor   = "graviton4"
    environment = "demo"
  }
}
