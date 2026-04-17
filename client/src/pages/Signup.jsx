import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';
import api from '../services/api';
import {useAuth} from '../context/AuthContext';

function Signup(){
  const [formData, setFormData] = useState({
    name: '', email: '',password: ''
  });
  const {login} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try{
      const response = await api.post('/users/register', formData);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch(error){
      alert(error.response?.message) || 'Registration failed'
    };
  }

return (
  <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full border border-gray-100 p-10 rounded-[2rem] shadow-sm">
        <h2 className="text-3xl font-bold tracking-tighter mb-2">Get Started</h2>
        <p className="text-gray-500 mb-8">Create an account to start shopping at My Bazaar.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="Rahul Parmar"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10 mt-2"
          >
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-bold text-black underline underline-offset-4">Sign in</Link>
        </p>
      </div>
    </div>
);
}

export default Signup;