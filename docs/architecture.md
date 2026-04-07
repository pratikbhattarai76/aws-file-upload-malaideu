# Architecture

This project follows a simple flow from user request to cloud storage.

## Flow
```text
User
    ↓
Cloudflare
    ↓
AWS Application Load Balancer
    ↓
Target Group
    ↓
EC2 Instance
    ↓
Docker Container
    ↓
Malaideu Application
    ↓
AWS SDK
    ↓
S3 Bucket
```

## Explanation

- The user accesses the application through a custom domain.
- Cloudflare handles DNS and HTTPS.
- Requests are forwarded to the EC2 instance.
- The application runs inside a Docker container.
- The backend uses the AWS SDK to upload and retrieve files from S3.
- Files are stored in an S3 bucket.


## 🔀 Multi-Service Routing

This project also demonstrates host-based routing using a single AWS Application Load Balancer (ALB).

Two services are deployed behind the same ALB:

- `malaideu.pratik-labs.xyz` → Main application (Node.js app on port 8080)
- `test.pratik-labs.xyz` → Test application (Nginx container on port 8081)

The ALB uses host header rules to route traffic to the correct target group.

### Routing Flow

```text
User request
    ↓
Cloudflare DNS
    ↓
AWS ALB (HTTPS 443)
malaideu.pratik-labs.xyz → malaideu-tg → EC2:8080
test.pratik-labs.xyz     → test-tg     → EC2:8081
```
