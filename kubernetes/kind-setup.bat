@echo off
REM Script to set up a Kind Kubernetes cluster for local development and testing

echo === Setting up Kind Kubernetes Cluster for Food Ordering System ===

REM Check if kind is installed
kind version > nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Kind is not installed. Please install kind first.
    echo Visit: https://kind.sigs.k8s.io/docs/user/quick-start/#installation
    exit /b 1
)

REM Define the Kind cluster configuration
echo Creating kind-config.yaml...
(
    echo kind: Cluster
    echo apiVersion: kind.x-k8s.io/v1alpha4
    echo name: food-ordering-system
    echo nodes:
    echo - role: control-plane
    echo   kubeadmConfigPatches:
    echo   - |
    echo     kind: InitConfiguration
    echo     nodeRegistration:
    echo       kubeletExtraArgs:
    echo         node-labels: "ingress-ready=true"
    echo   extraPortMappings:
    echo   - containerPort: 80
    echo     hostPort: 80
    echo     protocol: TCP
    echo   - containerPort: 443
    echo     hostPort: 443
    echo     protocol: TCP
) > kind-config.yaml

REM Create the Kind cluster
echo.
echo Creating Kind cluster...
kind create cluster --config kind-config.yaml

if %ERRORLEVEL% neq 0 (
    echo Failed to create Kind cluster.
    exit /b 1
)

REM Install NGINX Ingress Controller for Kind
echo.
echo Installing NGINX Ingress Controller...
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

REM Wait for NGINX Ingress to be ready
echo Waiting for NGINX Ingress Controller to be ready...
kubectl wait --namespace ingress-nginx ^
  --for=condition=ready pod ^
  --selector=app.kubernetes.io/component=controller ^
  --timeout=90s

REM Check cluster info
echo.
echo Kind cluster is ready! Cluster information:
kubectl cluster-info

echo.
echo === Setting up Docker Registry for Local Images ===

REM Set up a local Docker registry
echo Creating local Docker registry...
docker run -d --restart=always -p 5000:5000 --name local-registry registry:2

REM Connect the registry to the Kind network
echo Connecting registry to Kind network...
docker network connect kind local-registry

REM Add the registry to Kind cluster
echo.
echo Configuring Kind to use local registry...
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

echo.
echo === Ready to Deploy Food Ordering System ===
echo You can now build and push images to localhost:5000 and deploy them to your Kind cluster.
echo.
echo To deploy the food ordering system, run:
echo   deploy-to-kind.bat
echo.