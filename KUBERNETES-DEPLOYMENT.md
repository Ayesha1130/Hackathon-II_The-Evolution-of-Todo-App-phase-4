# Kubernetes Deployment Guide

This guide explains how to deploy the Todo application to Kubernetes using Minikube and Helm.

## Prerequisites

Before starting, ensure you have the following tools installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/)

## Quick Start with Scripts

### Option 1: Using Windows Batch Scripts

1. **Start Minikube**:
   ```cmd
   minikube-setup.bat
   ```

2. **Build and Deploy**:
   ```cmd
   deploy-minikube.bat
   ```

### Option 2: Manual Deployment

1. **Start Minikube**:
   ```bash
   minikube start --cpus=4 --memory=8192 --disk-size=20g
   minikube addons enable ingress
   ```

2. **Build Docker Images**:
   ```bash
   docker build -t todo-backend:latest ./backend
   docker build -t todo-frontend:latest ./frontend
   ```

3. **Load Images into Minikube**:
   ```bash
   minikube image load todo-backend:latest
   minikube image load todo-frontend:latest
   ```

4. **Deploy with Helm**:
   ```bash
   helm install todo-release charts/todo-app/ --wait --timeout=10m
   ```

## Accessing the Application

### Using Minikube Service URLs:
```bash
# Get frontend URL
minikube service todo-release-todo-app-frontend --url

# Get backend URL
minikube service todo-release-todo-app-backend --url
```

### Using Port Forwarding:
```bash
# Frontend
kubectl port-forward svc/todo-release-todo-app-frontend 3000:3000

# Backend
kubectl port-forward svc/todo-release-todo-app-backend 8000:8000
```

### Using Ingress (after enabling):
```bash
# Add to hosts file: 127.0.0.1 todo.local
# Then access: http://todo.local
```

## Verifying the Deployment

### Check Pod Status:
```bash
kubectl get pods
```

Expected output should show all pods in "Running" status:
```
NAME                                                        READY   STATUS    RESTARTS   AGE
todo-release-todo-app-backend-7d5b9c8c5c-xyz               1/1     Running   0          5m
todo-release-todo-app-frontend-7d5b9c8c5c-abc              1/1     Running   0          5m
todo-release-todo-app-postgresql-primary-0                 1/1     Running   0          5m
```

### Check Services:
```bash
kubectl get services
```

### Check Logs:
```bash
# Backend logs
kubectl logs -l app.kubernetes.io/component=backend

# Frontend logs
kubectl logs -l app.kubernetes.io/component=frontend
```

## Custom Configuration

### Override Default Values

Create a `custom-values.yaml` file to override default values:

```yaml
backend:
  replicaCount: 2
  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"

frontend:
  replicaCount: 2
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"

ingress:
  enabled: true
  hosts:
    - host: todo.local
      paths:
        - path: /
          pathType: Prefix

env:
  openaiApiKey: "your-openai-api-key-here"
```

Deploy with custom values:
```bash
helm install todo-release charts/todo-app/ -f custom-values.yaml
```

## Scaling the Application

### Scale Backend:
```bash
kubectl scale deployment todo-release-todo-app-backend --replicas=3
```

### Scale Frontend:
```bash
kubectl scale deployment todo-release-todo-app-frontend --replicas=3
```

## Updating the Application

### Update with New Image:
```bash
# Build new image
docker build -t todo-backend:v2 ./backend

# Load into Minikube
minikube image load todo-backend:v2

# Update deployment
kubectl set image deployment/todo-release-todo-app-backend backend=todo-backend:v2
```

### Update with Helm:
```bash
# Modify values in values.yaml or create custom-values.yaml
helm upgrade todo-release charts/todo-app/ -f custom-values.yaml
```

## Monitoring and Debugging

### Check Resource Usage:
```bash
kubectl top nodes
kubectl top pods
```

### Get Detailed Pod Information:
```bash
kubectl describe pod <pod-name>
```

### Exec into a Pod:
```bash
kubectl exec -it <pod-name> -- /bin/sh
```

## Cleanup

### Uninstall Release:
```bash
helm uninstall todo-release
```

### Stop and Delete Minikube:
```bash
minikube stop
minikube delete
```

## Troubleshooting

Refer to the [troubleshooting guide](minikube-troubleshooting.md) for common issues and solutions.

## Production Considerations

When deploying to production, consider:

- Using a proper container registry (Docker Hub, AWS ECR, etc.)
- Implementing SSL certificates for HTTPS
- Setting up proper backup strategies for PostgreSQL
- Configuring monitoring and alerting
- Implementing proper security measures (RBAC, network policies, etc.)
- Using a production-grade ingress controller
- Implementing CI/CD pipelines