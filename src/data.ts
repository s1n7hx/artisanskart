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

export const PRODUCTS: Product[] = [
  // --- Dedicated Crochet Category ---
  {
    id: 101,
    title: "Handmade Sunflower & Daisy Crochet Bouquet",
    category: "Crochet",
    price: 549,
    rating: 0,
    reviews: 0,
    maker: "Ananya Sharma",
    cls: "Crochet Artist",
    school: "Studio Threadworks",
    image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: "In Stock • Made on Demand",
    inStockCount: 12,
    materials: "Premium milk cotton yarn, flexible floral stem wire, kraft paper gift wrapping",
    dimensions: "30 cm height × 18 cm bouquet spread",
    weight: "220g",
    careInstructions: "Gently dust with a soft brush. Keep away from direct moisture and flame.",
    slug: "handmade-sunflower-daisy-crochet-bouquet-101",
    description: "Forever-blooming sunflower and white daisy bouquet hand-crocheted using ultra-soft milk cotton yarn. Comes elegantly wrapped in craft paper with a satin ribbon, making it a timeless gift for birthdays, anniversaries, or desk decor.",
    source: 'default',
    originCity: "Bengaluru",
    isMadeToOrder: true
  },
  {
    id: 102,
    title: "Artisanal Amigurumi Bunny Crochet Plushie",
    category: "Crochet",
    price: 420,
    rating: 0,
    reviews: 0,
    maker: "Priya Varma",
    cls: "Amigurumi Maker",
    school: "YarnCraft Studio",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: "In Stock • Handcrafted",
    inStockCount: 8,
    materials: "Hypoallergenic soft acrylic yarn, high-resilience polyester fiberfill, safety eyes",
    dimensions: "18 cm height × 10 cm width",
    weight: "160g",
    careInstructions: "Spot clean gently with damp cloth and mild baby soap. Air dry in shade.",
    slug: "artisanal-amigurumi-bunny-crochet-plushie-102",
    description: "Adorable handmade floppy-eared bunny stuffed animal hand-hooked with hypoallergenic yarn. Features securely locked safety eyes and cute pink blush details, perfect as a comforting heirloom or nursery keepsake.",
    source: 'default',
    originCity: "Pune",
    isMadeToOrder: true
  },
  {
    id: 103,
    title: "Pastel Daisy Granny Square Crochet Tote Bag",
    category: "Crochet",
    price: 799,
    rating: 0,
    reviews: 0,
    maker: "Shalini Menon",
    cls: "Fiber Artist",
    school: "Handmade Atelier",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: "Made to Order",
    inStockCount: 6,
    materials: "100% combed natural cotton yarn, reinforced matching crochet shoulder straps",
    dimensions: "35 cm width × 38 cm height (strap drop 28 cm)",
    weight: "340g",
    careInstructions: "Hand wash gently in cold water with mild liquid detergent. Lay flat to dry.",
    slug: "pastel-daisy-granny-square-crochet-tote-bag-103",
    description: "Bohemian retro tote bag crafted from intricate floral granny squares joined with dense slip stitches. Sturdy enough to carry books, an iPad, or everyday essentials with effortless artistic style.",
    source: 'default',
    originCity: "Kochi",
    isMadeToOrder: true
  },
  {
    id: 104,
    title: "Handcrafted Boho Crochet Coaster Set of 4",
    category: "Crochet",
    price: 280,
    rating: 0,
    reviews: 0,
    maker: "Kavita Rao",
    cls: "Home Decor Creator",
    school: "Cozy Stitches",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: "In Stock",
    inStockCount: 15,
    materials: "Eco-friendly natural cotton cord with frayed boho fringing",
    dimensions: "12 cm diameter including fringe border",
    weight: "140g (set of 4)",
    careInstructions: "Hand wash or gentle spot clean. Comb fringe with a clean fine-tooth comb.",
    slug: "handcrafted-boho-crochet-coaster-set-of-4-104",
    description: "Set of 4 circular heat-resistant drink coasters hand-knitted with thick textured stitches and boho tassels. Protects coffee tables while adding tactile aesthetic charm.",
    source: 'default',
    originCity: "Jaipur",
    isMadeToOrder: false
  },
  {
    id: 105,
    title: "Crochet Strawberry & Blossom Charm Keychain",
    category: "Crochet",
    price: 199,
    rating: 0,
    reviews: 0,
    maker: "Neha Dutta",
    cls: "Accessory Creator",
    school: "Kolkata Craft Guild",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: "In Stock",
    inStockCount: 20,
    materials: "Mercerized fine cotton thread, brass lobster swivel clasp, gold-tone key ring",
    dimensions: "6 cm charm length × 4 cm width",
    weight: "35g",
    careInstructions: "Wipe with damp cloth. Avoid harsh chemicals.",
    slug: "crochet-strawberry-blossom-charm-keychain-105",
    description: "Delightful mini strawberry and white flower charm, hand-crocheted with intricate fine-gauge cotton and attached to a durable brass keychain clasp. Makes a wonderful gift or bag accent.",
    source: 'default',
    originCity: "Kolkata",
    isMadeToOrder: false
  },

  // --- Pottery, Clay & Traditional Crafts ---
  {
    id: 1,
    title: "Terracotta Diya Set of 6",
    category: "Clay Crafts",
    price: 349,
    rating: 0,
    reviews: 0,
    maker: "Sakib Ansari",
    cls: "Clay Artist",
    school: "Heritage Terracotta Guild",
    image: "https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574343635791-0e481f3bc925?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: "In Stock • Made on Demand",
    inStockCount: 18,
    materials: "Natural riverbed terracotta, organic ochre pigments, hand-chiseled motifs",
    dimensions: "7.5 cm diameter × 3.5 cm height (each diya)",
    weight: "480g (box of 6)",
    careInstructions: "Gently wipe clean with dry cotton cloth. Not dishwasher safe. Use ghee or vegetable oil for flame.",
    slug: "terracotta-diya-set-of-6-1",
    description: "Hand-pinched and sun-baked earthen diyas, finished with natural ochre pigments and fine floral engravings. Designed for festive rituals or serene tabletop lighting.",
    source: 'default',
    originCity: "New Delhi",
    isMadeToOrder: true
  },
  {
    id: 2,
    title: "Hand-thrown Ceramic Vase",
    category: "Clay Crafts",
    price: 899,
    rating: 0,
    reviews: 0,
    maker: "Meera Nair",
    cls: "Studio Potter",
    school: "Pune Clay Works",
    image: "https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      "https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "Limited Studio Stock (4 left)",
    inStockCount: 4,
    materials: "Stoneware clay body, lead-free raw matte mineral glaze",
    dimensions: "18 cm height × 11 cm belly diameter",
    weight: "720g",
    careInstructions: "Wipe with damp cloth or rinse gently with mild detergent. Watertight for fresh floral stems.",
    slug: "hand-thrown-ceramic-vase-2",
    description: "Wheel-thrown minimal stoneware vase with an earthy textured sand glaze. Perfectly sized for single dried sprigs or fresh wildflower stems.",
    source: 'default',
    originCity: "Pune",
    isMadeToOrder: false
  },
  {
    id: 3,
    title: "Clay Owl Planter",
    category: "Clay Crafts",
    price: 499,
    rating: 0,
    reviews: 0,
    maker: "Arjun Verma",
    cls: "Ceramic Sculptor",
    school: "Studio Earthcraft",
    image: "https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock • Made on Demand",
    inStockCount: 9,
    materials: "Natural terracotta clay, non-toxic waterproof underglaze, drilled drainage hole",
    dimensions: "12 cm height × 10 cm width",
    weight: "550g",
    careInstructions: "Suitable for indoor succulents or small ferns. Features drainage hole at base.",
    slug: "clay-owl-planter-3",
    description: "Whimsical sculpted owl planter with hand-etched feathers and saucer-wide eyes. Keeps small succulents healthy while adding personality to study shelves.",
    source: 'default',
    originCity: "Lucknow",
    isMadeToOrder: true
  },
  {
    id: 4,
    title: "Terracotta Incense Burner",
    category: "Clay Crafts",
    price: 599,
    rating: 0,
    reviews: 0,
    maker: "Diya Patel",
    cls: "Ceramicist",
    school: "Ahmedabad Craft Collective",
    image: "https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock",
    inStockCount: 11,
    materials: "Kiln-fired clay, perforated ventilation dome, heat-resistant base",
    dimensions: "14 cm height × 9 cm diameter",
    weight: "620g",
    careInstructions: "Allow to cool before emptying residual ash. Clean with dry sponge.",
    slug: "terracotta-incense-burner-4",
    description: "Double-tiered dhoop and incense cone holder with pierced latticework that channels aromatic smoke trails into mesmerizing patterns.",
    source: 'default',
    originCity: "Ahmedabad",
    isMadeToOrder: false
  },

  // --- Hand-painted Paper & Paintings ---
  {
    id: 5,
    title: "Watercolor Botanical Postcards (Set of 4)",
    category: "Hand-painted Cards",
    price: 180,
    rating: 0,
    reviews: 0,
    maker: "Ananya Roy",
    cls: "Botanical Illustrator",
    school: "Shantiniketan Arts Studio",
    image: "https://images.pexels.com/photos/9534281/pexels-photo-9534281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/9534281/pexels-photo-9534281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      "https://images.pexels.com/photos/10455739/pexels-photo-10455739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock",
    inStockCount: 25,
    materials: "300 GSM cold-pressed handmade cotton paper, artist-grade lightfast watercolors",
    dimensions: "15 cm × 10.5 cm (A6 standard postcard format)",
    weight: "95g (pack of 4 with envelopes)",
    careInstructions: "Store in cool, dry place. Keep out of direct prolonged sunlight to preserve pigments.",
    slug: "watercolor-botanical-postcards-set-of-4-5",
    description: "Four distinct native Indian botanicals individually hand-painted with wet-on-wet watercolor washes on deckled-edge paper. Packaged with recycled kraft envelopes.",
    source: 'default',
    originCity: "Kolkata",
    isMadeToOrder: false
  },
  {
    id: 6,
    title: "Handmade Birthday Card with Calligraphy",
    category: "Hand-painted Cards",
    price: 140,
    rating: 0,
    reviews: 0,
    maker: "Kavya S.",
    cls: "Calligrapher & Artist",
    school: "Chennai Paper Guild",
    image: "https://images.pexels.com/photos/10455739/pexels-photo-10455739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/10455739/pexels-photo-10455739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock",
    inStockCount: 30,
    materials: "Heavyweight recycled cotton rag, gold mica ink, pointed pen copperplate script",
    dimensions: "17.5 cm × 12.5 cm folded",
    weight: "50g",
    careInstructions: "Keep dry. Blank interior for personalized handwritten heartfelt notes.",
    slug: "handmade-birthday-card-with-calligraphy-6",
    description: "Festive celebration card hand-lettered with genuine shimmering gold mica ink and floral gouache wreaths. Blank inside for your own heartfelt message.",
    source: 'default',
    originCity: "Chennai",
    isMadeToOrder: false
  },
  {
    id: 7,
    title: "Mini Watercolor Landscape Canvas",
    category: "Paintings",
    price: 649,
    rating: 0,
    reviews: 0,
    maker: "Rohan Das",
    cls: "Plein Air Painter",
    school: "Shimla Valley Arts",
    image: "https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "One of a Kind",
    inStockCount: 2,
    materials: "Stretched primed mini canvas, Windsor & Newton watercolors, wooden tabletop easel",
    dimensions: "12 cm × 12 cm square (with 15 cm display easel)",
    weight: "220g",
    careInstructions: "Coated with archival matte UV varnish. Dust lightly with feather brush.",
    slug: "mini-watercolor-landscape-canvas-7",
    description: "Misty pine forest landscape painted during sunrise in Himachal Pradesh. Includes a miniature natural pine easel for instant desktop display.",
    source: 'default',
    originCity: "Shimla",
    isMadeToOrder: false
  },

  // --- Accessories & Wearables ---
  {
    id: 8,
    title: "Hand-beaded Seed Bead Bracelet",
    category: "Accessories",
    price: 199,
    rating: 0,
    reviews: 0,
    maker: "Tanvi Joshi",
    cls: "Jewellery Maker",
    school: "Mumbai Beadworks",
    image: "https://images.pexels.com/photos/1212048/pexels-photo-1212048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/1212048/pexels-photo-1212048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock",
    inStockCount: 16,
    materials: "Precision Japanese Miyuki glass beads, 14k gold-plated hypoallergenic lobster clasp",
    dimensions: "16 cm length + 4 cm extension chain",
    weight: "18g",
    careInstructions: "Avoid contact with perfumes and swimming pool water to preserve bead luster.",
    slug: "hand-beaded-seed-bead-bracelet-8",
    description: "Subtle geometric chevron pattern woven bead-by-bead using Japanese Miyuki glass cylinders on durable micro-cord. Adjustable clasp fits all wrists.",
    source: 'default',
    originCity: "Mumbai",
    isMadeToOrder: false
  },
  {
    id: 9,
    title: "Braided Macrame Wristlet",
    category: "Accessories",
    price: 220,
    rating: 0,
    reviews: 0,
    maker: "Sneha Pillai",
    cls: "Macrame Crafter",
    school: "Kerala Knotworks",
    image: "https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock",
    inStockCount: 22,
    materials: "100% recycled cotton macrame cord, antique brass swivel clasp",
    dimensions: "18 cm loop length × 2.5 cm width",
    weight: "45g",
    careInstructions: "Spot clean with cold water and mild soap. Air dry flat.",
    slug: "braided-macrame-wristlet-9",
    description: "Textured macrame keychain wristlet hand-tied in a herringbone spiral. Keeps house keys or car remotes conveniently attached to your wrist.",
    source: 'default',
    originCity: "Kochi",
    isMadeToOrder: false
  },
  {
    id: 10,
    title: "Silver Wire Wrapped Stone Pendant",
    category: "Accessories",
    price: 349,
    rating: 0,
    reviews: 0,
    maker: "Kabir Mehta",
    cls: "Wire Sculptor",
    school: "Udaipur Silver Arts",
    image: "https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock",
    inStockCount: 7,
    materials: "Tarnish-resistant German silver wire, natural tumbled green aventurine stone",
    dimensions: "4.5 cm pendant drop length × 2 cm width (comes with 45 cm wax cord)",
    weight: "28g",
    careInstructions: "Store sealed in zip pouch when not in use. Buff occasionally with soft silver cloth.",
    slug: "silver-wire-wrapped-stone-pendant-10",
    description: "Raw green aventurine gemstone hand-caged in flowing silver wire weaving. Comes ready to wear on a black adjustable woven cord.",
    source: 'default',
    originCity: "Udaipur",
    isMadeToOrder: false
  },
  {
    id: 11,
    title: "Handmade Polymer Clay Daisy Keychain",
    category: "Keychains",
    price: 120,
    rating: 0,
    reviews: 0,
    maker: "Simran Kaur",
    cls: "Clay Crafter",
    school: "Chandigarh Craft Studio",
    image: "https://images.pexels.com/photos/7559739/pexels-photo-7559739.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
    images: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80"
    ],
    stock: "In Stock",
    inStockCount: 20,
    materials: "Oven-baked polymer clay, UV resin topcoat, stainless steel split key ring",
    dimensions: "4 cm flower charm diameter",
    weight: "20g",
    careInstructions: "Drop-resistant and waterproof. Wipe with damp cloth.",
    slug: "handmade-polymer-clay-daisy-keychain-11",
    description: "Cheerful daisy flower keychain sculpted petal-by-petal and cured under high-gloss UV resin for scratch-free daily durability.",
    source: 'default',
    originCity: "Chandigarh",
    isMadeToOrder: false
  },
  {
    id: 12,
    title: "Hand-painted Wooden Keychain",
    category: "Keychains",
    price: 140,
    rating: 0,
    reviews: 0,
    maker: "Varun Nair",
    cls: "Woodcraft Artist",
    school: "Mysuru Wood Guild",
    image: "https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    images: [
      "https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
    ],
    stock: "In Stock",
    inStockCount: 14,
    materials: "Sustainably sourced natural pine wood slice, acrylic paint, waterproof lacquer",
    dimensions: "5 cm diameter slice × 0.8 cm thickness",
    weight: "25g",
    careInstructions: "Avoid submerging in water. Clean with dry cloth.",
    slug: "hand-painted-wooden-keychain-12",
    description: "Natural live-edge wood round miniature hand-painted with nocturnal mountain scenes and sealed in satin weatherproof lacquer.",
    source: 'default',
    originCity: "Mysuru",
    isMadeToOrder: false
  }
];

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
