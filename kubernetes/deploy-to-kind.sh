#!/bin/bash
# Script to build, push, and deploy the food ordering system backend services to a local Kind cluster

echo "=== Building and Deploying Food Ordering System Backend Services to Kind ==="
echo

# Check if Kind cluster exists
if ! kind get clusters | grep -q "food-ordering-system"; then
    echo "Kind cluster 'food-ordering-system' not found. Please run kind-setup.sh first."
    exit 1
fi

# Function to build and push a Docker image
build_and_push() {
    SERVICE_PATH=$1
    SERVICE_NAME=$2
    
    echo "Building ${SERVICE_NAME}..."
    docker build -t localhost:5000/${SERVICE_NAME}:latest ${SERVICE_PATH}
    if [ $? -ne 0 ]; then
        echo "❌ Failed to build ${SERVICE_NAME}. Deployment aborted."
        exit 1
    fi
    
    echo "Pushing ${SERVICE_NAME} to local registry..."
    docker push localhost:5000/${SERVICE_NAME}:latest
    if [ $? -ne 0 ]; then
        echo "❌ Failed to push ${SERVICE_NAME}. Deployment aborted."
        exit 1
    fi
    
    echo "✅ Successfully built and pushed ${SERVICE_NAME}"
    echo
}

# Function to apply a Kubernetes file with proper error handling
apply_kubernetes_file() {
    echo "Applying: $1"
    kubectl apply -f "$1"
    if [ $? -ne 0 ]; then
        echo "❌ Failed to apply $1. Deployment aborted."
        exit 1
    else
        echo "✅ Successfully applied $1"
    fi
    echo
    # Small delay to ensure resources are registered
    sleep 2
}

# Update image references in Kubernetes YAML files to use local registry
echo "=== Updating Kubernetes manifests to use local registry ==="
echo

# Create a temporary directory for modified files
mkdir -p temp_k8s

# Copy and modify Kubernetes YAML files
echo "Updating Kubernetes manifests..."
cp 00-namespace.yaml 01-api-gateway-configmaps.yaml 02-api-gateway.yaml temp_k8s/

# Update service YAML files with local registry references
for f in 0[3-9]-*-service.yaml 10-payment-service.yaml; do
    OUTPUT_FILE="temp_k8s/$(basename $f)"
    sed 's|image: dasunwickr/\(.*\):latest|image: localhost:5000/\1:latest|g' $f > $OUTPUT_FILE
done

# Check for additional service files
if [ -f "11-delivery-service.yaml" ]; then
    sed 's|image: dasunwickr/\(.*\):latest|image: localhost:5000/\1:latest|g' 11-delivery-service.yaml > temp_k8s/11-delivery-service.yaml
fi

if [ -f "12-ratings-reviews-service.yaml" ]; then
    sed 's|image: dasunwickr/\(.*\):latest|image: localhost:5000/\1:latest|g' 12-ratings-reviews-service.yaml > temp_k8s/12-ratings-reviews-service.yaml
fi

echo "✅ Kubernetes manifests updated"
echo

# Build and push all service images
echo "=== Building and pushing Docker images ==="
echo

cd ../backend

# Build and push microservices
build_and_push auth-service auth-service
build_and_push session-service session-service
build_and_push user-service user-service
build_and_push order-service order-service
build_and_push menu-service menu-service
build_and_push cart-service cart-service
build_and_push notification-service notification-service
build_and_push payment-service payment-service

# Check if delivery and ratings-reviews services exist
if [ -d "delivery-service" ]; then
    build_and_push delivery-service delivery-service
fi

if [ -d "ratings-and-reviews-service" ]; then
    build_and_push ratings-and-reviews-service ratings-and-reviews-service
fi

# Remove frontend build and push as it's not needed
# Frontend will be deployed separately

cd ../kubernetes

echo "All backend images built and pushed successfully."
echo

# Deploy to Kubernetes
echo "=== Deploying to Kind Kubernetes Cluster ==="
echo

# Deploy namespace first
echo "=== Creating namespace ==="
apply_kubernetes_file "temp_k8s/00-namespace.yaml"

# Deploy API Gateway ConfigMaps
echo "=== Deploying API Gateway ConfigMaps ==="
apply_kubernetes_file "temp_k8s/01-api-gateway-configmaps.yaml"

# Deploy API Gateway
echo "=== Deploying API Gateway ==="
apply_kubernetes_file "temp_k8s/02-api-gateway.yaml"

# Deploy Auth Service
echo "=== Deploying Auth Service ==="
apply_kubernetes_file "temp_k8s/03-auth-service.yaml"

# Deploy Session Service
echo "=== Deploying Session Service ==="
apply_kubernetes_file "temp_k8s/04-session-service.yaml"

# Deploy User Service
echo "=== Deploying User Service ==="
apply_kubernetes_file "temp_k8s/05-user-service.yaml"

# Deploy Order Service
echo "=== Deploying Order Service ==="
apply_kubernetes_file "temp_k8s/06-order-service.yaml"

# Deploy Menu Service (with MySQL)
echo "=== Deploying Menu Service ==="
apply_kubernetes_file "temp_k8s/07-menu-service.yaml"

# Deploy Cart Service
echo "=== Deploying Cart Service ==="
apply_kubernetes_file "temp_k8s/08-cart-service.yaml"

# Deploy Notification Service
echo "=== Deploying Notification Service ==="
apply_kubernetes_file "temp_k8s/09-notification-service.yaml"

# Deploy Payment Service
echo "=== Deploying Payment Service ==="
apply_kubernetes_file "temp_k8s/10-payment-service.yaml"

# Check if any additional service files exist and deploy them
if [ -f "temp_k8s/11-delivery-service.yaml" ]; then
  echo "=== Deploying Delivery Service ==="
  apply_kubernetes_file "temp_k8s/11-delivery-service.yaml"
fi

if [ -f "temp_k8s/12-ratings-reviews-service.yaml" ]; then
  echo "=== Deploying Ratings and Reviews Service ==="
  apply_kubernetes_file "temp_k8s/12-ratings-reviews-service.yaml"
fi

echo "=== Creating secrets from environment files ==="
cd ..
bash kubernetes/create-secrets-from-env.sh
cd kubernetes

echo "=== Deployment completed! ==="
echo "Waiting for pods to become ready..."
echo

# Wait for a moment to let pods initialize
sleep 10

# Check the status of the deployment
echo "=== Checking pod status ==="
kubectl get pods -n nomnom-system

# Get the API Gateway service information
echo
echo "=== API Gateway Access Information ==="
kubectl get service api-gateway -n nomnom-system

# Create an Ingress for easier access
echo
echo "=== Creating Ingress for API Gateway ==="
cat > temp_k8s/ingress.yaml << EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: food-ordering-ingress
  namespace: nomnom-system
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
EOF

kubectl apply -f temp_k8s/ingress.yaml

echo
echo "=== Access Information ==="
echo "Your Food Ordering System Backend API is now accessible at:"
echo "  http://localhost/"
echo
echo "For debugging, you can check pod logs with:"
echo "  kubectl logs -n nomnom-system [pod-name]"
echo
echo "Note: This deployment only includes backend services. The frontend needs to be deployed separately."
echo

# Optional cleanup
read -p "Do you want to clean up the temporary files? (y/n) " cleanup
if [[ $cleanup == "y" || $cleanup == "Y" ]]; then
    echo "Cleaning up temporary files..."
    rm -rf temp_k8s
    echo "Temporary files removed."
fi