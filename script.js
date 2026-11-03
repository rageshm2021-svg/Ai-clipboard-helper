/* PromptVault – vanilla JS. Data is stored in your browser's localStorage. */
(() => {
  "use strict";

  const STORAGE_KEY = "promptvault.items.v1";
  const THEME_KEY = "promptvault.theme";

  // Starter cards shown the first time the app opens
  const SAMPLES = [
    { title: "Explain like I'm five", category: "Learning", content: "Explain [topic] as if I were five years old. Use a simple everyday analogy and keep it under 120 words." },
    { title: "Polish my email", category: "Writing", content: "Rewrite the email below so it is clear, friendly and professional. Keep it short and keep my meaning.\n\n[paste email]" },
    { title: "Code review buddy", category: "Coding", content: "Review this code for bugs, readability and performance. List issues by priority and suggest a fix for each.\n\n[paste code]" },
    { title: "Meeting recap", category: "Work", content: "Turn these notes into a recap with: 1) decisions made, 2) action items with owners, 3) open questions.\n\n[paste notes]" },
  ];

  const $ = (sel) => document.querySelector(sel);
  const grid = $("#grid"), chips = $("#chips"), countEl = $("#count"), emptyEl = $("#empty");
  const dialog = $("#dialog"), form = $("#form"), toastEl = $("#toast");
  const fTitle = $("#fTitle"), fCategory = $("#fCategory"), fContent = $("#fContent");

  let items = loadItems();
  let activeCategory = "All";
  let query = "";
  let editingId = null;
  let firstRender = true;
  let toastTimer;

  /* ---------- Storage ---------- */
  function loadItems() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (e) { /* ignore corrupted data */ }
    return SAMPLES.map((s, i) => ({ ...s, id: uid() + i }));
  }
  function saveItems() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch (e) { toast("Could not save – browser storage is unavailable."); }
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- Helpers ---------- */
  // Gives every category its own consistent color
  function hueFor(text) {
    let h = 0;
    for (const ch of text.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
  }
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // Fallback for older browsers / non-secure pages
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  /* ---------- Rendering ---------- */
  function categories() {
    return [...new Set(items.map((i) => i.category))].sort((a, b) => a.localeCompare(b));
  }

  function renderChips() {
    const cats = ["All", ...categories()];
    if (!cats.includes(activeCategory)) activeCategory = "All";
    chips.replaceChildren(...cats.map((cat) => {
      const b = el("button", "chip", cat);
      b.type = "button";
      b.dataset.cat = cat;
      b.setAttribute("aria-pressed", String(cat === activeCategory));
      return b;
    }));
    $("#catList").replaceChildren(...categories().map((c) => { const o = el("option"); o.value = c; return o; }));
  }

  function buildCard(item, index, animation) {
    const card = el("article", "card " + animation);
    card.dataset.id = item.id;
    card.style.setProperty("--hue", hueFor(item.category));
    if (animation === "intro") card.style.animationDelay = Math.min(index, 8) * 50 + "ms";

    const head = el("div", "card-head");
    head.append(el("h3", "", item.title), el("span", "badge", item.category));

    const foot = el("div", "card-foot");
    const copy = el("button", "copy");
    copy.type = "button"; copy.dataset.action = "copy";
    copy.append(el("span", "", "Copy to clipboard"));
    const edit = el("button", "mini", "Edit");
    edit.type = "button"; edit.dataset.action = "edit";
    const del = el("button", "mini danger", "Delete");
    del.type = "button"; del.dataset.action = "delete";
    foot.append(copy, edit, del);

    card.append(head, el("p", "card-text", item.content), foot);
    return card;
  }

  function render(newId) {
    renderChips();
    const q = query.trim().toLowerCase();
    const visible = items.filter((i) =>
      (activeCategory === "All" || i.category === activeCategory) &&
      (!q || (i.title + " " + i.content + " " + i.category).toLowerCase().includes(q)));

    grid.replaceChildren(...visible.map((item, idx) =>
      buildCard(item, idx, firstRender ? "intro" : item.id === newId ? "pop" : "")));
    firstRender = false;

    emptyEl.hidden = visible.length > 0;
    countEl.textContent = items.length
      ? `Showing ${visible.length} of ${items.length} saved ${items.length === 1 ? "prompt" : "prompts"}`
      : "";
  }

  /* ---------- Dialog (add / edit) ---------- */
  function openDialog(item) {
    editingId = item ? item.id : null;
    $("#dialogTitle").textContent = item ? "Edit prompt" : "New prompt";
    fTitle.value = item ? item.title : "";
    fCategory.value = item ? item.category : (activeCategory !== "All" ? activeCategory : "");
    fContent.value = item ? item.content : "";
    $("#formError").hidden = true;
    dialog.showModal();
    fTitle.focus();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      title: fTitle.value.trim(),
      category: fCategory.value.trim(),
      content: fContent.value.trim(),
    };
    if (!data.title || !data.category || !data.content) {
      $("#formError").hidden = false;
      return;
    }
    let newId = null;
    if (editingId) {
      items = items.map((i) => (i.id === editingId ? { ...i, ...data } : i));
      toast("Prompt updated");
    } else {
      newId = uid();
      items.unshift({ id: newId, ...data });
      toast("Prompt saved");
    }
    saveItems();
    dialog.close();
    render(newId);
  });

  $("#addBtn").addEventListener("click", () => openDialog(null));
  $("#cancelBtn").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }); // click backdrop to close

  /* ---------- Card actions (event delegation) ---------- */
  grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const card = btn.closest(".card");
    const item = items.find((i) => i.id === card.dataset.id);
    if (!item) return;

    if (btn.dataset.action === "copy") {
      await copyText(item.content);
      const label = btn.querySelector("span");
      btn.classList.add("done");
      label.textContent = "Copied!";
      toast("Copied to clipboard");
      setTimeout(() => { btn.classList.remove("done"); label.textContent = "Copy to clipboard"; }, 1600);
    } else if (btn.dataset.action === "edit") {
      openDialog(item);
    } else if (btn.dataset.action === "delete") {
      if (!confirm(`Delete “${item.title}”?`)) return;
      card.classList.add("leaving");
      setTimeout(() => {
        items = items.filter((i) => i.id !== item.id);
        saveItems();
        render();
        toast("Prompt deleted");
      }, 250);
    }
  });

  /* ---------- Search & filter ---------- */
  $("#search").addEventListener("input", (e) => { query = e.target.value; render(); });
  chips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    activeCategory = chip.dataset.cat;
    render();
  });

  /* ---------- Theme ---------- */
  function applyTheme(theme) { document.documentElement.dataset.theme = theme; }
  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  $("#themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  render();
})();
