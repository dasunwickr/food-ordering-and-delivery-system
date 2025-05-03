#!/bin/bash
# Script to set up a Kind Kubernetes cluster for local development and testing

echo "=== Setting up Kind Kubernetes Cluster for Food Ordering System (Backend Only) ==="

# Check if kind is installed
if ! command -v kind &> /dev/null; then
    echo "Kind is not installed. Please install kind first."
    echo "Visit: https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
    exit 1
fi

# Define the Kind cluster configuration
echo "Creating kind-config.yaml..."
cat > kind-config.yaml << EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name: food-ordering-system
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF

# Create the Kind cluster
echo
echo "Creating Kind cluster..."
kind create cluster --config kind-config.yaml

if [ $? -ne 0 ]; then
    echo "Failed to create Kind cluster."
    exit 1
fi

# Install NGINX Ingress Controller for Kind
echo
echo "Installing NGINX Ingress Controller..."
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for NGINX Ingress to be ready
echo "Waiting for NGINX Ingress Controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s

# Check cluster info
echo
echo "Kind cluster is ready! Cluster information:"
kubectl cluster-info

echo
echo "=== Setting up Docker Registry for Local Images ==="

# Set up a local Docker registry
echo "Creating local Docker registry..."
docker run -d --restart=always -p 5000:5000 --name local-registry registry:2

# Connect the registry to the Kind network
echo "Connecting registry to Kind network..."
docker network connect kind local-registry

# Add the registry to Kind cluster
echo
echo "Configuring Kind to use local registry..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:5000"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF

echo
echo "=== Ready to Deploy Food Ordering System Backend Services ==="
echo "You can now build and push images to localhost:5000 and deploy them to your Kind cluster."
echo
echo "To deploy the backend services, run:"
echo "   ./deploy-to-kind.sh"
echo
echo "Note: This setup is for backend services only. The frontend will be deployed separately."
echo

# Clean up temporary files
rm -f kind-config.yaml