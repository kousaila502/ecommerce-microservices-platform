// src/App.tsx (UPDATED WITH ADMIN ORDER MANAGEMENT)
import { Routes, Route } from "react-router-dom"
import Home from './pages/Home/Home'
import Product from './pages/Product/Product'
import Cart from './pages/Cart/Cart'
import SearchResults from './pages/SearchResults/SearchResults'
import Profile from './pages/Profile/Profile'
import Layout from './components/layout/Layout'
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import UsersManagement from './pages/UsersManagement/UsersManagement'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import AdminLayout from './components/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard'
import UserManagement from './pages/Admin/UserManagement/UserManagement'
import Analytics from './pages/Admin/Analytics/Analytics'
import Settings from './pages/Admin/Settings/Settings'
import AdminOrderManagement from './pages/'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import OrdersPage from './pages/Orders/OrdersPage'
import OrderDetails from './pages/Orders/OrderDetails'

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <Routes>
                    {/* Public routes with main layout */}
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/product/:id" element={<Layout><Product /></Layout>} />
                    <Route path="/search" element={<Layout><SearchResults /></Layout>} />
                    <Route path="/register" element={<Layout><Register /></Layout>} />
                    <Route path="/login" element={<Layout><Login /></Layout>} />
                    
                    {/* Protected routes with main layout */}
                    <Route path="/cart" element={
                        <Layout>
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        </Layout>
                    } />
                    <Route path="/profile" element={
                        <Layout>
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        </Layout>
                    } />

                    {/* Orders routes - Fixed to use Layout */}
                    <Route path="/orders" element={
                        <Layout>
                            <ProtectedRoute>
                                <OrdersPage />
                            </ProtectedRoute>
                        </Layout>
                    } />
                    <Route path="/orders/:id" element={
                        <Layout>
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        </Layout>
                    } />
                    
                    {/* Legacy admin route (redirect to new admin) */}
                    <Route path="/users" element={
                        <Layout>
                            <ProtectedRoute requireAdmin={true}>
                                <UsersManagement />
                            </ProtectedRoute>
                        </Layout>
                    } />
                    
                    {/* New Admin routes with admin layout */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute requireAdmin={true}>
                            <AdminLayout>
                                <Routes>
                                    <Route index element={<AdminDashboard />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="orders" element={<AdminOrderManagement />} />
                                    <Route path="analytics" element={<Analytics />} />
                                    <Route path="settings" element={<Settings />} />
                                </Routes>
                            </AdminLayout>
                        </ProtectedRoute>
                    } />
                </Routes>
            </CartProvider>
        </AuthProvider>
    )
}

export default App