import "./style.css";
import { renderLogin } from "./screens/login.ts";
import { renderSignup } from "./screens/signup.ts";
import { renderMenu } from "./screens/menu.ts";
import { renderAddObservation } from "./screens/addObservation.ts";
import { renderViewRecords } from "./screens/viewRecords.ts";
import { LocalStorage } from "./storage/local.ts";
import { CloudStorage } from "./storage/cloud.ts";
import { getToken, clearToken } from "./auth.ts";
import { config } from "./config.ts";
import type { Storage } from "./storage/types.ts";

const app = document.querySelector<HTMLDivElement>("#app")!;

let storage: Storage | null = null;
let isGuest = false;

function showLogin() {
  storage = null;
  renderLogin(
    app,
    () => {
      isGuest = false;
      storage = new CloudStorage(config.apiBase, getToken);
      showMenu();
    },
    () => {
      isGuest = true;
      storage = new LocalStorage();
      showMenu();
    },
    showSignup,
  );
}

function showSignup() {
  renderSignup(
    app,
    () => {
      isGuest = false;
      storage = new CloudStorage(config.apiBase, getToken);
      showMenu();
    },
    showLogin,
  );
}

function showMenu() {
  renderMenu(
    app,
    isGuest,
    () => renderAddObservation(app, storage!, showMenu),
    () => renderViewRecords(app, storage!, showMenu),
    () => {
      clearToken();
      showLogin();
    },
  );
}

showLogin();
