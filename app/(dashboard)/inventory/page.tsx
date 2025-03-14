'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InventoryItem {
  id: number;
  name: string;
  brand: string;
  category_id: number;
  size: string;
  price: number;
  cost: number;
  quantity: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    description?: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category_id: '',
    size: '',
    price: '',
    cost: '',
    quantity: '',
    min_stock: '5'  // Default value from schema
  });

  // Load inventory and categories on component mount
  useEffect(() => {
    loadInventoryAndCategories();
  }, []);

  async function loadInventoryAndCategories() {
    try {
      setLoading(true);
      
      // Fetch categories first
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (categoryError) {
        console.error('Error loading categories:', categoryError);
        throw categoryError;
      }
      
      if (!categoryData || categoryData.length === 0) {
        console.warn('No categories found in the database');
        alert('No categories found. Please add categories first.');
        return;
      }
      
      setCategories(categoryData);
      
      // Fetch inventory with category details
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          *,
          category:category_id (
            id,
            name,
            description
          )
        `)
        .order('name');
        
      if (inventoryError) {
        console.error('Error loading inventory:', inventoryError);
        throw inventoryError;
      }
      
      setInventory(inventoryData || []);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error loading data:', error);
        alert(`Failed to load inventory data: ${error.message}`);
      } else {
        console.error('Error loading data:', error);
        alert('Failed to load inventory data: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      item.category_id === Number(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      category_id: '',
      size: '',
      price: '',
      cost: '',
      quantity: '',
      min_stock: '5'  // Reset to default value
    });
    setEditingItem(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const itemData = {
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category_id: parseInt(formData.category_id),
        size: formData.size.trim(),
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        min_stock: parseInt(formData.min_stock)
      };

      // Validate the data
      if (isNaN(itemData.category_id)) {
        alert('Please select a category');
        return;
      }

      if (itemData.price < itemData.cost) {
        if (!confirm('Selling price is less than cost price. Do you want to continue?')) {
          return;
        }
      }
      
      if (editingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('inventory')
          .update({
            ...itemData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);
          
        if (updateError) throw updateError;
        
      } else {
        // Add new item
        const { error: insertError } = await supabase
          .from('inventory')
          .insert([{
            ...itemData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (insertError) throw insertError;
      }
      
      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      
      // Reload inventory to get fresh data
      await loadInventoryAndCategories();
      
    } catch (error: unknown) {
      console.error('Error saving item:', error);
      if (error instanceof Error && 'code' in error) {
        const errorCode = (error as { code: string }).code;
        if (errorCode === 'PGRST116') {
          alert('You do not have permission to modify inventory. Please check if you are logged in as an admin user.');
        } else if (errorCode === '23503') {
          alert('Invalid category selected. Please choose a valid category.');
        } else if (errorCode === '23502') {
          alert('Please fill in all required fields.');
        } else if (errorCode === '42501') {
          alert('Permission denied. Please check if you are logged in as an admin user.');
        }
      } else {
        alert(`Failed to save item: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Handle item deletion
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Reload inventory
      await loadInventoryAndCategories();
      
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  // Handle edit button click
  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      brand: item.brand,
      category_id: item.category_id.toString(),
      size: item.size,
      price: item.price.toString(),
      cost: item.cost.toString(),
      quantity: item.quantity.toString(),
      min_stock: item.min_stock.toString()
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  if (loading) {
    return <div className="flex justify-center p-12 text-foreground">Loading inventory...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Inventory Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search inventory..."
          className="p-2 rounded-lg bg-input text-foreground border border-border placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        <select
          className="p-2 rounded-lg bg-input text-foreground border border-border"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Table - Desktop */}
      <div className="bg-card rounded-lg shadow overflow-x-auto hidden md:block">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-secondary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredInventory.map((item) => (
              <tr key={item.id} className="hover:bg-muted/50">
                <td className="px-6 py-4 whitespace-nowrap text-foreground">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">
                  {item.brand}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">
                  {item.category?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">
                  {item.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-foreground">
                  ₹{item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`${
                    item.quantity < 5 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-accent hover:text-accent-foreground mr-4 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inventory Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredInventory.length > 0 ? (
          filteredInventory.map((item) => (
            <div key={item.id} className="bg-card rounded-lg shadow p-4 border border-border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-foreground">{item.name}</h3>
                <span className={`${
                  item.quantity < 5 ? 'text-red-400' : 'text-green-400'
                } font-medium`}>
                  {item.quantity} in stock
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-muted-foreground">Brand:</span> {item.brand}
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span> {item.category?.name || 'N/A'}
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span> {item.size}
                </div>
                <div>
                  <span className="text-muted-foreground">Price:</span> ₹{item.price.toFixed(2)}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-accent hover:text-accent-foreground transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No items found matching your search criteria.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-4 sm:p-6 w-full max-w-md border border-border shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground placeholder:text-muted-foreground"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    required
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground placeholder:text-muted-foreground"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground">Category</label>
                  <select
                    name="category_id"
                    required
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground">Size</label>
                  <input
                    type="text"
                    name="size"
                    required
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground placeholder:text-muted-foreground"
                    value={formData.size}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground">Cost Price</label>
                  <input
                    type="number"
                    name="cost"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground placeholder:text-muted-foreground"
                    value={formData.cost}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground">Selling Price</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground placeholder:text-muted-foreground"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground">Current Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground placeholder:text-muted-foreground"
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground">Minimum Stock Level</label>
                  <input
                    type="number"
                    name="min_stock"
                    required
                    min="0"
                    className="mt-1 block w-full bg-input border-border rounded-md shadow-sm p-2 text-foreground placeholder:text-muted-foreground"
                    value={formData.min_stock}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                  className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
