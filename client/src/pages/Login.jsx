import {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try{
      const response = await api.post('users/login', {
        email,password
      });
    
      //login function handles localStorage and global state
      if(response?.data?.token){
        login(response.data.user, response.data.token);
        navigate('/');
      } else {
        console.error("Auth failed: Token not found in response", response.data);
        alert("Account created, but we couldn't log you in automatically. Please sign in manually.");
        navigate('/login');
        }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      console.error("Submission Error:", error);
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full border border-gray-100 p-10 rounded-[2rem] shadow-sm">
        <h2 className="text-3xl font-bold tracking-tighter mb-2 text-gray-900">Sign In</h2>
        <p className="text-gray-500 mb-8">Access your My Bazaar account.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Password
            </label>
            <input 
              type="password" 
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-black outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
          >
            Login
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          New here? <Link to="/signup" className="font-bold text-black underline underline-offset-4">Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;