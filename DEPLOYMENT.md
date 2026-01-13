# GAP Insurance Demo - Deployment Guide

This document outlines the deployment configuration for the GAP Insurance Claim Agent Demo, following the same patterns as the jac-gpt deployment.

## Overview

The deployment consists of two main components:
- **Server (JAC Backend)**: Jac application with AI agents for processing insurance claims
- **Client (React Frontend)**: Web interface for interacting with the claims agent

## Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│   Frontend (React)  │    │   Backend (Jac)     │
│   gap-insurance     │────┤   gap-insurance-api │
│   .jaseci.org       │    │   .jaseci.org       │
└─────────────────────┘    └─────────────────────┘
                                      │
                           ┌─────────────────────┐
                           │   MongoDB Replica   │
                           │   Set + Redis       │
                           └─────────────────────┘
```

## Docker Images

- **Server**: `776241927220.dkr.ecr.us-east-2.amazonaws.com/gap-insurance/jac`
- **Client**: `776241927220.dkr.ecr.us-east-2.amazonaws.com/gap-insurance/webapp`

## Kubernetes Configuration

The deployment is organized into two namespaces:

### Server Deployment (`gap-insurance` namespace)
Located in: `infra/apps/jaseci-cluster/gap-insurance/`

- **Namespace**: `gap-insurance`
- **Services**: JAC server, MongoDB replica set, Redis
- **Ingress**: `gap-insurance-api.jaseci.org`
- **Resources**:
  - JAC Server: 1-2 CPU, 2-4Gi memory
  - MongoDB: 2 replicas with persistent storage
  - Redis: In-memory caching

### Client Deployment (`gap-insurance-webapp` namespace)
Located in: `infra/apps/jaseci-cluster/gap-insurance-webapp/`

- **Namespace**: `gap-insurance-webapp`
- **Service**: React webapp (nginx)
- **Ingress**: `gap-insurance.jaseci.org`
- **Replicas**: 2 (for high availability)

## CI/CD Pipeline

### Automated Deployment (GitHub Actions)

The deployment is triggered by:
1. **Release Tags**: `gap-insurance-v*` or `v*` (e.g., `gap-insurance-v1.0.0`)
2. **Manual Dispatch**: For testing and manual deployments

#### Workflow File
`.github/workflows/deploy.yml` handles:
- Multi-platform Docker builds (linux/amd64)
- ECR authentication and push
- Automatic tagging and versioning

### Manual Deployment

For local testing and development:

```bash
# Build and push both images with default 'latest' tag
./build-and-push.sh

# Build and push with specific version
./build-and-push.sh v1.0.0
```

**Prerequisites**:
- Docker with buildx support
- AWS CLI configured with ECR permissions
- kubectl access to the jaseci cluster (optional, for verification)

## Environment Configuration

### Server Environment Variables

The JAC server uses these key environment variables:

```yaml
# Database
DATABASE_HOST: "mongodb://JacMongoUser:JacMongoPassword2025@mongodb-0.mongodb-svc:27017,mongodb-1.mongodb-svc:27017/?replicaSet=rs0&authSource=admin"

# Cache
REDIS_HOST: "redis://redis"
REDIS_PORT: "6379"

# Authentication (jac-cloud compatible)
TOKEN_SECRET: "s3cr3t"
TOKEN_ALGORITHM: "HS256"
TOKEN_TIMEOUT: "720"

# AI Services
OPENAI_API_KEY: [from secret]

# AWS
AWS_REGION: "us-east-2"
AWS_ACCESS_KEY_ID: [from secret]
AWS_SECRET_ACCESS_KEY: [from secret]
```

### Client Environment Variables

The React client is built with:

```bash
VITE_API_URL=https://gap-insurance-api.jaseci.org
```

## Deployment Process

### Automatic Deployment (Recommended)

1. **Create a Release**:
   ```bash
   git tag gap-insurance-v1.0.0
   git push origin gap-insurance-v1.0.0
   ```

2. **Monitor GitHub Actions**: The workflow will automatically:
   - Build Docker images
   - Push to ECR
   - Update image tags in the infra repository via Flux

3. **Flux CD Integration**: FluxCD monitors the ECR repositories and automatically updates the Kubernetes deployments when new images are available.

### Manual Deployment

1. **Build and Push Images**:
   ```bash
   ./build-and-push.sh v1.0.0
   ```

2. **Update Kubernetes Manifests** (if using specific versions):
   ```yaml
   # In infra/apps/jaseci-cluster/gap-insurance/jac.yaml
   image: 776241927220.dkr.ecr.us-east-2.amazonaws.com/gap-insurance/jac:v1.0.0
   
   # In infra/apps/jaseci-cluster/gap-insurance-webapp/webapp.yaml  
   image: 776241927220.dkr.ecr.us-east-2.amazonaws.com/gap-insurance/webapp:v1.0.0
   ```

3. **Deploy via Flux** (if the infra repo is connected):
   Changes to the infra repository will trigger automatic deployment.

## Access URLs

After successful deployment:

- **Frontend Application**: https://gap-insurance.jaseci.org
- **API Documentation**: https://gap-insurance-api.jaseci.org/docs
- **Health Check**: https://gap-insurance-api.jaseci.org/docs

## Monitoring and Logging

### Health Checks

The server deployment includes:
- **Liveness Probe**: `GET /docs` (checks every 10s)
- **Readiness Probe**: `GET /docs` (checks every 5s)

### Resource Monitoring

Monitor resource usage via:
- Kubernetes dashboard
- AWS CloudWatch (for ECR, EKS metrics)
- Application logs via kubectl

### Troubleshooting

Common debugging commands:

```bash
# Check pod status
kubectl get pods -n gap-insurance
kubectl get pods -n gap-insurance-webapp

# View logs
kubectl logs -n gap-insurance deployment/jac
kubectl logs -n gap-insurance-webapp deployment/webapp

# Check ingress status
kubectl get ingress -n gap-insurance
kubectl get ingress -n gap-insurance-webapp

# Describe resources for detailed status
kubectl describe deployment/jac -n gap-insurance
```

## Scaling

### Horizontal Scaling

Adjust replica counts in the deployment manifests:

```yaml
# Server scaling (stateful, be careful with database connections)
spec:
  replicas: 2  # Increase as needed

# Client scaling (stateless, can scale freely)
spec:
  replicas: 5  # Scale based on traffic
```

### Vertical Scaling

Adjust resource limits:

```yaml
resources:
  requests:
    cpu: "2"      # Increase CPU
    memory: "4Gi" # Increase memory
  limits:
    cpu: "4"
    memory: "8Gi"
```

## Security

### Secrets Management

Sensitive data is stored in Kubernetes secrets:
- `openai-api-key`: OpenAI API credentials
- `aws-credentials`: AWS access keys
- `mongodb-secret`: Database credentials

### Network Security

- All traffic is routed through AWS Application Load Balancer
- TLS termination at the load balancer level
- Internal cluster communication over encrypted channels

## Backup and Recovery

### Database Backup

MongoDB data is persisted using:
- **Storage Class**: `gp3` (AWS EBS)
- **Volume Size**: 20Gi per replica
- **Backup Strategy**: Regular EBS snapshots (configured separately)

### Application State

The Jac application maintains state in:
- MongoDB (persistent data)
- Redis (temporary cache)

### Disaster Recovery

1. **Database Recovery**: Restore from EBS snapshots
2. **Application Recovery**: Redeploy from ECR images
3. **Configuration Recovery**: Git-based infrastructure as code

## Dependencies

- **Kubernetes**: EKS cluster with sufficient resources
- **Storage**: EBS volumes for persistent storage
- **Networking**: ALB controller for ingress management
- **Image Registry**: ECR repositories for container images
- **GitOps**: Flux CD for automated deployments

## Version History

- **v1.0.0**: Initial deployment configuration
- Future versions will be tracked through git tags and release notes.