import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

//request interceptor: auto attach the token to all requests
api.interceptors.request.use(
  (config)=>{
    const token = localStorage.getItem('token');
    if(token){
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error)=>Promise.reject(error)
);

//cart api service functions
export const cartService = {
  getCart: ()=> api.get('/cart'),
  
  addToCart: (productId,quantity,size) => api.post('/cart',{productId,quantity,size}),

  updateQuantity: (productId,size,quantity)=>api.put('/cart', {productId,size,quantity}),

  removeItem: (productId,size) => 
    api.delete(`/cart/item/${productId}/${size}`),
};

export default api;