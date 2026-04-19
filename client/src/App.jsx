import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import Checkout from './pages/Checkout';
import Orders from './pages/Order';
import ProductForm from './pages/admin/ProductForm';
import Wishlist from './pages/Wishlist';
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from './pages/Profile';

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';

function App() {
  return (
<AuthProvider>
      <CartProvider>
        <Router>
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

            <Route 
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }/>
            <Route 
            path="/wishlist"
            element={
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
              <Route path='add-product' element={<ProductForm />} />
              <Route path='edit-product/:id' element={<ProductForm/>}/>
            </Route>

          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
