import {useState} from 'react';
import axios from 'axios';

function Login(){
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post('http://localhost:3000/api/users/login', {
        email,password
      });
      console.log('Login Success:', response.data);

      //save the token for further api requests
      localStorage.setItem('token',response.data.token);
      alert('Logged in Successfully');
    } catch (error) {
      console.error('Login Error: ', error.response?.data || error.message);
      alert('Login failed. Check console for details');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Login to My Bazaar</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;