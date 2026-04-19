import {Link, Outlet, useLocation} from 'react-router-dom';

function AdminLayout(){
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Products", path: "/admin/products" },
    { name: "Users", path: "/admin/users" }, // Added Users management
    { name: "Add Product", path: "/admin/add-product" },
    { name: "Coupons", path: "/admin/coupons" }
  ];

  const isActive = (path) => {
    return location.pathname === path ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar - Converts to Top Nav on Mobile */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-gray-200 flex flex-col">
        <div className="p-5 md:p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold tracking-tighter uppercase">Admin Panel</h2>
        </div>
        
        {/* Navigation - Horizontal scroll on mobile, Vertical on desktop */}
        <nav className="flex md:flex-col p-3 md:p-4 space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto no-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`whitespace-nowrap md:whitespace-normal px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive(item.path)}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;