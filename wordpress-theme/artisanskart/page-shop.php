<?php
/**
 * Template Name: Shop / Marketplace Page
 * Description: Dedicated full catalog page for all 13 handcrafted student crafts with live category filters, search, and Quick View.
 *
 * @package ArtisansKart
 */
get_header();
?>
<main id="primary" class="site-main" style="padding:50px 0 80px 0; background:#ffffff; min-height:85vh;">
    <div class="ak-container">
        <!-- Page Header -->
        <div style="text-align:center; max-width:680px; margin:0 auto 40px auto;">
            <span class="badge-terracotta" style="margin-bottom:8px;">Campus Artisan Catalog</span>
            <h1 style="font-size:clamp(32px, 4vw, 48px); font-weight:900; color:#1E293B; margin:6px 0 12px 0;">
                Handcrafted Student Shop
            </h1>
            <p style="font-size:16px; color:#64748b; line-height:1.6;">
                Browse unique clay pottery, watercolor greeting cards, beaded jewelry, and custom keychains crafted by student creators across India.
            </p>
        </div>

        <!-- Search and Filter Bar -->
        <div style="background:#FAF9F6; border:1px solid #E7E0D8; border-radius:24px; padding:20px; margin-bottom:36px; display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:space-between;">
            <!-- Category Tabs -->
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <button type="button" class="filter-btn active" onclick="filterCrafts('All', this)">All Crafts (13)</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Clay Crafts', this)">Clay Crafts (5)</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Hand-painted Cards', this)">Hand-painted Cards (3)</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Accessories', this)">Accessories (3)</button>
                <button type="button" class="filter-btn" onclick="filterCrafts('Keychains', this)">Keychains (2)</button>
            </div>

            <!-- Instant Search Input -->
            <div style="position:relative; width:100%; max-width:280px;">
                <input type="text" placeholder="Search craft or student..." oninput="searchCrafts(this)" style="width:100%; padding:10px 18px; border-radius:9999px; border:1px solid #E7E0D8; background:#ffffff; font-size:13px; outline:none; font-family:inherit;">
            </div>
        </div>

        <!-- 13 Products Grid -->
        <div id="craftsGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:24px;">
            <!-- 1. Terracotta Diya Set of 6 -->
            <article class="card-hover product-craft-card" data-category="Clay Crafts" data-title="Terracotta Diya Set of 6" data-maker="Sakib Ansari" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(1)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Terracotta Diya Set of 6" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Clay Crafts</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Sakib Ansari (Class 10)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Terracotta Diya Set of 6</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Hand-pinched and sun-baked earthen diyas, finished with natural ochre pigments.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹349</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(1)">Quick View</button>
                </div>
            </article>

            <!-- 2. Hand-thrown Ceramic Vase -->
            <article class="card-hover product-craft-card" data-category="Clay Crafts" data-title="Hand-thrown Ceramic Vase" data-maker="Meera Nair" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(2)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Hand-thrown Ceramic Vase" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Clay Crafts</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Meera Nair (Class 12)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Hand-thrown Ceramic Vase</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Wheel-thrown speckled stoneware vase with soft matte sage glaze.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹899</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(2)">Quick View</button>
                </div>
            </article>

            <!-- 3. Clay Owl Planter -->
            <article class="card-hover product-craft-card" data-category="Clay Crafts" data-title="Clay Owl Planter" data-maker="Arjun Verma" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(3)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Clay Owl Planter" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Clay Crafts</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Arjun Verma (Class 9)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.8</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Clay Owl Planter</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Charming hand-sculpted succulent planter with carved feather textures.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹499</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(3)">Quick View</button>
                </div>
            </article>

            <!-- 4. Rustic Clay Wind Chime -->
            <article class="card-hover product-craft-card" data-category="Clay Crafts" data-title="Rustic Clay Wind Chime" data-maker="Riya Kapoor" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(4)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/5699665/pexels-photo-5699665.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Rustic Clay Wind Chime" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Clay Crafts</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Riya Kapoor (Class 11)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Rustic Clay Wind Chime</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Soothing terracotta bell chimes tuned for gentle porch breezes.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹599</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(4)">Quick View</button>
                </div>
            </article>

            <!-- 5. Miniature Terracotta Tea Set -->
            <article class="card-hover product-craft-card" data-category="Clay Crafts" data-title="Miniature Terracotta Tea Set" data-maker="Devansh Roy" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(5)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Miniature Terracotta Tea Set" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Clay Crafts</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Devansh Roy (Class 8)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.7</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Miniature Terracotta Tea Set</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">A nostalgic 5-piece miniature kettle and kulhad set hand-molded with care.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹399</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(5)">Quick View</button>
                </div>
            </article>

            <!-- 6. Botanical Wildflower Card -->
            <article class="card-hover product-craft-card" data-category="Hand-painted Cards" data-title="Botanical Wildflower Card" data-maker="Ananya Sharma" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(6)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/159862/art-school-supplies-draw-159862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Botanical Wildflower Card" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Cards</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Ananya Sharma (Class 11)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Botanical Wildflower Card</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Original watercolor study on 300 GSM handmade recycled cotton paper.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹199</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(6)">Quick View</button>
                </div>
            </article>

            <!-- 7. Sunset Gradient Bookmark Set -->
            <article class="card-hover product-craft-card" data-category="Hand-painted Cards" data-title="Sunset Gradient Bookmark Set" data-maker="Kabir Das" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(7)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Sunset Gradient Bookmark Set" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Cards</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Kabir Das (Class 10)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.8</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Sunset Gradient Bookmark Set</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Laminated watercolor bookmarks with silk tassels.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹149</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(7)">Quick View</button>
                </div>
            </article>

            <!-- 8. Mandala Art Greeting Card -->
            <article class="card-hover product-craft-card" data-category="Hand-painted Cards" data-title="Mandala Art Greeting Card" data-maker="Sanya Patel" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(8)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/1572386/pexels-photo-1572386.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Mandala Art Greeting Card" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Cards</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Sanya Patel (Class 12)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Mandala Art Greeting Card</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Intricate black-ink and metallic gold fine-liner mandala on parchment cardstock.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹249</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(8)">Quick View</button>
                </div>
            </article>

            <!-- 9. Boho Beaded Bracelet -->
            <article class="card-hover product-craft-card" data-category="Accessories" data-title="Boho Beaded Bracelet" data-maker="Tanvi Joshi" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(9)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Boho Beaded Bracelet" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Accessories</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Tanvi Joshi (Class 10)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Boho Beaded Bracelet</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Hand-strung seed beads with adjustable sliding knot macrame band.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹279</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(9)">Quick View</button>
                </div>
            </article>

            <!-- 10. Macrame Wristlet Band -->
            <article class="card-hover product-craft-card" data-category="Accessories" data-title="Macrame Wristlet Band" data-maker="Aditya Kulkarni" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(10)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/458766/pexels-photo-458766.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Macrame Wristlet Band" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Accessories</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Aditya Kulkarni (Class 11)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.8</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Macrame Wristlet Band</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Braided organic unbleached cotton cord with vintage brass swivel clasp.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹199</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(10)">Quick View</button>
                </div>
            </article>

            <!-- 11. Polymer Clay Daisy Earrings -->
            <article class="card-hover product-craft-card" data-category="Accessories" data-title="Polymer Clay Daisy Earrings" data-maker="Pooja Hegde" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(11)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Polymer Clay Daisy Earrings" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Accessories</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Pooja Hegde (Class 9)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Polymer Clay Daisy Earrings</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Lightweight hypoallergenic floral dangles handcrafted in oven-baked clay.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹329</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(11)">Quick View</button>
                </div>
            </article>

            <!-- 12. Wooden Name Keychain -->
            <article class="card-hover product-craft-card" data-category="Keychains" data-title="Wooden Name Keychain" data-maker="Vikram Sen" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(12)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/1194036/pexels-photo-1194036.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Wooden Name Keychain" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Keychains</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Vikram Sen (Class 10)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.8</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Wooden Name Keychain</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Hand-pyrographed birch wood slice key holder with protective beeswax polish.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹179</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(12)">Quick View</button>
                </div>
            </article>

            <!-- 13. Resin Botanical Keychain -->
            <article class="card-hover product-craft-card" data-category="Keychains" data-title="Resin Botanical Keychain" data-maker="Ishita Roy" style="padding:16px; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="openCraftModal(13)">
                <div>
                    <div style="aspect-ratio:1; border-radius:18px; overflow:hidden; background:#FAF9F6; margin-bottom:14px; position:relative;">
                        <img src="https://images.pexels.com/photos/1037992/pexels-photo-1037992.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Resin Botanical Keychain" style="width:100%; height:100%; object-fit:cover;">
                        <span style="position:absolute; top:10px; right:10px; background:rgba(30,41,59,0.85); color:#fff; font-size:10px; font-weight:700; padding:3px 8px; border-radius:9999px;">Keychains</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-size:11px; font-weight:700; color:#C85A32;">🎨 Ishita Roy (Class 11)</span>
                        <span style="font-size:11px; font-weight:700; color:#8A9A86;">★ 4.9</span>
                    </div>
                    <h3 style="font-size:16px; font-weight:800; margin:2px 0 6px 0; color:#1E293B;">Resin Botanical Keychain</h3>
                    <p style="font-size:12px; color:#64748b; line-height:1.5; margin-bottom:12px;">Real pressed mini daisies and gold leaf flakes suspended in crystal resin.</p>
                </div>
                <div style="border-top:1px solid #E7E0D8; padding-top:12px; display:flex; align-items:center; justify-content:space-between;">
                    <div><span style="font-size:18px; font-weight:900; color:#1E293B;">₹219</span><span style="display:block; font-size:10px; color:#8A9A86; font-weight:700;">Made to Order</span></div>
                    <button type="button" class="btn-terracotta" style="padding:6px 14px; font-size:12px;" onclick="event.stopPropagation(); openCraftModal(13)">Quick View</button>
                </div>
            </article>
        </div>
    </div>
</main>
<?php
get_footer();
