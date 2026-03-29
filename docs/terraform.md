# Terraform

This project uses Terraform to provision the AWS infrastructure required by the application.

## What Terraform Manages

- EC2 instance
- S3 bucket
- IAM role
- IAM instance profile
- Security group

## Terraform File Structure

```text
├── main.tf
├── outputs.tf
├── providers.tf
├── terraform.tf
├── terraform.tfvars
└── variables.tf
```

## What Each File Does

### `terraform.tf`
Defines Terraform version requirements and provider version constraints.

### `providers.tf`
Configures the AWS provider and region.

### `main.tf`
Defines the AWS resources to create, such as the EC2 instance, S3 bucket, IAM role, instance profile, and security group.

### `variables.tf`
Declares the input variables used by the configuration.

### `terraform.tfvars`
Stores the actual values assigned to those variables for this environment.

### `outputs.tf`
Displays useful values after the infrastructure is created, such as the EC2 public IP, bucket name, IAM role name, and security group ID.

## Terraform Workflow

```text
terraform init
    ↓
terraform plan
    ↓
terraform apply
```

## What This Means

- `terraform init` initializes the working directory and downloads required provider plugins  
- `terraform plan` shows what Terraform intends to create, modify, or destroy  
- `terraform apply` creates the infrastructure in AWS based on the configuration  


## Why Terraform Was Used

- Replaces manual AWS console setup
- Makes infrastructure reproducible and consistent
- Allows infrastructure to be version-controlled
- Separates infrastructure provisioning from application deployment
- Aligns with real-world DevOps and cloud practices

## How Terraform Fits Into This Project

Terraform
    ↓
Creates AWS Infrastructure
    ↓
EC2 + S3 + IAM + Security Group
    ↓
Application Deployment Uses That Infrastructure

## Practical Role in This Project

Terraform is responsible for provisioning the AWS infrastructure required by the application.

It creates:

- EC2 instance (application server)
- S3 bucket (file storage)
- IAM role and instance profile (secure AWS access)
- Security group (network access control)

After the infrastructure is created:

- Docker runs the application inside a container
- GitHub Actions builds and pushes the Docker image
- EC2 pulls the latest image and runs it
- IAM allows secure interaction with S3 without storing credentials

This separation keeps infrastructure provisioning and application delivery clean, automated, and maintainable.
