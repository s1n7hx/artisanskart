import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  CartItem,
  ToastItem,
  HeroContent,
  AnimationSettings,
  UserAccount,
} from '../types';
import { PRODUCTS, INITIAL_ORDERS, DEFAULT_HERO_CONTENT, DEFAULT_ANIMATION_SETTINGS } from '../data';
import {
  WordPressConfig,
  DEFAULT_WP_CONFIG,
  fetchWordPressContent,
} from '../services/wordpress';
import {
  supabase,
  fetchHeroCmsContent,
  saveHeroCmsContent,
  fetchAllProfiles,
  updateUserRole as updateSupabaseUserRole,
  getProfile,
} from '../services/supabase';

interface AppContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  cartCount: number;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  addToCart: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  quickViewProduct: Product | null;
  setQuickViewId: (id: number | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isMakerSignupOpen: boolean;
  setIsMakerSignupOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  toasts: ToastItem[];
  showToast: (message: string, icon?: string) => void;
  acceptOrder: (id: number) => void;
  markReady: (id: number) => void;
  markCompleted: (id: number) => void;
  confirmCheckout: () => void;

  // Authentication & RBAC
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  userRole: 'admin' | 'maker' | 'customer';
  setUserRole: (role: 'admin' | 'maker' | 'customer') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  usersList: UserAccount[];
  grantUserRole: (userId: string, newRole: 'admin' | 'maker' | 'customer') => Promise<void>;

  // Hero & Animation Customization
  heroContent: HeroContent;
  updateHeroContent: (partial: Partial<HeroContent>) => void;
  resetHeroToDefault: () => void;
  animationSettings: AnimationSettings;
  updateAnimationSettings: (partial: Partial<AnimationSettings>) => void;
  resetAnimationToDefault: () => void;

  // WordPress & Live Content Management
  wpConfig: WordPressConfig;
  updateWpConfig: (partial: Partial<WordPressConfig>) => void;
  syncWithWordPress: (overrideUrl?: string) => Promise<boolean>;
  isWpModalOpen: boolean;
  setIsWpModalOpen: (open: boolean) => void;
  selectedProductIdForEdit: number | null;
  openEditorForProduct: (id: number) => void;
  updateProduct: (updated: Product) => void;
  addNewProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  resetProductsToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS_KEY = 'artisanskart_custom_products_v1';
const LOCAL_STORAGE_HERO_KEY = 'artisanskart_hero_content_v1';
const LOCAL_STORAGE_ANIMATION_KEY = 'artisanskart_animation_settings_v1';
const LOCAL_STORAGE_USER_KEY = 'artisanskart_current_user_v1';
const LOCAL_STORAGE_USERS_LIST_KEY = 'artisanskart_all_users_v1';

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_admin_1',
    email: 'admin@artisanskart.in',
    name: 'Master Admin (You)',
    role: 'admin',
    school: 'Platform Headquarters',
  },
  {
    id: 'usr_maker_sakib',
    email: 'sakib.maker@delhischool.edu',
    name: 'Sakib Ansari',
    role: 'maker',
    school: 'DPS RK Puram (Class 10)',
    bio: 'Sculpting terracotta planters & traditional wheel pottery.',
  },
  {
    id: 'usr_maker_meera',
    email: 'meera.art@punecampus.in',
    name: 'Meera Nair',
    role: 'maker',
    school: 'Bishop Cotton Pune (Class 12)',
    bio: 'Watercolor greeting cards and botanical paintings.',
  },
  {
    id: 'usr_maker_arjun',
    email: 'arjun.crafts@jaipur.edu',
    name: 'Arjun Verma',
    role: 'maker',
    school: 'Maharaja Sawai Man Jaipur (Class 9)',
    bio: 'Handcrafted macrame bookmarks & keychains.',
  },
  {
    id: 'usr_cust_priya',
    email: 'priya.customer@gmail.com',
    name: 'Priya Sharma',
    role: 'customer',
    school: 'Customer Patron',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load user profile from localStorage or default to Master Admin for easy management
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USERS[0]; // Default to Master Admin
  });

  const [userRole, setUserRoleState] = useState<'admin' | 'maker' | 'customer'>(
    currentUser?.role || 'admin'
  );

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USERS_LIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_USERS;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync role state when current user changes
  const setUserRole = (role: 'admin' | 'maker' | 'customer') => {
    setUserRoleState(role);
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  // Master Admin grants/elevates user permissions
  const grantUserRole = async (userId: string, newRole: 'admin' | 'maker' | 'customer') => {
    setUsersList((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
      try {
        localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // If active user is the one being updated
    if (currentUser && currentUser.id === userId) {
      setUserRole(newRole);
    }

    try {
      await updateSupabaseUserRole(userId, newRole);
    } catch (err) {
      console.warn('Supabase profile role update error:', err);
    }

    showToast(`Permission updated! User is now ${newRole.toUpperCase()}.`, 'shield-check');
  };

  // Load products from localStorage or default PRODUCTS
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: Product) => p.id));
          const missingDefaults = PRODUCTS.filter((p) => !existingIds.has(p.id));
          return [...parsed, ...missingDefaults];
        }
      }
    } catch (e) {
      console.warn('Failed to load cached products', e);
    }
    return PRODUCTS;
  });

  const [heroContent, setHeroContent] = useState<HeroContent>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HERO_KEY);
      if (saved) {
        return { ...DEFAULT_HERO_CONTENT, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_HERO_CONTENT;
  });

  // On mount, pull live CMS settings from Supabase if available
  useEffect(() => {
    async function initSupabaseData() {
      try {
        const remoteHero = await fetchHeroCmsContent();
        if (remoteHero) {
          setHeroContent(remoteHero);
        }
        const remoteProfiles = await fetchAllProfiles();
        if (remoteProfiles && remoteProfiles.length > 0) {
          setUsersList((prev) => {
            const remoteMap = new Map(remoteProfiles.map((p) => [p.id, p]));
            const merged = prev.map((u) => {
              const r = remoteMap.get(u.id);
              return r ? { ...u, role: r.role, name: r.full_name || u.name } : u;
            });
            // Add new remote profiles
            remoteProfiles.forEach((rp) => {
              if (!merged.some((m) => m.id === rp.id)) {
                merged.push({
                  id: rp.id,
                  email: rp.email,
                  name: rp.full_name || 'Student Creator',
                  role: rp.role,
                  school: rp.school || 'Campus Arts Club',
                });
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.warn('Supabase background fetch notice:', err);
      }
    }
    initSupabaseData();
  }, []);

  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ANIMATION_KEY);
      if (saved) {
        return { ...DEFAULT_ANIMATION_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {}
    return DEFAULT_ANIMATION_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMakerSignupOpen, setIsMakerSignupOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [isWpModalOpen, setIsWpModalOpen] = useState<boolean>(false);
  const [selectedProductIdForEdit, setSelectedProductIdForEdit] = useState<number | null>(null);
  const [wpConfig, setWpConfig] = useState<WordPressConfig>(DEFAULT_WP_CONFIG);

  const showToast = (message: string, icon: string = 'check-circle-2') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const updateHeroContent = (partial: Partial<HeroContent>) => {
    setHeroContent((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(LOCAL_STORAGE_HERO_KEY, JSON.stringify(next));
      } catch (e) {}
      // Sync to Supabase in background
      saveHeroCmsContent(next).catch((err) =>
        console.warn('Supabase CMS sync warning:', err)
      );
      return next;
    });
    showToast('Live storefront headlines & photography saved!', 'sparkles');
  };

  const resetHeroToDefault = () => {
    setHeroContent(DEFAULT_HERO_CONTENT);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HERO_KEY);
    } catch (e) {}
    saveHeroCmsContent(DEFAULT_HERO_CONTENT).catch(() => {});
    showToast('Hero photos reset to default', 'rotate-ccw');
  };

  const updateAnimationSettings = (partial: Partial<AnimationSettings>) => {
    setAnimationSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(LOCAL_STORAGE_ANIMATION_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const resetAnimationToDefault = () => {
    setAnimationSettings(DEFAULT_ANIMATION_SETTINGS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_ANIMATION_KEY);
    } catch (e) {}
  };

  const updateWpConfig = (partial: Partial<WordPressConfig>) => {
    setWpConfig((prev) => ({ ...prev, ...partial }));
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast(`Updated product "${updated.title}"`, 'edit-2');
  };

  const addNewProduct = (newProd: Product) => {
    setProducts((prev) => {
      const next = [newProd, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast(`Published "${newProd.title}" live!`, 'sparkles');
  };

  const deleteProduct = (id: number) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    showToast('Product removed from marketplace', 'trash-2');
  };

  const resetProductsToDefault = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY);
    } catch (e) {}
  };

  const openEditorForProduct = (id: number) => {
    setSelectedProductIdForEdit(id);
    setIsWpModalOpen(true);
  };

  const syncWithWordPress = async (overrideUrl?: string): Promise<boolean> => {
    const activeUrl = overrideUrl || wpConfig.url;
    if (!activeUrl) return false;
    updateWpConfig({ status: 'syncing' });
    const result = await fetchWordPressContent({ ...wpConfig, url: activeUrl });
    if (result.success && result.products.length > 0) {
      setProducts((prev) => {
        const customItems = prev.filter((p) => p.source === 'custom');
        return [...result.products, ...customItems];
      });
      updateWpConfig({ status: 'connected' });
      return true;
    }
    updateWpConfig({ status: 'error' });
    return false;
  };

  const addToCart = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id, qty: 1 }];
    });
    const prod = products.find((p) => p.id === id);
    showToast(`Added ${prod?.title || 'item'} to cart!`, 'shopping-bag');
  };

  const changeQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const acceptOrder = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'in_production' } : o))
    );
    showToast('Order accepted — student maker crafting started!', 'hammer');
  };

  const markReady = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'ready' } : o))
    );
    showToast('Marked ready for campus dispatch!', 'package');
  };

  const markCompleted = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'completed' } : o))
    );
    showToast('Order completed. 65% Student Fund updated!', 'wallet');
  };

  const confirmCheckout = () => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCart([]);
    showToast('Order placed! Your student maker will begin crafting.', 'party-popper');
  };

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const quickViewProduct = products.find((p) => p.id === quickViewId) || null;

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        cart,
        cartCount,
        activeCategory,
        setActiveCategory,
        searchTerm,
        setSearchTerm,
        addToCart,
        changeQty,
        removeFromCart,
        quickViewProduct,
        setQuickViewId,
        isCartOpen,
        setIsCartOpen,
        isMakerSignupOpen,
        setIsMakerSignupOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toasts,
        showToast,
        acceptOrder,
        markReady,
        markCompleted,
        confirmCheckout,

        // Authentication & RBAC
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        usersList,
        grantUserRole,

        // Hero & Animation Customization
        heroContent,
        updateHeroContent,
        resetHeroToDefault,
        animationSettings,
        updateAnimationSettings,
        resetAnimationToDefault,

        // WordPress & Live Content Management
        wpConfig,
        updateWpConfig,
        syncWithWordPress,
        isWpModalOpen,
        setIsWpModalOpen,
        selectedProductIdForEdit,
        openEditorForProduct,
        updateProduct,
        addNewProduct,
        deleteProduct,
        resetProductsToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
