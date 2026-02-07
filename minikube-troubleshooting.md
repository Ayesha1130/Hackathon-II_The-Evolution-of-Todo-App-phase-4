# Minikube Troubleshooting Guide

## Common Issues and Solutions

### 1. Minikube won't start
**Issue**: `minikube start` fails with hypervisor errors
**Solution**:
- Ensure VirtualBox, Hyper-V, or Docker Desktop is installed and running
- Try different drivers: `minikube start --driver=docker`
- On Windows: Run as Administrator

### 2. Images not loading
**Issue**: `minikube image load` fails
**Solution**:
- Ensure Minikube is running: `minikube status`
- Check if images exist locally: `docker images`
- Use `eval $(minikube docker-env)` to point Docker to Minikube's registry

### 3. Deployment fails
**Issue**: Helm deployment fails
**Solution**:
- Check resource availability: `kubectl top nodes`
- Check pod status: `kubectl get pods`
- Check logs: `kubectl logs -l app.kubernetes.io/name=todo-app`

### 4. Services not accessible
**Issue**: Cannot access the application
**Solution**:
- Check service status: `kubectl get services`
- Use minikube service: `minikube service <service-name> --url`
- Check ingress: `kubectl get ingress`

## Useful Commands

### Minikube Management
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192 --disk-size=20g

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete

# Check status
minikube status

# Access dashboard
minikube dashboard
```

### Kubernetes Management
```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# Check logs
kubectl logs -l app.kubernetes.io/component=backend
kubectl logs -l app.kubernetes.io/component=frontend

# Port forward for debugging
kubectl port-forward svc/todo-release-todo-app-frontend 3000:3000
kubectl port-forward svc/todo-release-todo-app-backend 8000:8000

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

### Helm Management
```bash
# Install with custom values
helm install todo-release charts/todo-app/ --values custom-values.yaml

# Upgrade deployment
helm upgrade todo-release charts/todo-app/

# Check release status
helm status todo-release

# Uninstall
helm uninstall todo-release
```

## Resource Considerations

The Todo app requires:
- At least 4 CPU cores
- 8GB RAM (recommended 12GB for smooth operation)
- 20GB disk space
- Internet access for pulling images

## Environment Variables

If you need to customize the deployment, create a `custom-values.yaml`:

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

postgresql:
  primary:
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
    persistence:
      size: "10Gi"
```

Then install with: `helm install todo-release charts/todo-app/ -f custom-values.yaml`