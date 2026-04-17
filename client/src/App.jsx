import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProductDetails from "./pages/ProductDetails";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <CartDrawer />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={
              <Signup />
            }/>
            <Route path='/product/:id' element={<ProductDetails />} /> 
            <Route
              path='/checkout'
              element={
                <ProtectedRoute>
                  <Checkout/>
                </ProtectedRoute>
              }            
            /> 
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
