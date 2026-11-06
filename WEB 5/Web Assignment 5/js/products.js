/* Products page: search, filter, sort */
(function () {
  const state = { cat: "All", q: "", source: "All", stock: "all", sort: "default" };
  const grid = document.getElementById("productGrid");
  const info = document.getElementById("resultsInfo");

  // Allow ?q= search from links
  const params = new URLSearchParams(location.search);
  if (params.get("q")) { state.q = params.get("q"); document.getElementById("searchInput").value = state.q; }

  function render() {
    let list = PRODUCTS.filter((p) =>
      (state.cat === "All" || p.category === state.cat) &&
      (state.source === "All" || p.source === state.source) &&
      (state.stock === "all" || p.stock > 0) &&
      (p.name + " " + p.desc + " " + p.source).toLowerCase().includes(state.q.toLowerCase().trim())
    );
    if (state.sort === "low") list.sort((a, b) => a.price - b.price);
    if (state.sort === "high") list.sort((a, b) => b.price - a.price);
    if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));

    info.textContent = `Showing ${list.length} of ${PRODUCTS.length} products`;
    grid.innerHTML = list.length
      ? list.map(productCard).join("")
      : '<div class="empty" style="grid-column:1/-1"><h3>No fish match your search</h3><p>Try a different keyword or clear the filters.</p></div>';
  }

  document.getElementById("categoryChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.cat = chip.dataset.cat;
    render();
  });
  document.getElementById("searchInput").addEventListener("input", (e) => { state.q = e.target.value; render(); });
  document.getElementById("sourceFilter").addEventListener("change", (e) => { state.source = e.target.value; render(); });
  document.getElementById("stockFilter").addEventListener("change", (e) => { state.stock = e.target.value; render(); });
  document.getElementById("sortSelect").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

  render();
})();
