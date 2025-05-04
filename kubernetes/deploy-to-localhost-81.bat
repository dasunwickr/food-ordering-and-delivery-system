@echo off
REM Deploy to localhost on port 81
REM This script deploys all services to a local Kubernetes cluster and exposes them on port 81

echo Checking if Kubernetes cluster is running...
kubectl cluster-info > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Error: Unable to connect to the Kubernetes cluster.
  echo Please ensure your Kubernetes cluster is running by executing:
  echo   - For Docker Desktop: Make sure Kubernetes is enabled in settings
  echo   - For kind: Run .\kind-setup.bat first
  echo   - For minikube: Run 'minikube start'
  exit /b 1
)

REM Create namespace if it doesn't exist
kubectl apply -f 00-namespace.yaml --validate=false

REM Deploy API Gateway ConfigMaps
kubectl apply -f 01-api-gateway-configmaps.yaml --validate=false

REM Deploy all services
kubectl apply -f 03-auth-service.yaml --validate=false
kubectl apply -f 04-session-service.yaml --validate=false
kubectl apply -f 05-user-service.yaml --validate=false
kubectl apply -f 06-order-service.yaml --validate=false
kubectl apply -f 07-menu-service.yaml --validate=false
kubectl apply -f 08-cart-service.yaml --validate=false
kubectl apply -f 09-notification-service.yaml --validate=false
kubectl apply -f 10-payment-service.yaml --validate=false
kubectl apply -f 11-delivery-service.yaml --validate=false
kubectl apply -f 12-ratings-reviews-service.yaml --validate=false

REM Deploy modified API Gateway with port 81
kubectl apply -f - --validate=false << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway-port-81
  namespace: nomnom-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: api-gateway-port-81
  template:
    metadata:
      labels:
        app: api-gateway-port-81
    spec:
      containers:
      - name: api-gateway
        image: nginx:latest
        ports:
        - containerPort: 81
        volumeMounts:
        - name: nginx-conf
          mountPath: /etc/nginx/nginx.conf
          subPath: nginx.conf
        - name: nginx-default-conf
          mountPath: /etc/nginx/conf.d/default.conf
          subPath: default.conf
      volumes:
      - name: nginx-conf
        configMap:
          name: nginx-conf
      - name: nginx-default-conf
        configMap:
          name: nginx-default-conf
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-port-81
  namespace: nomnom-system
spec:
  selector:
    app: api-gateway-port-81
  ports:
  - port: 81
    targetPort: 81
    nodePort: 30081
  type: NodePort
EOF

echo All services deployed. API Gateway exposed on port 81
echo The food ordering system should now be accessible at http://localhost:81/
echo.
echo Note: If you're using 'kind' as your Kubernetes cluster, you may need to port-forward:
echo kubectl port-forward -n nomnom-system service/api-gateway-port-81 81:81