# This tels terraform to use AWS as the cloud provider, and use the region stored in aws_region.

provider "aws" {
  region = var.aws_region
}
