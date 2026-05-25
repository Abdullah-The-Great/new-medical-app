import {
  OBSERVATION_TYPES,
  typeByName,
  categoryForName,
} from "../observations.ts";
import type { Storage } from "../storage/types.ts";

export function renderAddObservation(
  app: HTMLElement,
  storage: Storage,
  onDone: () => void,
) {
  const first = OBSERVATION_TYPES[0];

  app.innerHTML = `
    <div class="card">
      <h2>➕ Add observation</h2>
      <p class="subtitle">Pick what you measured — the unit comes from the system.</p>

      <label>Observation</label>
      <select id="name">
        ${OBSERVATION_TYPES.map((t) => `<option value="${t.name}">${t.name}</option>`).join("")}
      </select>

      <label>Category <span style="font-weight:400;color:var(--ink-soft)">(auto-selected)</span></label>
      <input id="category" readonly />

      <label>Unit</label>
      <div id="unit-wrap"></div>

      <label>Amount</label>
      <input id="amount" placeholder="${first.placeholder ?? ""}" />

      <div class="error" id="err"></div>
      <div class="row" style="margin-top:18px">
        <button class="btn-ghost" id="cancel">Cancel</button>
        <button class="btn-primary" id="save">Save</button>
      </div>
    </div>
  `;

  const nameSel = app.querySelector<HTMLSelectElement>("#name")!;
  const catInput = app.querySelector<HTMLInputElement>("#category")!;
  const unitWrap = app.querySelector<HTMLDivElement>("#unit-wrap")!;
  const amount = app.querySelector<HTMLInputElement>("#amount")!;
  const err = app.querySelector<HTMLDivElement>("#err")!;

  // Re-render unit control + auto-category whenever the observation changes.
  function refresh() {
    const t = typeByName(nameSel.value)!;
    catInput.value = categoryForName(t.name); // auto-select category
    amount.placeholder = t.placeholder ?? "";

    if (t.units.length > 1) {
      // multiple units -> dropdown
      unitWrap.innerHTML = `<select id="unit">
        ${t.units.map((u) => `<option value="${u}">${u}</option>`).join("")}
      </select>`;
    } else {
      // single unit -> system just shows it
      unitWrap.innerHTML = `<div><span class="unit-badge">${t.units[0]}</span></div>`;
    }
  }
  refresh();
  nameSel.addEventListener("change", refresh);

  app.querySelector("#cancel")?.addEventListener("click", onDone);

  app.querySelector("#save")?.addEventListener("click", async () => {
    err.textContent = "";
    const t = typeByName(nameSel.value)!;
    const unit =
      t.units.length > 1
        ? app.querySelector<HTMLSelectElement>("#unit")!.value
        : t.units[0];
    const value = amount.value.trim();
    if (!value) {
      err.textContent = "Please enter an amount.";
      return;
    }

    try {
      await storage.add({
        name: t.name,
        category: catInput.value,
        unit,
        amount: value,
      });
      onDone();
    } catch (e) {
      err.textContent = (e as Error).message;
    }
  });
}
