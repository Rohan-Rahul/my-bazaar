import {Link} from 'react-router-dom';

function Navbar(){
  return (
    <nav className='flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white'>
      <div className='text-2xl font-bold tracking-tighter'>
        <Link to='/'>My bazaar</Link>
      </div>
      <div className='flex gap-6 text-sm font-medium text-gray-600'>
        <Link to='/' className='hover:text-black transition-colors'>Home</Link>
        <Link to='/cart' className='hover:text-black transition-colors'>Cart</Link>
        <Link to='/login' className='hover:text-black transition:colors'>Login</Link>
      </div>
    </nav>
  );
}

export default Navbar;