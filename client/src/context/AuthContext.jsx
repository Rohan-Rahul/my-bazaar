import {createContext, useState, useEffect, useContext} from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(null);

  //check is user is logged in
  useEffect(()=>{
    const checkAuth = async() => {
      const token = localStorage.getItem('token');
      if(token){
        try{
          const resposne = await api.get('/users/profile');
          setUser(response.data);
        } catch(error){
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () =>{
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{user,login,logout,isAuthenticated: !!user, loading}}>{children}</AuthContext.Provider>
  );
};
