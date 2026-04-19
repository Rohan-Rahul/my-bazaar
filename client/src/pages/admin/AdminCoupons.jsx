import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: '',
    usageLimit: 100
  });

  const fetchCoupons = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', newCoupon);
      toast.success('Coupon created!');
      setNewCoupon({ code: '', discountType: 'percentage', discountValue: '', expiryDate: '', usageLimit: 100 });
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Creation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Creation Form */}
      <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-fit">
        <h2 className="text-xl font-bold mb-6 tracking-tight">Create Coupon</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <input 
            type="text" placeholder="CODE (e.g. BAZAAR10)" 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none focus:ring-1 focus:ring-black text-sm"
            value={newCoupon.code}
            onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
            required 
          />
          <select 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm"
            value={newCoupon.discountType}
            onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
          <input 
            type="number" placeholder="Value" 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm"
            value={newCoupon.discountValue}
            onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})}
            required 
          />
          <input 
            type="date" 
            className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm"
            value={newCoupon.expiryDate}
            onChange={e => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
            required 
          />
          <button type="submit" className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
            Generate Coupon
          </button>
        </form>
      </div>

      {/* Coupon List */}
      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              <th className="p-6">Code</th>
              <th className="p-6">Discount</th>
              <th className="p-6">Expiry</th>
              <th className="p-6">Usage</th>
              <th className="p-6">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {coupons.map(c => (
              <tr key={c._id} className="hover:bg-gray-50/50">
                <td className="p-6 font-black">{c.code}</td>
                <td className="p-6">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td className="p-6 text-gray-500">{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td className="p-6 text-xs text-gray-400">{c.usedCount} / {c.usageLimit}</td>
                <td className="p-6">
                  <button onClick={() => handleDelete(c._id)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminCoupons;