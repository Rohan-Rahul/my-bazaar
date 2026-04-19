import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const rawSearch = searchParams.get('search');
  const searchQuery = (rawSearch === 'undefined' || !rawSearch) ? '' : rawSearch;
  const categoryQuery = searchParams.get('category') || '';

  const categories = ['All', 'Electronics', 'Clothing', 'Jewelry', 'Toys'];

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (categoryQuery && categoryQuery !== 'All') params.category = categoryQuery;

        const response = await api.get('/products', { params });
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products: ', error);
      } finally {
        setLoading(false);
      }
    };

    const fastTimer = setTimeout(fetchProducts, 150);
    return () => clearTimeout(fastTimer);
  }, [searchQuery, categoryQuery]);

  return (
    <div className='max-w-7xl mx-auto p-4 md:p-6 pb-24 md:pb-6'>
      {/* Responsive Search Result Heading */}
      <h2 className='text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center tracking-tight'>
        {searchQuery ? `Results for "${searchQuery}"` : 'Recommended for You'}
      </h2>

      {/* Category Filter - Scrollable on Mobile */}
      <div className='flex flex-nowrap md:flex-wrap overflow-x-auto md:justify-center gap-3 mb-8 md:mb-10 no-scrollbar pb-2 md:pb-0'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-5 py-2 rounded-full border transition-all text-xs md:text-sm font-bold whitespace-nowrap ${
              (categoryQuery === category) || (!categoryQuery && category === 'All')
                ? 'bg-black text-white border-black shadow-md'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid - 2 columns on mobile, 4 on desktop */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8'>
        {loading && products.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-400 font-medium">
            Searching My Bazaar...
          </div>
        ) : products.length === 0 ? (
          <div className='col-span-full text-center py-20 bg-gray-50 rounded-[2rem]'>
            <p className='text-gray-500'>No products found matching your search.</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchParams({})}
                className="mt-4 text-black font-bold underline underline-offset-4"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          products.map((product) => (
            <Link 
              to={`/product/${product._id}`} 
              key={product._id} 
              className='group cursor-pointer'
            >
              {/* Responsive Image Height */}
              <div className='bg-gray-50 rounded-2xl h-48 md:h-72 w-full mb-3 flex items-center justify-center overflow-hidden border border-gray-100'>
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className='object-cover h-full w-full group-hover:scale-105 transition-transform duration-500' 
                  />
                ) : (
                  <span className='text-gray-400 font-mono text-[10px]'>NO IMAGE</span>
                )}
              </div>
              
              <h3 className='font-bold text-gray-900 truncate tracking-tight text-sm md:text-base'>
                {product.title}
              </h3>
              
              <p className='text-[9px] md:text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1'>
                {product.category}
              </p>
              
              <div className="flex justify-between items-center">
                <p className='font-black text-base md:text-lg'>₹{product.price.toFixed(0)}</p>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-[8px] md:text-[10px] text-red-600 font-black uppercase tracking-tighter">Low Stock</span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;