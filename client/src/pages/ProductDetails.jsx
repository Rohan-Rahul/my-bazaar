import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { cartService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function ProductDetails() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { fetchCart, setIsCartOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductData = async () => {
    try {
      const productRes = await api.get(`/products/${id}`);
      const data = productRes.data;
      setProduct(data);

      if (data.variantOptions?.length > 0) setSelectedOption(data.variantOptions[0]);
      if (data.colors?.length > 0) setSelectedColor(data.colors[0]);

      if (isAuthenticated) {
        const wishlistRes = await api.get('/users/wishlist');
        const isPresent = wishlistRes.data.some(item => item._id === id);
        setIsInWishlist(isPresent);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching product: ', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id, isAuthenticated]);

  const handleAddToCart = async () => {
    try {
      await cartService.addToCart(product._id, 1, selectedOption, selectedColor);
      fetchCart();
      setIsCartOpen(true);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Please login to add items to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) return toast.error('Please login to use wishlist');
    
    setTogglingWishlist(true);
    try {
      const { data } = await api.post('/users/wishlist/toggle', { productId: id });
      setIsInWishlist(data.isAdded);
      toast.success(data.message);
    } catch (error) {
      toast.error('Failed to update wishlist');
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success('Review submitted successfully');
      setComment('');
      setRating(5);
      fetchProductData(); // Refresh product to show new review and updated rating
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className='p-10 text-center font-medium text-gray-400'>Loading My Bazaar product...</div>;
  if (!product) return <div className='p-10 text-center'>Product not found</div>;

  return (
    <div className='max-w-6xl mx-auto p-6 text-gray-800'>
      <div className='text-sm mb-6 text-gray-400'>
        <Link to='/' className='hover:text-black transition-colors'>Home</Link> &nbsp; &gt; &nbsp; 
        <span className='text-gray-800 font-medium'>{product.category}</span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-12 mb-20'>
        <div className='flex flex-col gap-4'>
          {/* Main Image */}
          <div className='bg-gray-50 rounded-3xl h-[500px] w-full flex items-center justify-center overflow-hidden border border-gray-100'>
            {product.images?.length > 0 ? (
              <img src={product.images[activeImage]} alt={product.title} className='object-contain h-full w-full' />
            ) : (
              <span className='text-gray-400'>No Image Available</span>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images?.length > 1 && (
            <div className='flex gap-3 overflow-x-auto py-2 no-scrollbar'>
              {product.images.map((img, index) => (
                <img 
                  key={index}
                  src={img}
                  alt=""
                  onClick={() => setActiveImage(index)}
                  className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition-all shrink-0 ${
                    activeImage === index ? 'border-black' : 'border-transparent opacity-60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className='flex flex-col'>
          <div className='flex justify-between items-start mb-2'>
            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400'>
              {product.category}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">★ {product.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-gray-400">({product.numReviews} reviews)</span>
            </div>
          </div>
          
          <h1 className='text-4xl font-bold mb-4 tracking-tighter'>{product.title}</h1>
          <p className='text-3xl font-black mb-8'>₹{product.price.toLocaleString('en-IN')}</p>

          {/* Variant Selector */}
          {product.variantOptions?.length > 0 && (
            <div className='mb-8'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-4'>Select {product.variantType}</h3>
              <div className='flex flex-wrap gap-3'>
                {product.variantOptions.map((option) => (
                  <button 
                    key={option} 
                    onClick={() => setSelectedOption(option)}
                    className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${
                      selectedOption === option ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors?.length > 0 && (
            <div className='mb-10'>
              <h3 className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-4'>Select Color</h3>
              <div className='flex flex-wrap gap-3'>
                {product.colors.map((color) => (
                  <button 
                    key={color} 
                    onClick={() => {
                      setSelectedColor(color);
                      const matchedVariant = product.colorImages?.find(c => c.color === color);
                      if(matchedVariant){
                        const index = product.images.indexOf(matchedVariant.url);
                        if(index !== -1) setActiveImage(index);
                      }
                    }}
                    className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${
                      selectedColor === color ? 'bg-black text-white border-black shadow-md' : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='flex gap-4'>
            <button 
              onClick={handleAddToCart}
              className='flex-1 bg-black text-white py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all text-lg shadow-xl shadow-black/10'
            >
              Add to Cart
            </button>
            <button 
              onClick={handleToggleWishlist}
              disabled={togglingWishlist}
              className={`px-6 rounded-2xl border-2 transition-all flex items-center justify-center ${
                isInWishlist ? 'bg-red-50 border-red-500 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:border-black hover:text-black'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>

          <div className='mt-12 pt-8 border-t border-gray-100'>
            <h3 className='text-xs font-bold uppercase tracking-widest text-gray-400 mb-4'>Details</h3>
            <p className='text-gray-600 text-sm leading-relaxed whitespace-pre-line'>{product.description}</p>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="max-w-4xl border-t border-gray-100 pt-16">
        <h2 className="text-3xl font-bold mb-10 tracking-tighter">Customer Reviews</h2>

        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="mb-16 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h3 className="font-bold mb-6">Share your experience</h3>
            <div className="flex gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setRating(num)}
                  className={`w-12 h-12 rounded-2xl font-bold transition-all ${
                    rating >= num ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-300 border border-gray-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <textarea
              className="w-full p-5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-black mb-6 min-h-[120px] text-sm"
              placeholder="What did you think of the quality and fit?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={submittingReview}
              className="bg-black text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {submittingReview ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        ) : (
          <div className="mb-16 p-8 bg-gray-50 rounded-[2rem] text-center border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm italic">Please login to share your thoughts with the community.</p>
          </div>
        )}

        <div className="space-y-10">
          {product.reviews?.length === 0 ? (
            <p className="text-gray-400 italic py-10">No reviews yet. Be the first to share your feedback!</p>
          ) : (
            product.reviews.map((rev) => (
              <div key={rev._id} className="group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-lg tracking-tight">{rev.name}</p>
                    <div className="flex text-black text-xs mt-1">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;