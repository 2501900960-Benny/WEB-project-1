/* Kampala Fresh Fish Delivery - Shared JavaScript */

const PRODUCTS = [
  { id: 1, name: "Fresh Tilapia", category: "Fresh", source: "Entebbe", price: 15000, unit: "kg", stock: 120, image: "images/tilapia.jpg", featured: true,
    desc: "Lake Victoria tilapia caught at dawn and delivered chilled. Sweet, mild white flesh — perfect for frying, stewing or grilling." },
  { id: 2, name: "Nile Perch (Whole)", category: "Fresh", source: "Jinja", price: 18000, unit: "kg", stock: 80, image: "images/nile-perch.jpg", featured: true,
    desc: "Large, firm Nile perch from the source of the Nile. Ideal for hotels and restaurants needing big portions." },
  { id: 3, name: "Nile Perch Fillets", category: "Fillets", source: "Jinja", price: 26000, unit: "kg", stock: 45, image: "images/nile-perch.jpg", featured: false,
    desc: "Boneless, skinless fillets cleaned and packed on ice. Ready for the pan — no preparation needed." },
  { id: 4, name: "Mukene (Silver Fish)", category: "Dried", source: "Kalangala", price: 8000, unit: "kg", stock: 200, image: "images/mukene.jpg", featured: true,
    desc: "Sun-dried silver cyprinid from Kalangala islands. Rich in protein and calcium, great for sauces and snacks." },
  { id: 5, name: "African Catfish (Male)", category: "Fresh", source: "Mukono", price: 14000, unit: "kg", stock: 8, image: "images/catfish.jpg", featured: true,
    desc: "Farm-fresh catfish from Mukono fish ponds. Tender, flavourful meat that is excellent for soups and pepper dishes." },
  { id: 6, name: "Smoked Tilapia", category: "Smoked", source: "Entebbe", price: 20000, unit: "kg", stock: 35, image: "images/smoked.jpg", featured: false,
    desc: "Traditionally smoked over wood fire for a deep, smoky flavour. Long shelf life, ideal for groundnut sauce." },
  { id: 7, name: "Tilapia Fillets", category: "Fillets", source: "Entebbe", price: 24000, unit: "kg", stock: 0, image: "images/tilapia.jpg", featured: false,
    desc: "Neatly cut tilapia fillets, boneless and cleaned. Popular with restaurants and busy households." },
  { id: 8, name: "Smoked Catfish", category: "Smoked", source: "Mukono", price: 22000, unit: "kg", stock: 25, image: "images/smoked.jpg", featured: false,
    desc: "Wood-smoked catfish pieces with a rich aroma. A Ugandan favourite for stews and luwombo." },
  { id: 9, name: "Dried Mukene (Bulk)", category: "Dried", source: "Kalangala", price: 70000, unit: "10kg sack", stock: 15, image: "images/mukene.jpg", featured: false,
    desc: "Bulk 10kg sack of dried mukene for wholesalers, schools and animal-feed businesses." }
];

const DELIVERY_FEES = { "Kampala Central": 5000, "Nakawa": 6000, "Kawempe": 6000, "Makindye": 6000, "Rubaga": 6000, "Ntinda": 7000, "Kira": 8000, "Entebbe Road": 10000 };

const fmt = (n) => "UGX " + Number(n).toLocaleString("en-UG");

/* ---------- Basket (localStorage) ---------- */
const Basket = {
  get() { try { return JSON.parse(localStorage.getItem("kffd_basket")) || []; } catch { return []; } },
  save(items) { localStorage.setItem("kffd_basket", JSON.stringify(items)); updateBasketCount(); },
  add(id, qty = 1) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p || p.stock === 0) return showToast("Sorry, this item is out of stock");
    const items = this.get();
    const line = items.find((i) => i.id === id);
    const newQty = (line ? line.qty : 0) + qty;
    if (newQty > p.stock) return showToast(`Only ${p.stock} ${p.unit} available`);
    line ? (line.qty = newQty) : items.push({ id, qty });
    this.save(items);
    showToast(`✓ ${p.name} added to basket`);
  },
  setQty(id, qty) {
    const p = PRODUCTS.find((x) => x.id === id);
    qty = Math.max(1, Math.min(qty, p.stock));
    const items = this.get().map((i) => (i.id === id ? { ...i, qty } : i));
    this.save(items);
  },
  remove(id) { this.save(this.get().filter((i) => i.id !== id)); },
  clear() { this.save([]); },
  subtotal() {
    return this.get().reduce((sum, i) => { const p = PRODUCTS.find((x) => x.id === i.id); return sum + (p ? p.price * i.qty : 0); }, 0);
  },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); }
};

function updateBasketCount() {
  document.querySelectorAll(".basket-count").forEach((el) => (el.textContent = Basket.count()));
}

function showToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2400);
}

function stockBadge(p) {
  if (p.stock === 0) return '<span class="badge out">Out of stock</span>';
  if (p.stock < 10) return `<span class="badge low">Only ${p.stock} left</span>`;
  return `<span class="badge">${p.category}</span>`;
}

function productCard(p) {
  return `
  <article class="card">
    <div class="card-img"><img src="${p.image}" alt="${p.name}" loading="lazy">${stockBadge(p)}</div>
    <div class="card-body">
      <h3>${p.name}</h3>
      <div class="card-meta"><span>📍 ${p.source}</span><span>📦 ${p.stock > 0 ? p.stock + " " + p.unit + " in stock" : "Restocking soon"}</span></div>
      <p class="card-desc">${p.desc.slice(0, 80)}…</p>
      <div class="price">${fmt(p.price)} <small>/ ${p.unit}</small></div>
      <div class="card-actions">
        <button class="btn btn-light" data-view="${p.id}">Details</button>
        <button class="btn btn-dark" data-add="${p.id}" ${p.stock === 0 ? "disabled" : ""}>Add to basket</button>
      </div>
    </div>
  </article>`;
}

/* ---------- Product detail modal ---------- */
function openModal(id) {
  const p = PRODUCTS.find((x) => x.id === id);
  let modal = document.getElementById("productModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "productModal"; modal.className = "modal";
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("open"); });
  }
  modal.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-label="${p.name}">
      <button class="modal-close" aria-label="Close">×</button>
      <img src="${p.image}" alt="${p.name}">
      <div class="modal-content">
        <span class="eyebrow">${p.category} fish</span>
        <h2>${p.name}</h2>
        <div class="price">${fmt(p.price)} <small>/ ${p.unit}</small></div>
        <p style="color:var(--muted)">${p.desc}</p>
        <div class="spec">
          <div><strong>Source</strong>${p.source}</div>
          <div><strong>In stock</strong>${p.stock > 0 ? p.stock + " " + p.unit : "Out of stock"}</div>
          <div><strong>Category</strong>${p.category}</div>
          <div><strong>Delivery</strong>Same day</div>
        </div>
        ${p.stock > 0 ? `
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:6px">
          <div class="qty"><button data-step="-1">−</button><input id="modalQty" type="number" value="1" min="1" max="${p.stock}"><button data-step="1">+</button></div>
          <button class="btn btn-primary" id="modalAdd">Add to basket</button>
        </div>` : `<p style="color:var(--danger);font-weight:600">Currently out of stock</p>`}
      </div>
    </div>`;
  modal.classList.add("open");
  modal.querySelector(".modal-close").onclick = () => modal.classList.remove("open");
  const input = modal.querySelector("#modalQty");
  modal.querySelectorAll("[data-step]").forEach((b) => (b.onclick = () => {
    input.value = Math.max(1, Math.min(p.stock, Number(input.value) + Number(b.dataset.step)));
  }));
  const addBtn = modal.querySelector("#modalAdd");
  if (addBtn) addBtn.onclick = () => { Basket.add(p.id, Number(input.value) || 1); modal.classList.remove("open"); };
}

/* Delegated click handling for any product grid */
document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  const view = e.target.closest("[data-view]");
  if (add) Basket.add(Number(add.dataset.add));
  if (view) openModal(Number(view.dataset.view));
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") document.getElementById("productModal")?.classList.remove("open");
});

/* ---------- Common init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateBasketCount();
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle) toggle.addEventListener("click", () => links.classList.toggle("open"));
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const featured = document.getElementById("featuredGrid");
  if (featured) featured.innerHTML = PRODUCTS.filter((p) => p.featured).map(productCard).join("");
});
