# AWS Setup

This project uses AWS services for hosting the application and storing uploaded files.

## EC2

- Used to host the application
- Runs Docker and Docker Compose
- ALB is the public entry point
- Receives app traffic from ALB on port 8080
- EC2 is not the main public application end point.
- Uses and attached IAM instance profile for AWS access

## S3

- Stores uploaded files
- Provides scalable and durable object storage
- Used by the application to upload and retrieve files

## IAM

- An IAM role is attached to the EC2 instance
- The application uses this role to access S3
- No AWS credentials are stored in the code or environment variables

## Security Group

- There are two security groups:
  - ALB SG for 80/443
  - EC2 SG for 22 and app port from ALB only.

## Why IAM Roles?

- More secure than hardcoded access keys
- Temporary credentials are provided automatically by AWS
- Keeps secrets out of the application and deployment files
- Better aligned with cloud security best practices
