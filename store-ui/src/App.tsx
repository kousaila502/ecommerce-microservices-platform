import { Routes, Route } from "react-router-dom"
import Home from './pages/Home/Home'
import Product from './pages/Product/Product'
import Cart from './pages/Cart/Cart'
import SearchResults from './pages/SearchResults/SearchResults'
import Profile from './pages/Profile/Profile'
import Layout from './components/layout/Layout'
import Register from './pages/Register/Register'
import UsersManagement from './pages/UsersManagement/UsersManagement'



const App = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/register" element={<Register />} />
                <Route path="/users" element={<UsersManagement />} />
            </Routes>
        </Layout>
    )
}

export default App