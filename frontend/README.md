Food Ordering & Delivery System Deployment Guide
This guide provides instructions for deploying the Food Ordering & Delivery System using Docker and Kubernetes with kind.

Deployment with Docker
Prerequisites
Docker installed on your system.
Docker Compose installed.
Steps
Navigate to the backend directory:

Start the services using Docker Compose:

Verify that all services are running:

Access the application via the API Gateway at http://localhost.

Deployment with Kubernetes (kind)
Prerequisites
kind installed on your system.
kubectl CLI installed and configured.
Steps
Create a kind cluster:

Load Docker images into the kind cluster:

Navigate to the kubernetes directory:

Deploy the application:

Monitor the deployment:

Access the application via the API Gateway:

Run the following command to get the service details:
If using kind, you may need to forward the port:

### Using kind for Kubernetes Deployment

If you are using `kind` (Kubernetes in Docker) for your Kubernetes deployment, follow these additional steps:

1. **Create a kind cluster**:
   ```bash
   kind create cluster --name nomnom-system
   ```

2. **Load Docker images into the kind cluster**:
   ```bash
   kind load docker-image <image-name> --name nomnom-system
   ```

3. **Port-forward the API Gateway service**:
   After deploying the application, forward the API Gateway port to access the application locally:
   ```bash
   kubectl port-forward service/api-gateway 8080:80 -n nomnom-system
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:8080` to access the Food Ordering & Delivery System.

Notes
Ensure all .env files are properly configured before deployment.
For production, consider using a managed Kubernetes service and secure sensitive data using Kubernetes Secrets.