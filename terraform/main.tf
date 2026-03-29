# S3 Bucket
resource "aws_s3_bucket" "uploads" {
  bucket = var.s3_bucket_name
  tags = {
    Name    = "malaideu-upload-bucket"
    Project = "malaideu"
  }
}
