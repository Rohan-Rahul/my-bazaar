import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { toast } from "react-hot-toast";

function Checkout() {
  const { cartItems, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [address, setAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "India",
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Calculate discount and final total
  const discountAmount = appliedCoupon 
    ? (appliedCoupon.discountType === 'percentage' 
        ? (subtotal * appliedCoupon.discountValue) / 100 
        : appliedCoupon.discountValue)
    : 0;

  const finalTotal = subtotal - discountAmount;

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setSavedAddresses(data.addresses || []);
        const defaultAddr = data.addresses?.find(a => a.isDefault);
        if (defaultAddr) {
          setAddress({
            address: defaultAddr.address,
            city: defaultAddr.city,
            postalCode: defaultAddr.postalCode,
            country: defaultAddr.country
          });
        }
      } catch (error) {
        console.error("Error loading addresses");
      }
    };
    fetchSavedAddresses();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode });
      setAppliedCoupon(data);
      toast.success(`Coupon "${data.code}" applied!`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

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
      alert('Razorpay SDK failed to load.');
      setLoading(false);
      return;
    }

    try {
      // Create Razorpay order with the finalTotal (after discount)
      const { data: order } = await api.post('/orders/razorpay-order', {
        amount: finalTotal 
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'My Bazaar',
        description: appliedCoupon ? `Discount Applied: ${appliedCoupon.code}` : 'Order Payment',
        order_id: order.id,
        handler: async(response)=>{
          try {
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
                  selectedColor: item.selectedColor
                })),
                shippingAddress: address,
                totalPrice: finalTotal, // Save discounted price in DB
                userEmail: user?.email,
                couponUsed: appliedCoupon?.code || null
              }
            };

            await api.post('/orders/verify', verificationData);
            fetchCart();
            toast.success('Order placed successfully!');
            navigate('/orders');
          } catch(error){
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: {color: '#000000'},
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch(error){
      alert('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-12'>
      <div className="lg:col-span-2">
        <h2 className='text-2xl font-bold mb-6'>Shipping Details</h2>
        
        {/* Saved Addresses Selector */}
        {savedAddresses.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Quick Select Address</p>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {savedAddresses.map((addr) => (
                <button 
                  key={addr._id}
                  type="button"
                  onClick={() => setAddress({
                    address: addr.address, city: addr.city, postalCode: addr.postalCode, country: addr.country
                  })}
                  className="flex-shrink-0 text-left p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:border-black transition-all max-w-[180px]"
                >
                  <p className="text-sm font-bold truncate">{addr.address}</p>
                  <p className="text-[10px] text-gray-500">{addr.city}, {addr.postalCode}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handlePayment} className='space-y-4'>
          <input className='w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all' placeholder='Full Street Address' value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })} required />
          <div className='grid grid-cols-2 gap-4'>
            <input className='w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all' placeholder='City' value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} required />
            <input className='w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all' placeholder='Postal Code' value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} required />
          </div>
          <input className='w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black transition-all' placeholder='Country' value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} required />

          <button type='submit' disabled={loading || cartItems.length === 0} className='w-full bg-black text-white py-5 rounded-2xl font-black mt-4 disabled:bg-gray-400 shadow-xl shadow-black/10'>
            {loading ? "Processing..." : `Confirm & Pay ₹${finalTotal.toFixed(2)}`}
          </button>
        </form>
      </div>

      {/* Summary Sidebar with Coupon */}
      <div className='lg:col-span-1'>
        <div className='bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 sticky top-24'>
          <h2 className='text-xl font-bold mb-6'>Order Summary</h2>
          
          <div className='space-y-4 mb-8'>
            {cartItems.map((item, idx) => (
              <div key={idx} className='flex justify-between text-sm'>
                <span className="text-gray-600">{item.product.title} (x{item.quantity})</span>
                <span className="font-bold">₹{(item.product.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
          </div>

          {/* Coupon Input */}
          <div className="mb-8 pt-6 border-t border-gray-200">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Promo Code</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 bg-white px-4 py-2 rounded-xl text-sm border-none outline-none focus:ring-1 focus:ring-black"
              />
              <button 
                type="button"
                onClick={handleApplyCoupon}
                disabled={validatingCoupon || appliedCoupon}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-30"
              >
                {validatingCoupon ? '...' : 'Apply'}
              </button>
            </div>
            {appliedCoupon && (
              <p className="mt-2 text-[10px] text-green-600 font-bold">✓ Coupon "{appliedCoupon.code}" Applied</p>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div className='flex justify-between text-sm text-green-600 font-bold'>
                <span>Discount</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className='flex justify-between font-black text-2xl pt-2 border-t border-gray-100'>
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;