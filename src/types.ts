export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  maker: string;
  cls: string;
  school: string;
  image: string;
  stock: string;
  description?: string;
  wpId?: number | string;
  source?: 'wordpress' | 'custom' | 'default';
  updatedAt?: string;
}

export interface Order {
  id: number;
  city: string;
  product: string;
  qty: number;
  deadline: string;
  status: 'new' | 'in_production' | 'ready' | 'completed';
  amount: number;
}

export interface CartItem {
  id: number;
  qty: number;
}

export interface CollectionItem {
  n: string;
  cat: string;
  title: string;
  desc: string;
  img1: string;
  img2: string;
  img3: string;
  category: string;
}

export interface HowItWorksItem {
  n: string;
  t: string;
  d: string;
}

export interface ToastItem {
  id: number;
  message: string;
  icon: string;
}

export interface HeroContent {
  badgeText: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  subhead: string;
  mainImage: string;
  leftImage: string;
  rightImage: string;
  mainTag: string;
  leftTag: string;
  rightTag: string;
}

export interface AnimationSettings {
  marqueeSpeed: 'slow' | 'normal' | 'fast' | 'paused';
  enableMagnet: boolean;
  enableFloatingBadges: boolean;
  enableScrollReveal: boolean;
}
