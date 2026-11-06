/* Basket & checkout page */
(function () {
  const itemsEl = document.getElementById("basketItems");
  const areaSel = document.getElementById("area");
  const form = document.getElementById("checkoutForm");
  const placeBtn = document.getElementById("placeOrder");

  Object.entries(DELIVERY_FEES).forEach(([a, fee]) => {
    areaSel.insertAdjacentHTML("beforeend", `<option value="${a}">${a} (${fmt(fee)})</option>`);
  });
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").min = today;
  document.getElementById("date").value = today;

  function renderBasket() {
    const items = Basket.get();
    if (!items.length) {
      itemsEl.innerHTML = '<div class="empty"><h3>Your basket is empty</h3><p>Add some fresh fish to get started.</p><a href="products.html" class="btn btn-dark" style="margin-top:14px">Browse products</a></div>';
    } else {
      itemsEl.innerHTML = items.map((i) => {
        const p = PRODUCTS.find((x) => x.id === i.id);
        return `<div class="basket-item">
          <img src="${p.image}" alt="${p.name}">
          <div><h4>${p.name}</h4><div class="unit">${fmt(p.price)} / ${p.unit} · ${p.stock} available</div>
            <div class="qty" style="margin-top:8px"><button data-dec="${p.id}" aria-label="Decrease">−</button><input type="number" min="1" max="${p.stock}" value="${i.qty}" data-qty="${p.id}" aria-label="Quantity"><button data-inc="${p.id}" aria-label="Increase">+</button></div>
          </div>
          <div class="right"><strong>${fmt(p.price * i.qty)}</strong><button class="btn btn-ghost" data-remove="${p.id}">Remove</button></div>
        </div>`;
      }).join("");
    }
    updateSummary();
  }

  function updateSummary() {
    const sub = Basket.subtotal();
    const fee = Basket.count() ? DELIVERY_FEES[areaSel.value] || 0 : 0;
    document.getElementById("sumItems").textContent = Basket.count();
    document.getElementById("sumSubtotal").textContent = fmt(sub);
    document.getElementById("sumDelivery").textContent = areaSel.value ? fmt(fee) : "Select area";
    document.getElementById("sumTotal").textContent = fmt(sub + fee);
    placeBtn.disabled = Basket.count() === 0;
  }

  itemsEl.addEventListener("click", (e) => {
    const t = e.target;
    const items = Basket.get();
    if (t.dataset.remove) { Basket.remove(+t.dataset.remove); showToast("Item removed"); }
    if (t.dataset.inc) { const l = items.find((i) => i.id === +t.dataset.inc); Basket.setQty(l.id, l.qty + 1); }
    if (t.dataset.dec) { const l = items.find((i) => i.id === +t.dataset.dec); Basket.setQty(l.id, l.qty - 1); }
    if (t.dataset.remove || t.dataset.inc || t.dataset.dec) renderBasket();
  });
  itemsEl.addEventListener("change", (e) => {
    if (e.target.dataset.qty) { Basket.setQty(+e.target.dataset.qty, parseInt(e.target.value) || 1); renderBasket(); }
  });
  areaSel.addEventListener("change", updateSummary);

  /* ---------- Validation ---------- */
  const rules = {
    name: (v) => !v.trim() ? "Please enter your full name" : !/^[A-Za-z\s'.-]{3,80}$/.test(v.trim()) ? "Name should contain letters only (min 3)" : "",
    phone: (v) => !v.trim() ? "Please enter your phone number" : !/^(\+256|0)7\d{8}$/.test(v.replace(/\s/g, "")) ? "Enter a valid Ugandan number e.g. 0772123456" : "",
    email: (v) => v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Enter a valid email address" : "",
    area: (v) => !v ? "Please select a delivery area" : "",
    address: (v) => v.trim().length < 5 ? "Please enter a clear address or landmark" : "",
    date: (v) => !v ? "Choose a delivery date" : v < today ? "Date cannot be in the past" : "",
    time: (v) => !v ? "Choose a time slot" : ""
  };

  function validateField(name) {
    const input = form.elements[name];
    const msg = rules[name](input.value);
    const field = input.closest(".field");
    field.classList.toggle("invalid", !!msg);
    field.querySelector(".error").textContent = msg;
    return !msg;
  }
  Object.keys(rules).forEach((n) => form.elements[n].addEventListener("blur", () => validateField(n)));

  placeBtn.addEventListener("click", () => {
    if (!Basket.count()) return showToast("Your basket is empty");
    const ok = Object.keys(rules).map(validateField).every(Boolean);
    if (!ok) {
      showToast("Please correct the highlighted fields");
      form.querySelector(".invalid input, .invalid select")?.focus();
      return;
    }
    const fd = new FormData(form);
    const items = Basket.get().map((i) => { const p = PRODUCTS.find((x) => x.id === i.id); return { name: p.name, unit: p.unit, price: p.price, qty: i.qty }; });
    const subtotal = Basket.subtotal();
    const fee = DELIVERY_FEES[fd.get("area")];
    const order = {
      id: "KFF-" + Date.now().toString().slice(-6),
      placedAt: Date.now(),
      customer: { name: fd.get("name").trim(), phone: fd.get("phone").trim(), email: fd.get("email").trim(), area: fd.get("area"), address: fd.get("address").trim(), date: fd.get("date"), time: fd.get("time"), payment: fd.get("payment"), notes: fd.get("notes").trim() },
      items, subtotal, fee, total: subtotal + fee
    };
    localStorage.setItem("kffd_last_order", JSON.stringify(order));
    Basket.clear();
    location.href = "tracking.html";
  });

  renderBasket();
})();
