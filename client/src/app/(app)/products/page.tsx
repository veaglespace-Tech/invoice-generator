"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, PackageOpen, Loader2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { fetchApi } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  SKU: string;
  type: string;
  price: string | number;
  tax_rate: string | number;
  status: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    SKU: '',
    type: 'SERVICE',
    unit: 'pcs',
    price: '',
    tax_rate: '0'
  });

  const loadProducts = async () => {
    try {
      const response = await fetchApi<{ success: boolean; data: Product[] }>('/products');
      setProducts(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        tax_rate: Number(formData.tax_rate)
      };
      await fetchApi('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      await loadProducts();
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', SKU: '', type: 'SERVICE', unit: 'pcs', price: '', tax_rate: '0' });
    } catch (err: any) {
      alert(err.message || 'Failed to add product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Items</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your catalog of items for invoicing.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary text-white hover:scale-105 transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 rounded-t-xl">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/50" />
            <input 
              type="text" 
              placeholder="Search items by name or SKU..." 
              className="input input-bordered w-full pl-10"
            />
          </div>
          <button className="btn btn-outline">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
        
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
              <p>Loading items...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 hover:underline">Try again</button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
              <p>No items found.</p>
            </div>
          ) : (
            <table className="table table-zebra w-full text-sm text-left">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Tax Rate</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.id} className="hover">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <PackageOpen className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-base-content">{item.name}</span>
                      </div>
                    </td>
                    <td className="text-base-content/70 font-mono text-xs">{item.SKU || 'N/A'}</td>
                    <td className="text-base-content font-medium">
                      ₹{Number(item.price).toLocaleString()}
                    </td>
                    <td className="text-base-content/70">{item.tax_rate}%</td>
                    <td>
                      {item.status === 'ACTIVE' ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="default">Inactive</Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <button className="btn btn-ghost btn-sm btn-square">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {!loading && !error && products.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Showing {products.length} result(s)</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Item</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input input-bordered w-full"
                    placeholder="e.g. Consultation Service"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                  <input 
                    type="text"
                    value={formData.SKU}
                    onChange={(e) => setFormData({...formData, SKU: e.target.value})}
                    className="input input-bordered w-full"
                    placeholder="e.g. ITEM-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unit Price *</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="input input-bordered w-full"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tax Rate (%)</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData({...formData, tax_rate: e.target.value})}
                    className="input input-bordered w-full"
                    placeholder="0"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="textarea textarea-bordered w-full"
                    placeholder="Optional details about this item..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary text-white"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
