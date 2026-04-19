import {Link, Outlet, useLocation} from 'react-router-dom';

function AdminLayout(){
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold tracking-tighter">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin"
            className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/admin")}`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/orders"
            className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/admin/orders")}`}
          >
            Manage Orders
          </Link>
          <Link
            to="/admin/products"
            className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/admin/products")}`}
          >
            Manage Products
          </Link>
          <Link
            to="/admin/add-product"
            className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/admin/add-product")}`}
          >
            Add Product
          </Link>
          <Link
            to="/admin/coupons"
            className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive("/admin/coupons")}`}
          >
            Add Coupons
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;