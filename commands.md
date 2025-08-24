#!/bin/bash
# =============================================================================
# CLUSTER OVERVIEW & DASHBOARD ACCESS COMMANDS
# Quick commands to see everything in your GKE cluster
# =============================================================================

echo "🌐 GKE CLUSTER OVERVIEW & DASHBOARD ACCESS COMMANDS"
echo "================================================="

# =============================================================================
# 1. CLUSTER CONNECTION & BASIC INFO
# =============================================================================
echo "📡 CLUSTER CONNECTION & BASIC INFO"
echo "--------------------------------"

# Connect to your cluster (run this first)
gcloud container clusters get-credentials ecommerce-thesis --zone northamerica-northeast1-a

# Check cluster information
kubectl cluster-info

# Get cluster details
kubectl get nodes -o wide

# Check cluster version
kubectl version --short

# =============================================================================
# 2. COMPLETE CLUSTER OVERVIEW
# =============================================================================
echo "🔍 COMPLETE CLUSTER OVERVIEW"
echo "-------------------------"

# See ALL resources across ALL namespaces
kubectl get all --all-namespaces

# Get all pods across all namespaces
kubectl get pods --all-namespaces -o wide

# Get all services across all namespaces
kubectl get services --all-namespaces

# Get all deployments across all namespaces
kubectl get deployments --all-namespaces

# Get all ingress resources
kubectl get ingress --all-namespaces

# See all namespaces
kubectl get namespaces

# Get all secrets (names only, not content)
kubectl get secrets --all-namespaces

# Get all configmaps
kubectl get configmaps --all-namespaces

# =============================================================================
# 3. RESEARCH-APPS NAMESPACE (YOUR SERVICES)
# =============================================================================
echo "🚀 RESEARCH-APPS NAMESPACE (YOUR SERVICES)"
echo "---------------------------------------"

# Everything in your main namespace
kubectl get all -n research-apps

# Detailed view of your services
kubectl get pods,svc,deployment,ingress -n research-apps -o wide

# Check your specific services
echo "User Service:"
kubectl get pods -n research-apps -l app=user-service
kubectl get deployment user-service-deployment -n research-apps
kubectl get service user-service -n research-apps

echo "Order Service:"
kubectl get pods -n research-apps -l app=order-service
kubectl get deployment order-service-deployment -n research-apps
kubectl get service order-service -n research-apps

# Check secrets in your namespace
kubectl get secrets -n research-apps

# =============================================================================
# 4. ARGOCD NAMESPACE OVERVIEW
# =============================================================================
echo "🔄 ARGOCD NAMESPACE OVERVIEW"
echo "-------------------------"

# All ArgoCD components
kubectl get all -n argocd

# ArgoCD applications
kubectl get applications -n argocd

# ArgoCD services
kubectl get services -n argocd

# =============================================================================
# 5. LOAD BALANCERS & NETWORKING
# =============================================================================
echo "🌐 LOAD BALANCERS & NETWORKING"
echo "----------------------------"

# Get all services with external IPs (Load Balancers)
kubectl get services --all-namespaces -o wide

# Check for LoadBalancer type services
kubectl get services --all-namespaces --field-selector spec.type=LoadBalancer

# Check ingress controllers and external IPs
kubectl get ingress --all-namespaces -o wide

# Get endpoints (shows actual pod IPs behind services)
kubectl get endpoints --all-namespaces

# Check for any external services
kubectl get services --all-namespaces | grep -E "(LoadBalancer|NodePort|ExternalName)"

# =============================================================================
# 6. ARGOCD DASHBOARD ACCESS (PORT FORWARDING)
# =============================================================================
echo "🖥️ ARGOCD DASHBOARD ACCESS"
echo "------------------------"

# Method 1: Port forward to ArgoCD server (RECOMMENDED)
echo "Starting ArgoCD port forwarding on http://localhost:8080"
echo "Press Ctrl+C to stop"
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Method 2: Alternative port (if 8080 is busy)
# kubectl port-forward svc/argocd-server -n argocd 9090:443

# Method 3: Forward to HTTP port (if HTTPS doesn't work)
# kubectl port-forward svc/argocd-server -n argocd 8080:80

# Get ArgoCD admin password (run in another terminal)
echo "To get ArgoCD admin password, run:"
echo "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"

# =============================================================================
# 7. KUBERNETES DASHBOARD ACCESS (if installed)
# =============================================================================
echo "📊 KUBERNETES DASHBOARD ACCESS"
echo "----------------------------"

# Check if Kubernetes dashboard is installed
kubectl get pods --all-namespaces | grep dashboard

# If dashboard exists, port forward to it
# kubectl port-forward -n kubernetes-dashboard service/kubernetes-dashboard 8443:443

# Create admin user for dashboard (if needed)
# kubectl create serviceaccount dashboard-admin-sa
# kubectl create clusterrolebinding dashboard-admin-sa --clusterrole=cluster-admin --serviceaccount=default:dashboard-admin-sa
# kubectl describe secret $(kubectl get secrets | grep dashboard-admin-sa | cut -f1 -d' ') | grep -E '^token'

# =============================================================================
# 8. MONITORING & METRICS ACCESS
# =============================================================================
echo "📈 MONITORING & METRICS ACCESS"
echo "----------------------------"

# Check if metrics-server is running
kubectl get pods -n kube-system | grep metrics-server

# Get resource usage (if metrics-server is available)
kubectl top nodes
kubectl top pods --all-namespaces

# Check for Prometheus/Grafana (if installed)
kubectl get pods --all-namespaces | grep -E "(prometheus|grafana)"

# Port forward to Grafana (if exists)
# kubectl port-forward svc/grafana -n monitoring 3000:3000

# =============================================================================
# 9. USEFUL ONE-LINER OVERVIEW COMMANDS
# =============================================================================
echo "⚡ USEFUL ONE-LINER OVERVIEW COMMANDS"
echo "----------------------------------"

# Quick cluster health check
echo "🏥 CLUSTER HEALTH:"
kubectl get componentstatuses

# Count resources by type
echo "📊 RESOURCE COUNTS:"
echo "Pods: $(kubectl get pods --all-namespaces --no-headers | wc -l)"
echo "Services: $(kubectl get services --all-namespaces --no-headers | wc -l)"
echo "Deployments: $(kubectl get deployments --all-namespaces --no-headers | wc -l)"
echo "Namespaces: $(kubectl get namespaces --no-headers | wc -l)"

# Show pods that are not running
echo "🚨 NON-RUNNING PODS:"
kubectl get pods --all-namespaces --field-selector=status.phase!=Running

# Show services with external IPs
echo "🌐 EXTERNAL SERVICES:"
kubectl get services --all-namespaces -o wide | grep -E "(EXTERNAL-IP|LoadBalancer)"

# Show recent events
echo "📋 RECENT EVENTS:"
kubectl get events --all-namespaces --sort-by='.lastTimestamp' | tail -10

# =============================================================================
# 10. ACCESS YOUR SERVICES
# =============================================================================
echo "🎯 ACCESS YOUR SERVICES"
echo "--------------------"

# Your service URLs (update with actual IPs if different)
echo "🔗 YOUR SERVICE ENDPOINTS:"
echo "User Service API: https://34.95.5.30.nip.io/user/docs"
echo "User Service Health: https://34.95.5.30.nip.io/user/health"
echo "Order Service: https://34.95.5.30.nip.io/orders/"

# Port forwarding to your services (alternative access)
echo "🔌 PORT FORWARDING TO YOUR SERVICES:"
echo "User Service: kubectl port-forward deployment/user-service-deployment -n research-apps 9090:9090"
echo "Order Service: kubectl port-forward deployment/order-service-deployment -n research-apps 8080:8080"

# Test your services
echo "🧪 TEST YOUR SERVICES:"
echo "curl https://34.95.5.30.nip.io/user/health"
echo "curl https://34.95.5.30.nip.io/orders/health"

# =============================================================================
# 11. DASHBOARD SETUP FUNCTIONS
# =============================================================================

# Function to start ArgoCD dashboard with instructions
start_argocd_dashboard() {
    echo "🚀 Starting ArgoCD Dashboard..."
    echo "================================"
    echo "1. Dashboard will be available at: http://localhost:8080"
    echo "2. Username: admin"
    echo "3. To get password, run in another terminal:"
    echo "   kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
    echo ""
    echo "Press Ctrl+C to stop the dashboard"
    echo ""
    kubectl port-forward svc/argocd-server -n argocd 8080:443
}

# Function to get ArgoCD password
get_argocd_password() {
    echo "🔐 ArgoCD Admin Password:"
    kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
    echo ""
}

# Function to show all external access points
show_external_access() {
    echo "🌐 EXTERNAL ACCESS POINTS"
    echo "======================="
    
    echo "📊 ArgoCD Dashboard:"
    echo "   Port Forward: kubectl port-forward svc/argocd-server -n argocd 8080:443"
    echo "   URL: http://localhost:8080"
    echo "   Username: admin"
    echo "   Password: Run 'get_argocd_password' function"
    echo ""
    
    echo "🎯 Your Services:"
    echo "   User Service API: https://34.95.5.30.nip.io/user/docs"
    echo "   User Service Health: https://34.95.5.30.nip.io/user/health"
    echo "   Order Service: https://34.95.5.30.nip.io/orders/"
    echo ""
    
    echo "🔌 Port Forward Options:"
    echo "   User Service: kubectl port-forward deployment/user-service-deployment -n research-apps 9090:9090"
    echo "   Order Service: kubectl port-forward deployment/order-service-deployment -n research-apps 8080:8080"
}

# =============================================================================
# 12. QUICK COMMANDS REFERENCE
# =============================================================================
echo "📚 QUICK REFERENCE"
echo "==============="
echo ""
echo "🔍 SEE EVERYTHING:"
echo "  kubectl get all --all-namespaces"
echo ""
echo "🚀 YOUR SERVICES:"
echo "  kubectl get all -n research-apps"
echo ""
echo "🔄 ARGOCD:"
echo "  kubectl get applications -n argocd"
echo "  kubectl get all -n argocd"
echo ""
echo "🌐 EXTERNAL ACCESS:"
echo "  kubectl get services --all-namespaces -o wide"
echo "  kubectl get ingress --all-namespaces"
echo ""
echo "🖥️ ARGOCD DASHBOARD:"
echo "  kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "  Username: admin"
echo "  Password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
echo ""
echo "🧪 TEST SERVICES:"
echo "  curl https://34.95.5.30.nip.io/user/health"
echo "  curl https://34.95.5.30.nip.io/orders/health"

# =============================================================================
# USAGE EXAMPLES
# =============================================================================
echo ""
echo "💡 USAGE EXAMPLES:"
echo "==============="
echo ""
echo "# Connect and see everything:"
echo "gcloud container clusters get-credentials ecommerce-thesis --zone northamerica-northeast1-a"
echo "kubectl get all --all-namespaces"
echo ""
echo "# Start ArgoCD dashboard:"
echo "kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "# Then go to http://localhost:8080 (username: admin)"
echo ""
echo "# Get ArgoCD password:"
echo "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
echo ""
echo "# Check your services:"
echo "kubectl get all -n research-apps"
echo "curl https://34.95.5.30.nip.io/user/health"