output "vpc_id" {
  description = "ID of the AWS VPC."
  value       = aws_vpc.this.id
}

output "vpc_cidr" {
  description = "CIDR block of the AWS VPC."
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets."
  value       = [for s in aws_subnet.public : s.id]
}

output "private_subnet_ids" {
  description = "IDs of the private subnets."
  value       = [for s in aws_subnet.private : s.id]
}

output "alb_security_group_id" {
  description = "Security group ID for the Application Load Balancer."
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "Security group ID for the Graviton4 ECS tasks."
  value       = aws_security_group.ecs.id
}

output "dx_gateway_id" {
  description = "ID of the AWS Direct Connect Gateway for Multicloud Interconnect."
  value       = aws_dx_gateway.interconnect.id
}
