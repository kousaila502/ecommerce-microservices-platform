// src/App.tsx (REPLACE YOUR EXISTING)
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
import { AuthProvider } from './contexts/AuthContext'

const App = () => {
    return (
        <AuthProvider>
            <Layout>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<Product />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected routes - require login */}
                    <Route path="/cart" element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    
                    {/* Admin-only routes */}
                    <Route path="/users" element={
                        <ProtectedRoute requireAdmin={true}>
                            <UsersManagement />
                        </ProtectedRoute>
                    } />
                </Routes>
            </Layout>
        </AuthProvider>
    )
}

export default App