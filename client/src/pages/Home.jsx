import {useState, useEffect} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import api from '../services/api';

function Home(){
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  //extract url params
  const [searchParams, setSearchParams] = useSearchParams();

  //guard against 'undefined' showing up in the queries
  const rawSearch = searchParams.get('search');
  const searchQuery = (rawSearch === 'undefined' || !rawSearch) ? '' : rawSearch;
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
    const fetchProducts = async () => {
      setLoading(true);
      try{
        const params = {};
        if(searchQuery) params.search = searchQuery;
        if(categoryQuery && categoryQuery !== 'All') params.category = categoryQuery;

        const response = await api.get('/products', {params});
        setProducts(response.data);
      } catch (error){
        console.error('Error fetching products: ', error);
      } finally {
        setLoading(false);
      }
    };

    const fastTimer = setTimeout(fetchProducts, 150);
    return () => clearTimeout(fastTimer);
  }, [searchQuery, categoryQuery]);

    
  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Search Result Heading */}
      <h2 className='text-3xl font-bold mb-10 text-center tracking-tight'>
        {searchQuery ? `Results for "${searchQuery}"` : 'Recommended for You'}
      </h2>

      {/* Category Filter */}
      <div className='flex flex-wrap justify-center gap-4 mb-10'>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-6 py-2 rounded-full border transition-all text-sm font-medium ${
              (categoryQuery === category) || (!categoryQuery && category === 'All')
                ? 'bg-black text-white border-black shadow-md'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
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
              <div className='bg-gray-100 rounded-2xl h-72 w-full mb-4 flex items-center justify-center overflow-hidden shadow-sm border border-gray-50'>
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className='object-cover h-full w-full group-hover:scale-105 transition-transform duration-500' 
                  />
                ) : (
                  <span className='text-gray-400 font-mono text-xs'>NO IMAGE</span>
                )}
              </div>
              <h3 className='font-bold text-gray-900 truncate tracking-tight'>
                {product.title}
              </h3>
              <p className='text-[10px] text-gray-400 uppercase tracking-widest font-black mb-1'>
                {product.category}
              </p>
              <div className="flex justify-between items-center">
                <p className='font-bold text-lg'>₹{product.price.toFixed(2)}</p>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-[10px] text-red-600 font-bold uppercase">Low Stock</span>
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