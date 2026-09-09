import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Order,
  CartItem,
  ToastItem,
  HeroContent,
  AnimationSettings,
  UserAccount,
  UserRole,
  UserStatus,
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
  updateUserStatus as updateSupabaseUserStatus,
  updateUserRoleAndStatus as updateSupabaseUserRoleAndStatus,
  ensureUserProfile,
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
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  userStatus: UserStatus;
  setUserStatus: (status: UserStatus) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  usersList: UserAccount[];
  grantUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  grantUserStatus: (userId: string, newStatus: UserStatus) => Promise<void>;
  promoteUserRole: (userId: string, newRole: UserRole, newStatus?: UserStatus) => Promise<void>;
  addNewUserAccount: (email: string, name: string, role: UserRole, status?: UserStatus, school?: string) => Promise<void>;
  removeUserAccount: (userId: string) => Promise<void>;
  loginWithGoogleAccount: (email: string, name?: string, avatarUrl?: string) => Promise<UserAccount>;
  logoutUser: () => void;
  requestElevatedRole: (role: 'admin' | 'maker', note?: string) => Promise<void>;

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

export const MASTER_ADMIN_EMAIL = 'ssumollah@gmail.com';

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr_master_admin_ssumollah',
    email: 'ssumollah@gmail.com',
    name: 'Master Admin (ssumollah)',
    role: 'admin',
    status: 'approved',
    school: 'ArtisansKart Platform Headquarters',
  },
  {
    id: 'usr_admin_default',
    email: 'admin@artisanskart.in',
    name: 'Platform Administrator',
    role: 'admin',
    status: 'approved',
    school: 'Operations HQ',
  },
  {
    id: 'usr_maker_sakib',
    email: 'sakib.maker@delhischool.edu',
    name: 'Sakib Ansari',
    role: 'maker',
    status: 'approved',
    school: 'DPS RK Puram (Class 10)',
    bio: 'Sculpting terracotta planters & traditional wheel pottery.',
  },
  {
    id: 'usr_maker_meera',
    email: 'meera.art@punecampus.in',
    name: 'Meera Nair',
    role: 'maker',
    status: 'approved',
    school: 'Bishop Cotton Pune (Class 12)',
    bio: 'Watercolor greeting cards and botanical paintings.',
  },
  {
    id: 'usr_maker_arjun',
    email: 'arjun.crafts@jaipur.edu',
    name: 'Arjun Verma',
    role: 'maker',
    status: 'approved',
    school: 'Maharaja Sawai Man Jaipur (Class 9)',
    bio: 'Handcrafted macrame bookmarks & keychains.',
  },
  {
    id: 'usr_cust_patron',
    email: 'visitor@artisanskart.in',
    name: 'Customer Shopper',
    role: 'customer',
    status: 'approved',
    school: 'Art Patron & Supporter',
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

  const [userRole, setUserRoleState] = useState<UserRole>(
    currentUser?.role || 'admin'
  );

  const [userStatus, setUserStatusState] = useState<UserStatus>(
    currentUser?.status || 'approved'
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
  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const setUserStatus = (status: UserStatus) => {
    setUserStatusState(status);
    if (currentUser) {
      const updated = { ...currentUser, status };
      setCurrentUser(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  // Master Admin grants/elevates user permissions
  const grantUserRole = async (userId: string, newRole: UserRole) => {
    setUsersList((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
      try {
        localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (currentUser && currentUser.id === userId) {
      setUserRole(newRole);
    }

    try {
      await updateSupabaseUserRole(userId, newRole);
    } catch (err) {
      console.warn('Supabase profile role update error:', err);
    }

    showToast(`Role updated! User is now ${newRole.toUpperCase()}.`, 'shield-check');
  };

  // Master Admin updates approval status
  const grantUserStatus = async (userId: string, newStatus: UserStatus) => {
    setUsersList((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
      try {
        localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (currentUser && currentUser.id === userId) {
      setUserStatus(newStatus);
    }

    try {
      await updateSupabaseUserStatus(userId, newStatus);
    } catch (err) {
      console.warn('Supabase status update error:', err);
    }

    showToast(`Account status set to ${newStatus.toUpperCase()}`, 'check-circle-2');
  };

  // Combined role and status update
  const promoteUserRole = async (userId: string, newRole: UserRole, newStatus: UserStatus = 'approved') => {
    setUsersList((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, role: newRole, status: newStatus } : u));
      try {
        localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    if (currentUser && currentUser.id === userId) {
      setUserRole(newRole);
      setUserStatus(newStatus);
    }

    try {
      await updateSupabaseUserRoleAndStatus(userId, newRole, newStatus);
    } catch (err) {
      console.warn('Supabase role/status update error:', err);
    }

    showToast(`Updated to ${newRole.toUpperCase()} (${newStatus})!`, 'sparkles');
  };

  // Add new authorized email / user account
  const addNewUserAccount = async (
    email: string,
    name: string,
    role: UserRole,
    status: UserStatus = 'approved',
    school?: string
  ) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existingIndex = usersList.findIndex((u) => u.email.toLowerCase() === trimmedEmail);

    const newUser: UserAccount = {
      id: `usr_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: trimmedEmail,
      name: name.trim() || trimmedEmail.split('@')[0],
      role: role,
      status: status,
      school: school?.trim() || (role === 'admin' ? 'HQ Administrator' : role === 'maker' ? 'Campus Arts Club' : 'Customer Patron'),
    };

    let nextList: UserAccount[];
    if (existingIndex >= 0) {
      nextList = usersList.map((u, i) => (i === existingIndex ? { ...u, role, status, name: newUser.name, school: newUser.school } : u));
    } else {
      nextList = [newUser, ...usersList];
    }

    setUsersList(nextList);
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(nextList));
    } catch (e) {}

    // If active user is the one being updated
    if (currentUser && currentUser.email.toLowerCase() === trimmedEmail) {
      setUserRole(role);
      setUserStatus(status);
    }

    showToast(`Added ${trimmedEmail} with ${role.toUpperCase()} (${status}) access!`, 'check-circle-2');
  };

  // Remove / revoke user account
  const removeUserAccount = async (userId: string) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (targetUser?.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      showToast('Cannot delete the Master Admin account!', 'alert-circle');
      return;
    }

    const nextList = usersList.filter((u) => u.id !== userId);
    setUsersList(nextList);
    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(nextList));
    } catch (e) {}

    showToast('User removed successfully.', 'trash-2');
  };

  // Dedicated Google Account Authentication Handler
  const loginWithGoogleAccount = async (
    email: string,
    name?: string,
    avatarUrl?: string
  ): Promise<UserAccount> => {
    const cleanEmail = email.trim().toLowerCase();
    const isMaster = cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase();

    // Check if user already exists in authorized users list
    const matchedUser = usersList.find((u) => u.email.toLowerCase() === cleanEmail);

    let role: UserRole = 'customer';
    let status: UserStatus = 'approved';
    let userName = name?.trim() || cleanEmail.split('@')[0];
    let school = 'Customer Patron';

    if (isMaster) {
      role = 'admin';
      status = 'approved';
      userName = name?.trim() || 'Master Admin (ssumollah)';
      school = 'ArtisansKart Platform Headquarters';
    } else if (matchedUser) {
      role = matchedUser.role;
      status = matchedUser.status || 'approved';
      userName = name?.trim() || matchedUser.name;
      school = matchedUser.school || school;
    }

    const userAccount: UserAccount = {
      id: matchedUser?.id || `usr_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: userName,
      role,
      status,
      school,
      avatarUrl: avatarUrl,
    };

    // If not already in users list, save them
    if (!matchedUser) {
      const updatedUsers = [userAccount, ...usersList];
      setUsersList(updatedUsers);
      try {
        localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(updatedUsers));
      } catch (e) {}
    }

    setCurrentUser(userAccount);
    setUserRoleState(role);
    setUserStatusState(status);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userAccount));
    } catch (e) {}

    if (isMaster) {
      showToast('Signed in with Google as Master Admin (ssumollah@gmail.com)!', 'shield-check');
    } else if (role === 'maker') {
      showToast(`Welcome back, Student Maker ${userName}!`, 'sparkles');
    } else {
      showToast(`Signed in with Google as ${userName}`, 'check-circle-2');
    }

    return userAccount;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setUserRoleState('customer');
    try {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    } catch (e) {}
    showToast('Signed out successfully.', 'log-out');
  };

  // Submit request for Maker or Admin role (requires Master Admin ssumollah@gmail.com approval)
  const requestElevatedRole = async (targetRole: 'admin' | 'maker', note?: string) => {
    if (!currentUser) {
      showToast('Please sign in with your Google account first.', 'alert-circle');
      return;
    }

    if (currentUser.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
      showToast('You are already the Master Administrator!', 'shield-check');
      return;
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      role: targetRole,
      status: 'pending',
      bio: note || currentUser.bio || `Requested ${targetRole} role`,
    };

    const exists = usersList.some((u) => u.email.toLowerCase() === currentUser.email.toLowerCase());
    let nextList: UserAccount[];
    if (exists) {
      nextList = usersList.map((u) =>
        u.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...u, role: targetRole, status: 'pending' as UserStatus, bio: note || u.bio }
          : u
      );
    } else {
      nextList = [updatedUser, ...usersList];
    }

    setUsersList(nextList);
    setCurrentUser(updatedUser);
    setUserRoleState(targetRole);
    setUserStatusState('pending');

    try {
      localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(nextList));
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser));
    } catch (e) {}

    showToast(
      `Request submitted for ${targetRole.toUpperCase()}! Master Admin (ssumollah@gmail.com) must approve before access is granted.`,
      'sparkles'
    );
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

  // On mount, pull live CMS settings from Supabase and listen for Supabase auth events
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

    // Supabase Auth State Change Listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();

        // Check if there is an existing profile or granted role
        const profile = await getProfile(session.user.id);
        const resolvedRole: 'admin' | 'maker' | 'customer' = isMaster
          ? 'admin'
          : profile?.role || (email.includes('admin') ? 'admin' : 'customer');

        const userAccount: UserAccount = {
          id: session.user.id,
          email: email,
          name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            (isMaster ? 'Master Admin' : email.split('@')[0]),
          role: resolvedRole,
          school: profile?.school || (isMaster ? 'Platform Headquarters' : 'Artisans Patron'),
        };

        setCurrentUser(userAccount);
        setUserRoleState(resolvedRole);
        try {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userAccount));
        } catch (e) {}

        // Add to users list if not present
        setUsersList((prev) => {
          if (!prev.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
            const next = [userAccount, ...prev];
            try {
              localStorage.setItem(LOCAL_STORAGE_USERS_LIST_KEY, JSON.stringify(next));
            } catch (e) {}
            return next;
          }
          return prev.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...userAccount } : u));
        });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
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
        userStatus,
        setUserStatus,
        isAuthModalOpen,
        setIsAuthModalOpen,
        usersList,
        grantUserRole,
        grantUserStatus,
        promoteUserRole,
        addNewUserAccount,
        removeUserAccount,
        loginWithGoogleAccount,
        logoutUser,
        requestElevatedRole,

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
