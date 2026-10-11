output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer."
  value       = aws_lb.this.dns_name
}

output "app_url" {
  description = "Public URL to access the Malta Keynote presentation."
  value       = "http://${aws_lb.this.dns_name}"
}

output "ecs_cluster_name" {
  description = "Name of the ECS Graviton4 cluster."
  value       = aws_ecs_cluster.this.name
}

output "ecs_service_name" {
  description = "Name of the ECS service."
  value       = aws_ecs_service.this.name
}

output "cpu_architecture" {
  description = "Runtime CPU architecture of the ECS tasks."
  value       = "ARM64 (AWS Graviton4)"
}
