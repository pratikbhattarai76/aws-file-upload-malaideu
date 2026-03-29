# Deployment

The application is deployed on an AWS EC2 instance using Docker.


## How Deployment Works

1. The application is packaged into a Docker image.
2. GitHub Actions builds and pushes the image to GHCR.
3. The EC2 server pulls the latest image from GHCR.
4. Docker Compose updates the running container.
5. The application becomes available through Cloudflare.

## Important Points

- The server does not store the application source code.
- The application is deployed using a pre-built Docker image.
- Environment variables are stored securely on the server using a `.env` file.
- Docker Compose manages the container lifecycle (start, stop, restart).
- New deployments update the container by pulling the latest image and restarting it.
