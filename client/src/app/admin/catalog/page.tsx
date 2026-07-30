import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SearchBar } from '@/components/shared/SearchBar';
import { Plus, Check, X, Pencil, GripVertical } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  sortOrder: number;
}

interface Product {
  id: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  basePrice: string;
  imageUrl: string | null;
  isAvailable: boolean;
  modifierIds: number[];
}

interface Modifier {
  id: number;
  name: string;
  priceAdjustment: string;
  isAvailable: boolean;
}

type Tab = 'products' | 'categories' | 'modifiers';

function formatPrice(price: string) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseFloat(price));
}

export function AdminCatalogPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['catalog', 'categories'],
    queryFn: () => api<{ data: Category[] }>('/catalog/categories'),
    enabled: activeTab === 'products' || activeTab === 'categories',
  });

  const { data: productsData } = useQuery({
    queryKey: ['catalog', 'products', { search, categoryFilter }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('categoryId', String(categoryFilter));
      return api<{ data: Product[] }>(`/catalog/products?${params}`);
    },
    enabled: activeTab === 'products',
  });

  const { data: modifiersData } = useQuery({
    queryKey: ['catalog', 'modifiers'],
    queryFn: () => api<{ data: Modifier[] }>('/catalog/modifiers'),
    enabled: activeTab === 'modifiers',
  });

  const categories = categoriesData?.data ?? [];
  const products = productsData?.data ?? [];
  const modifiers = modifiersData?.data ?? [];

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'products', label: 'Productos', count: products.length },
    { id: 'categories', label: 'Categorías', count: categories.length },
    { id: 'modifiers', label: 'Modificadores', count: modifiers.length },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Playfair_Display'] font-bold text-3xl text-[#2C1810]">Catálogo</h2>
      </div>

      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] transition-colors duration-150 ${
              activeTab === tab.id
                ? 'bg-[#6B1A2A] text-[#F0E6D3]'
                : 'border-2 border-[#8B7355] text-[#5C4030] hover:bg-[#EBDCC4]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <ProductsTab
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          categories={categories}
          products={products}
          modifiers={modifiers}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesTab categories={categories} />
      )}

      {activeTab === 'modifiers' && (
        <ModifiersTab modifiers={modifiers} />
      )}
    </div>
  );
}

function ProductsTab({
  search, onSearchChange, categoryFilter, onCategoryFilterChange,
  categories, products, modifiers,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  categoryFilter: number | null;
  onCategoryFilterChange: (v: number | null) => void;
  categories: Category[];
  products: Product[];
  modifiers: Modifier[];
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', basePrice: '', categoryId: '', modifierIds: [] as number[], isAvailable: true });
  const [modifierFilter, setModifierFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: typeof form) => api('/catalog/products', {
      method: 'POST',
      body: JSON.stringify({ ...input, categoryId: input.categoryId ? parseInt(input.categoryId) : null }),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] }); resetForm(); },
    onError: (err: { message?: string }) => setError(err.message ?? 'Error al crear'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: typeof form }) => api(`/catalog/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...input, categoryId: input.categoryId ? parseInt(input.categoryId) : null }),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] }); resetForm(); },
    onError: (err: { message?: string }) => setError(err.message ?? 'Error al guardar'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: number; isAvailable: boolean }) =>
      api(`/catalog/products/${id}`, { method: 'PUT', body: JSON.stringify({ isAvailable }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalog', 'products'] }),
  });

  function resetForm() {
    setEditing(null);
    setForm({ name: '', description: '', basePrice: '', categoryId: '', modifierIds: [], isAvailable: true });
    setModifierFilter('');
    setError(null);
  }

  function openCreate() { resetForm(); }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name, description: p.description ?? '', basePrice: p.basePrice,
      categoryId: p.categoryId ? String(p.categoryId) : '', modifierIds: p.modifierIds ?? [], isAvailable: p.isAvailable,
    });
  }

  const isOpen = editing !== null || (!editing && form.name === '');

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={onSearchChange} placeholder="Buscar productos..." />
        </div>
        <select
          value={categoryFilter ?? ''}
          onChange={(e) => onCategoryFilterChange(e.target.value ? parseInt(e.target.value) : null)}
          className="border-2 border-[#8B7355] bg-white px-3 py-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={openCreate}
          className="bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-5 py-3 hover:bg-[#8B2535]">
          <Plus size={16} className="inline mr-1" /> Producto
        </button>
      </div>

      {isOpen && (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-6 mb-6"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <h3 className="font-['Playfair_Display'] font-bold text-2xl text-[#6B1A2A] mb-4">
            {editing ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
            <input type="text" placeholder="Precio base" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
              className="border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
            <div className="col-span-2">
              <input type="text" placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
            </div>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none">
              <option value="">Sin categoría</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="flex items-center gap-2 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-[#6B1A2A]" />
              Disponible
            </label>
          </div>

          {modifiers.length > 0 && (
            <div className="mt-4">
              <p className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030] mb-2">
                Modificadores ({form.modifierIds.length} seleccionados)
              </p>
              <input
                type="text"
                placeholder="Filtrar modificadores..."
                value={modifierFilter}
                onChange={(e) => setModifierFilter(e.target.value)}
                className="w-full border-2 border-[#8B7355] bg-white p-2 font-['JetBrains_Mono'] text-xs text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none mb-2"
              />
              <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-1">
                {modifiers
                  .filter((m) => {
                    if (!modifierFilter) return true;
                    return m.name.toLowerCase().includes(modifierFilter.toLowerCase());
                  })
                  .map((m) => (
                    <label key={m.id} className={`flex items-center gap-2 p-2 cursor-pointer border-2 transition-colors text-xs ${
                      form.modifierIds.includes(m.id)
                        ? 'bg-[#6B1A2A]/10 border-[#6B1A2A]'
                        : 'bg-white border-[#EBDCC4] hover:border-[#8B7355]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.modifierIds.includes(m.id)}
                        onChange={() => {
                          setForm({
                            ...form,
                            modifierIds: form.modifierIds.includes(m.id)
                              ? form.modifierIds.filter((id) => id !== m.id)
                              : [...form.modifierIds, m.id],
                          });
                        }}
                        className="w-3.5 h-3.5 accent-[#6B1A2A] shrink-0"
                      />
                      <span className="font-['JetBrains_Mono'] text-[#2C1810] truncate">{m.name}</span>
                      {parseFloat(m.priceAdjustment) !== 0 && (
                        <span className="font-['JetBrains_Mono'] text-[#2D4A22] ml-auto shrink-0">
                          +{formatPrice(m.priceAdjustment)}
                        </span>
                      )}
                    </label>
                  ))}
                {modifierFilter && modifiers.filter((m) => m.name.toLowerCase().includes(modifierFilter.toLowerCase())).length === 0 && (
                  <p className="col-span-2 text-center font-['Caveat'] text-lg text-[#8B7355] py-4">Sin resultados</p>
                )}
              </div>
            </div>
          )}

          {error && <p className="mt-3 font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">{error}</p>}

          <div className="flex gap-3 mt-4">
            <button onClick={resetForm}
              className="flex items-center gap-1 border-2 border-[#6B1A2A] text-[#6B1A2A] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2 hover:bg-white">
              <X size={14} /> Cancelar
            </button>
            <button onClick={() => editing ? updateMutation.mutate({ id: editing.id, input: form }) : createMutation.mutate(form)}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-1 bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2 hover:bg-[#8B2535] disabled:opacity-50">
              <Check size={14} /> {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">Esta hoja está en blanco.</p>
          <p className="font-['Caveat'] text-lg text-[#8B7355] mt-1">El primer trazo es el más importante.</p>
        </div>
      ) : (
        <div className="border-4 border-[#6B1A2A]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Producto</th>
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Categoría</th>
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Precio</th>
                <th className="text-center p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Estado</th>
                <th className="text-right p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white hover:bg-[#EBDCC4]/30 transition-colors">
                  <td className="p-4">
                    <span className="font-['Playfair_Display'] font-bold text-lg text-[#2C1810]">{p.name}</span>
                    {p.description && <p className="font-['JetBrains_Mono'] text-xs text-[#8B7355] mt-1">{p.description}</p>}
                    {p.modifierIds?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.modifierIds.map((mId) => {
                          const mod = modifiers.find((m) => m.id === mId);
                          return mod ? (
                            <span key={mId} className="font-['Caveat'] text-sm text-[#8B7355] italic">
                              • {mod.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#5C4030]">
                    {categories.find((c) => c.id === p.categoryId)?.name ?? '—'}
                  </td>
                  <td className="p-4 font-['JetBrains_Mono'] font-bold text-sm text-[#2D4A22]">{formatPrice(p.basePrice)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => toggleMutation.mutate({ id: p.id, isAvailable: !p.isAvailable })}
                      className={`font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-3 py-1 ${
                        p.isAvailable ? 'text-[#2D4A22]' : 'text-[#8B7355]'
                      }`}>
                      {p.isAvailable ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(p)}
                      className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#8B7355] hover:text-[#6B1A2A] px-3 py-2">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CategoriesTab({ categories }: { categories: Category[] }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: { name: string; sortOrder: number }) =>
      api('/catalog/categories', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] }); resetForm(); },
    onError: (err: { message?: string }) => setError(err.message ?? 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { name: string; sortOrder: number } }) =>
      api(`/catalog/categories/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalog', 'categories'] }); resetForm(); },
    onError: (err: { message?: string }) => setError(err.message ?? 'Error'),
  });

  function resetForm() { setEditing(null); setName(''); setSortOrder(0); setError(null); }
  function openCreate() { resetForm(); }
  function openEdit(c: Category) { setEditing(c); setName(c.name); setSortOrder(c.sortOrder); }

  const isOpen = editing !== null || (!editing && name === '' && !error);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate}
          className="bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-5 py-3 hover:bg-[#8B2535]">
          <Plus size={16} className="inline mr-1" /> Categoría
        </button>
      </div>

      {isOpen && (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-6 mb-6"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <h3 className="font-['Playfair_Display'] font-bold text-2xl text-[#6B1A2A] mb-4">
            {editing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
            </div>
            <div className="w-24">
              <input type="number" placeholder="Orden" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
            </div>
          </div>
          {error && <p className="mt-3 font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={resetForm}
              className="flex items-center gap-1 border-2 border-[#6B1A2A] text-[#6B1A2A] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2 hover:bg-white">
              <X size={14} /> Cancelar
            </button>
            <button onClick={() => editing ? updateMutation.mutate({ id: editing.id, input: { name, sortOrder } }) : createMutation.mutate({ name, sortOrder })}
              className="flex items-center gap-1 bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2 hover:bg-[#8B2535]">
              <Check size={14} /> {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin categorías aún.</p>
        </div>
      ) : (
        <div className="border-4 border-[#6B1A2A]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030] w-8"><GripVertical size={14} /></th>
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Nombre</th>
                <th className="text-center p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Orden</th>
                <th className="text-right p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white hover:bg-[#EBDCC4]/30 transition-colors">
                  <td className="p-4 text-[#8B7355]"><GripVertical size={14} /></td>
                  <td className="p-4 font-['Playfair_Display'] font-bold text-lg text-[#2C1810]">{c.name}</td>
                  <td className="p-4 text-center font-['JetBrains_Mono'] text-sm text-[#5C4030]">{c.sortOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(c)}
                      className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#8B7355] hover:text-[#6B1A2A] px-3 py-2">
                      <Pencil size={14} className="inline mr-1" /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ModifiersTab({ modifiers }: { modifiers: Modifier[] }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Modifier | null>(null);
  const [name, setName] = useState('');
  const [priceAdjustment, setPriceAdjustment] = useState('0');
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (input: { name: string; priceAdjustment: string; isAvailable: boolean }) =>
      api('/catalog/modifiers', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalog', 'modifiers'] }); resetForm(); },
    onError: (err: { message?: string }) => setError(err.message ?? 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: { name: string; priceAdjustment: string; isAvailable: boolean } }) =>
      api(`/catalog/modifiers/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['catalog', 'modifiers'] }); resetForm(); },
    onError: (err: { message?: string }) => setError(err.message ?? 'Error'),
  });

  function resetForm() { setEditing(null); setName(''); setPriceAdjustment('0'); setIsAvailable(true); setError(null); }
  function openCreate() { resetForm(); }
  function openEdit(m: Modifier) { setEditing(m); setName(m.name); setPriceAdjustment(m.priceAdjustment); setIsAvailable(m.isAvailable); }

  const isOpen = editing !== null || (!editing && name === '' && !error);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate}
          className="bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-sm uppercase tracking-[0.1em] px-5 py-3 hover:bg-[#8B2535]">
          <Plus size={16} className="inline mr-1" /> Modificador
        </button>
      </div>

      {isOpen && (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-6 mb-6"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <h3 className="font-['Playfair_Display'] font-bold text-2xl text-[#6B1A2A] mb-4">
            {editing ? 'Editar Modificador' : 'Nuevo Modificador'}
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
            </div>
            <div className="w-32">
              <input type="text" placeholder="Ajuste" value={priceAdjustment} onChange={(e) => setPriceAdjustment(e.target.value)}
                className="w-full border-2 border-[#8B7355] bg-white p-3 font-['JetBrains_Mono'] text-sm text-[#2C1810] focus:border-[#6B1A2A] focus:border-4 outline-none" />
            </div>
            <label className="flex items-center gap-2 font-['DM_Sans'] font-bold text-xs uppercase text-[#5C4030]">
              <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 accent-[#6B1A2A]" />
              Disponible
            </label>
          </div>
          {error && <p className="mt-3 font-['DM_Sans'] font-bold text-sm text-[#8B1A1A]">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={resetForm}
              className="flex items-center gap-1 border-2 border-[#6B1A2A] text-[#6B1A2A] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2 hover:bg-white">
              <X size={14} /> Cancelar
            </button>
            <button onClick={() => editing ? updateMutation.mutate({ id: editing.id, input: { name, priceAdjustment, isAvailable } }) : createMutation.mutate({ name, priceAdjustment, isAvailable })}
              className="flex items-center gap-1 bg-[#6B1A2A] text-[#F0E6D3] font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] px-4 py-2 hover:bg-[#8B2535]">
              <Check size={14} /> {editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      )}

      {modifiers.length === 0 ? (
        <div className="bg-[#EBDCC4] border-4 border-[#6B1A2A] p-12 text-center"
          style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}>
          <p className="font-['Caveat'] text-2xl text-[#8B7355]">Sin modificadores aún.</p>
        </div>
      ) : (
        <div className="border-4 border-[#6B1A2A]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#EBDCC4] border-b-4 border-[#6B1A2A]">
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Nombre</th>
                <th className="text-left p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Ajuste</th>
                <th className="text-center p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Estado</th>
                <th className="text-right p-4 font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#5C4030]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modifiers.map((m) => (
                <tr key={m.id} className="border-b-2 border-[#8B7355]/30 last:border-0 bg-white hover:bg-[#EBDCC4]/30 transition-colors">
                  <td className="p-4 font-['Playfair_Display'] font-bold text-lg text-[#2C1810]">{m.name}</td>
                  <td className="p-4 font-['JetBrains_Mono'] text-sm text-[#2D4A22]">
                    {parseFloat(m.priceAdjustment) === 0 ? '—' : `+${formatPrice(m.priceAdjustment)}`}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] ${m.isAvailable ? 'text-[#2D4A22]' : 'text-[#8B7355]'}`}>
                      {m.isAvailable ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(m)}
                      className="font-['DM_Sans'] font-bold text-xs uppercase tracking-[0.1em] text-[#8B7355] hover:text-[#6B1A2A] px-3 py-2">
                      <Pencil size={14} className="inline mr-1" /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
