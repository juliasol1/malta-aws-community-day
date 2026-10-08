# AWS ECS Fargate on Graviton4 ARM64 Compute Stack
# Serves the Malta Keynote presentation and orchestrates live telemetry pings across Interconnect to Azure.

resource "aws_ecs_cluster" "this" {
  name = "${var.prefix}-graviton-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# IAM Roles
# -----------------------------------------------------------------------------

resource "aws_iam_role" "execution" {
  name = "${var.prefix}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  name = "${var.prefix}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# -----------------------------------------------------------------------------
# CloudWatch Logs
# -----------------------------------------------------------------------------

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.prefix}-malta-app"
  retention_in_days = 7
  tags              = var.tags
}

# -----------------------------------------------------------------------------
# ECS Task Definition (Graviton4 ARM64 Native)
# -----------------------------------------------------------------------------

resource "aws_ecs_task_definition" "app" {
  family                   = "${var.prefix}-malta-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.cpu)
  memory                   = tostring(var.memory)
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  # Explicitly configure AWS Graviton4 ARM64 native execution
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "malta-presentation-app"
      image     = var.app_image
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "PORT"
          value = tostring(var.container_port)
        },
        {
          name  = "AZURE_BACKEND_URL"
          value = var.azure_backend_url
        },
        {
          name  = "AWS_REGION"
          value = var.aws_region
        },
        {
          name  = "PROCESSOR"
          value = "AWS Graviton4 ARM64"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }
    }
  ])

  tags = var.tags
}

# -----------------------------------------------------------------------------
# Application Load Balancer (Public Ingress for Attendees & Main Stage)
# -----------------------------------------------------------------------------

resource "aws_lb" "this" {
  name               = "${var.prefix}-presentation-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [local.alb_security_group_id]
  subnets            = local.public_subnet_ids

  tags = var.tags
}

resource "aws_lb_target_group" "this" {
  name        = "${var.prefix}-presentation-tg"
  port        = var.container_port
  protocol    = "HTTP"
  vpc_id      = local.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-399"
  }

  tags = var.tags
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# ECS Fargate Service
# -----------------------------------------------------------------------------

resource "aws_ecs_service" "this" {
  name            = "${var.prefix}-malta-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = local.private_subnet_ids
    security_groups  = [local.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.this.arn
    container_name   = "malta-presentation-app"
    container_port   = var.container_port
  }

  depends_on = [aws_lb_listener.http]
  tags       = var.tags
}
