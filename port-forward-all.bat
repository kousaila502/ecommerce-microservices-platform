@echo off
echo Starting all port-forwards...

start "Frontend" cmd /k "kubectl port-forward service/frontend-service 3000:3000"
start "User Service" cmd /k "kubectl port-forward service/user-service 9090:9090"  
start "Cart Service" cmd /k "kubectl port-forward service/cart-service 8080:8080"
start "Order Service" cmd /k "kubectl port-forward service/order-service 8081:8081"
start "Product Service" cmd /k "kubectl port-forward service/product-service 3001:3001"
start "Search Service" cmd /k "kubectl port-forward service/search-service 4000:4000"

echo All services are being forwarded!
echo Frontend: http://localhost:3000
echo User: http://localhost:9090
echo Cart: http://localhost:8080
echo Order: http://localhost:8081
echo Product: http://localhost:3001
echo Search: http://localhost:4000
pause