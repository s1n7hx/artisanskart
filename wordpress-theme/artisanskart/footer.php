    <footer id="colophon" style="background:#1E293B; color:#ffffff; padding:64px 0 32px 0; margin-top:auto;">
        <div class="ak-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:48px;">
            <div>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    <div style="width:36px; height:36px; border-radius:10px; background:#C85A32; color:#ffffff; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:18px;">
                        A
                    </div>
                    <h3 style="font-size:22px; font-weight:900; color:#ffffff; margin:0;">ArtisansKart</h3>
                </div>
                <p style="font-size:13px; color:#94a3b8; line-height:1.7;">
                    A nationwide handmade craft marketplace empowering school students and young artisans to showcase their creative talents and fund their education.
                </p>
            </div>
            <div>
                <h4 style="font-size:14px; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:18px;">Craft Categories</h4>
                <div style="display:flex; flex-direction:column; gap:10px; font-size:13px; color:#cbd5e1;">
                    <a href="<?php echo esc_url(home_url('/#marketplace')); ?>" style="color:#cbd5e1;">Clay &amp; Pottery Crafts</a>
                    <a href="<?php echo esc_url(home_url('/#marketplace')); ?>" style="color:#cbd5e1;">Hand-painted Greeting Cards</a>
                    <a href="<?php echo esc_url(home_url('/#marketplace')); ?>" style="color:#cbd5e1;">Beaded Accessories</a>
                    <a href="<?php echo esc_url(home_url('/#marketplace')); ?>" style="color:#cbd5e1;">Handmade Keychains</a>
                </div>
            </div>
            <div>
                <h4 style="font-size:14px; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:18px;">Student Creator Pledge</h4>
                <p style="font-size:13px; color:#cbd5e1; line-height:1.7;">
                    65% of all proceeds go directly into verified student creator accounts. Every piece is 100% made to order with plastic-free, recyclable packaging.
                </p>
            </div>
        </div>
        <div class="ak-container" style="border-top:1px solid #334155; margin-top:48px; padding-top:24px; font-size:13px; color:#94a3b8; display:flex; justify-content:space-between; flex-wrap:wrap; gap:16px;">
            <span>&copy; <?php echo date('Y'); ?> ArtisansKart.in • Handcrafted with Pride by Student Creators across India</span>
            <span>Crafted for Student Entrepreneurs</span>
        </div>
    </footer>

    <!-- Interactive Craft Quick-View Modal -->
    <div id="craftModal" class="ak-modal-overlay" onclick="closeCraftModal(event)">
        <div class="ak-modal-box" onclick="event.stopPropagation()">
            <div style="position:absolute; top:16px; right:16px; z-index:10;">
                <button onclick="closeCraftModalDirect()" style="width:36px; height:36px; border-radius:50%; background:#f1ede8; border:none; cursor:pointer; font-size:18px; font-weight:900; display:flex; align-items:center; justify-content:center;">✕</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:24px; padding:28px;">
                <div>
                    <img id="modalImg" src="" alt="Craft" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:18px; border:1px solid #E7E0D8;">
                </div>
                <div style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <span id="modalCat" class="badge-sage" style="margin-bottom:8px;">Clay Crafts</span>
                        <h2 id="modalTitle" style="font-size:24px; font-weight:900; margin:6px 0 10px 0; color:#1E293B;"></h2>
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px; font-size:13px; color:#64748b;">
                            <span style="color:#f59e0b; font-weight:800;">★ 4.9</span>
                            <span>•</span>
                            <span id="modalMaker" style="font-weight:700; color:#C85A32;"></span>
                            <span>•</span>
                            <span id="modalSchool"></span>
                        </div>
                        <p id="modalDesc" style="font-size:14px; color:#475569; line-height:1.7; margin-bottom:20px;"></p>
                    </div>
                    <div style="border-top:1px solid #E7E0D8; padding-top:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                        <div>
                            <span style="font-size:11px; color:#8A9A86; font-weight:700; display:block;">Direct Student Price</span>
                            <span id="modalPrice" style="font-size:26px; font-weight:900; color:#1E293B;">₹349</span>
                        </div>
                        <button onclick="alert('Thank you for supporting student creators! Your on-demand order inquiry has been initiated.')" class="btn-terracotta" style="padding:10px 24px;">
                            Order on Demand →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Client-side Interactive Filter & Quick View Script
const CRAFTS_DATA = [{"id":1,"title":"Terracotta Diya Set of 6","category":"Clay Crafts","price":349,"rating":4.9,"reviews":18,"maker":"Sakib Ansari","cls":"Class 10","school":"Delhi Public School, RK Puram","image":"https://images.pexels.com/photos/35473885/pexels-photo-35473885.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Hand-pinched and sun-baked earthen diyas, finished with natural ochre pigments and fine floral engravings. Designed for festive rituals or serene tabletop lighting.","source":"default"},{"id":2,"title":"Hand-thrown Ceramic Vase","category":"Clay Crafts","price":899,"rating":4.9,"reviews":14,"maker":"Meera Nair","cls":"Class 12","school":"Kendriya Vidyalaya, Pune","image":"https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Wheel-thrown speckled stoneware vase featuring subtle ribbed texture and a soft matte sage glaze. Perfect for dried botanical stems or fresh campus flora.","source":"default"},{"id":3,"title":"Clay Owl Planter","category":"Clay Crafts","price":499,"rating":4.8,"reviews":9,"maker":"Arjun Verma","cls":"Class 9","school":"St. Xavier's School, Mumbai","image":"https://images.pexels.com/photos/6611173/pexels-photo-6611173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Charming hand-sculpted succulent planter with carved feather textures and breathable porous terracotta walls that promote healthy root aeration.","source":"default"},{"id":4,"title":"Rustic Clay Wind Chime","category":"Clay Crafts","price":599,"rating":4.9,"reviews":12,"maker":"Riya Kapoor","cls":"Class 11","school":"DAV Public School, Jaipur","image":"https://images.pexels.com/photos/27837210/pexels-photo-27837210.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800","stock":"Made on Demand","description":"Terracotta bells suspended on hand-twined natural jute cords with ceramic clappers that produce warm, acoustic chime tones in gentle afternoon breezes.","source":"default"},{"id":5,"title":"Watercolor Birthday Card Set (5)","category":"Hand-painted Cards","price":149,"rating":5,"reviews":24,"maker":"Ananya Iyer","cls":"Class 11","school":"Vidya Mandir, Chennai","image":"https://images.pexels.com/photos/9534281/pexels-photo-9534281.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"300 GSM cold-pressed cotton rag greeting cards painted individually with wet-on-wet watercolor botanical blooms. Includes matching handmade envelopes.","source":"default"},{"id":6,"title":"Abstract Art Greeting Card","category":"Hand-painted Cards","price":129,"rating":4.8,"reviews":11,"maker":"Priya Sharma","cls":"Class 10","school":"Delhi Public School, Noida","image":"https://images.pexels.com/photos/34387792/pexels-photo-34387792.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Modernist palette knife strokes combining earth tones with gold leaf accents on heavyweight archival cardstock, blank inside for heartfelt personal notes.","source":"default"},{"id":7,"title":"Handprint Memory Canvas","category":"Hand-painted Cards","price":599,"rating":5,"reviews":8,"maker":"Rohan Das","cls":"Class 8","school":"Ryan International School","image":"https://images.pexels.com/photos/1240988/pexels-photo-1240988.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Original 8x10 inch stretched canvas painted with textured acrylic impasto layers capturing warmth, optimism, and raw youthful expression.","source":"default"},{"id":8,"title":"Watercolor Wildlife Card Pack","category":"Hand-painted Cards","price":179,"rating":4.9,"reviews":15,"maker":"Tanvi Joshi","cls":"Class 12","school":"Bishop Cotton School, Shimla","image":"https://images.pexels.com/photos/10455739/pexels-photo-10455739.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Detailed wildlife studies depicting Himalayan songbirds and flora painted with fine sable brushes on deckled-edge khadi paper.","source":"default"},{"id":9,"title":"Beaded Friendship Bracelet","category":"Accessories","price":199,"rating":4.8,"reviews":19,"maker":"Ishita Rao","cls":"Class 9","school":"Modern School, Delhi","image":"https://images.pexels.com/photos/1212048/pexels-photo-1212048.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Hand-threaded glass seed beads and freshwater shell chips on durable elasticized cord with adjustable macramé closure.","source":"default"},{"id":10,"title":"Silver Wire Wrapped Pendant","category":"Accessories","price":349,"rating":4.9,"reviews":13,"maker":"Kabir Mehta","cls":"Class 12","school":"The Doon School, Dehradun","image":"https://images.pexels.com/photos/15955332/pexels-photo-15955332.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Raw quartz crystal securely cage-wrapped in tarnish-resistant silver craft wire, mounted on an organic braided wax cord.","source":"default"},{"id":11,"title":"Leather Braided Keychain","category":"Keychains","price":99,"rating":4.7,"reviews":21,"maker":"Dev Chauhan","cls":"Class 10","school":"Amity International School","image":"https://images.pexels.com/photos/4452379/pexels-photo-4452379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Upcycled vegetable-tanned leather scraps four-strand braided with solid brass snap hardware and burnished edges.","source":"default"},{"id":12,"title":"Tile Art Keychain","category":"Keychains","price":129,"rating":4.9,"reviews":16,"maker":"Zara Khan","cls":"Class 11","school":"Springdales School, Delhi","image":"https://images.pexels.com/photos/29038452/pexels-photo-29038452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Miniature ceramic glazed tile with hand-painted floral motifs sealed in weather-resistant resin on a stainless steel keyring.","source":"default"},{"id":13,"title":"Handcrafted Studio Sample (Draft Item)","category":"Clay Crafts","price":299,"rating":5,"reviews":5,"maker":"Student Creator","cls":"Art Department","school":"Campus Studio","image":"https://images.pexels.com/photos/18646120/pexels-photo-18646120.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940","stock":"Made on Demand","description":"Sample handcrafted piece ready for your custom descriptions, photos, and student creator details. You can easily edit or change this anytime in the Live Editor or WordPress Sync.","source":"custom"}];

function filterCrafts(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.product-craft-card');
    cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'All' || cardCat === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function searchCrafts(input) {
    const q = input.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.product-craft-card');
    cards.forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const maker = (card.getAttribute('data-maker') || '').toLowerCase();
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        if (!q || title.includes(q) || maker.includes(q) || cat.includes(q)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function openCraftModal(id) {
    const item = CRAFTS_DATA.find(p => p.id === id) || CRAFTS_DATA[0];
    if (!item) return;

    document.getElementById('modalImg').src = item.image;
    document.getElementById('modalCat').innerText = item.category;
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalMaker').innerText = '🎨 ' + (item.maker || 'Student Maker');
    document.getElementById('modalSchool').innerText = (item.cls || 'Class 10') + ', ' + (item.school || 'Campus Studio');
    document.getElementById('modalDesc').innerText = item.description;
    document.getElementById('modalPrice').innerText = '₹' + item.price;

    document.getElementById('craftModal').classList.add('open');
}

function closeCraftModal(e) {
    document.getElementById('craftModal').classList.remove('open');
}

function closeCraftModalDirect() {
    document.getElementById('craftModal').classList.remove('open');
}
</script>

<?php wp_footer(); ?>
</body>
</html>
