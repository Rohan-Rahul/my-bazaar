import {useState,useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import axios from 'axios';
import {useCart} from '../context/CartContext';
import { cartService } from '../services/api';

function ProductDetails(){
  const {id} = useParams();
  const [product,setProduct] = useState(null);
  const [loading,setLoading] = useState(true);
  const [selectedOption,setSelectedOption] = useState('');

  const {fetchCart,setIsCartOpen} = useCart();

  useEffect(()=>{
    const fetchProduct = async () => {
      try{
        const response = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(response.data);
        if(response.data.variantOptions?.length>0){
          setSelectedOption(response.data.variantOptions[0]);
        }
        setLoading(false);
      } catch (error){
        console.error('Error fetching product: ',error);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try{
      await cartService.addToCart(product._id,1 ,selectedOption);
      fetchCart();
      setIsCartOpen(true);
    } catch (error){
      console.error('Error adding to cart: ', error);
      alert('Failed to add product tot cart. Please ensure you are logged in.');
    }
  };

  if(loading) return <div className='p-10 text-center'>Loading product...</div>;
  if(!product) return <div className='p-10 text-center'>Product not found</div>;

  return (
    <div className='max-w-6xl mx-auto p-6 text-gray-800'>
      <div className='text-sm mb-6 text-gray-500'>
        <Link to='/' className='hover:text-black'>Home</Link> &gt; Product details
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <div className='flex flex-col gap-4'>
          <div className='bg-gray-100 rounded-2xl h-96 w-full flex items-center justify-center overflow-hidden'>
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className='object-cover h-full w-full' />
            ) : (
              <span className='text-gray-400'>No Image Available</span>
            )}
          </div>
        </div>

        <div className='flex flex-col'>
          <span className='text-xs font-bold uppercase tracking-wider text-gray-500 mb-2'>{product.category}</span>
          <h1 className='text-3xl font-bold mb-4'>{product.title}</h1>
          <p className='text-2xl font-semibold mb-6'>${product.price}</p>

          {/* DYNAMIC SELECTOR SECTION */}
          {product.variantOptions?.length > 0 && (
            <div className='mb-6'>
              <h3 className='text-sm font-medium mb-3'>Select {product.variantType}</h3>
              <div className='flex flex-wrap gap-3'>
                {product.variantOptions.map((option) => (
                  <button 
                    key={option} 
                    onClick={() => setSelectedOption(option)}
                    className={`px-4 py-2 min-w-[3rem] rounded-full border transition-colors ${
                      selectedOption === option ? 'bg-black text-white' : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={handleAddToCart}
            className='w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors mb-8'
          >
            Add to Cart
          </button>

          <div className='border-t border-gray-200 py-4'>
            <h3 className='font-semibold mb-2'>Description</h3>
            <p className='text-gray-600 text-sm leading-relaxed'>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;