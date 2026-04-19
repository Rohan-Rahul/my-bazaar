import {useState, useEffect} from 'react';
import api from '../services/api';
import {toast} from 'react-hot-toast';

function Profile(){
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [addresses, setAddresses] = useState([]);
  const [newAddr,setNewAddr] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'India'
  });

  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const fetchProfile = async () => {
      try{
        const {data} = await api.get('/users/profile');
        setFormData({
          name: data.name,
          email: data.email,
          password: ''
        });
        setAddresses(data.addresses || []); 
      } catch (error){
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData);
      toast.success('Profile updated');
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/users/addresses', newAddr);
      setAddresses(data);
      setNewAddr({ address: '', city: '', postalCode: '', country: 'India' });
      toast.success('Address added');
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const { data } = await api.delete(`/users/addresses/${id}`);
      setAddresses(data);
      toast.success('Address removed');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Account Settings */}
      <div>
        <h2 className="text-2xl font-bold mb-6 tracking-tighter">Account Settings</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-black" required />
          <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-black" required />
          <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="New Password" className="w-full p-3 bg-gray-50 border rounded-2xl outline-none focus:ring-2 focus:ring-black" />
          <button type="submit" className="w-full bg-black text-white p-3 rounded-2xl font-bold hover:opacity-80 transition-opacity">Save Changes</button>
        </form>
      </div>

      {/* Address Management */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-6 tracking-tighter">Saved Addresses</h2>
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr._id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-start bg-white shadow-sm">
                <div className="text-sm">
                  <p className="font-bold">{addr.address}</p>
                  <p className="text-gray-500">{addr.city}, {addr.postalCode}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-red-400 hover:text-red-600 font-bold text-xs">Remove</button>
              </div>
            ))}
            {addresses.length === 0 && <p className="text-gray-400 text-sm italic">No addresses saved yet.</p>}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-[2rem]">
          <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-400">Add New Address</h3>
          <form onSubmit={handleAddAddress} className="space-y-3">
            <input type="text" placeholder="Street Address" value={newAddr.address} onChange={(e) => setNewAddr({...newAddr, address: e.target.value})} className="w-full p-2 text-sm border rounded-xl outline-none" required />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="City" value={newAddr.city} onChange={(e) => setNewAddr({...newAddr, city: e.target.value})} className="p-2 text-sm border rounded-xl outline-none" required />
              <input type="text" placeholder="Postal Code" value={newAddr.postalCode} onChange={(e) => setNewAddr({...newAddr, postalCode: e.target.value})} className="p-2 text-sm border rounded-xl outline-none" required />
            </div>
            <button type="submit" className="w-full bg-gray-200 text-black py-2 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors">Add Address</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;