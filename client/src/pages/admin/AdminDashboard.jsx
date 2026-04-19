import { useState, useEffect } from "react";
import SalesChart from '../../components/SalesChart';
import api from "../../services/api";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: [],
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get("/orders"),
          api.get("/products"),
        ]);

        const orders = ordersRes.data;
        const products = productsRes.data;

        // Calculate total revenue from all orders
        const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        // Process Chart Data (Last 7 Days)
        const dailyStats = {};
        
        // Initialize last 7 days with zeros
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          dailyStats[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
        }

        // Fill with real data
        orders.forEach(order => {
          const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          if (dailyStats[dateStr]) {
            dailyStats[dateStr].revenue += order.totalPrice;
            dailyStats[dateStr].orders += 1;
          }
        });

        setChartData(Object.values(dailyStats));
        
        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalProducts: products.length,
          recentOrders: orders.slice(0, 5),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-8 font-medium text-gray-400">Syncing bazaar metrics...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tighter">Dashboard Overview</h2>
        <p className="text-gray-500 mt-1">Real-time performance of My Bazaar.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Revenue</p>
          <p className="text-3xl font-black">₹{stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Orders</p>
          <p className="text-3xl font-black">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Inventory Items</p>
          <p className="text-3xl font-black">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Visual Analytics */}
      <SalesChart data={chartData} />

      {/* Recent Orders Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
          <Link to="/admin/orders" className="text-xs font-black uppercase tracking-widest text-black hover:opacity-60 transition-opacity">
            View Ledger →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6 font-black">ID</th>
                <th className="p-6 font-black">Customer</th>
                <th className="p-6 font-black">Date</th>
                <th className="p-6 font-black">Status</th>
                <th className="p-6 font-black text-right">Settlement</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6 font-mono text-[10px] text-gray-400">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="p-6 font-bold text-gray-900">{order.user?.name || "Guest User"}</td>
                  <td className="p-6 text-gray-500">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                  <td className="p-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-black text-white'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-lg">₹{order.totalPrice.toFixed(0)}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-400 italic">The bazaar is quiet. No recent transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;