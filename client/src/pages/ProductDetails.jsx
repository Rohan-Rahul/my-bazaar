import {useState,useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import axios from 'axios';

function ProductDetails(){
  const {id} = useParams();
  const [product,setProduct] = useState(null);
  const [loading,setLoading] = useState(true);
  const [selectedSize,setSelectedSize] = useState('S');

  useEffect(()=>{
    const fetchProduct = async () => {
      try{
        const response = await axios.get(`http://localhost:3000/api/products/${id}`);
        setProduct(response.data);
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
      const token = localStorage.getItem('token');
      if(!token){
        alert('Please login to add items to your cart');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/cart',
        {
          productId: product._id,
          quantity: 1,
          size: selectedSize
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Product added to cart successfully!');
    } catch (error){
      console.error('Error adding to cart: ', error.message?.data || error.message);
      alert('Failed to add product tot cart. Please ensure you are logged in.');
    }
  };

  if(loading) return <div className='p-10 text-center'>Loading product...</div>;
  if(!product) return <div className='p-10 text-center'>Product not found</div>;

  return (
    <div className='max-w-6xl mx-auto p-6 text-gray-800'>
      {/* Breadcrumb navigation */}
      <div className='text-sm mb-6 text-gray-500'>
        <Link to='/' className='hover:text-black'>Home</Link>
        &gt; Product details
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        {/* Left Side: Image Gallery */}
        <div className='flex flex-col gap-4'>
          <div className='bg-gray-100 rounded-2xl h-96 w-full flex items-center justify-center overflow-hidden'>
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0]} alt={product.title} className='object-cover h-full w-full' />
            ) : (
              <span className='text-gray-400'>Main Image Placeholder</span>
            )}
          </div>
          {/* Thumbnails */}
          <div className='flex gap-4'>
            {[1,2,3].map((_,index)=>(
              <div key={index} className='bg-gray-100 rounded-lg h-24 w-1/3 flex items-center justify-center'>
                <span className='text-xs text-gray-400'>Thumb {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Product Information */}
        <div className='flex flex-col'>
          <span className='text-xs font-bold uppercase tracking-wider text-gray-500 mb-2'>{product.category}</span>
          <h1 className='text-3xl font-bold mb-4'>{product.title}</h1>
          <p className='text-2xl font-semibold mb-6'>${product.price}</p>

          {/* Size Selector */}
          <div className='mb-6'>
            <h3 className='text-sm font-medium mb-3'>Select Size</h3>
            <div className='flex gap-3'>
              {['S','M','L','XL','XXL'].map((size)=>(
                <button 
                  key={size} 
                  onClick={()=> setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors ${
                    selectedSize === size ? 'bg-black text-white':'bg-white text-black border-gray-300 hover:border-black'
                  }`}>{size}</button>
              ))}
            </div>
          </div>

          {/* Add to cart button */}
          <button 
          onClick={handleAddToCart}
          className='w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-8 transition-colors mb-8'>Add to Cart</button>

          {/* Description Accordion */}
          <div className='border-t border-gray-200 py-4'>
            <h3 className='font-semibold mb-2'>Description & Fit</h3>
            <p className='text-gray-600 text-sm leading-relaxed'>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;