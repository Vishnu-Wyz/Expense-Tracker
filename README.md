# Expense Tracker

A mobile-friendly expense tracker you can host for free on GitHub Pages. Record daily spending, see which categories and payment methods (cash, online, card) the money goes to, set budgets, and read clear reports.

## Features

**Overview**
- This month's spending, with a budget progress bar and how much you can spend per day for the rest of the month
- Today, this week, daily average, and a comparison with the same point last month
- Last 7 days chart, the cash / online / card split, top categories, and your latest entries

**Adding expenses**
- Tap the **＋** button (or press `N` on a computer)
- Enter the amount, then tap a category tile and a payment method
- Quick **Today** / **Yesterday** date buttons, an optional description and notes
- **Save & add another** lets you enter several expenses in a row
- Tap any expense to edit or delete it

**Payment methods**: UPI, Net Banking and Wallet (grouped as *Online*), Debit Card and Credit Card (grouped as *Card*), and Cash.

**Categories & budgets**
- 17 built-in categories (food, groceries, transport, fuel, rent, bills, EMI, subscriptions and more)
- Add your own categories with any emoji and colour; rename or delete existing ones
- An overall monthly budget, plus optional budgets per category, with progress bars and warnings

**Transactions**
- Search, and filter by period, category, payment method or payment type
- Sort by date or amount; entries are grouped by day with a total for each day

**Reports**
- Periods: this month, last month, 3 months, this year, all time, or a custom date range
- Totals compared with the same stretch of the previous period
- Automatic insights: biggest category, fastest-growing category, busiest weekday, small purchases that add up, month-end projection, categories over budget
- Category donut chart and a breakdown table (share, number of transactions, change)
- Cash vs Online vs Card split, and a table for each payment method
- A category × payment-type table
- Daily or monthly trend, spending by day of week, largest expenses, and a 12-month comparison against your budget
- Export the selected period as CSV, or print it / save it as a PDF

**Settings**
- Light, dark, or match your system
- Download a backup (JSON) and restore it on another device
- Export everything as CSV
- Load sample data to preview the reports, and remove it again with one tap

## Your data

Everything is stored in your browser's local storage on that device. Nothing is sent to a server.

- Data on your phone and data on your laptop are separate. To move data between them, use **Settings → Download backup** and **Restore from backup**.
- Clearing your browser's site data deletes your expenses, so download a backup now and then.

## Deploy to GitHub Pages

1. Create a new **public** repository on GitHub (for example `expense-tracker`).
2. Push these files to it:

   ```bash
   git init
   git add index.html styles.css app.js manifest.webmanifest icon.svg README.md
   git commit -m "Expense tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/expense-tracker.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages**, set **Source** to *Deploy from a branch*, choose **main** and **/ (root)**, then save.
4. After a minute or two the app is live at `https://<your-username>.github.io/expense-tracker/`.

**On your phone:** open that link, then use *Add to Home Screen* (Safari's Share menu, or Chrome's ⋮ menu). The app then opens full-screen like a regular app.

## Run it locally

Browsers block local storage for pages opened directly from a file, so serve the folder instead:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page layout |
| `styles.css` | Styles, including dark mode and the mobile layout |
| `app.js` | App logic, reports, and charts |
| `manifest.webmanifest`, `icon.svg` | Home-screen app name and icon |

Charts use [Chart.js](https://www.chartjs.org/), loaded from a CDN, so the device needs an internet connection the first time it opens the app.
