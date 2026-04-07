# VPC
# This looks for existing default VPC in my AWS account.
# I did this because i didnt want to create custom networking from scratch yet, so I reused AWS default networking.
data "aws_vpc" "default" {
  default = true
}

# VPC Subnet
# Again it finds the subnets inside the default VPC.
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

#S3
# This creates an S3 bucket so my app can upload/store files there.
resource "aws_s3_bucket" "uploads" {
  bucket = var.s3_bucket_name

  tags = {
    Name    = "malaideu-uploads"
    Project = "devops"
  }
}


# ALB Security Group
# This is the firewall for the Application Load Balancer (ALB), which allows public HTTPS in port 80 and HTTPS on 443
# This is my public entry point which users need to reach my services.
resource "aws_security_group" "devops_alb_sg" {
  name   = "devops-alb-sg"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Security Group
# This is the firewall for EC2 instance, which allows SSH on port 22 and app traffic for malaideu application which is host mapped to the defined port variable in terraform.tfvars and is accessible from only the ALB Security Group
resource "aws_security_group" "devops_server_sg" {
  name   = "devops-server-sg"
  vpc_id = data.aws_vpc.default.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  # App from ALB
  ingress {
    from_port       = var.malaideu_port
    to_port         = var.malaideu_port
    protocol        = "tcp"
    security_groups = [aws_security_group.devops_alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# IAM Role
# This creates an IAM role that EC2 is allowed to use, for the EC2 instance can access AWS services without storing hardcoded keys in the environment variables or in the code.
resource "aws_iam_role" "devops_server_role" {
  name = "devops-server-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

# S3 Policy Attach
# This gives the role permission to use S3
# It allows the EC2 server identity to access S3.
resource "aws_iam_role_policy_attachment" "s3_access" {
  role       = aws_iam_role.devops_server_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"
}

# Instance Profile
# EC2 doesnt attach IAM roles directly, it attaches an instance profile, which uses the role.
resource "aws_iam_instance_profile" "devops_server_profile" {
  name = "devops-server-profile"
  role = aws_iam_role.devops_server_role.name
}

# EC2 Instance
# This creates the Virtual Machine.
resource "aws_instance" "devops_server" {
  ami                         = var.ami_id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.devops_server_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.devops_server_profile.name
  associate_public_ip_address = true

  tags = {
    Name = "devops-server"
  }
}


# Target Group
# This is the backend for the ALB, which tells AWS to use the http web protocol and the port to send traffic to and backend type and also the health checking
resource "aws_lb_target_group" "malaideu_tg" {
  name        = "malaideu-tg"
  port        = var.malaideu_port
  protocol    = "HTTP"
  vpc_id      = data.aws_vpc.default.id
  target_type = "instance"

  health_check {
    path    = "/"
    matcher = "200-399"
  }
}

# Attaching EC2 to target group
# This registers the EC2 instance in the target group.
# Without this the target group exists but has no server inside it.
# In simple words this says add the EC2 server to the target group list
resource "aws_lb_target_group_attachment" "malaideu_attach" {
  target_group_arn = aws_lb_target_group.malaideu_tg.arn
  target_id        = aws_instance.devops_server.id
  port             = var.malaideu_port
}


# ALB
# This creates an public Application Load Balancer, which is the public traffic entry point.
resource "aws_lb" "devops_alb" {
  name               = "devops-alb"
  load_balancer_type = "application"
  subnets            = data.aws_subnets.default.ids
  security_groups    = [aws_security_group.devops_alb_sg.id]
}


# Listener
# This defines what the ALB does when the traffic arrives on port 80.
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.devops_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.malaideu_tg.arn
  }
}
