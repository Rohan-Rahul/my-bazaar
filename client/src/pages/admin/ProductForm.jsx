import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    variantType: 'Size',
    variantOptions: '',
    isSeasonal: false,
    seasonalTag: ''
  });

  const [generalImages, setGeneralImages] = useState([]);
  const [colorMappings, setColorMappings] = useState([{ color: '', file: null }]);
  const [uploading, setUploading] = useState(false);

  // Fetch product data if in Edit Mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const { data } = await api.get(`/products/${id}`);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            category: data.category || '',
            stock: data.stock || '',
            variantType: data.variantType || 'Size',
            variantOptions: data.variantOptions?.join(', ') || '',
            isSeasonal: data.isSeasonal || false,
            seasonalTag: data.seasonalTag || ''
          });
          // Note: Current images are handled by the backend unless new files are uploaded
        } catch (error) {
          toast.error("Failed to load product data");
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleColorMappingChange = (index, field, value) => {
    const newMappings = [...colorMappings];
    newMappings[index][field] = value;
    setColorMappings(newMappings);
  };

  const addColorMapping = () => {
    setColorMappings([...colorMappings, { color: '', file: null }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const data = new FormData();

    // Append text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    // Append new general images
    for (let i = 0; i < generalImages.length; i++) {
      data.append('generalImages', generalImages[i]);
    }

    // Append new color variants
    colorMappings.forEach((mapping) => {
      if (mapping.color && mapping.file) {
        data.append('colorNames', mapping.color);
        data.append('colorFiles', mapping.file);
      }
    });

    const token = localStorage.getItem('token');

    try {
      if (isEditMode) {
        await api.put(`/products/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold">Title</label>
          <input type="text" name="title" value={formData.title} placeholder="Product Title" onChange={handleInputChange} className="w-full p-2 border rounded" required />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-semibold">Description</label>
          <textarea name="description" value={formData.description} placeholder="Description" onChange={handleInputChange} className="w-full p-2 border rounded" required />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Price (₹)</label>
            <input type="number" name="price" value={formData.price} placeholder="Price" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Stock Quantity</label>
            <input type="number" name="stock" value={formData.stock} placeholder="Stock" onChange={handleInputChange} className="p-2 border rounded w-full" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold">Category</label>
          <input type="text" name="category" value={formData.category} placeholder="Category" onChange={handleInputChange} className="w-full p-2 border rounded" required />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold">Variant Type</label>
            <input type="text" name="variantType" value={formData.variantType} placeholder="e.g. Size" onChange={handleInputChange} className="w-full p-2 border rounded" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-semibold">Options</label>
            <input type="text" name="variantOptions" value={formData.variantOptions} placeholder="S, M, L (comma separated)" onChange={handleInputChange} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-bold mb-2">Update Color Variants</h3>
          <p className="text-xs text-gray-500 mb-4">Leave empty to keep existing images unless you want to replace them.</p>
          {colorMappings.map((mapping, index) => (
            <div key={index} className="flex gap-4 mb-2 items-center">
              <input 
                type="text" 
                placeholder="Color Name" 
                value={mapping.color}
                onChange={(e) => handleColorMappingChange(index, 'color', e.target.value)}
                className="flex-1 p-2 border rounded"
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleColorMappingChange(index, 'file', e.target.files[0])}
                className="flex-1"
              />
            </div>
          ))}
          <button type="button" onClick={addColorMapping} className="text-sm bg-gray-200 px-3 py-1 rounded mt-2">
            + Add Another Color
          </button>
        </div>

        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-bold mb-2">Update Gallery Images</h3>
          <input type="file" multiple accept="image/*" onChange={(e) => setGeneralImages(e.target.files)} className="w-full" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isSeasonal" id="isSeasonal" checked={formData.isSeasonal} onChange={handleInputChange} />
          <label htmlFor="isSeasonal" className="font-semibold">Mark as Seasonal</label>
        </div>
        
        {formData.isSeasonal && (
          <input type="text" name="seasonalTag" value={formData.seasonalTag} placeholder="Seasonal Tag (e.g., Winter Essentials)" onChange={handleInputChange} className="w-full p-2 border rounded" />
        )}

        <button type="submit" disabled={uploading} className="w-full bg-black text-white p-3 rounded font-semibold disabled:bg-gray-400">
          {uploading ? 'Processing...' : isEditMode ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;