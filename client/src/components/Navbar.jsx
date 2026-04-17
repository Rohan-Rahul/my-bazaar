import {Link} from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {useAuth} from '../context/AuthContext';

function Navbar(){
  const {cartItems,setIsCartOpen} = useCart();
  const {isAuthenticated,logout,user} = useAuth();

  //calculate total quantity of items in cart
  const totalItems = cartItems.reduce((acc,item)=> acc + item.quantity, 0);

  return (
    <nav className='flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-40'>
      <div className='text-2xl font-bold tracking-tighter uppercase'>
        <Link to='/'>My bazaar</Link>
      </div>

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
            <span className='text-gray-400 hidden md:block'>Hi, {user?.name?.split(' ')[0]}</span>
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