import {Link} from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Navbar(){
  const {cartItems,setIsCartOpen} = useCart();

  //calculate total quantity of items in cart
  const totalItems = cartItems.reduce((acc,item)=> acc + item.quantity, 0);

  return (
    <nav className='flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white'>
      <div className='text-2xl font-bold tracking-tighter'>
        <Link to='/'>My bazaar</Link>
      </div>
      <div className='flex gap-6 text-sm font-medium text-gray-600 items-center'>
        <Link to='/' className='hover:text-black transition-colors'>Home</Link>
        
        {/* Updated Cart Button with Badge */}
        <button 
          onClick={() => setIsCartOpen(true)} 
          className='hover:text-black transition-colors relative flex items-center'
        >
          Cart
          {totalItems > 0 && (
            <span className='absolute -top-3 -right-4 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full'>
              {totalItems}
            </span>
          )}
        </button>
        
        <Link to='/login' className='hover:text-black transition-colors'>Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;