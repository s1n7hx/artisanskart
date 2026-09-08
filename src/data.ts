import { Product, Order, CollectionItem, HowItWorksItem, HeroContent, AnimationSettings } from './types';

export const CATEGORIES = ["All", "Clay Crafts", "Hand-painted Cards", "Accessories", "Keychains"];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Terracotta Diya Set of 6",
    category: "Clay Crafts",
    price: 349,
    rating: 4.9,
    reviews: 18,
    maker: "Sakib Ansari",
    cls: "Class 10",
    school: "Delhi Public School, RK Puram",
    image: "https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Hand-pinched and sun-baked earthen diyas, finished with natural ochre pigments and fine floral engravings. Designed for festive rituals or serene tabletop lighting.",
    source: 'default'
  },
  {
    id: 2,
    title: "Hand-thrown Ceramic Vase",
    category: "Clay Crafts",
    price: 899,
    rating: 4.9,
    reviews: 14,
    maker: "Meera Nair",
    cls: "Class 12",
    school: "Kendriya Vidyalaya, Pune",
    image: "https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Wheel-thrown speckled stoneware vase featuring subtle ribbed texture and a soft matte sage glaze. Perfect for dried botanical stems or fresh campus flora.",
    source: 'default'
  },
  {
    id: 3,
    title: "Clay Owl Planter",
    category: "Clay Crafts",
    price: 499,
    rating: 4.8,
    reviews: 9,
    maker: "Arjun Verma",
    cls: "Class 9",
    school: "St. Xavier's School, Mumbai",
    image: "https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Charming hand-sculpted succulent planter with carved feather textures and breathable porous terracotta walls that promote healthy root aeration.",
    source: 'default'
  },
  {
    id: 4,
    title: "Rustic Clay Wind Chime",
    category: "Clay Crafts",
    price: 599,
    rating: 4.9,
    reviews: 12,
    maker: "Riya Kapoor",
    cls: "Class 11",
    school: "DAV Public School, Jaipur",
    image: "https://images.pexels.com/photos/27837210/pexels-photo-27837210.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    stock: "Made on Demand",
    description: "Terracotta bells suspended on hand-twined natural jute cords with ceramic clappers that produce warm, acoustic chime tones in gentle afternoon breezes.",
    source: 'default'
  },
  {
    id: 5,
    title: "Watercolor Birthday Card Set (5)",
    category: "Hand-painted Cards",
    price: 149,
    rating: 5.0,
    reviews: 24,
    maker: "Ananya Iyer",
    cls: "Class 11",
    school: "Vidya Mandir, Chennai",
    image: "https://images.pexels.com/photos/9534281/pexels-photo-9534281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "300 GSM cold-pressed cotton rag greeting cards painted individually with wet-on-wet watercolor botanical blooms. Includes matching handmade envelopes.",
    source: 'default'
  },
  {
    id: 6,
    title: "Abstract Art Greeting Card",
    category: "Hand-painted Cards",
    price: 129,
    rating: 4.8,
    reviews: 11,
    maker: "Priya Sharma",
    cls: "Class 10",
    school: "Delhi Public School, Noida",
    image: "https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Modernist palette knife strokes combining earth tones with gold leaf accents on heavyweight archival cardstock, blank inside for heartfelt personal notes.",
    source: 'default'
  },
  {
    id: 7,
    title: "Handprint Memory Canvas",
    category: "Hand-painted Cards",
    price: 599,
    rating: 5.0,
    reviews: 8,
    maker: "Rohan Das",
    cls: "Class 8",
    school: "Ryan International School",
    image: "https://images.pexels.com/photos/1240988/pexels-photo-1240988.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Original 8x10 inch stretched canvas painted with textured acrylic impasto layers capturing warmth, optimism, and raw youthful expression.",
    source: 'default'
  },
  {
    id: 8,
    title: "Watercolor Wildlife Card Pack",
    category: "Hand-painted Cards",
    price: 179,
    rating: 4.9,
    reviews: 15,
    maker: "Tanvi Joshi",
    cls: "Class 12",
    school: "Bishop Cotton School, Shimla",
    image: "https://images.pexels.com/photos/10455739/pexels-photo-10455739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Detailed wildlife studies depicting Himalayan songbirds and flora painted with fine sable brushes on deckled-edge khadi paper.",
    source: 'default'
  },
  {
    id: 9,
    title: "Beaded Friendship Bracelet",
    category: "Accessories",
    price: 199,
    rating: 4.8,
    reviews: 19,
    maker: "Ishita Rao",
    cls: "Class 9",
    school: "Modern School, Delhi",
    image: "https://images.pexels.com/photos/1212048/pexels-photo-1212048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Hand-threaded glass seed beads and freshwater shell chips on durable elasticized cord with adjustable macramé closure.",
    source: 'default'
  },
  {
    id: 10,
    title: "Silver Wire Wrapped Pendant",
    category: "Accessories",
    price: 349,
    rating: 4.9,
    reviews: 13,
    maker: "Kabir Mehta",
    cls: "Class 12",
    school: "The Doon School, Dehradun",
    image: "https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Raw quartz crystal securely cage-wrapped in tarnish-resistant silver craft wire, mounted on an organic braided wax cord.",
    source: 'default'
  },
  {
    id: 11,
    title: "Leather Braided Keychain",
    category: "Keychains",
    price: 99,
    rating: 4.7,
    reviews: 21,
    maker: "Dev Chauhan",
    cls: "Class 10",
    school: "Amity International School",
    image: "https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Upcycled vegetable-tanned leather scraps four-strand braided with solid brass snap hardware and burnished edges.",
    source: 'default'
  },
  {
    id: 12,
    title: "Tile Art Keychain",
    category: "Keychains",
    price: 129,
    rating: 4.9,
    reviews: 16,
    maker: "Zara Khan",
    cls: "Class 11",
    school: "Springdales School, Delhi",
    image: "https://images.pexels.com/photos/29038452/pexels-photo-29038452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Miniature ceramic glazed tile with hand-painted floral motifs sealed in weather-resistant resin on a stainless steel keyring.",
    source: 'default'
  },
  {
    id: 13,
    title: "Handcrafted Studio Sample (Draft Item)",
    category: "Clay Crafts",
    price: 299,
    rating: 5.0,
    reviews: 5,
    maker: "Student Creator",
    cls: "Art Department",
    school: "Campus Studio",
    image: "https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    stock: "Made on Demand",
    description: "Sample handcrafted piece ready for your custom descriptions, photos, and student creator details. You can easily edit or change this anytime in the Live Editor or WordPress Sync.",
    source: 'custom'
  }
];

export const INITIAL_ORDERS: Order[] = [
  { id: 1, city: "Bengaluru, KA", product: "Terracotta Diya Set of 6", qty: 2, deadline: "18 Mar 2026", status: "new", amount: 698 },
  { id: 2, city: "Pune, MH", product: "Clay Owl Planter", qty: 1, deadline: "15 Mar 2026", status: "in_production", amount: 499 },
  { id: 3, city: "Jaipur, RJ", product: "Watercolor Birthday Card Set", qty: 3, deadline: "20 Mar 2026", status: "new", amount: 447 },
  { id: 4, city: "Chennai, TN", product: "Leather Braided Keychain", qty: 5, deadline: "14 Mar 2026", status: "ready", amount: 495 },
  { id: 5, city: "Kolkata, WB", product: "Handprint Memory Canvas", qty: 1, deadline: "22 Mar 2026", status: "completed", amount: 599 },
  { id: 6, city: "Hyderabad, TG", product: "Silver Wire Wrapped Pendant", qty: 2, deadline: "19 Mar 2026", status: "in_production", amount: 698 }
];

export const HOW_IT_WORKS: HowItWorksItem[] = [
  { n: "01", t: "Discover", d: "Browse handcrafted clay crafts, painted cards, accessories and keychains made entirely by school students." },
  { n: "02", t: "Support a Cause", d: "Every order you place directly funds a student creator's craft supplies, education and entrepreneurial dreams." },
  { n: "03", t: "Custom Order & Track", d: "Place a made-on-demand order and track it live as your student maker crafts it just for you." },
  { n: "04", t: "Quality Checked", d: "Every handcrafted piece is quality checked before eco-packaging to ensure it reaches you perfect." },
  { n: "05", t: "Eco Delivery", d: "We ship in 100% recyclable, plastic-free packaging — kind to the planet, just like our young makers." }
];

export const COLLECTIONS: CollectionItem[] = [
  {
    n: "01",
    cat: "Pottery & Sculpture",
    title: "Clay Crafts Collection",
    desc: "Hand-thrown vases, diyas and planters shaped on the wheel by young hands.",
    img1: "https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img2: "https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img3: "https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    category: "Clay Crafts"
  },
  {
    n: "02",
    cat: "Paper & Paint",
    title: "Hand-painted Cards Collection",
    desc: "Watercolor and abstract greeting cards, painted one brushstroke at a time.",
    img1: "https://images.pexels.com/photos/9534281/pexels-photo-9534281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img2: "https://images.pexels.com/photos/10455739/pexels-photo-10455739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img3: "https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    category: "Hand-painted Cards"
  },
  {
    n: "03",
    cat: "Wearables",
    title: "Accessories & Keychains Collection",
    desc: "Beaded bracelets, wire pendants and braided keychains crafted for everyday charm.",
    img1: "https://images.pexels.com/photos/1212048/pexels-photo-1212048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img2: "https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    img3: "https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    category: "Accessories"
  }
];

export const ABOUT_TEXT = "ArtisansKart.in is a marketplace built for school students who craft with their hands and dream with their hearts. Every clay pot, painted card, and beaded keychain here is made on demand by a real student artisan. When you buy, you don't just get a handmade product — you fund a young creator's future.";

export const DEFAULT_HERO_CONTENT: HeroContent = {
  badgeText: "Handcrafted by Student Artisans",
  headlineLine1: "Crafted by",
  headlineLine2: "Students,",
  headlineLine3: "Loved by You",
  subhead: "Discover one-of-a-kind clay crafts, hand-painted cards, accessories & keychains — every purchase directly funds a student creator's dream.",
  mainImage: "https://images.pexels.com/photos/7559739/pexels-photo-7559739.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  leftImage: "https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  rightImage: "https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mainTag: "Live Wheel Pottery",
  leftTag: "Fine Art",
  rightTag: "Silver & Wire",
};

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  marqueeSpeed: 'normal',
  enableMagnet: true,
  enableFloatingBadges: true,
  enableScrollReveal: true,
};
