import { useState, useEffect } from "react";
import api from "../../services/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      // Sort orders to show newest first
      const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const response = await api.put(`/orders/${orderId}/status`, {
        status: newStatus
      });
      
      // Update local state to reflect the change immediately
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tighter">Manage Orders</h2>
        <p className="text-gray-500 mt-1">View and update customer order statuses.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer Details</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500">
                    {order._id}
                    <div className="mt-1 text-[10px] text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <p className="font-bold">{order.user?.name || "Guest"}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={order.shippingAddress?.address}>
                      {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                    </p>
                  </td>
                  
                  <td className="p-4">
                    <ul className="text-xs space-y-1">
                      {order.orderItems.map((item, idx) => (
                        <li key={idx} className="text-gray-600">
                          {item.quantity}x {item.title}
                        </li>
                      ))}
                    </ul>
                  </td>
                  
                  <td className="p-4 font-bold">
                    ₹{order.totalPrice.toFixed(2)}
                  </td>
                  
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className={`text-xs font-bold uppercase tracking-wider p-2 rounded-lg border outline-none cursor-pointer transition-colors ${
                        order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      } ${updatingId === order._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {statuses.map(status => (
                        <option key={status} value={status} className="text-black bg-white">
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No orders have been placed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;