import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data);
      } catch (error) {
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Loading customers...</div>;

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-gray-50">
        <h2 className="text-2xl font-bold tracking-tighter">Registered Customers</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <th className="p-6">User ID</th>
              <th className="p-6">Name</th>
              <th className="p-6">Email</th>
              <th className="p-6">Role</th>
              <th className="p-6">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-6 font-mono text-[10px] text-gray-400">{user._id}</td>
                <td className="p-6 font-bold">{user.name}</td>
                <td className="p-6 text-gray-600">{user.email}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.isAdmin ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {user.isAdmin ? 'Admin' : 'Customer'}
                  </span>
                </td>
                <td className="p-6 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;