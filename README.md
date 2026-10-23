# Citystar Hardware

A simple, large-button business app for a small hardware and utensils shop in Gujarat, India.
Android-first (via Capacitor), also works in desktop browsers. English and ગુજરાતી supported.

> **Status:** the home dashboard, language switching, local database, the **Inventory
> (products) screen**, the basic **Sales** and **Purchase** screens and **Customer credit &
> payments** are implemented (not yet tested on a real phone). Reports is still a placeholder
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
  stockRepository.ts        getStockQuantities, setStockQuantity (stock entry)
  saleRepository.ts         createSale (sale + stock reduction in ONE transaction), recent sales
  purchaseRepository.ts     createPurchase (purchase + stock increase + price update in ONE transaction)
  customerRepository.ts     customers, balances, recordPayment (balance check + save in ONE transaction)
  testRecordRepository.ts   Example create/list/update/delete/mark-synced functions
```

Current schema (`DB_VERSION = 5`):

| Table          | Purpose                                              | Added in |
| -------------- | ---------------------------------------------------- | -------- |
| `testRecords`  | Example only, safe to delete later                   | v1       |
| `products`     | Product details: name, category, unit, prices        | v2       |
| `stockLevels`  | Current stock per product (separate from products)   | v2       |
| `sales`        | One row per saved sale (customer, total, time)       | v3       |
| `saleItems`    | Lines of a sale (name, unit, price, quantity copied) | v3       |
| `purchases`    | One row per saved purchase (supplier, total, time)   | v4       |
| `purchaseItems`| Lines of a purchase (name, unit, price, quantity)    | v4       |
| `customers`    | Saved customers (name, phone, notes)                 | v5       |
| `payments`     | Money received from a customer against their balance | v5       |

v5 also adds an index on `sales.customerId` and two optional fields on sales (`customerId`,
`isCredit`). Existing sales are not rewritten.
Upgrading from an older version is automatic and keeps existing data.

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
- **Stock is kept in its own table (`stockLevels`).** A product with no stock row shows
  "Not recorded yet", not 0, and cannot be sold.
- **Entering stock:** press **Enter Stock** (or **Change Stock** once recorded) on a product
  card, type how many are in the shop now, and press **Save Stock**. 0 is allowed. The quantity
  can't be negative, up to 3 decimals; piece, box, pair and set accept whole numbers only.
  The rules are enforced in the database layer (`setStockQuantity`), not only on screen.
  Saving **replaces** the quantity with what you typed (it is a count, not "add to stock"), never
  changes prices or product details, and is available to the Sales screen straight away.
  If a sale was saved after you opened the stock screen, re-open it to see the latest number.
- Stock changes in three places: `setStockQuantity` (stock entry), `createSale` (reduces it) and
  `createPurchase` (increases it).
  A saved purchase also adds stock (see below).
- The phone's Back button returns from Inventory to the dashboard. Inside the add/edit form it
  also leaves the Inventory screen, so unsaved text is lost; use the on-screen Cancel/Back buttons.
- Products cannot be deleted yet. Deleting needs a sync-safe design (soft delete) first.

Code: `src/pages/InventoryPage.tsx` and `src/features/inventory/`.

## Sales module

Open **Sales** from the dashboard, press **New Sale**, search a product, tap it, type the
quantity, and press **Save Sale**. Customer name and phone are optional.

- Price comes from the product's selling price; line totals and the grand total update as you type.
- Quantity must be above 0 (up to 3 decimals). Piece, box, pair and set accept whole numbers only.
- A sale cannot exceed the stock on hand, and stock can never go below 0. A product with no
  stock row, no stock or no selling price is shown greyed out and cannot be added.
- Saving writes the sale, its lines and the stock reduction in **one database transaction**.
  If anything fails, nothing is saved and stock is unchanged. The database re-checks price and
  stock inside the transaction, so a stale screen cannot oversell.
- Each sale line keeps a copy of the product name, unit and price, so later product edits do
  not change old sales. Sales are marked `pending` for future sync.
- Not included: payments, discounts, tax/GST, printing bills, editing or cancelling a saved
  sale, and customer records.
- Leaving the New Sale screen (including the phone's Back button) discards the unsaved sale.

Code: `src/pages/SalesPage.tsx`, `src/features/sales/`, `src/db/saleRepository.ts`.

## Purchase module

Open **Purchase** from the dashboard, press **New Purchase**, search a product, tap it, type the
quantity bought and the purchase price per unit, and press **Save Purchase**. Supplier name and
phone are optional free text (there are no supplier records).

- The price box starts with the product's usual purchase price (empty if none). You can change
  it for this purchase. Line totals and the grand total update as you type.
- Quantity must be above 0 with up to 3 decimals; piece, box, pair and set accept whole numbers
  only. Price must be 0 or more (never negative) with up to 2 decimals.
- Saving writes the purchase, its lines, the stock increases and any product price updates in
  **one database transaction**. The database re-checks every rule inside the transaction; if
  anything fails, nothing is saved and stock and prices are unchanged.
- **Stock:** added to the product's stock. A product with no stock recorded is treated as 0, so
  buying 10 gives stock 10 (the same rule Sales uses). Count existing stock first with
  **Enter Stock** if the shop already holds some.
- **Product purchase price:** after saving, the product's purchase price becomes the price you
  entered (latest price paid), unless it is already the same or you entered 0 (a free sample does
  not change the price). **The selling price is never changed.**
- The same product can only appear once in a purchase.
- Each purchase line keeps a copy of the product name, unit and price, so later product edits do
  not change old purchases. Purchases are marked `pending` for future sync.
- Not included: payments, supplier accounts, GST/tax, returns, editing or cancelling a saved
  purchase.
- Leaving the New Purchase screen (including the phone's Back button) discards the unsaved purchase.

Code: `src/pages/PurchasePage.tsx`, `src/features/purchases/`, `src/db/purchaseRepository.ts`.

## Customer credit & payments

Open **Customers** from the dashboard. **Add Customer** takes a name (required), phone (optional)
and notes (optional). Tap a customer to see their totals, credit sales and payment history, and to
**Record Payment**.

- **Credit sales:** in **New Sale**, choose a saved customer. The sale is then a **CREDIT SALE**
  by default (a yellow note and a CREDIT tag say so) and its total is added to the customer's
  balance. Choose **Paid in cash** instead and the sale is linked to the customer but not added
  to the balance. A sale with no saved customer (including one with only a typed name) never
  counts toward any balance.
- **Balance = credit sales - payments received.** It is always calculated from the saved sales
  and payments, never stored, so it cannot drift out of step.
- **Payments:** amount (above 0, up to 2 decimals), date (today or earlier) and optional notes.
  A payment larger than the balance due is rejected. The check and the save happen in **one
  database transaction**, so two payments saved at the same moment cannot together exceed the
  balance. Money is added up in paise to avoid rounding errors.
- **Existing data:** sales saved before this version have no customer link and are **not**
  counted for anyone; no historical balances were invented. A customer's balance starts at 0 and
  only grows from credit sales saved after you pick the customer in New Sale.
- Not included: editing or deleting customers, editing or cancelling payments or credit sales,
  payment methods, interest, reminders (SMS/WhatsApp), invoices, and supplier accounts.
- Leaving a form (including the phone's Back button) discards unsaved input.

Code: `src/pages/CustomersPage.tsx`, `src/features/customers/`, `src/db/customerRepository.ts`
(plus the optional customer in `createSale`, `src/db/saleRepository.ts`).

## Reports (daily summary)

Open **Reports** from the dashboard. It shows **today** by default; use the date box (or the
**Today** button) to look at an earlier day. This is a **basic operational summary, not an
accounting or tax report.** It only reads data: it never changes sales, purchases, payments or stock.

- **Shown separately:** total sales, cash sales, credit sales, total purchases, customer payments
  collected, and the number of sales and purchases, plus a list of that day's sales and purchases
  with times and totals.
- **Cash vs credit:** credit = a sale linked to a saved customer and marked credit. **Every other
  sale counts as cash**, including older sales saved before credit existed. Cash + credit = total.
- **Payments are not sales.** A payment is counted on the day it was *received* (its payment
  date) and is never added to sales or profit.
- **Customers owe you:** the total of current customer balances (from the Customers module). It is
  the balance *right now*, whichever date you pick.
- **Day boundaries** use the phone's local midnight.

**Estimated gross profit - assumptions**

- Profit = selling price - cost, for items sold that day. Cost of an item = the unit price on the
  **most recent recorded Purchase** of that product made at or before the sale. The product's
  "purchase price" field and opening stock are **not** used, because they are not real purchase records.
- Items with no such purchase are **left out and listed by name**. The page then says
  **INCOMPLETE** (some costs known) or **unavailable** (none known). Costs are never guessed, and an
  incomplete figure is never shown as the full profit.
- Profit counts when the item is sold, so a credit sale counts on its sale day, not when paid.
- Not included: expenses, discounts, returns, tax, wastage, or exact stock-batch costing.
- No database change (schema stays at version 5).

Code: `src/pages/ReportsPage.tsx`, `src/features/reports/`, `src/db/reportRepository.ts`.

## Backup (export only)

On the dashboard, the **Backup** section has a large **Backup Now** button. It saves one JSON file
named like `citystar-hardware-backup-2026-10-22-2155.json` (device date and time).

- **Contains:** all eight business tables (products, stock, sales, sale items, purchases, purchase
  items, customers, payments) with their IDs and timestamps, plus the database version, the backup
  time, record counts per table, and a **SHA-256 checksum** of the data. The old test table is not included.
- **Read-only:** it reads everything in one snapshot and changes no shop data. Only a note of the
  last backup time is kept on the device.
- **Empty database:** no file is made; the app says there is no data yet.
- **Where the file goes:** the phone or browser decides (usually Downloads). If the device supports
  sharing files, a **Send Backup File** button also appears so it can go to WhatsApp or Drive.
- **Integrity:** `verifyBackupText()` (in `src/db/backupRepository.ts`) checks the format, counts and
  checksum of a backup file. Nothing uses it in the app yet.
- **Not included yet:** restore, cloud sync, automatic or scheduled backups, encryption.
- **Not verified:** the download and share buttons have not been tried in a real browser or on
  Android. Inside the Android app's WebView, ordinary downloads may not work; the Android step may
  need Capacitor's Filesystem and Share plugins.

Code: `src/db/backupRepository.ts`, `src/db/sha256.ts`, `src/features/backup/`.

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
  pages/SalesPage.tsx      Sales home: New Sale button and recent sales
  features/sales/          New sale form, validation helpers
  pages/PurchasePage.tsx   Purchase home: New Purchase button and recent purchases
  features/purchases/      New purchase form, validation helpers
  pages/CustomersPage.tsx  Customer list, add customer, customer detail, record payment
  features/customers/      Customer form, payment form, detail view, validation helpers
  pages/ReportsPage.tsx    Daily report with date picker and profit summary
  features/reports/        Report loading hook
  features/backup/         Backup Now card and file saving
  features/inventory/      Product form, stock form, card, validation helpers, loading hook
  components/              LanguageSelector, NavCard, SummaryCard, NotReadyDialog, Icons
  i18n/translations.ts     All English + Gujarati text (add new text here)
  i18n/LanguageContext.tsx Language state, saved on the device
  features/dashboard/      Real dashboard summary figures (read-only)
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
