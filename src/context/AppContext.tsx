import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, CartItem, ToastItem, HeroContent, AnimationSettings } from '../types';
import { PRODUCTS, INITIAL_ORDERS, DEFAULT_HERO_CONTENT, DEFAULT_ANIMATION_SETTINGS } from '../data';
import {
  WordPressConfig,
  DEFAULT_WP_CONFIG,
  fetchWordPressContent,
} from '../services/wordpress';

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
  resetProductsToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PRODUCTS_KEY = 'artisanskart_custom_products_v1';
const LOCAL_STORAGE_WP_CONFIG_KEY = 'artisanskart_wp_config_v1';
const LOCAL_STORAGE_HERO_KEY = 'artisanskart_hero_content_v1';
const LOCAL_STORAGE_ANIMATION_KEY = 'artisanskart_animation_settings_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products from localStorage if user customized descriptions, otherwise default PRODUCTS
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
    } catch (e) {
      console.warn('Failed to load cached hero content', e);
    }
    return DEFAULT_HERO_CONTENT;
  });

  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ANIMATION_KEY);
      if (saved) {
        return { ...DEFAULT_ANIMATION_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load cached animation settings', e);
    }
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

  // WordPress Hub & Live Editor state
  const [isWpModalOpen, setIsWpModalOpen] = useState<boolean>(false);
  const [selectedProductIdForEdit, setSelectedProductIdForEdit] = useState<number | null>(null);

  const [wpConfig, setWpConfig] = useState<WordPressConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WP_CONFIG_KEY);
      if (saved) {
        return { ...DEFAULT_WP_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load WordPress config', e);
    }
    return DEFAULT_WP_CONFIG;
  });

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
      } catch (e) {
        console.warn('Failed to persist hero content', e);
      }
      return next;
    });
    showToast('Hero photo & content updated successfully!', 'sparkles');
  };

  const resetHeroToDefault = () => {
    setHeroContent(DEFAULT_HERO_CONTENT);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HERO_KEY);
    } catch (e) {
      console.warn('Failed to reset hero content', e);
    }
    showToast('Hero photos reset to default', 'rotate-ccw');
  };

  const updateAnimationSettings = (partial: Partial<AnimationSettings>) => {
    setAnimationSettings((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(LOCAL_STORAGE_ANIMATION_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist animation settings', e);
      }
      return next;
    });
    showToast('Animation settings updated!', 'sparkles');
  };

  const resetAnimationToDefault = () => {
    setAnimationSettings(DEFAULT_ANIMATION_SETTINGS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_ANIMATION_KEY);
    } catch (e) {
      console.warn('Failed to reset animation settings', e);
    }
    showToast('Animation settings reset to default', 'rotate-ccw');
  };

  const updateWpConfig = (partial: Partial<WordPressConfig>) => {
    setWpConfig((prev) => {
      const next = { ...prev, ...partial };
      try {
        localStorage.setItem(LOCAL_STORAGE_WP_CONFIG_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save WordPress config', e);
      }
      return next;
    });
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist custom product edit', e);
      }
      return next;
    });
  };

  const addNewProduct = (newProd: Product) => {
    setProducts((prev) => {
      const next = [newProd, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to persist new product', e);
      }
      return next;
    });
  };

  const resetProductsToDefault = () => {
    setProducts(PRODUCTS);
    try {
      localStorage.removeItem(LOCAL_STORAGE_PRODUCTS_KEY);
    } catch (e) {
      console.warn('Failed to reset products', e);
    }
  };

  const openEditorForProduct = (id: number) => {
    setSelectedProductIdForEdit(id);
    setIsWpModalOpen(true);
  };

  const syncWithWordPress = async (overrideUrl?: string): Promise<boolean> => {
    const activeUrl = overrideUrl || wpConfig.url;
    if (!activeUrl) {
      showToast('Please enter a valid WordPress URL first.', 'alert-circle');
      return false;
    }

    updateWpConfig({ status: 'syncing' });
    showToast('Syncing craft catalog with WordPress...', 'refresh-cw');

    const result = await fetchWordPressContent({ ...wpConfig, url: activeUrl });

    if (result.success && result.products.length > 0) {
      setProducts(result.products);
      try {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(result.products));
      } catch (e) {
        console.warn('Failed to persist synced products', e);
      }

      updateWpConfig({
        isConnected: true,
        status: 'connected',
        lastSync: new Date().toISOString(),
      });
      showToast(`Successfully synced ${result.products.length} crafts from WordPress!`, 'sparkles');
      return true;
    } else {
      updateWpConfig({
        status: 'error',
        errorMessage: result.error,
      });
      showToast(result.error || 'Failed to sync with WordPress', 'alert-circle');
      return false;
    }
  };

  // Auto-sync with WordPress on initial load if configured
  useEffect(() => {
    if (wpConfig.autoSync && wpConfig.url && wpConfig.isConnected) {
      syncWithWordPress(wpConfig.url);
    }
  }, []);

  const addToCart = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id, qty: 1 }];
    });
    const p = products.find((prod) => prod.id === id);
    if (p) {
      showToast(`${p.title} added to cart`, 'shopping-cart');
    }
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
    showToast('Order accepted — happy crafting!', 'hammer');
  };

  const markReady = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'ready' } : o))
    );
    showToast('Marked ready for dispatch!', 'package');
  };

  const markCompleted = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'completed' } : o))
    );
    showToast('Order marked completed. Earnings updated!', 'wallet');
  };

  const confirmCheckout = () => {
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCart([]);
    showToast('Order placed! Your student maker will start crafting soon.', 'party-popper');
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

