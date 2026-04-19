import {useState, useEffect} from 'react';
import api from '../services/api';
import {toast} from 'react-hot-toast';

function Profile(){
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
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
      } catch (error){
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      await api.put('/users/profile', formData);
      toast.success('Profile updated successfully!');
      setFormData(prev => ({
        ...prev, password: ''
      }));
    } catch (error){
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-3xl font-bold mb-8 tracking-tighter">My Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-gray-400 tracking-widest">
            New Password (leave blank to keep current)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white p-4 rounded-2xl font-bold hover:bg-gray-800 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default Profile;