import { Product, Order, CollectionItem, HowItWorksItem, HeroContent, AnimationSettings } from './types';

export const CATEGORIES = [
  "All",
  "Crochet",
  "Clay Crafts",
  "Hand-painted Cards",
  "Paintings",
  "Accessories",
  "Keychains",
  "Other Crafts"
];

export const PRODUCTS: Product[] = [];

// Clean empty orders array — zero fabricated demo orders
export const INITIAL_ORDERS: Order[] = [];

export const HOW_IT_WORKS: HowItWorksItem[] = [
  { n: "01", t: "Discover Creators", d: "Explore handcrafted crochet, ceramics, paintings, jewelry and gift items crafted with heart by independent creators." },
  { n: "02", t: "Direct Support", d: "Every purchase directly supports independent makers, homemakers, crochet artists, and creative craftspeople." },
  { n: "03", t: "Made with Care", d: "Order on-demand pieces created by genuine hands, tracked transparently from the maker's workshop to your door." },
  { n: "04", t: "Authentic Quality", d: "Each piece is carefully inspected and packaged securely in eco-friendly protective materials." },
  { n: "05", t: "Reliable Delivery", d: "Shipped across India through verified postal and courier logistics with real-time status updates." }
];

export const COLLECTIONS: CollectionItem[] = [
  {
    n: "01",
    cat: "Yarn & Fiber",
    title: "Crochet Creations Collection",
    desc: "Forever bouquets, amigurumi plushies, granny square bags and home accents hand-hooked with love.",
    img1: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=80",
    img2: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
    img3: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    category: "Crochet"
  },
  {
    n: "02",
    cat: "Pottery & Sculpture",
    title: "Clay Crafts Collection",
    desc: "Hand-thrown vases, festive earthen diyas, and sculpted planters shaped by artisan hands.",
    img1: "https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img2: "https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img3: "https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    category: "Clay Crafts"
  },
  {
    n: "03",
    cat: "Paper & Paint",
    title: "Hand-painted Cards Collection",
    desc: "Watercolor botanicals and custom greeting cards, painted one mindful brushstroke at a time.",
    img1: "https://images.pexels.com/photos/9534281/pexels-photo-9534281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img2: "https://images.pexels.com/photos/10455739/pexels-photo-10455739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img3: "https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    category: "Hand-painted Cards"
  },
  {
    n: "04",
    cat: "Wearables & Gifts",
    title: "Accessories & Keychains Collection",
    desc: "Intricately woven beadwork, wire-wrapped pendants, and macrame wristlets crafted for daily joy.",
    img1: "https://images.pexels.com/photos/1212048/pexels-photo-1212048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img2: "https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img3: "https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    category: "Accessories"
  }
];

export const ABOUT_TEXT = "ArtisansKart.in is a conscious marketplace built for independent creators, homemakers, and skilled artisans who craft with their hands and hearts — crochet artists, ceramicists, painters, and independent makers. Every piece is handcrafted with care. Made by creators. Chosen by you.";

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badgeText: "Handcrafted by Independent Artisans & Creators",
  headlineLine1: "Made by Creators.",
  headlineLine2: "Chosen by You.",
  headlineLine3: "",
  subhead: "Discover one-of-a-kind crochet pieces, pottery, hand-painted art, jewelry & decorative crafts made with heart by independent creators, homemakers, and skilled artisans.",
  mainImage: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=80",
  leftImage: "https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  rightImage: "https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mainTag: "Crochet Creations",
  leftTag: "Fine Art",
  rightTag: "Silver & Wire",
};

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  marqueeSpeed: 'normal',
  enableMagnet: true,
  enableFloatingBadges: true,
  enableScrollReveal: true,
};
