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

  const [generalImages, setGeneralImages] = useState([]);
  const [colorMappings, setColorMappings] = useState([{
    color: '', file: null
  }]);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const {name,value,type,checked} = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked: value
    });
  };
  
 const handleColorMappingChange = (index, field,value) => {
  const newMappings = [...colorMappings];
  newMappings[index][field] = value;
  setColorMappings(newMappings);
 }

 const addColorMapping = () => {
  setColorMappings([...colorMappings, {color: '', file: null}]);
 }

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
    for(let i = 0; i <generalImages.length; i++){
      data.append('generalImages',generalImages[i]);
    }

    colorMappings.forEach((mapping) => {
      if(mapping.color && mapping.file){
        data.append('colorNames', mapping.color);
        data.append('colorFiles', mapping.file);
      }
    })

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

        <div className="border p-4 rounded bg-gray-50">
          <h3 className="font-bold mb-2">Color Variants (Required if using colors)</h3>
          {colorMappings.map((mapping, index) => (
            <div key={index} className="flex gap-4 mb-2 items-center">
              <input 
                type="text" 
                placeholder="Color Name (e.g. Black)" 
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
          <h3 className="font-bold mb-2">Additional Gallery Images (Optional)</h3>
          <input type="file" multiple accept="image/*" onChange={(e) => setGeneralImages(e.target.files)} className="w-full" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="isSeasonal" id="isSeasonal" onChange={handleInputChange} />
          <label htmlFor="isSeasonal">Mark as Seasonal</label>
        </div>
        
        {formData.isSeasonal && (
          <input type="text" name="seasonalTag" placeholder="Seasonal Tag (e.g., Winter Essentials)" onChange={handleInputChange} className="w-full p-2 border rounded" />
        )}

        <button type="submit" disabled={uploading} className="w-full bg-black text-white p-3 rounded font-semibold disabled:bg-gray-400">
          {uploading ? 'Uploading...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;