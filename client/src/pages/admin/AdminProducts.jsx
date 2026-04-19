import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  //handle local filtering for the admin table to keep it snappy
  useEffect(()=>{
    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProducts(sorted);
      setFilteredProducts(sorted);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    
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

  if (loading) return <div className="p-8 text-center font-medium">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-gray-900">Inventory</h2>
          <p className="text-gray-500 text-sm">Manage your store items.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black text-sm w-full md:w-64"
          />
          <Link to="/admin/add-product" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 text-sm">
            + New Product
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="p-5">Product</th>
                <th className="p-5">Category</th>
                <th className="p-5">Price</th>
                <th className="p-5">Stock</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <img src={product.images?.[0] || ""} className="w-10 h-10 rounded-lg object-cover bg-gray-100" alt="" />
                      <span className="font-bold text-gray-900 line-clamp-1">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-5 text-gray-500">{product.category}</td>
                  <td className="p-5 font-mono font-bold">₹{product.price.toFixed(2)}</td>
                  <td className="p-5">
                    <span className={`font-black text-xs px-2 py-1 rounded ${product.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-4">
                      <Link to={`/admin/edit-product/${product._id}`} className="text-gray-400 hover:text-black font-bold transition-colors">Edit</Link>
                      <button onClick={() => handleDelete(product._id)} disabled={deletingId === product._id} className="text-red-300 hover:text-red-600 font-bold transition-colors disabled:opacity-30">
                        {deletingId === product._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;