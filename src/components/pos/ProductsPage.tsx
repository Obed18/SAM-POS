import React, { useState, useMemo, useEffect, } from 'react';
import { Product, Category } from '@/types';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct, getCategories, uploadProductImage,
} from '@/services/dataService';
import { useAppContext } from '@/contexts/AppContext';
import Modal from './Modal';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Package,
  Filter,
  X,
  ScanBarcode,
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

const emptyProduct: Partial<Product> = {
  name: '',
  category: 'Fruits',
  price: 0,
  stock: 0,
  barcode: '',
  description: '',
  image: '',
};

const ProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productList, setProductList] = useState<Product[]>([]);
  const categoryOptions = ['All', ...categories.map(c => c.name)];
  const [loading, setLoading] = useState(true);
  const { userRole } = useAppContext();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

useEffect(() => {
  loadProducts();
  loadCategories();
}, []);

const loadCategories = async () => {
  try {
    const data = await getCategories();
    setCategories(data);
  } catch (err) {
    console.error(err);
    alert('Failed to load categories');
  }
};
const loadProducts = async () => {
  try {
    const data = await getProducts();
    setProductList(data);
  } catch (err) {
    console.error(err);
    alert('Failed to load products');
  } finally {
    setLoading(false);
  }
};

  const filtered = useMemo(() => {
    return productList.filter((p) => {
      const matchSearch =
  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (p.barcode?.includes(searchQuery) ?? false);
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [productList, searchQuery, filterCategory]);

  const openAdd = () => {
    setEditingProduct({ ...emptyProduct });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setImageFile(null);
    setImagePreview(product.image || null);
    setShowModal(true);
  };

const handleSave = async () => {
  if (!editingProduct?.name || editingProduct?.price == null) {
    alert('Please fill required fields');
    return;
  }

  try {
    let finalImage = editingProduct.image;

    if (imageFile) {
      finalImage = await uploadProductImage(imageFile);
    }

    const productData = { ...editingProduct, image: finalImage };

    if (editingProduct.id) {
      await updateProduct(editingProduct.id, productData, imageFile || undefined);
      await loadProducts();
    } else {
      await addProduct(productData, imageFile || undefined);
      await loadProducts();
    }

    setShowModal(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
  } catch (err: unknown) {
    console.error('Save error:', err);
    alert(err instanceof Error ? err.message : 'Operation failed');
  }
};

const handleDelete = async () => {
  if (!deleteId) return;

try {
  await deleteProduct(deleteId);
  setProductList(prev => prev.filter(p => p.id !== deleteId));

  setShowDeleteModal(false);
  setDeleteId(null);

} catch (err: unknown) {
  console.error('Delete error:', err);
  alert(err instanceof Error ? err.message : 'Delete failed');
}
};

if (loading) {
  return <p className="text-center py-10">Loading products...</p>;
}

    const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
  }).format(amount);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{productList.length} products in inventory</p>
        </div>
        {userRole === 'admin' && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-sm text-slate-700 outline-none"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Barcode</th>
                  {userRole === 'admin' && (
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={product.image || 'https://via.placeholder.com/40'} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      product.stock <= 10
                        ? 'bg-red-50 text-red-600'
                        : product.stock <= 30
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{product.barcode}</td>
                {userRole === 'admin' && (
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setDeleteId(product.id); setShowDeleteModal(true); }}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                    )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Package className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm font-medium">No products found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct?.id ? 'Edit Product' : 'Add Product'} size="lg">
        {editingProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={editingProduct.category || 'Fruits'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={editingProduct.stock ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Barcode</label>
                <div className="relative">
                  <input
                    type="text"
                    value={editingProduct.barcode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Enter or Scan barcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                  >
                    <ScanBarcode size={18} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                    {imagePreview || editingProduct.image ? (
                      <img src={imagePreview || editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, or GIF</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none h-20"
                placeholder="Product description..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm"
              >
                {editingProduct.id ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Product" size="sm">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2.5 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
      {showScanner && (
        <BarcodeScanner
          onDetected={(code) => {
            setEditingProduct({ ...editingProduct, barcode: code });
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default ProductsPage;
