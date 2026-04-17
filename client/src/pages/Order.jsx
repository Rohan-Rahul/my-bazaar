import { useState, useEffect } from "react";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoadin] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/find");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading)
    return <div className='p-10 text-center'>Loading your orders...</div>;

  return (
    <div className='max-w-4xl mx-auto p-8'>
      <h2 className='text-3xl font-bold mb-8 tracking-tighter'>My Orders</h2>

      {orders.length === 0 ? (
        <div className='text-center py-20 bg-gray-50 rounded-[2rem]'>
          <p className='text-gray-500'>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className='space-y-6'>
          {orders.map((order) => (
            <div
              key={order._id}
              className='border border-gray-100 rounded-[2rem] p-6 shadow-sm'
            >
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <p className='text-xs font-bold uppercase text-gray-400 tracking-widest'>
                    Order ID
                  </p>
                  <p className='text-sm font-mono'>{order._id}</p>
                </div>
                <div className='text-right'>
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className='border-t border-b border-gray-50 py-4 my-4'>
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className='flex justify-between text-sm py-1'>
                    <span className='text-gray-600'>
                      {item.title}{" "}
                      <span className='text-gray-400 ml-2'>
                        x{item.quantity}
                      </span>
                    </span>
                    <span className='font-medium'>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className='flex justify-between items-center'>
                <p className='text-gray-500 text-sm'>
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className='text-lg font-bold'>
                  Total: ${order.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;