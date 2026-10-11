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

locals {
  server_script = <<-PY
import http.server
import json
import socketserver
import urllib.request
import os

PORT = int(os.environ.get('PORT', 3000))
S3_URL = "http://awscd-presentation-frontend-419361886508.s3-website.eu-central-1.amazonaws.com"
AZURE_URL = os.environ.get('AZURE_BACKEND_URL', 'http://10.20.1.4:8080')

# Download the static 3D presentation files locally to /tmp/web
os.makedirs('/tmp/web', exist_ok=True)
files = ['index.html', 'styles.css', 'three.min.js', 'OrbitControls.js', 'textures.js', 'audio.js', 'game.js']
for f in files:
    try:
        urllib.request.urlretrieve(f"{S3_URL}/{f}", f"/tmp/web/{f}")
    except Exception as e:
        print(f"Failed to fetch {f}: {e}")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='/tmp/web', **kwargs)

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            resp = {
                "service": "Malta AWS-Azure Multicloud Interconnect Presentation Service",
                "status": "healthy",
                "cloud": "AWS",
                "region": "eu-central-1 (Frankfurt)",
                "processor": "AWS Graviton4 ARM64 (Fargate)",
                "paired_backend": AZURE_URL,
                "interconnect_status": "ONLINE"
            }
            self.wfile.write(json.dumps(resp, indent=2).encode())
        elif self.path == '/api/azure-ping':
            try:
                req = urllib.request.Request(f"{AZURE_URL}/api/ping")
                with urllib.request.urlopen(req, timeout=3) as r:
                    body = r.read().decode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(body.encode())
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e), "target": AZURE_URL}).encode())
        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
PY
}

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
      command = [
        "python3",
        "-c",
        local.server_script
      ]

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
