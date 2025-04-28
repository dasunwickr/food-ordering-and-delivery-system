@echo off
REM Script to build, push, and deploy the food ordering system to a local Kind cluster

echo === Building and Deploying Food Ordering System to Kind ===
echo.

REM Check if Kind cluster exists
kind get clusters | findstr food-ordering-system > nul
if %ERRORLEVEL% neq 0 (
    echo Kind cluster 'food-ordering-system' not found. Please run kind-setup.bat first.
    exit /b 1
)

REM Function to build and push a Docker image
:build_and_push
    set SERVICE_PATH=%1
    set SERVICE_NAME=%2
    
    echo Building %SERVICE_NAME%...
    docker build -t localhost:5000/%SERVICE_NAME%:latest %SERVICE_PATH%
    if %ERRORLEVEL% neq 0 (
        echo X Failed to build %SERVICE_NAME%. Deployment aborted.
        exit /b 1
    )
    
    echo Pushing %SERVICE_NAME% to local registry...
    docker push localhost:5000/%SERVICE_NAME%:latest
    if %ERRORLEVEL% neq 0 (
        echo X Failed to push %SERVICE_NAME%. Deployment aborted.
        exit /b 1
    )
    
    echo √ Successfully built and pushed %SERVICE_NAME%
    echo.
    exit /b 0

REM Function to apply a Kubernetes file with proper error handling
:apply_kubernetes_file
    echo Applying: %1
    kubectl apply -f "%1"
    if %ERRORLEVEL% neq 0 (
        echo X Failed to apply %1. Deployment aborted.
        exit /b 1
    ) else (
        echo √ Successfully applied %1
    )
    echo.
    REM Small delay to ensure resources are registered
    timeout /t 2 /nobreak >nul
    exit /b 0

REM Update image references in Kubernetes YAML files to use local registry
echo === Updating Kubernetes manifests to use local registry ===
echo.

REM Create a temporary directory for modified files
if not exist temp_k8s mkdir temp_k8s

REM Copy and modify Kubernetes YAML files
echo Updating Kubernetes manifests...
for %%f in (00-namespace.yaml 01-api-gateway-configmaps.yaml 02-api-gateway.yaml) do (
    copy "%%f" "temp_k8s\%%f" > nul
)

REM Update service YAML files with local registry references
setlocal enabledelayedexpansion
for %%f in (03-auth-service.yaml 04-session-service.yaml 05-user-service.yaml 06-order-service.yaml 07-menu-service.yaml 08-cart-service.yaml 09-notification-service.yaml 10-payment-service.yaml) do (
    set "outfile=temp_k8s\%%f"
    (for /f "delims=" %%i in (%%f) do (
        set "line=%%i"
        if "!line:~0,9!"=="      image" (
            set "service_name=!line:*image: dasunwickr/=!"
            set "service_name=!service_name::latest=!"
            echo       image: localhost:5000/!service_name!:latest
        ) else (
            echo %%i
        )
    )) > "!outfile!"
)

REM Check for additional service files
if exist "11-delivery-service.yaml" (
    (for /f "delims=" %%i in (11-delivery-service.yaml) do (
        set "line=%%i"
        if "!line:~0,9!"=="      image" (
            set "service_name=!line:*image: dasunwickr/=!"
            set "service_name=!service_name::latest=!"
            echo       image: localhost:5000/!service_name!:latest
        ) else (
            echo %%i
        )
    )) > "temp_k8s\11-delivery-service.yaml"
)

if exist "12-ratings-reviews-service.yaml" (
    (for /f "delims=" %%i in (12-ratings-reviews-service.yaml) do (
        set "line=%%i"
        if "!line:~0,9!"=="      image" (
            set "service_name=!line:*image: dasunwickr/=!"
            set "service_name=!service_name::latest=!"
            echo       image: localhost:5000/!service_name!:latest
        ) else (
            echo %%i
        )
    )) > "temp_k8s\12-ratings-reviews-service.yaml"
)
endlocal

echo √ Kubernetes manifests updated
echo.

REM Build and push all service images
echo === Building and pushing Docker images ===
echo.

cd ..\backend

call :build_and_push auth-service auth-service
call :build_and_push session-service session-service
call :build_and_push user-service user-service
call :build_and_push order-service order-service
call :build_and_push menu-service menu-service
call :build_and_push cart-service cart-service
call :build_and_push notification-service notification-service
call :build_and_push payment-service payment-service

REM Check if delivery and ratings-reviews services exist
if exist delivery-service (
    call :build_and_push delivery-service delivery-service
)

if exist ratings-and-reviews-service (
    call :build_and_push ratings-and-reviews-service ratings-and-reviews-service
)

REM Build and push frontend
if exist ..\frontend (
    call :build_and_push ..\frontend frontend
)

cd ..\kubernetes

echo All images built and pushed successfully.
echo.

REM Deploy to Kubernetes
echo === Deploying to Kind Kubernetes Cluster ===
echo.

REM Deploy namespace first
echo === Creating namespace ===
call :apply_kubernetes_file "temp_k8s\00-namespace.yaml"

REM Deploy API Gateway ConfigMaps
echo === Deploying API Gateway ConfigMaps ===
call :apply_kubernetes_file "temp_k8s\01-api-gateway-configmaps.yaml"

REM Deploy API Gateway
echo === Deploying API Gateway ===
call :apply_kubernetes_file "temp_k8s\02-api-gateway.yaml"

REM Deploy Auth Service
echo === Deploying Auth Service ===
call :apply_kubernetes_file "temp_k8s\03-auth-service.yaml"

REM Deploy Session Service
echo === Deploying Session Service ===
call :apply_kubernetes_file "temp_k8s\04-session-service.yaml"

REM Deploy User Service
echo === Deploying User Service ===
call :apply_kubernetes_file "temp_k8s\05-user-service.yaml"

REM Deploy Order Service
echo === Deploying Order Service ===
call :apply_kubernetes_file "temp_k8s\06-order-service.yaml"

REM Deploy Menu Service (with MySQL)
echo === Deploying Menu Service ===
call :apply_kubernetes_file "temp_k8s\07-menu-service.yaml"

REM Deploy Cart Service
echo === Deploying Cart Service ===
call :apply_kubernetes_file "temp_k8s\08-cart-service.yaml"

REM Deploy Notification Service
echo === Deploying Notification Service ===
call :apply_kubernetes_file "temp_k8s\09-notification-service.yaml"

REM Deploy Payment Service
echo === Deploying Payment Service ===
call :apply_kubernetes_file "temp_k8s\10-payment-service.yaml"

REM Check if any additional service files exist and deploy them
if exist "temp_k8s\11-delivery-service.yaml" (
  echo === Deploying Delivery Service ===
  call :apply_kubernetes_file "temp_k8s\11-delivery-service.yaml"
)

if exist "temp_k8s\12-ratings-reviews-service.yaml" (
  echo === Deploying Ratings and Reviews Service ===
  call :apply_kubernetes_file "temp_k8s\12-ratings-reviews-service.yaml"
)

echo === Creating secrets from environment files ===
cd ..
call kubernetes\create-secrets-from-env.sh
cd kubernetes

echo === Deployment completed! ===
echo Waiting for pods to become ready...
echo.

REM Wait for a moment to let pods initialize
timeout /t 10 /nobreak >nul

REM Check the status of the deployment
echo === Checking pod status ===
kubectl get pods -n nomnom-system

REM Get the API Gateway service information
echo.
echo === API Gateway Access Information ===
kubectl get service api-gateway -n nomnom-system

REM Create an Ingress for easier access
echo.
echo === Creating Ingress for API Gateway ===
(
    echo apiVersion: networking.k8s.io/v1
    echo kind: Ingress
    echo metadata:
    echo   name: food-ordering-ingress
    echo   namespace: nomnom-system
    echo   annotations:
    echo     kubernetes.io/ingress.class: nginx
    echo spec:
    echo   rules:
    echo   - http:
    echo       paths:
    echo       - path: /
    echo         pathType: Prefix
    echo         backend:
    echo           service:
    echo             name: api-gateway
    echo             port:
    echo               number: 80
) > temp_k8s\ingress.yaml

kubectl apply -f temp_k8s\ingress.yaml

echo.
echo === Access Information ===
echo Your Food Ordering System is now accessible at:
echo   http://localhost/
echo.
echo For debugging, you can check pod logs with:
echo   kubectl logs -n nomnom-system [pod-name]
echo.

REM Optional cleanup
echo Do you want to clean up the temporary files? (Y/N)
set /p cleanup=
if /i "%cleanup%"=="Y" (
    echo Cleaning up temporary files...
    rd /s /q temp_k8s
    echo Temporary files removed.
)

pause