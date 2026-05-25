import { cloudAvailable } from "../config.ts";

export function renderMenu(
  app: HTMLElement,
  isGuest: boolean,
  onAdd: () => void,
  onView: () => void,
  onLogout: () => void,
) {
  app.innerHTML = `
    <div class="card">
      <h1>🌿 Your Health</h1>
      <p class="subtitle">What would you like to do?</p>

      ${
        isGuest
          ? `
        <div class="notice">
          <strong>You're using the app without an account.</strong>
          Your records are saved only on this device and won't sync anywhere.
          Clearing your browser data will remove them.
        </div>
      `
          : ``
      }

      <button class="menu-tile" id="add">
        <span class="emoji">➕</span>
        <span><span class="label">Add observation</span><br>
        <span class="desc">Record a new measurement</span></span>
      </button>

      <button class="menu-tile" id="view">
        <span class="emoji">📋</span>
        <span><span class="label">View records</span><br>
        <span class="desc">Browse and filter what you've saved</span></span>
      </button>
    </div>

    <button class="btn-ghost" id="logout">
      ${isGuest ? "Back to start" : "Log out"}
    </button>
  `;

  app.querySelector("#add")?.addEventListener("click", onAdd);
  app.querySelector("#view")?.addEventListener("click", onView);
  app.querySelector("#logout")?.addEventListener("click", onLogout);
}
