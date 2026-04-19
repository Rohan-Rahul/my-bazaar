import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Checkout() {
  const { cartItems, fetchCart } = useCart();
  const {user} = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [loading,setLoading] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await loadRazorpay();
    if(!res){
      alert('Razorpay SDK failed to load. Check your internet.');
      setLoading(false);
      return;
    }

    try{
      //create order on backend
      const { data: order } = await api.post('/orders/razorpay-order', {
        amount: subtotal
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'My Bazaar',
        description: 'Order Payment',
        order_id: order.id,
        handler: async(response)=>{
          try{
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData:{
                orderItems: cartItems.map(item=>({
                  product: item.product._id,
                  title: item.product.title,
                  price: item.product.price,
                  quantity: item.quantity,
                  selectedOption: item.selectedOption,
                  selectedColor: item.selectedColor,
                })),
                shippingAddress: address,
                totalPrice: subtotal
              }
            };


            await api.post('/orders/verify', verificationData);
            fetchCart();
            alert('Payment successful! order placed.');
            navigate('/orders');
          } catch(error){
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.name || 'Customer',
          email: user?.email || '',
        },
        theme: {color: '#000000'},
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch(error){
      console.error("PAYMENT ERROR DETAILS:", error.response?.data || error);
      alert('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12'>
      <div>
        <h2 className='text-2xl font-bold mb-6'>Shipping Details</h2>
        {/* onSubmit is now changed to handlePayment */}
        <form onSubmit={handlePayment} className='space-y-4'>
          <input
            className='w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-black'
            placeholder='Address'
            onChange={(e) => setAddress({ ...address, address: e.target.value })}
            required
          />
          <div className='grid grid-cols-2 gap-4'>
            <input
              className='w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-black'
              placeholder='City'
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              required
            />
            <input
              className='w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-black'
              placeholder='Postal Code'
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
              required
            />
          </div>
          <input
            className='w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-black'
            placeholder='Country'
            onChange={(e) => setAddress({ ...address, country: e.target.value })}
            required
          />
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-black text-white py-4 rounded-full font-bold mt-4 disabled:bg-gray-400'
          >
            {loading ? "Processing..." : `Confirm & Pay ₹${subtotal}`}
          </button>
        </form>
      </div>

      <div className='bg-gray-50 p-8 rounded-[2rem] h-fit'>
        <h2 className='text-xl font-bold mb-6'>Order Summary</h2>
        <div className='space-y-4'>
          {cartItems.map((item, idx) => (
            <div key={idx} className='flex justify-between text-sm'>
              <span>
                {item.product.title} (x{item.quantity})
              </span>
              <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className='border-gray-200' />
          <div className='flex justify-between font-bold text-lg'>
            <span>Total</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
