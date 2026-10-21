# Citystar Hardware

A simple, large-button business app for a small hardware and utensils shop in Gujarat, India.
Android-first (via Capacitor), also works in desktop browsers. English and ગુજરાતી supported.

> **Status:** the home dashboard, language switching, local database and the **Inventory
> (products) screen** are implemented (not yet tested on a real phone). Sales, Purchase, Customers and Reports are still placeholders
> (tapping them shows a "not ready yet" message). The summary numbers on the dashboard
> are **demo data**; products you add in Inventory are real records stored on the device.

## Tech

- React 18 + TypeScript + Vite
- Capacitor 6 (configured, Android platform **not added yet**)
- No UI framework, no router, no backend. Only extra package: `@fontsource/noto-sans-gujarati`
  (bundled font so Gujarati looks right on every device, including offline).

## Local database (offline storage)

Data is stored on the device with **Dexie**, a small wrapper around the browser's built-in
IndexedDB. The same code is meant to run in desktop browsers and inside the Android app
(Capacitor runs the app in an Android WebView, which has IndexedDB). No native plugin is needed.

Setup: nothing extra. `npm install` installs Dexie and the database is created automatically
the first time it is used.

```
src/db/
  index.ts                  Import everything from here: import { ... } from '../db'
  database.ts               Database class, DB_VERSION, table definitions, initDatabase()
  types.ts                  BaseRecord (id, createdAt, updatedAt, syncStatus) + example TestRecord
  ids.ts                    newId() (UUID v4) and nowIso() (UTC timestamp)
  productRepository.ts      listProducts, createProduct, updateProduct
  stockRepository.ts        getStockQuantities (read-only for now)
  testRecordRepository.ts   Example create/list/update/delete/mark-synced functions
```

Current schema (`DB_VERSION = 2`):

| Table          | Purpose                                              | Added in |
| -------------- | ---------------------------------------------------- | -------- |
| `testRecords`  | Example only, safe to delete later                   | v1       |
| `products`     | Product details: name, category, unit, prices        | v2       |
| `stockLevels`  | Current stock per product (separate from products)   | v2       |

Upgrading from v1 to v2 is automatic and keeps existing data.

Rules for the data layer:

- Every record has a unique `id`, `createdAt`, `updatedAt` and `syncStatus`
  (`'pending'` = not yet uploaded, `'synced'` = matches the server). New and edited records are `pending`.
- Screens never use `db` directly. Each feature gets its own repository file (like
  `testRecordRepository.ts`) and screens call those functions.
- To change the structure later: raise `DB_VERSION`, add a new `this.version(n).stores({...})`
  block in `database.ts` and keep the old blocks. Dexie upgrades existing devices automatically.
- `TestRecord` / `testRecordRepository.ts` are examples only. Delete them when the first real table is added.
- The Inventory screen is the first feature to use the database (it calls `initDatabase()`
  when opened). There is no cloud sync yet.

Known limitations:

- IndexedDB data lives inside the app. Uninstalling the app or using Android's "Clear data"
  deletes it, so a backup/export feature will be needed before real business data is stored.
- Browsers and the Android WebView may delete storage when the phone is very low on space.
  `initDatabase()` asks for protected ("persistent") storage, but Android WebView may not grant it.
- Persistence inside the real Android app has not been tested yet; this must be checked on a
  device once the APK build exists.

## Inventory module

Open **Inventory** from the dashboard. You can add products, edit them, search by name or
category, and view the list (name, category, unit, purchase price, selling price, stock).

- A product has only: name (required), category, unit, purchase price, selling price.
  Prices are optional; leave empty if unknown. Units: piece, kg, metre, box, pair, set, litre, dozen.
- Product names must be unique (ignoring capital letters and extra spaces).
- Prices accept digits with up to 2 decimals (`250`, `99.50`). Gujarati digits (૨૫૦) also work.
- New and edited products are saved as `pending` (waiting for future sync). The product `id`
  and `createdAt` never change; `updatedAt` is refreshed on every edit.
- **Stock is kept in its own table (`stockLevels`) and nothing writes to it yet.** Every product
  therefore shows "Not recorded yet" for current stock, not 0. Stock will change only when
  Purchase / Sales / stock-adjustment features are built.
- The phone's Back button returns from Inventory to the dashboard. Inside the add/edit form it
  also leaves the Inventory screen, so unsaved text is lost; use the on-screen Cancel/Back buttons.
- Products cannot be deleted yet. Deleting needs a sync-safe design (soft delete) first.

Code: `src/pages/InventoryPage.tsx` and `src/features/inventory/`.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev        # opens a dev server; use the "Network" URL to test on your phone
npm run typecheck  # TypeScript check
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

## Push to GitHub

1. Create an empty repository on GitHub named `citystar-hardware` (no README, no .gitignore).
2. In this project folder:

```bash
git init
git add .
git commit -m "Initial project foundation"
git branch -M main
git remote add origin https://github.com/<your-username>/citystar-hardware.git
git push -u origin main
```

## Project structure

```
src/
  main.tsx                 App entry, fonts, language provider
  App.tsx                  Root component
  pages/Dashboard.tsx      Home screen
  pages/InventoryPage.tsx  Inventory list, search and add/edit
  features/inventory/      Product form, card, validation helpers, loading hook
  components/              LanguageSelector, NavCard, SummaryCard, NotReadyDialog, Icons
  i18n/translations.ts     All English + Gujarati text (add new text here)
  i18n/LanguageContext.tsx Language state, saved on the device
  data/demoData.ts         Demo-only sample numbers
  utils/formatCurrency.ts  Rupee formatting
  styles/global.css        Styling (large text, large buttons)
capacitor.config.ts        Android packaging config (change appId before `cap add android`)
```

## Adding text in both languages

Every visible string lives in `src/i18n/translations.ts`. The `Translations` type forces
English and Gujarati to have the same keys, so TypeScript reports an error if one is missing.

## Next steps (not done yet)

- Add the Android platform and a GitHub Actions workflow to build the APK
- Build the remaining features one at a time (Purchase and Sales will also change stock)
