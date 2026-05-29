# Development guide

How to work on this project locally. For first-time setup, see `README.md`.

## Running locally

**Frontend (guest mode — no AWS):**

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

**Backend (cloud mode — needs backend/.env):**

```bash
cd backend
deno task dev      # http://localhost:8000, auto-reloads on save
```

The backend reads `.env` via the `--env-file` flag in `deno.json`. Deno does
not load `.env` automatically, so that flag is required.

## Switching between guest and cloud mode

The mode is decided by whether `frontend/.env` has Cognito values:

- **Cloud mode:** `frontend/.env` is filled → login form appears.
- **Guest-only mode:** no `frontend/.env` → only the "Start using the app"
  button appears.

To test the guest-only experience while you have a real `.env`, temporarily
rename it and restart Vite (it only reads env at startup):

```bash
cd frontend
mv .env .env.cloud     # hide it
npm run dev            # now guest-only
# ...later...
mv .env.cloud .env     # restore cloud mode
npm run dev
```

## Code conventions

- **Screens** live in `frontend/src/screens/`. Each exports a `render…(app, …)`
  function that writes into the `#app` element and wires up event handlers.
  Imports from there use `../` to reach `src/` (e.g. `../config.ts`).
- **`main.ts`** is the only router. It owns the active `Storage` instance and
  the navigation between screens.
- **Storage** changes go through the `Storage` interface in
  `frontend/src/storage/types.ts`. Don't let screens talk to IndexedDB or the
  API directly.
- **Backend logic** that can be unit-tested (validation, token parsing) lives in
  `backend/lib.ts`, separate from the AWS-touching code in `main.ts`.

## A hard-won tip: confirm edits landed

When pasting a file's contents, it's easy to paste into the wrong file or not
save. Before re-running after an edit, confirm the change is actually on disk:

```bash
grep -n "the thing you just added" path/to/file.ts
```

This catches "I edited it but nothing changed" before you spend time debugging
code that was never saved.

## Not yet implemented (good first additions)

These were intentionally left out to keep the project understandable. They're
natural next steps:

- **Automated tests.** Deno has a built-in test runner (`deno test`) for the
  backend; Vitest pairs with Vite for the frontend. Pure logic (the catalog,
  validation, token parsing) is the easiest and most valuable to test.
- **CI/CD.** A GitHub Actions workflow could run lint + tests + build on every
  push. It needs no AWS credentials if it only exercises the guest/pure-logic
  paths.
- **In-app session persistence** so refresh doesn't log you out.
- **Tighter IAM permissions** for any non-dev deployment.
