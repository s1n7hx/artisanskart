import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Check,
  X,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CollectionItem, Product, getProductSlug } from '../types';
import {
  fetchCollections,
  saveCollection,
  deleteCollection,
  togglePublishCollection,
} from '../services/supabase';

export const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    products,
    addToCart,
    showToast,
    currentUser,
    userRole,
    setActiveCategory,
  } = useApp();

  const isMaster = (currentUser?.email || '').trim().toLowerCase() === 'ssumollah@gmail.com' || userRole === 'master_admin';
  const isAdmin = userRole === 'admin' || userRole === 'master_admin' || isMaster;

  // Collections state
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedColId, setSelectedColId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Crochet');
  const [formCustomCategory, setFormCustomCategory] = useState<string>('');
  const [formDesc, setFormDesc] = useState<string>('');
  const [formPublished, setFormPublished] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load collections from Supabase
  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCollections();
      if (Array.isArray(data) && data.length > 0) {
        setCollections(data);
      }
    } catch (err: any) {
      console.warn('Error loading collections:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Distinct categories from actual products for dropdown
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category.trim());
    });
    // Add default fallbacks
    ['Crochet', 'Crochet Bouquet', 'Clay Crafts', 'Other Crafts', 'Paintings', 'Accessories', 'Keychains'].forEach((c) => cats.add(c));
    return Array.from(cats);
  }, [products]);

  // Helper: Match products to a collection
  const getProductsForCollection = (col: CollectionItem): Product[] => {
    if (!products || products.length === 0) return [];

    // If explicit productIds defined
    if (Array.isArray(col.productIds) && col.productIds.length > 0) {
      return products.filter((p) => col.productIds!.includes(p.id));
    }

    const colCat = (col.category || col.cat || '').trim().toLowerCase();
    const colTitle = (col.title || '').toLowerCase();

    return products.filter((p) => {
      const prodCat = (p.category || '').trim().toLowerCase();
      if (!prodCat) return false;

      // Exact or mutual substring match
      if (prodCat === colCat) return true;
      if (colCat.includes(prodCat) || prodCat.includes(colCat)) return true;

      // Special cluster: 'Crochet' & 'Crochet Bouquet'
      if (colCat.includes('crochet') && prodCat.includes('crochet')) return true;

      // Special cluster: 'Clay' & 'Pottery'
      if (colCat.includes('clay') && (prodCat.includes('clay') || prodCat.includes('pottery'))) return true;

      // Check title match
      if (colTitle.includes(prodCat)) return true;

      return false;
    });
  };

  // Filtered collections to display
  const displayedCollections = useMemo(() => {
    return collections.filter((c) => {
      // Non-admins only see published collections
      if (!isAdmin && c.published === false) return false;

      // Selected tab filter
      if (selectedColId !== 'all' && c.id !== selectedColId) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (c.title || '').toLowerCase().includes(q);
        const matchesDesc = (c.desc || '').toLowerCase().includes(q);
        const matchesCat = (c.category || c.cat || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCat;
      }

      return true;
    });
  }, [collections, isAdmin, selectedColId, searchQuery]);

  // Admin Actions
  const handleOpenCreate = () => {
    setModalMode('create');
    setEditingId(null);
    setFormTitle('');
    setFormCategory(availableCategories[0] || 'Crochet');
    setFormCustomCategory('');
    setFormDesc('');
    setFormPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col: CollectionItem) => {
    setModalMode('edit');
    setEditingId(col.id || null);
    setFormTitle(col.title || '');
    const currentCat = col.category || col.cat || '';
    if (availableCategories.includes(currentCat)) {
      setFormCategory(currentCat);
      setFormCustomCategory('');
    } else {
      setFormCategory('Other');
      setFormCustomCategory(currentCat);
    }
    setFormDesc(col.desc || '');
    setFormPublished(col.published !== false);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Collection title is required.', 'alert-circle');
      return;
    }

    const finalCategory = formCategory === 'Other' ? formCustomCategory.trim() || 'Handicrafts' : formCategory;

    setIsSaving(true);
    try {
      const payload: Partial<CollectionItem> = {
        id: modalMode === 'edit' && editingId ? editingId : undefined,
        title: formTitle.trim(),
        cat: finalCategory,
        category: finalCategory,
        desc: formDesc.trim() || 'Curated collection of authentic artisan handcrafted works.',
        published: formPublished,
      };

      const result = await saveCollection(payload, currentUser?.email);

      if (result.success && result.collections) {
        setCollections(result.collections);
        setIsModalOpen(false);
        showToast(
          modalMode === 'create' ? 'Collection created and saved to database!' : 'Collection updated!',
          'sparkles'
        );
      } else {
        showToast(result.error || 'Failed to save collection.', 'alert-circle');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving collection.', 'alert-circle');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (col: CollectionItem) => {
    if (!col.id) return;
    const confirm = window.confirm(`Permanently remove collection "${col.title}"?`);
    if (!confirm) return;

    try {
      const result = await deleteCollection(col.id, currentUser?.email);
      if (result.success && result.collections) {
        setCollections(result.collections);
        showToast(`Collection "${col.title}" deleted.`, 'check-circle');
      } else {
        showToast(result.error || 'Failed to delete collection.', 'alert-circle');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting collection.', 'alert-circle');
    }
  };

  const handleTogglePublish = async (col: CollectionItem) => {
    if (!col.id) return;
    const nextState = !col.published;

    try {
      const result = await togglePublishCollection(col.id, nextState, currentUser?.email);
      if (result.success && result.collections) {
        setCollections(result.collections);
        showToast(
          nextState ? `"${col.title}" published to live storefront!` : `"${col.title}" moved to draft status.`,
          'sparkles'
        );
      } else {
        showToast(result.error || 'Failed to update publish status.', 'alert-circle');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating status.', 'alert-circle');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <span>Curated Editions</span>
          <span aria-hidden="true">·</span>
          <span>Authentic Supabase Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E293B] tracking-tight">
          Handcrafted Collections
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Thematic craft sets sculpted, hooked, and kiln-fired by independent artisan creators. Every product card links directly to the verified maker's work.
        </p>
      </div>

      {/* Admin Action Bar (Only visible to Master Admin & Admins) */}
      {isAdmin && (
        <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C85A32]" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Admin Mode: Live Collections Control
              </p>
              <p className="text-xs text-amber-800">
                Create, edit, publish, or remove collections. Changes persist permanently to the Supabase database.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreate}
            className="btn-terracotta text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
        {/* Collection Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedColId('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer ${
              selectedColId === 'all'
                ? 'bg-[#1E293B] text-white shadow-xs'
                : 'bg-white border border-[#e7e0d8] text-slate-700 hover:border-slate-400'
            }`}
          >
            All Collections ({collections.length})
          </button>
          {collections.map((c) => (
            <button
              key={c.id || c.title}
              onClick={() => setSelectedColId(c.id || 'all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                selectedColId === c.id
                  ? 'bg-[#1E293B] text-white shadow-xs'
                  : 'bg-white border border-[#e7e0d8] text-slate-700 hover:border-slate-400'
              }`}
            >
              <span>{c.title}</span>
              {isAdmin && c.published === false && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                  Draft
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search input within collections */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within collections..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#e7e0d8] text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-[#C85A32]"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-8 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="p-8 rounded-3xl bg-slate-100 border border-slate-200 space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded-lg"></div>
              <div className="h-4 w-96 bg-slate-200 rounded-lg"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-64 bg-slate-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collections List */}
      {!isLoading && displayedCollections.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#e7e0d8] p-8 space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Collections Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No collections matching "${searchQuery}". Clear your search or explore the complete marketplace.`
              : 'There are currently no collections published. Check back soon!'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedColId('all');
              }}
              className="text-xs font-bold text-[#C85A32] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Render Each Collection Section */}
      {!isLoading &&
        displayedCollections.map((col, index) => {
          const colProducts = getProductsForCollection(col);
          const isDraft = col.published === false;

          return (
            <section
              key={col.id || col.title || index}
              className={`rounded-3xl p-6 sm:p-8 lg:p-10 border transition shadow-xs ${
                isDraft
                  ? 'bg-amber-50/40 border-dashed border-amber-300'
                  : 'bg-white border-[#e7e0d8]'
              }`}
            >
              {/* Collection Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#e7e0d8]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#C85A32] uppercase tracking-wider">
                      {col.n || String(index + 1).padStart(2, '0')} · {col.cat || col.category || 'Curated'}
                    </span>
                    {isDraft && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                        Draft (Hidden from Public)
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B]">
                    {col.title}
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
                    {col.desc}
                  </p>
                </div>

                {/* Right Side: Admin Controls & Shop Category Button */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                      <button
                        onClick={() => handleTogglePublish(col)}
                        title={col.published ? 'Unpublish (make draft)' : 'Publish to live storefront'}
                        className="p-2 rounded-lg text-slate-700 hover:bg-white hover:text-slate-900 transition cursor-pointer"
                      >
                        {col.published ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(col)}
                        title="Edit collection"
                        className="p-2 rounded-lg text-slate-700 hover:bg-white hover:text-slate-900 transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 text-slate-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(col)}
                        title="Delete collection"
                        className="p-2 rounded-lg text-red-600 hover:bg-white hover:text-red-700 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (col.category || col.cat) {
                        setActiveCategory(col.category || col.cat || 'All');
                      }
                      navigate('/marketplace');
                    }}
                    className="btn-terracotta text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <span>Browse in Marketplace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Actual Products Grid for this Collection */}
              <div className="mt-8">
                {colProducts.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-[#FAF9F6] border border-dashed border-[#e7e0d8] space-y-3">
                    <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">
                      No products currently linked to this collection
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Artisans are currently crafting the next batch for this category ({col.cat || col.category}). Explore available pieces in our main catalog.
                    </p>
                    <Link
                      to="/marketplace"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#C85A32] hover:underline pt-1"
                    >
                      <span>Explore all available marketplace crafts</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {colProducts.map((product) => {
                      const slugOrId = product.slug || getProductSlug(product) || product.id;
                      const productUrl = `/product/${slugOrId}`;

                      return (
                        <div
                          key={product.id}
                          className="group bg-white rounded-2xl border border-[#e7e0d8] overflow-hidden hover:shadow-md hover:border-[#C85A32]/40 transition flex flex-col justify-between"
                        >
                          {/* Image Container with Backdrop */}
                          <Link to={productUrl} className="block relative aspect-4/3 overflow-hidden bg-neutral-900/5 select-none">
                            {/* Blurred backdrop for zero whitespace and no cropping */}
                            <img
                              src={product.image}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover scale-125 blur-xl opacity-40 select-none pointer-events-none"
                              loading="lazy"
                            />
                            {/* Foreground actual product photograph */}
                            <img
                              src={product.image}
                              alt={product.title}
                              className="relative z-10 w-full h-full object-contain p-2 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            {product.stock && (
                              <div className="absolute top-2.5 left-2.5 z-20">
                                <span className="bg-white/95 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200">
                                  {product.stock.includes('Stock') ? 'Made on Demand' : product.stock}
                                </span>
                              </div>
                            )}
                          </Link>

                          {/* Product Details */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                <span className="font-semibold">{product.category}</span>
                                <span>by {product.maker}</span>
                              </div>
                              <Link
                                to={productUrl}
                                className="block font-bold text-sm text-[#1E293B] group-hover:text-[#C85A32] transition line-clamp-1"
                              >
                                {product.title}
                              </Link>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                {product.school || 'Independent Studio Guild'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#e7e0d8]">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Selling Price</span>
                                <span className="text-base font-black text-[#1E293B] tabular-nums">
                                  ₹{product.price}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    addToCart(product.id);
                                    showToast(`Added "${product.title}" to cart!`, 'shopping-bag');
                                  }}
                                  className="p-2.5 bg-[#FAF9F6] border border-[#e7e0d8] hover:border-[#C85A32] text-slate-700 hover:text-[#C85A32] rounded-xl transition cursor-pointer"
                                  title="Add to shopping bag"
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                </button>
                                <Link
                                  to={productUrl}
                                  className="text-xs font-bold text-white bg-[#C85A32] hover:bg-[#b04a25] px-3 py-2 rounded-xl transition whitespace-nowrap"
                                >
                                  View Piece
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          );
        })}

      {/* Sustainable Craft Pledge Footer Strip */}
      <section className="bg-[#FAF9F6] rounded-3xl p-8 border border-[#e7e0d8] text-center space-y-2">
        <h3 className="text-base font-black text-[#1E293B]">
          100% Genuine Studio Creations
        </h3>
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
          ArtisansKart does not list factory-stamped goods. Every collection represents verified independent craftspeople with eco-friendly protective packaging and verified parcel transit.
        </p>
      </section>

      {/* Admin Modal: Create / Edit Collection */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#e7e0d8] space-y-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#e7e0d8]">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {modalMode === 'create' ? 'Create New Collection' : 'Edit Collection'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved permanently in Supabase database and displayed on this Collections page.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Collection Title <span className="text-[#C85A32]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Terracotta &amp; Studio Pottery"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Category Mapping <span className="text-[#C85A32]">*</span>
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:border-[#C85A32] focus:outline-hidden"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">Other (Custom Category Name)</option>
                </select>

                {formCategory === 'Other' && (
                  <input
                    type="text"
                    required
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="Enter custom category name (e.g. Macramé, Metal Art)"
                    className="w-full mt-2 px-3.5 py-2.5 rounded-xl border border-amber-300 text-sm focus:border-[#C85A32] focus:outline-hidden"
                  />
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Products in the Supabase catalog with this category will automatically populate this collection.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Artisan Narrative &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the craft techniques, materials, and artisan traditions represented in this set..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-[#C85A32] focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="formPublished"
                  checked={formPublished}
                  onChange={(e) => setFormPublished(e.target.checked)}
                  className="w-4 h-4 text-[#C85A32] rounded focus:ring-[#C85A32]"
                />
                <label htmlFor="formPublished" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Publish Immediately (Visible to customers on live storefront)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e7e0d8]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-terracotta text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Collection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
