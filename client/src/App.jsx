import { useState, useEffect, useCallback } from 'react';
import GearCard from './components/GearCard';
import GearModal from './components/GearModal';
import ConfirmDialog from './components/ConfirmDialog';

const API = '/api';

export default function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      const res = await fetch(`${API}/products?${params}`);
      if (!res.ok) throw new Error('Failed to load gear');
      const data = await res.json();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API}/categories`);
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setLoading(true);
    fetchItems();
  }, [fetchItems]);

  async function handleSave(formData) {
    const method = editItem ? 'PUT' : 'POST';
    const url = editItem ? `${API}/products/${editItem.id}` : `${API}/products`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Save failed');
    }
    await fetchItems();
    await fetchCategories();
    setShowModal(false);
    setEditItem(null);
    showToast(editItem ? '✅ Gear updated!' : '✅ Gear added!');
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      showToast(`❌ ${err.error}`);
    } else {
      await fetchItems();
      showToast('🗑️ Item deleted.');
    }
    setDeleteId(null);
  }

  async function handleQuantityChange(id, quantity) {
    const res = await fetch(`${API}/products/${id}/quantity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) {
      const err = await res.json();
      showToast(`❌ ${err.error}`);
    }
  }

  // Summary stats
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalValue = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const lowStockCount = items.filter((i) => i.quantity > 0 && i.quantity <= 3).length;
  const outOfStockCount = items.filter((i) => i.quantity === 0).length;

  return (
    <div className="min-h-screen bg-[#f0f7f4]">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎣</span>
            <div>
              <h1 className="text-xl font-bold leading-none">Tackle Tracker</h1>
              <p className="text-teal-200 text-xs mt-0.5">Personal Fishing Gear Inventory</p>
            </div>
          </div>
          <button
            onClick={() => { setEditItem(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-white text-teal-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-teal-50 transition-colors shadow-sm"
          >
            <span className="text-base">＋</span> Add Gear
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Items', value: items.length, icon: '📦', color: 'text-teal-700' },
            { label: 'In Stock', value: totalItems, icon: '✅', color: 'text-emerald-600' },
            { label: 'Low Stock', value: lowStockCount, icon: '⚠️', color: 'text-amber-600' },
            { label: 'Total Value', value: `€${totalValue.toFixed(2)}`, icon: '💰', color: 'text-teal-700' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search & filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gear by name, SKU or description…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Out-of-stock banner */}
        {outOfStockCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span>🚨</span>
            <span>
              <strong>{outOfStockCount} item{outOfStockCount > 1 ? 's' : ''}</strong> out of stock
            </span>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-400 space-y-2">
            <div className="text-5xl">🎣</div>
            <p className="font-medium text-gray-600">No gear found</p>
            <p className="text-sm">Try adjusting your search or add new gear.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <GearCard
                key={item.id}
                item={item}
                onDelete={(id) => setDeleteId(id)}
                onQuantityChange={handleQuantityChange}
                onEdit={(i) => { setEditItem(i); setShowModal(true); }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <GearModal
          item={editItem}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditItem(null); }}
        />
      )}

      {deleteId !== null && (
        <ConfirmDialog
          message="Delete this item from your tackle inventory?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
