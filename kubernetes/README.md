# Kubernetes Deployment Guide for Food Ordering System Backend

This guide explains how to deploy the backend services of the Food Ordering and Delivery System to a local Kubernetes cluster using Kind.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- [kind](https://kind.sigs.k8s.io/docs/user/quick-start/#installation) installed

## Deployment Steps

### 1. Set up a local Kind Kubernetes cluster

The `kind-setup.sh` script creates a local Kubernetes cluster with the following features:
- Named "food-ordering-system"
- NGINX Ingress Controller for routing
- A local Docker registry for storing images

Run:
```bash
# For Linux/Mac
./kind-setup.sh

# For Windows
./kind-setup.bat
```

### 2. Deploy Backend Services

The `deploy-to-kind.sh` script:
- Builds Docker images for each microservice
- Pushes them to the local registry
- Deploys all services to the Kind cluster

Run:
```bash
# For Linux/Mac
./deploy-to-kind.sh

# For Windows
./deploy-to-kind.bat
```

## Services Deployed

The following backend services are deployed:
1. API Gateway (NGINX) - Entry point for all requests
2. Auth Service - Handles authentication and authorization
3. Session Service - Manages user sessions
4. User Service - User registration and profile management
5. Order Service - Order processing
6. Menu Service - Food menu management
7. Cart Service - Shopping cart functionality
8. Notification Service - Handles system notifications
9. Payment Service - Payment processing
10. Delivery Service - Delivery management
11. Ratings & Reviews Service - User reviews and ratings

## Accessing the Backend API

After deployment, the backend API is accessible at:
```
http://localhost/
```

## Troubleshooting

### Checking Deployment Status
```bash
kubectl get pods -n nomnom-system
```

### Viewing Service Logs
```bash
kubectl logs -n nomnom-system [pod-name]
```

### Common Issues

1. **Images not building:** Check Docker for errors
2. **Pods in CrashLoopBackOff:** Check logs with `kubectl logs`
3. **Services not accessible:** Verify Ingress is properly configured

## Notes

- This deployment only includes backend services
- The frontend needs to be deployed separately
- MongoDB and MySQL databases are deployed as part of the service pods
- Persistent volumes are used for database storage