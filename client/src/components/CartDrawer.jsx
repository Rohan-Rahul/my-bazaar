import {useCart} from '../context/CartContext';
import axios from 'axios';

function CartDrawer(){
  const {isCartOpen,setIsCartOpen,cartItems,fetchCart} = useCart();

  //calculate subtotal assuming the backend populates the product details
  const subtotal = cartItems.reduce((acc,item)=>{
    const price = item.product?.price || 0;
    return acc + (price*item.quantity);
  }, 0);

  const handleUpdateQuantity = async (productId, size, newQuantity) =>{
    if(newQuantity<1) return;
    try{
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:3000/api/cart',
        {productId, size, quantity: newQuantity},
        {headers: {Authorization: `Bearer ${token}`}}
      );
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (productId,size) => {
    try{
      const token = localStorage.getItem('token');
      //using data payload in delete request for axios
      await axios.delete('http://localhost:3000/api/cart', {
        headers: {Authorization: `Bearer ${token}`},
        data: {productId, size}
      });
      fetchCart();
    } catch (error){
      console.error('Error removing item:',error);
    }
  };

  if(!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Sliding Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full flex">
        <div className="h-full flex flex-col bg-white shadow-xl w-full transform transition-transform duration-300 translate-x-0">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Item Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt={item.product.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{item.product?.title || 'Product'}</h3>
                          <button 
                            onClick={() => handleRemoveItem(item.product?._id, item.size)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                          <button 
                            onClick={() => handleUpdateQuantity(item.product?._id, item.size, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >-</button>
                          <span className="px-2 text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(item.product?._id, item.size, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100"
                          >+</button>
                        </div>
                        <p className="font-semibold">${item.product?.price || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-gray-600">Subtotal</span>
                <span className="text-xl font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <button className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;