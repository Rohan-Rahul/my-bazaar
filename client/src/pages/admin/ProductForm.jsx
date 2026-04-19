import {useState} from 'react';
import api from '../../services/api';
import {toast} from 'react-hot-toast';

const ProductForm =()=>{
  const [formData,setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    variantType: 'Size',
    variantOptions: '',
    isSeasonal: false,
    seasonalTag:''
  });

  const [images,setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const {name,value,type,checked} = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked: value
    });
  };
  
  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const data = new FormData();

    //append text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    //handle variantOptions conversion from string to array for backend

    //append multiple files
    for(let i = 0; i <images.length; i++){
      data.append('images',images[i]);
    }

    const token = localStorage.getItem('token');

    try{
      await api.post('/products',data,{
        headers: {'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Product created successfully');
    } catch(error){
      toast.error(error.response?.data?.message || 'Upload failed'); 
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="title" placeholder="Product Title" onChange={handleInputChange} className="w-full p-2 border rounded" required />
        
        <textarea name="description" placeholder="Description" onChange={handleInputChange} className="w-full p-2 border rounded" required />
        
        <div className="grid grid-cols-2 gap-4">
          <input type="number" name="price" placeholder="Price" onChange={handleInputChange} className="p-2 border rounded" required />
          <input type="number" name="stock" placeholder="Stock" onChange={handleInputChange} className="p-2 border rounded" required />
        </div>

        <input type="text" name="category" placeholder="Category" onChange={handleInputChange} className="w-full p-2 border rounded" required />

        <div className="flex gap-4">
          <input type="text" name="variantType" placeholder="Variant Type (e.g. Size)" onChange={handleInputChange} className="flex-1 p-2 border rounded" />
          <input type="text" name="variantOptions" placeholder="Options (comma separated)" onChange={handleInputChange} className="flex-1 p-2 border rounded" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isSeasonal" id="isSeasonal" onChange={handleInputChange} />
          <label htmlFor="isSeasonal">Mark as Seasonal</label>
        </div>

      {formData.isSeasonal && (
        <input 
              type="text" 
              name="seasonalTag" 
              placeholder="Seasonal Tag (e.g., Winter Essentials)" 
              onChange={handleInputChange} 
              className="w-full p-2 border rounded" 
            />
      )}

        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full" required />

        <button 
          type="submit" 
          disabled={uploading}
          className="w-full bg-black text-white p-3 rounded font-semibold disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;