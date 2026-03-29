variable "aws region" {
  description = "AWS Region"
  type        = string
}

# ami_id is the Amazon Machine Image for EC2
variable "ami_id" {
  description = "AMI ID for EC2 Instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 Instance Type"
  type        = string
}

variable "key_name" {
  description = "Existing EC2 Key Pair Name"
  type        = string
}



