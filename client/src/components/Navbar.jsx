import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { cartItems, setIsCartOpen } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentSearch = params.get('search') || '';
    if (searchTerm === currentSearch) return;

    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      } else {
        params.delete('search');
      }
      navigate({ pathname: '/', search: params.toString() }, { replace: true });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, navigate, location.pathname]);

  return (
    <nav className='flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-40'>
      {/* Logo - Scaled for mobile */}
      <div className='text-xl md:text-2xl font-black tracking-tighter uppercase'>
        <Link to='/'>My Bazaar</Link>
      </div>

      {/* Search Bar - Hidden on mobile, visible on desktop */}
      <form className='hidden md:flex flex-1 max-w-md mx-8'>
        <input
          type='text'
          placeholder='Search products...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none border-none focus:ring-2 focus:ring-black'
        />
      </form>

      {/* Navigation Actions */}
      <div className='flex gap-4 md:gap-8 items-center'>
        {/* Cart Icon */}
        <button onClick={() => setIsCartOpen(true)} className='relative p-2'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.112 11.513a2.25 2.25 0 0 1-2.224 2.466H4.492a2.25 2.25 0 0 1-2.224-2.466L3.38 8.507a2.25 2.25 0 0 1 2.224-2.207h12.912a2.25 2.25 0 0 1 2.224 2.207Z" />
          </svg>
          {totalItems > 0 && (
            <span className='absolute top-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold'>
              {totalItems}
            </span>
          )}
        </button>

        {/* Auth Actions - Hidden icons/text on mobile to save space */}
        {isAuthenticated ? (
          <div className='flex items-center gap-4'>
            <Link to='/profile' className='hidden md:block text-sm font-bold'>Profile</Link>
            <button onClick={logout} className='text-xs md:text-sm font-black uppercase tracking-widest'>Logout</button>
          </div>
        ) : (
          <Link to='/login' className='text-sm font-bold'>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;