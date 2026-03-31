import { useState } from 'react';

const CATEGORY_ICONS = {
  'Rods': '🎣',
  'Reels': '🔄',
  'Lures': '🐟',
  'Lines & Leaders': '〰️',
  'Hooks & Terminal Tackle': '🪝',
  'Accessories': '🎒',
};

export default function GearCard({ item, onDelete, onQuantityChange, onEdit }) {
  const [qty, setQty] = useState(item.quantity);
  const [saving, setSaving] = useState(false);

  const icon = CATEGORY_ICONS[item.category] || '🎣';

  const stockColor =
    qty === 0
      ? 'bg-red-100 text-red-700'
      : qty <= 3
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700';

  const stockLabel = qty === 0 ? 'Out of stock' : qty <= 3 ? 'Low stock' : 'In stock';

  async function handleQtyChange(newQty) {
    if (newQty < 0) return;
    setSaving(true);
    await onQuantityChange(item.id, newQty);
    setQty(newQty);
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Category badge */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl flex-shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{item.name}</h3>
            <span className="text-xs text-gray-400 font-mono">{item.sku}</span>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-teal-50 text-teal-700 whitespace-nowrap flex-shrink-0">
          {item.category}
        </span>
      </div>

      {/* Description */}
      <p className="px-5 text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
        {item.description || 'No description'}
      </p>

      {/* Price & stock */}
      <div className="px-5 py-3 flex items-center justify-between mt-2">
        <span className="text-lg font-bold text-gray-900">€{item.price.toFixed(2)}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stockColor}`}>
          {stockLabel}
        </span>
      </div>

      {/* Quantity control */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
          <button
            onClick={() => handleQtyChange(qty - 1)}
            disabled={saving || qty <= 0}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold text-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            value={qty}
            min={0}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v) && v >= 0) setQty(v);
            }}
            onBlur={() => handleQtyChange(qty)}
            disabled={saving}
            className="flex-1 text-center font-semibold text-gray-900 bg-transparent text-sm outline-none w-0"
            aria-label="Quantity"
          />
          <button
            onClick={() => handleQtyChange(qty + 1)}
            disabled={saving}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold text-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 text-xs font-medium py-2 rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="flex-1 text-xs font-medium py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
