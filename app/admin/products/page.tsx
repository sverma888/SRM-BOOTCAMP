'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  slug: string;
}

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image_url: '',
  category: '',
  stock: '',
  slug: '',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      image_url: p.image_url || '',
      category: p.category || '',
      stock: String(p.stock),
      slug: p.slug,
    });
    setError('');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim() || !form.slug.trim()) {
      setError('Name, price, and slug are required.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      image_url: form.image_url,
      category: form.category,
      stock: parseInt(form.stock) || 0,
      slug: form.slug,
    };

    try {
      const url = editingId
        ? `/api/admin/products/${editingId}`
        : '/api/admin/products';
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormOpen(false);
        setForm(emptyForm);
        setEditingId(null);
        await fetchProducts();
      } else {
        const d = await res.json();
        setError(d.error || 'Save failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      setDeleteConfirmId(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate KPIs
  const totalProducts = products.length;
  const lowStock = products.filter(p => p.stock < 10).length;
  const uniqueCategories = new Set(products.map(p => p.category).filter(Boolean)).size;
  const avgPrice = totalProducts > 0 
    ? products.reduce((acc, p) => acc + Number(p.price), 0) / totalProducts 
    : 0;

  const kpis = [
    { label: 'Total Products', value: String(totalProducts), accent: '#6366f1' },
    { label: 'Low Stock Alerts', value: String(lowStock), accent: '#ef4444' },
    { label: 'Categories', value: String(uniqueCategories), accent: '#8b5cf6' },
    { label: 'Avg. Price', value: `₹${avgPrice.toFixed(2)}`, accent: '#10b981' },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Package className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-foreground">Products</h1>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-surface border border-border/50 shadow-sm rounded-xl p-4 flex flex-col gap-2 transition-shadow hover:shadow-md">
            <span className="text-[11px] font-medium text-muted uppercase tracking-wider">{kpi.label}</span>
            <span className="text-xl font-bold text-foreground">{kpi.value}</span>
            <div className="h-0.5 w-8 rounded-full" style={{ backgroundColor: kpi.accent, opacity: 0.8 }} />
          </div>
        ))}
      </div>

      {/* Add / Edit Form Modal */}
      {formOpen && (
        <div className="bg-surface border border-border/50 shadow-sm rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">
              {editingId ? 'Edit Product' : 'New Product'}
            </h2>
            <button
              onClick={() => { setFormOpen(false); setEditingId(null); }}
              className="p-1 rounded text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Product name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="product-slug"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Price *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="29.99"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Audio"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Stock</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Image URL</label>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://..."
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-muted uppercase tracking-wider">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Product description"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end pt-1">
            <button
              onClick={() => { setFormOpen(false); setEditingId(null); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground border border-border hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{editingId ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-surface border border-border/50 shadow-sm rounded-xl p-10 text-center">
          <p className="text-sm text-muted">No products found. Add your first product above.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border/50 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="px-4 py-2.5 text-[11px] font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background/30 transition-colors">
                    <td className="px-4 py-2.5 text-foreground font-medium truncate max-w-[200px]">{p.name}</td>
                    <td className="px-4 py-2.5 text-foreground">₹{Number(p.price).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-muted hidden sm:table-cell">
                      {p.category && (
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[11px] font-medium">
                          {p.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted hidden md:table-cell">{p.stock}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-md text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {deleteConfirmId === p.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="px-2 py-1 rounded-md text-[11px] font-medium bg-error/10 text-error hover:bg-error/20 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 rounded-md text-[11px] font-medium text-muted hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-md text-muted hover:text-error hover:bg-error/10 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
