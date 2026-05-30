import { allCategories } from "../observations.ts";
import type { Observation, Storage } from "../storage/types.ts";

export function renderViewRecords(
  app: HTMLElement,
  storage: Storage,
  onBack: () => void,
) {
  app.innerHTML = `
    <div class="card">
      <h2>📋 Your records</h2>
      <label>Filter by category</label>
      <select id="filter">
        <option value="">All categories</option>
        ${allCategories()
          .map((c) => `<option value="${c}">${c}</option>`)
          .join("")}
      </select>
      <div id="list" style="margin-top:18px"><p class="empty">Loading…</p></div>
    </div>
    <button class="btn-ghost" id="back">← Back to menu</button>
  `;

  const filter = app.querySelector<HTMLSelectElement>("#filter")!;
  const list = app.querySelector<HTMLDivElement>("#list")!;
  app.querySelector("#back")?.addEventListener("click", onBack);

  async function load() {
    list.innerHTML = `<p class="empty">Loading…</p>`;
    let items: Observation[];
    try {
      items = await storage.list(filter.value || undefined);
    } catch (e) {
      list.innerHTML = `<p class="error">${(e as Error).message}</p>`;
      return;
    }
    if (items.length === 0) {
      list.innerHTML = `<p class="empty">No records yet. Add your first observation!</p>`;
      return;
    }
    list.innerHTML = items
      .map(
        (o) => `
      <div class="record" data-id="${o.observationId}">
        <div>
          <div class="r-name">${o.name}</div>
          <div class="r-meta">${o.category} · ${new Date(o.createdAt).toLocaleString()}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="r-value">${o.amount} <span style="font-size:.8rem;color:var(--ink-soft)">${o.unit}</span></span>
          <button class="btn-danger" data-del="${o.observationId}">Delete</button>
        </div>
      </div>
    `,
      )
      .join("");

    list.querySelectorAll<HTMLButtonElement>("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.del!;
        if (!confirm("Delete this record? This can't be undone.")) return;
        await storage.remove(id);
        load();
      });
    });
  }
  filter.addEventListener("change", load);
  load();
}
