import {Link, useNavigate} from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import {useAuth} from '../context/AuthContext';

function Navbar(){
  const {cartItems,setIsCartOpen} = useCart();
  const {isAuthenticated,logout,user} = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  //calculate total quantity of items in cart
  const totalItems = cartItems.reduce((acc,item)=> acc + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if(searchTerm.trim()) {
      navigate(`/?search=${searchTerm}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className='flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-40'>
      <div className='text-2xl font-bold tracking-tighter uppercase'>
        <Link to='/'>My Bazaar</Link>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className='hidden md:flex flex-1 max-w-md mx-8'>
        <input
          type='text'
          placeholder='Search products...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='w-full px-4 py-2 bg-gray-100 rounded-full text-sm outline-none border-none focus:ring-2 focus:ring-black'
        />
      </form>

      <div className='flex gap-8 text-sm font-medium text-gray-600 items-center'>
        <Link to='/' className='hover:text-black transition-colors'>Home</Link>
        
        {/* Cart Button */}
        <button 
          onClick={() => setIsCartOpen(true)} 
          className='hover:text-black transition-colors relative flex items-center'
        >
          Cart
          {totalItems > 0 && (
            <span className='absolute -top-2 -right-3 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full'>
              {totalItems}
            </span>
          )}
        </button>
        
        {/* Conditional Auth Rendering */}
        {isAuthenticated ? (
          <div className='flex items-center gap-6'>
            <span className='text-gray-400 hidden lg:block'>Hi, {user?.name?.split(' ')[0]}</span>
            {isAuthenticated && (
              <Link to='/orders' className='hover:text-black transition-colors'>Orders</Link>
            )}
            <button 
              onClick={logout}
              className='text-black font-bold hover:opacity-70 transition-opacity'
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to='/login' className='hover:text-black transition-colors'>Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;