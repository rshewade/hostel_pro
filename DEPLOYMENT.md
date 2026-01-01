# CI / CD Deployment Notes

This repository includes two GitHub Actions workflows:

- `.github/workflows/ci.yml` — runs lint, tests and builds the Next.js frontend.
- `.github/workflows/cd.yml` — builds and optionally publishes a Docker image and can deploy to a remote host via SSH.

Required repository secrets (set these in GitHub Settings → Secrets → Actions):

- `DOCKERHUB_USERNAME` — Docker Hub username (optional; required to push image).
- `DOCKERHUB_ACCESS_TOKEN` — Docker Hub access token or password (optional; required to push image).
- `SSH_HOST` — Remote host to deploy to (optional; required for SSH deploy).
- `SSH_USER` — SSH user on remote host (optional; required for SSH deploy).
- `SSH_PRIVATE_KEY` — Private SSH key (PEM) for the deploy user (optional; required for SSH deploy).
- `SSH_PORT` — (optional) SSH port; default `22` when not set.

How CD works:

- If `DOCKERHUB_*` secrets are present the workflow will build `frontend` using the provided `Dockerfile` and push the image tagged as `DOCKERHUB_USERNAME/hostel_pro-frontend:latest`.
- If `SSH_*` secrets are present the workflow will copy `docker-compose.yml` to `~/hostel_pro` on the remote host and run `docker compose up -d --build` there.

Notes:

- Make sure the remote server has Docker and Docker Compose (v2) installed and that the deploy user can run Docker commands.
- If you prefer a different registry or deploy method (e.g. GitHub Container Registry, Kubernetes, or a cloud provider), I can adapt the workflows.
