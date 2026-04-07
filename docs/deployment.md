# Deployment

The application is deployed on an AWS EC2 instance using Docker.


## How Deployment Works

1. The application is packaged into a Docker image.
2. GitHub Actions builds and pushes the image to GHCR.
3. The EC2 server pulls the latest image from GHCR.
4. Docker Compose updates the running container.
5. The Application Load Balancer (ALB) forwards incoming traffic to the EC2 instance.
6. The application becomes available through the custom domain managed by Cloudflare with combination of ACM(AWS Certificate Manger)


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

## Important Points

- The server does not store the application source code.
- The application is deployed using a pre-built Docker image.
- Environment variables are stored securely on the server using a `.env` file.
- Docker Compose manages the container lifecycle (start, stop, restart).
- New deployments update the container by pulling the latest image and restarting it.
- The application is exposed through an ALB instead of direct public access to the EC2 application port.


