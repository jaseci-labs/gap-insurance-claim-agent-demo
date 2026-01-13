#!/bin/bash

# Build and push script for GAP Insurance Demo
# This script builds and pushes both server and client Docker images to ECR

set -e

# Configuration
AWS_REGION="us-east-2"
AWS_ACCOUNT_ID="776241927220"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
SERVER_REPOSITORY="gap-insurance/jac"
CLIENT_REPOSITORY="gap-insurance/webapp"

# Default tag
TAG="${1:-latest}"

echo "Building and pushing GAP Insurance Demo images with tag: $TAG"

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build and push server image
echo "Building server image..."
cd server
docker buildx build \
    --platform linux/amd64 \
    -t $ECR_REGISTRY/$SERVER_REPOSITORY:$TAG \
    -t $ECR_REGISTRY/$SERVER_REPOSITORY:latest \
    --push \
    .
cd ..

# Build and push client image
echo "Building client image..."
cd client
docker buildx build \
    --platform linux/amd64 \
    --build-arg VITE_API_URL=https://gap-insurance-api.jaseci.org \
    -t $ECR_REGISTRY/$CLIENT_REPOSITORY:$TAG \
    -t $ECR_REGISTRY/$CLIENT_REPOSITORY:latest \
    --push \
    .
cd ..

echo "✅ Build and push completed successfully!"
echo "🔗 Server Image: $ECR_REGISTRY/$SERVER_REPOSITORY:$TAG"
echo "🔗 Client Image: $ECR_REGISTRY/$CLIENT_REPOSITORY:$TAG"
echo ""
echo "📝 Next steps:"
echo "   1. Update the image tags in the Kubernetes manifests if using a specific version"
echo "   2. Images will be automatically deployed by Flux CD"
echo "   3. Access the application at:"
echo "      - Frontend: https://gap-insurance.jaseci.org"
echo "      - API: https://gap-insurance-api.jaseci.org/docs"