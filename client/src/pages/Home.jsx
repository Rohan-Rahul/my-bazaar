import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import axios from 'axios';

function Home(){
  const [products, setProducts] = useState();
  const [loading, setLoading] = useState(true);

  useEffect (()=>{
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/products');
        setProducts(response.data);
        setLoading(false);
      } catch (error){
        console.error('Error fetching products: ', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className='p-10 text-center'>Loading products...</div>;

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <h2 className='text-3xl font-bold mb-8 text-center'>You might also like</h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
        {products.length === 0 ? (
          <p className='col-span-full text-center text-gray-500'>No products found.</p>
        ) : (
          products.map((product)=>(
            <Link to={`/product/${product._id}`}
            key={product._id || index}
            className='group cursor-pointer'>
              {/* Product Image Placeholder */}
              <div className='bg-gray-100 rounded-xl h-72 w-full mb-4 flex items-center justify-center overflow-hidden'>
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]}
                    alt={product.title}
                    className='object-cover h-full w-full group-hover:scale-105 transition-transform duration-300'
                  />
                ) : (
                  <span className='text-gray-400'>Image</span>
                )}
              </div>

              {/* Product Info */}
              <h3 className='font-semibold text-gray-900 truncate'>{product.title}</h3>
              <p className='text-sm text-gray-500 capitalize'>{product.category}</p>
              <div className='flex gap-3 mt-1 items-center'>
                <span className='font-bold text-lg'>${product.price}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;