import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      const sortedProducts = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProducts(sortedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(product => product._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-8">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter">Manage Products</h2>
          <p className="text-gray-500 mt-1">View, manage, and remove your inventory.</p>
        </div>
        <Link 
          to="/admin/add-product" 
          className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
        >
          + Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.length > 0 ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold line-clamp-1">{product.title}</p>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {product._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                      {product.category}
                    </span>
                  </td>
                  
                  <td className="p-4 font-bold">
                    ₹{product.price.toFixed(2)}
                  </td>
                  
                  <td className="p-4">
                    <span className={`font-bold ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock} {product.stock <= 5 && '(Low)'}
                    </span>
                  </td>
                  
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/admin/edit-product/${product._id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        className="text-red-500 hover:text-red-700 font-semibold text-sm transition-colors disabled:opacity-50"
                      >
                        {deletingId === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No products found. Start by adding some!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;