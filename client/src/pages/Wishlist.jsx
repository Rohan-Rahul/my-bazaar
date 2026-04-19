import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import api from '../services/api';
import {toast} from 'react-hot-toast';

function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try{
      const {data} = await api.get('/users/wishlist');
      setItems(data);
    } catch(error){
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async(productId) => {
    try{
      await api.post('/users/wishlist/toggle', {productId});
      setItems(items.filter(item => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error){
      toast.error('Error removing items');
    }
  };

  if(loading) return <div className="p-10 text-center text-gray-400">Loading Wishlist...</div>

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <h2 className='text-3xl font-bold mb-10 text-center tracking-tight'>My Wishlist</h2>
      
      {items.length === 0 ? (
        <div className='text-center py-20 bg-gray-50 rounded-[2rem]'>
          <p className='text-gray-500'>Your wishlist is empty.</p>
          <Link to='/' className='mt-4 inline-block font-bold underline'>Go Shopping</Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
          {items.map((product) => (
            <div key={product._id} className="relative group">
              <button 
                onClick={() => handleRemove(product._id)}
                className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <Link to={`/product/${product._id}`}>
                <div className='bg-gray-100 rounded-2xl h-72 w-full mb-4 flex items-center justify-center overflow-hidden'>
                  <img src={product.images?.[0]} className='object-cover h-full w-full' alt="" />
                </div>
                <h3 className='font-bold text-gray-900 truncate'>{product.title}</h3>
                <p className='font-bold text-lg'>₹{product.price.toFixed(2)}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;