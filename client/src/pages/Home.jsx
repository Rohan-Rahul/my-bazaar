import {useState, useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import axios from 'axios';

function Home(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  //extract url params
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';

  //define categories for the filter
  const categories = ['All', 'Electronics', 'Clothing', 'Jewelry', 'Toys'];

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if(category === 'All'){
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  useEffect (()=>{
    //implementing debouncing to prevent excessive api calls
    const delayDebounceFn = setTimeout(async ()=>{
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if(searchQuery) params.append('search', searchQuery);
        if(categoryQuery && categoryQuery !== 'All') params.append('category', categoryQuery);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await axios.get(`http://localhost:3000/api/products${queryString}`);

        setProducts(response.data);
      } catch (error){
        console.error('Error fetching products: ', error);
      } finally {
        setLoading(false);
      }
    }, 500); //wait for 500 ms

    //cleanup function to clear timeout
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, categoryQuery]);

  if(loading && products?.length ===0) return <div className='p-10 text-center'>Loading products...</div>;
    
  return (
    <div className='max-w-7xl mx-auto p-6'>
      <h2 className='text-3xl font-bold mb-6 text-center'>
        {searchQuery ? `Search results for "${searchQuery}"` : 'You might also like'}
      </h2>

      {/* Category Filter */}
      <div className='flex flex-wrap justify-center gap-4 mb-10'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-6 py-2 rounded-full border transition-colors ${
              (categoryQuery === category) || (!categoryQuery && category === 'All')
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
        {products.length === 0 && !loading ? (
          <p className='col-span-full text-center text-gray-500'>No products found.</p>
        ) : (
          products.map((product) => (
            <Link 
              to={`/product/${product._id}`}
              key={product._id}
              className='group cursor-pointer'
            >
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