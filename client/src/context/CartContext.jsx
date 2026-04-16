import {createContext, useState, useEffect, useContext} from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({children}) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if(!token) return;

    try {
      const response = await axios.get('http://localhost:3000/api/cart',{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCartItems(response.data.cartItems || []);
    } catch (error) {
      console.error('Error fetching cart:',error);
    }
  };

  useEffect(()=>{
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{cartItems,isCartOpen,setIsCartOpen,fetchCart}}>{children}</CartContext.Provider>
  );
};