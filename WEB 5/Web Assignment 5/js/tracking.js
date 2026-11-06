/* Order confirmation & simulated delivery tracking */
(function () {
  const root = document.getElementById("trackingRoot");
  const order = JSON.parse(localStorage.getItem("kffd_last_order") || "null");

  if (!order) {
    root.innerHTML = '<div class="empty"><h3>No recent order found</h3><p>Place an order to see your confirmation and track delivery.</p><a href="products.html" class="btn btn-primary" style="margin-top:14px">Order Fresh Fish</a></div>';
    return;
  }

  const STAGES = [
    { icon: "✓", title: "Order received", text: "We have received your order." },
    { icon: "🎣", title: "Sourcing at landing site", text: "Fresh fish selected from our suppliers." },
    { icon: "🧊", title: "Cleaned & packed on ice", text: "Your fish is cleaned, weighed and iced." },
    { icon: "🛵", title: "Out for delivery", text: `Rider on the way to ${order.customer.area}.` },
    { icon: "🏠", title: "Delivered", text: "Enjoy your fresh fish!" }
  ];
  const STEP_SECONDS = 8; // simulated time between stages

  const c = order.customer;
  root.innerHTML = `
    <div class="checkout">
      <div class="panel">
        <div class="confirm-head">
          <div class="check-icon">✓</div>
          <h2>Thank you, ${escapeHtml(c.name.split(" ")[0])}!</h2>
          <p style="color:var(--muted)">Your order has been placed successfully.</p>
          <span class="order-id">Order ${order.id}</span>
        </div>
        <h3 style="margin:30px 0 10px">Delivery tracking</h3>
        <div class="progress"><div class="progress-bar" id="bar"></div></div>
        <p id="eta" style="color:var(--muted);font-size:.9rem;margin-bottom:16px"></p>
        <ul class="tracker" id="tracker">
          ${STAGES.map((s) => `<li><span class="dot">${s.icon}</span><strong>${s.title}</strong><small>${s.text}</small></li>`).join("")}
        </ul>
      </div>
      <aside class="panel">
        <h2>Order details</h2>
        ${order.items.map((i) => `<div class="summary-row"><span>${i.name} × ${i.qty}</span><span>${fmt(i.price * i.qty)}</span></div>`).join("")}
        <div class="summary-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
        <div class="summary-row"><span>Delivery (${escapeHtml(c.area)})</span><span>${fmt(order.fee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${fmt(order.total)}</span></div>
        <h3 style="margin:24px 0 10px;font-size:1.1rem">Deliver to</h3>
        <p style="color:var(--muted);font-size:.92rem">
          ${escapeHtml(c.name)}<br>📞 ${escapeHtml(c.phone)}<br>📍 ${escapeHtml(c.address)}, ${escapeHtml(c.area)}<br>
          📅 ${c.date} · ${c.time}<br>💳 ${c.payment}
        </p>
        <a href="products.html" class="btn btn-dark btn-block" style="margin-top:20px">Order again</a>
      </aside>
    </div>`;

  const items = document.querySelectorAll("#tracker li");
  function tick() {
    const elapsed = (Date.now() - order.placedAt) / 1000;
    const stage = Math.min(STAGES.length - 1, Math.floor(elapsed / STEP_SECONDS));
    items.forEach((li, i) => {
      li.classList.toggle("done", i < stage || stage === STAGES.length - 1);
      li.classList.toggle("current", i === stage && stage < STAGES.length - 1);
    });
    document.getElementById("bar").style.width = (stage / (STAGES.length - 1)) * 100 + "%";
    const left = Math.max(0, (STAGES.length - 1) * STEP_SECONDS - elapsed);
    document.getElementById("eta").textContent = stage === STAGES.length - 1
      ? "✅ Your order has been delivered."
      : `Current status: ${STAGES[stage].title} · estimated arrival in ${Math.ceil(left)}s (simulation)`;
    if (stage < STAGES.length - 1) setTimeout(tick, 1000);
  }
  tick();

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])); }
})();
