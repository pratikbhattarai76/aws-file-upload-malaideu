# These are the inputs for terraform. Instead of hardcoding the values directly inside main.tf, I defined them as variables.
# These are like placeholders. The values are inserted in terraform.tfvars

variable "aws_region" { type = string }
variable "ami_id" { type = string }
variable "instance_type" { type = string }
variable "key_name" { type = string }
variable "s3_bucket_name" { type = string }

variable "ssh_cidr" {
  description = "CIDR for SSH access"
  type        = string
}

variable "malaideu_port" {
  type = number
}

