import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";

function Checkout() {
  const { cartItems, fetchCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product._id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          selectedOption: item.selectedOption,
        })),
        shippingAddress: address,
        totalPrice: subtotal,
      };

      await api.post("orders", orderData);
      fetchCart(); //refresh cart
      alert("Order Placed Successfully!");
      navigate("/");
    } catch (error) {
      alert("Failed to place order");
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12'>
      <div>
        <h2 className='text-2xl font-bold mb-6'>Shipping Details</h2>
        <form onSubmit={handlePlaceOrder} className='space-y-4'>
          <input
            className='w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-black'
            placeholder='Address'
            onChange={(e) =>
              setAddress({ ...address, address: e.target.value })
            }
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
              onChange={(e) =>
                setAddress({ ...address, postalCode: e.target.value })
              }
              required
            />
          </div>
          <input
            className='w-full p-4 bg-gray-50 rounded-2xl outline-none border-none focus:ring-2 focus:ring-black'
            placeholder='Country'
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
            required
          />
          <button
            type='submit'
            className='w-full bg-black text-white py-4 rounded-full font-bold mt-4'
          >
            Confirm Order
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
              <span>${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className='border-gray-200' />
          <div className='flex justify-between font-bold text-lg'>
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
