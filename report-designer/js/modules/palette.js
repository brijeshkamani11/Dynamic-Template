/**
 * MCloud Report Template Designer — Field Palette Module
 * ──────────────────────────────────────────────────────
 * Builds the left-panel field list with drag & click-to-add support.
 * Depends on: state.js, field-registry.js, canvas.js (addFieldToFirstEmpty)
 */

function buildFieldPalette() {
  const list = document.getElementById("fieldList");
  list.innerHTML = "";

  const categories = [...new Set(FIELD_REGISTRY.map(f => f.category))];
  const searchVal  = (document.getElementById("fieldSearch").value || "").toLowerCase();

  categories.forEach(cat => {
    const fields = FIELD_REGISTRY.filter(f =>
      f.category === cat &&
      (f.label.toLowerCase().includes(searchVal) || f.defaultCaption.toLowerCase().includes(searchVal))
    );
    if (!fields.length) return;

    const catEl = document.createElement("div");
    catEl.className = "field-category";
    catEl.textContent = cat;
    list.appendChild(catEl);

    fields.forEach(f => {
      const el = document.createElement("div");
      el.className = "field-chip";
      el.draggable = true;
      el.dataset.fieldId = f.id;
      el.innerHTML = `<span class="chip-label">${f.label}</span><span class="chip-add">+</span>`;

      el.addEventListener("dragstart", e => {
        _dragFieldId = f.id;
        el.classList.add("dragging");
        e.dataTransfer.effectAllowed = "copy";
      });
      el.addEventListener("dragend", () => {
        _dragFieldId = null;
        el.classList.remove("dragging");
      });
      el.querySelector(".chip-add").addEventListener("click", () => {
        addFieldToFirstEmpty(f.id);
      });
      list.appendChild(el);
    });
  });
}

function buildIndicatorFieldSelect() {
  const sel = document.getElementById("indicatorField");
  sel.innerHTML = '<option value="">— pick field —</option>';
  FIELD_REGISTRY.filter(f => f.category === "Account" || f.label.toLowerCase().includes("amount") || f.label.toLowerCase().includes("balance"))
    .forEach(f => {
      sel.innerHTML += `<option value="${f.dataField}">${f.label}</option>`;
    });
}

function bindFieldSearch() {
  document.getElementById("fieldSearch").addEventListener("input", buildFieldPalette);
}
