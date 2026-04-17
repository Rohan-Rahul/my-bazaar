import {createContext, useState, useEffect, useContext} from 'react';
import {cartService} from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({children}) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if(!token){
      setCartItems([]);
      return;
    }
    try {
      const response = await cartService.getCart();
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