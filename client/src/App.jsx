import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import MobileNav from "./components/MobileNav"; // Ensure this is imported
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import Checkout from './pages/Checkout';
import Orders from './pages/Order';
import ProductForm from './pages/admin/ProductForm';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminUsers from './pages/admin/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          {/* Global UI Components - OUTSIDE of Routes */}
          <Navbar />
          <CartDrawer />
          
          <Routes>
            {/* Public & Customer Routes */}
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/product/:id' element={<ProductDetails />} /> 
            
            <Route path='/checkout' element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } /> 
            
            <Route path='/orders' element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }/>

            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }/>

            {/* Admin Routes (Nested) */}
            <Route path='/admin' element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path='orders' element={<AdminOrders />} />
              <Route path='products' element={<AdminProducts />} />
              <Route path='users' element={<AdminUsers />} />
              <Route path='coupons' element={<AdminCoupons />} />
              <Route path='add-product' element={<ProductForm />} />
              <Route path='edit-product/:id' element={<ProductForm/>}/>
            </Route>
          </Routes>

          {/* Place MobileNav here so it renders on every page but stays outside Routes */}
          <MobileNav />
          
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;