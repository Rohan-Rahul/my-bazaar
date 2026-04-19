import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { cartService } from "../services/api";

function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, fetchCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const handleUpdateQuantity = async (productId, selectedOption, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateQuantity(productId, selectedOption, newQuantity);
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (productId, selectedOption) => {
    try {
      await cartService.removeItem(productId, selectedOption);
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  if (!isCartOpen) return null;

  return (
    // UPDATED: Increased z-index to z-[100] to stay above MobileNav
    <div className='fixed inset-0 z-[100] overflow-hidden'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity'
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* UPDATED: w-full for mobile, sm:max-w-md for desktop */}
      <div className='absolute inset-y-0 right-0 w-full sm:max-w-md flex'>
        <div className='h-full flex flex-col bg-white shadow-2xl w-full'>
          
          {/* Header */}
          <div className='flex items-center justify-between px-6 py-5 border-b border-gray-100'>
            <h2 className='text-xl font-black uppercase tracking-tighter'>My Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className='p-2 hover:bg-gray-100 rounded-full transition-colors'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          {/* Cart Items List */}
          <div className='flex-1 overflow-y-auto px-6 py-4 no-scrollbar'>
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className='text-gray-400 italic mb-4'>Your cart is empty.</p>
                <button 
                  onClick={() => setIsCartOpen(false)} 
                  className="text-black font-black uppercase text-xs tracking-widest border-b-2 border-black pb-1"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className='flex flex-col gap-8 py-4'>
                {cartItems.map((item, index) => (
                  <div key={index} className='flex gap-4 group'>
                    <div className='w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100'>
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt="" className='w-full h-full object-cover' />
                      )}
                    </div>

                    <div className='flex flex-1 flex-col justify-between py-1'>
                      <div>
                        <div className='flex justify-between items-start'>
                          <h3 className='font-bold text-gray-900 leading-tight pr-4'>
                            {item.product?.title || "Product"}
                          </h3>
                          <button
                            onClick={() => handleRemoveItem(item.product?._id, item.selectedOption)}
                            className='text-gray-300 hover:text-red-500 transition-colors'
                          >
                            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                            </svg>
                          </button>
                        </div>
                        <p className='text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1'>
                          {item.product?.variantType || "Option"}: {item.selectedOption}
                        </p>
                      </div>

                      <div className='flex justify-between items-center mt-4'>
                        <div className='flex items-center bg-gray-50 rounded-full px-1 border border-gray-100'>
                          <button
                            onClick={() => handleUpdateQuantity(item.product?._id, item.selectedOption, item.quantity - 1)}
                            className='w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black'
                          >
                            -
                          </button>
                          <span className='px-2 text-xs font-bold w-4 text-center'>{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product?._id, item.selectedOption, item.quantity + 1)}
                            className='w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black'
                          >
                            +
                          </button>
                        </div>
                        <p className='font-black text-sm'>₹{item.product?.price || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Checkout Area */}
          {cartItems.length > 0 && (
            <div className='border-t border-gray-100 p-6 bg-white'>
              <div className='flex justify-between items-center mb-6'>
                <span className='text-xs font-black uppercase tracking-widest text-gray-400'>Subtotal</span>
                <span className='text-2xl font-black tracking-tighter'>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              
              {/* UPDATED: Larger, more thumb-friendly button with margin for the safe area */}
              <button
                onClick={handleCheckout}
                className='w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-xl shadow-black/10'
              >
                Proceed to Checkout
              </button>
              
              <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-black">
                Shipping calculated at checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;