'use strict';

/* ============ Constants ============ */
const SWATCHES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948', '#0891b2', '#64748b'];

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#eb6834' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#008300' },
  { id: 'transport', name: 'Transport', icon: '🚕', color: '#2a78d6' },
  { id: 'fuel', name: 'Fuel', icon: '⛽', color: '#0891b2' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#e87ba4' },
  { id: 'utilities', name: 'Bills & Utilities', icon: '💡', color: '#eda100' },
  { id: 'rent', name: 'Rent & Housing', icon: '🏠', color: '#4a3aa7' },
  { id: 'healthcare', name: 'Health & Medical', icon: '💊', color: '#e34948' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#e87ba4' },
  { id: 'subscriptions', name: 'Subscriptions', icon: '📺', color: '#4a3aa7' },
  { id: 'education', name: 'Education', icon: '📚', color: '#1baf7a' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#0891b2' },
  { id: 'personal', name: 'Personal Care', icon: '💇', color: '#e87ba4' },
  { id: 'family', name: 'Family & Kids', icon: '👨‍👩‍👧', color: '#1baf7a' },
  { id: 'gifts', name: 'Gifts & Donations', icon: '🎁', color: '#e34948' },
  { id: 'emi', name: 'EMI & Loans', icon: '🏦', color: '#2a78d6' },
  { id: 'other', name: 'Other', icon: '📌', color: '#64748b' },
];

const MODES = [
  { id: 'upi', name: 'UPI', icon: '📲', group: 'online' },
  { id: 'card', name: 'Debit Card', icon: '💳', group: 'card' },
  { id: 'credit', name: 'Credit Card', icon: '💳', group: 'card' },
  { id: 'cash', name: 'Cash', icon: '💵', group: 'cash' },
  { id: 'netbanking', name: 'Net Banking', icon: '🏛️', group: 'online' },
  { id: 'wallet', name: 'Wallet', icon: '👛', group: 'online' },
];

const GROUPS = [
  { id: 'online', name: 'Online', icon: '📲', color: 'var(--g-online)', cssVar: '--g-online', hint: 'UPI, net banking, wallets' },
  { id: 'card', name: 'Card', icon: '💳', color: 'var(--g-card)', cssVar: '--g-card', hint: 'Debit & credit cards' },
  { id: 'cash', name: 'Cash', icon: '💵', color: 'var(--g-cash)', cssVar: '--g-cash', hint: 'Paid in cash' },
];

const EMOJI_SUGGESTIONS = ['🐶', '🍺', '☕', '🎮', '🏋️', '🚗', '🧾', '📱', '🧸', '💼', '🏥', '🎓', '🌱', '🔧', '💍', '🙏'];

const PERIOD_LABELS = {
  'this-month': 'This month', 'last-month': 'Last month', 'this-week': 'This week',
  'last-3-months': 'Last 3 months', 'this-year': 'This year', all: 'All time', custom: 'Custom range',
};

const VIEW_TITLES = {
  dashboard: 'Overview', transactions: 'Transactions', reports: 'Reports',
  categories: 'Categories & Budgets', settings: 'Settings',
};

const KEYS = { expenses: 'expenses', categories: 'et_categories', settings: 'et_settings' };

/* ============ Helpers ============ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const todayKey = () => toKey(new Date());
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const isDateKey = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseKey(s));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeColor = c => (typeof c === 'string' && /^#[0-9a-f]{3,8}$/i.test(c) ? c : '#64748b');
const total = list => list.reduce((s, e) => s + e.amount, 0);
const share = (a, b) => (b ? (a / b) * 100 : 0);

const inr0 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (n, precise = false) => (precise && Math.round(n * 100) % 100 !== 0 ? inr2 : inr0).format(n);
const compact = n => {
  const a = Math.abs(n);
  if (a >= 1e7) return '₹' + +(n / 1e7).toFixed(1) + 'Cr';
  if (a >= 1e5) return '₹' + +(n / 1e5).toFixed(1) + 'L';
  if (a >= 1e3) return '₹' + +(n / 1e3).toFixed(1) + 'k';
  return '₹' + Math.round(n);
};
const fmtDate = (k, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => parseKey(k).toLocaleDateString('en-IN', opts);
const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}

/* ============ State ============ */
const state = {
  expenses: [],
  categories: [],
  settings: { theme: 'system', budget: 0, lastMode: 'upi' },
  view: 'dashboard',
  tx: { q: '', period: 'this-month', category: 'all', mode: 'all', sort: 'newest', from: '', to: '' },
  rp: { period: 'this-month', from: '', to: '' },
  editingId: null,
  editingCat: null,
  form: { category: null, mode: 'upi' },
  catForm: { color: SWATCHES[0] },
};

function sanitizeCategory(c) {
  if (!c || typeof c.id !== 'string' || typeof c.name !== 'string') return null;
  const budget = Number(c.budget);
  return {
    id: c.id.slice(0, 60),
    name: c.name.slice(0, 30),
    icon: typeof c.icon === 'string' && c.icon.trim() ? c.icon.slice(0, 8) : '📌',
    color: safeColor(c.color),
    budget: budget > 0 && isFinite(budget) ? budget : 0,
  };
}

function sanitizeExpense(e, categoryIds) {
  if (!e) return null;
  const amount = Math.round(Number(e.amount) * 100) / 100;
  if (!(amount > 0) || !isFinite(amount) || !isDateKey(e.date)) return null;
  let mode = e.mode === 'online' ? 'upi' : e.mode;
  if (!MODES.some(m => m.id === mode)) mode = 'cash';
  const created = Number(e.createdAt) || (typeof e.id === 'number' ? e.id : 0);
  return {
    id: String(e.id ?? uid()),
    amount,
    category: categoryIds.has(e.category) ? e.category : 'other',
    mode,
    date: e.date,
    description: String(e.description ?? '').slice(0, 80),
    notes: String(e.notes ?? '').slice(0, 300),
    createdAt: created,
    ...(e.sample ? { sample: true } : {}),
  };
}

function hydrate(raw) {
  const cats = (Array.isArray(raw.categories) ? raw.categories : DEFAULT_CATEGORIES.map(c => ({ ...c })))
    .map(sanitizeCategory).filter(Boolean);
  if (!cats.some(c => c.id === 'other')) cats.push({ ...DEFAULT_CATEGORIES.at(-1), budget: 0 });
  const ids = new Set(cats.map(c => c.id));
  const seen = new Set();
  const expenses = (Array.isArray(raw.expenses) ? raw.expenses : [])
    .map(e => sanitizeExpense(e, ids))
    .filter(e => e && !seen.has(e.id) && seen.add(e.id));
  const s = raw.settings || {};
  state.categories = cats;
  state.expenses = expenses;
  state.settings = {
    theme: ['light', 'dark', 'system'].includes(s.theme) ? s.theme : 'system',
    budget: Number(s.budget) > 0 ? Number(s.budget) : 0,
    lastMode: MODES.some(m => m.id === s.lastMode) ? s.lastMode : 'upi',
  };
}

function persist() {
  const ok = store(KEYS.expenses, state.expenses)
    && store(KEYS.categories, state.categories)
    && store(KEYS.settings, state.settings);
  if (!ok) toast('Could not save — browser storage is full or blocked', true);
}

const catById = id => state.categories.find(c => c.id === id) || state.categories.find(c => c.id === 'other');
const modeById = id => MODES.find(m => m.id === id) || MODES[0];
const byNewest = (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt;

/* ============ Date ranges ============ */
function rangeFor(period, from, to) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  switch (period) {
    case 'this-week': {
      const start = addDays(now, -((now.getDay() + 6) % 7));
      return { from: toKey(start), to: toKey(addDays(start, 6)) };
    }
    case 'this-month': return { from: toKey(new Date(y, m, 1)), to: toKey(new Date(y, m + 1, 0)) };
    case 'last-month': return { from: toKey(new Date(y, m - 1, 1)), to: toKey(new Date(y, m, 0)) };
    case 'last-3-months': return { from: toKey(new Date(y, m - 2, 1)), to: toKey(new Date(y, m + 1, 0)) };
    case 'this-year': return { from: `${y}-01-01`, to: `${y}-12-31` };
    case 'custom':
      if (!isDateKey(from) || !isDateKey(to)) return rangeFor('this-month');
      return from <= to ? { from, to } : { from: to, to: from };
    default: {
      if (!state.expenses.length) return { ...rangeFor('this-month'), all: true };
      const keys = state.expenses.map(e => e.date).sort();
      return { from: keys[0], to: keys[keys.length - 1] > todayKey() ? keys[keys.length - 1] : todayKey(), all: true };
    }
  }
}

// While a period is still in progress, compare only the same number of elapsed days.
function previousRange(r, period) {
  const prev = fullPreviousRange(r, period);
  if (!prev) return null;
  const t = todayKey();
  if (r.from <= t && t < r.to) {
    const cut = toKey(addDays(parseKey(prev.from), daysBetween(r.from, t)));
    if (cut < prev.to) prev.to = cut;
  }
  return prev;
}

function fullPreviousRange(r, period) {
  if (r.all) return null;
  const s = parseKey(r.from);
  if (period === 'this-month' || period === 'last-month')
    return { from: toKey(new Date(s.getFullYear(), s.getMonth() - 1, 1)), to: toKey(new Date(s.getFullYear(), s.getMonth(), 0)) };
  if (period === 'last-3-months')
    return { from: toKey(new Date(s.getFullYear(), s.getMonth() - 3, 1)), to: toKey(new Date(s.getFullYear(), s.getMonth(), 0)) };
  if (period === 'this-year') return { from: `${s.getFullYear() - 1}-01-01`, to: `${s.getFullYear() - 1}-12-31` };
  const len = daysBetween(r.from, r.to) + 1;
  const end = addDays(s, -1);
  return { from: toKey(addDays(end, -(len - 1))), to: toKey(end) };
}

// Days that have actually elapsed within a range (for fair daily averages).
function elapsedDays(r) {
  const t = todayKey();
  const end = r.to < t ? r.to : t;
  if (end < r.from) return 1;
  return daysBetween(r.from, end) + 1;
}

const inRange = (e, r) => e.date >= r.from && e.date <= r.to;
const expensesIn = r => state.expenses.filter(e => inRange(e, r));

/* ============ Aggregations ============ */
function byCategory(list) {
  const map = new Map();
  for (const e of list) {
    const row = map.get(e.category) || { id: e.category, total: 0, count: 0 };
    row.total += e.amount; row.count++;
    map.set(e.category, row);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

function byGroup(list) {
  const out = Object.fromEntries(GROUPS.map(g => [g.id, { total: 0, count: 0 }]));
  for (const e of list) { const g = out[modeById(e.mode).group]; g.total += e.amount; g.count++; }
  return out;
}

function byMode(list) {
  const map = new Map(MODES.map(m => [m.id, { id: m.id, total: 0, count: 0 }]));
  for (const e of list) { const r = map.get(e.mode); r.total += e.amount; r.count++; }
  return [...map.values()].filter(r => r.count).sort((a, b) => b.total - a.total);
}

function budgetStatus(spent, budget) {
  const p = share(spent, budget);
  return p > 100 ? 'over' : p >= 80 ? 'warn' : 'ok';
}

/* ============ Shared HTML pieces ============ */
const emptyHTML = (msg, icon = '🧾', withAdd = false) =>
  `<div class="empty"><div class="empty-icon">${icon}</div><p>${msg}</p>${withAdd ? '<button class="btn btn-primary" data-action="add">＋ Add expense</button>' : ''}</div>`;

const catIcon = (c, size = '') => `<span class="cat-icon ${size}" style="--c:${safeColor(c.color)}">${esc(c.icon)}</span>`;

function changeHTML(cur, prev) {
  if (prev == null) return '';
  if (!prev) return cur ? '<span class="change up">new</span>' : '<span class="change flat">—</span>';
  const d = ((cur - prev) / prev) * 100;
  if (Math.abs(d) < 0.5) return '<span class="change flat">0%</span>';
  return `<span class="change ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)}%</span>`;
}

function txRowHTML(e, { showDate = false } = {}) {
  const c = catById(e.category), m = modeById(e.mode);
  const parts = [esc(c.name)];
  if (showDate) parts.unshift(fmtDate(e.date, { day: 'numeric', month: 'short' }));
  if (e.notes) parts.push(esc(e.notes));
  return `<button class="tx" data-edit="${esc(e.id)}">
    ${catIcon(c)}
    <span class="tx-main">
      <span class="tx-title">${esc(e.description || c.name)}</span>
      <span class="tx-sub"><span class="tx-mode">${m.icon} ${m.name}</span> ${parts.join(' · ')}</span>
    </span>
    <span class="tx-amt">${money(e.amount, true)}</span>
  </button>`;
}

function categoryBarsHTML(list, limit) {
  const rows = byCategory(list);
  if (!rows.length) return emptyHTML('No spending yet this month', '🗂️');
  const sum = total(list), max = rows[0].total;
  const shown = rows.slice(0, limit);
  const rest = rows.slice(limit);
  let html = shown.map(r => {
    const c = catById(r.id);
    return `<div class="bar-row">${catIcon(c)}
      <div class="bar-main">
        <div class="bar-top"><span class="name">${esc(c.name)}</span><span class="amt">${money(r.total)}</span></div>
        <div class="bar-track"><span style="width:${(r.total / max) * 100}%;background:${safeColor(c.color)}"></span></div>
        <div class="bar-meta"><span>${share(r.total, sum).toFixed(1)}% of spending</span><span>${r.count} txn${r.count > 1 ? 's' : ''}</span></div>
      </div></div>`;
  }).join('');
  if (rest.length) {
    const restTotal = rest.reduce((s, r) => s + r.total, 0);
    html += `<p class="muted small">+ ${rest.length} more ${rest.length > 1 ? 'categories' : 'category'} · ${money(restTotal)}</p>`;
  }
  return `<div class="bar-list">${html}</div>`;
}

function groupSplitHTML(list, cols = false) {
  const g = byGroup(list);
  const sum = total(list);
  if (!sum) return emptyHTML('No payments recorded yet', '💳');
  const bar = GROUPS.filter(x => g[x.id].total > 0)
    .map(x => `<span style="width:${share(g[x.id].total, sum)}%;background:${x.color}" title="${x.name}: ${money(g[x.id].total)}"></span>`).join('');
  const legend = GROUPS.map(x => `<div class="split-item">
      <span class="dot" style="background:${x.color}"></span>
      <span class="lbl">${x.icon} ${x.name}<small>${x.hint}</small></span>
      <span class="val">${money(g[x.id].total)}<small>${share(g[x.id].total, sum).toFixed(0)}% · ${g[x.id].count} txn</small></span>
    </div>`).join('');
  return `<div class="split-bar" role="img" aria-label="Payment split">${bar}</div><div class="split-legend ${cols ? 'cols' : ''}">${legend}</div>`;
}

function kpiHTML(label, value, foot = '') {
  return `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div><div class="kpi-foot">${foot || '&nbsp;'}</div></div>`;
}

/* ============ Charts ============ */
const charts = {};

function chartBase() {
  if (typeof Chart === 'undefined') return false;
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = cssVar('--muted');
  Chart.defaults.borderColor = cssVar('--grid');
  const tt = Chart.defaults.plugins.tooltip;
  tt.backgroundColor = cssVar('--text');
  tt.titleColor = cssVar('--surface');
  tt.bodyColor = cssVar('--surface');
  tt.padding = 10;
  tt.cornerRadius = 10;
  tt.displayColors = true;
  tt.boxPadding = 4;
  return true;
}

function drawChart(id, config) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  const el = document.getElementById(id);
  if (!el || !chartBase()) return;
  charts[id] = new Chart(el, config);
}

function barChart(id, labels, data, { titles, extra = [], color } = {}) {
  drawChart(id, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Spent', data, order: 2,
        backgroundColor: color || cssVar('--s1'),
        hoverBackgroundColor: color || cssVar('--s1'),
        borderRadius: { topLeft: 4, topRight: 4 },
        borderSkipped: 'bottom',
        maxBarThickness: 36,
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      }, ...extra],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 350 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: extra.length > 0, align: 'end', labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8 } },
        tooltip: {
          callbacks: {
            title: items => (titles ? titles[items[0].dataIndex] : items[0].label),
            label: c => ` ${c.dataset.label}: ${money(c.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { color: cssVar('--grid') }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } },
        y: { beginAtZero: true, grid: { color: cssVar('--grid') }, border: { display: false }, ticks: { maxTicksLimit: 5, callback: v => compact(v) } },
      },
    },
  });
}

const centerLabel = (big, small) => ({
  id: 'centerLabel',
  afterDraw(chart) {
    const arc = chart.getDatasetMeta(0).data[0];
    if (!arc) return;
    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = cssVar('--text');
    ctx.font = '800 18px Inter, system-ui, sans-serif';
    ctx.fillText(big, arc.x, arc.y - 8);
    ctx.fillStyle = cssVar('--muted');
    ctx.font = '500 12px Inter, system-ui, sans-serif';
    ctx.fillText(small, arc.x, arc.y + 12);
    ctx.restore();
  },
});

/* ============ Views ============ */
function go(view) {
  if (!VIEW_TITLES[view]) view = 'dashboard';
  state.view = view;
  $$('.view').forEach(v => { v.hidden = v.id !== `view-${view}`; });
  $$('[data-view]').forEach(b => {
    const on = b.dataset.view === view && (b.closest('.side-nav') || b.closest('.bottom-nav'));
    b.classList.toggle('active', !!on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('#viewTitle').textContent = VIEW_TITLES[view];
  if (location.hash.slice(1) !== view) history.replaceState(null, '', `#${view}`);
  window.scrollTo({ top: 0 });
  render();
}

function render() {
  Object.keys(charts).forEach(id => { charts[id].destroy(); delete charts[id]; });
  ({
    dashboard: renderDashboard,
    transactions: renderTransactions,
    reports: renderReports,
    categories: renderCategories,
    settings: renderSettings,
  })[state.view]();
}

/* ----- Overview ----- */
function renderDashboard() {
  const now = new Date();
  const month = rangeFor('this-month');
  const list = expensesIn(month);
  const spent = total(list);
  const day = now.getDate();
  const daysInMonth = parseKey(month.to).getDate();
  const daysLeft = daysInMonth - day + 1;

  $('#viewSub').textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#heroMonth').textContent = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  $('#heroSpent').textContent = money(spent);

  const budget = state.settings.budget;
  if (budget > 0) {
    const status = budgetStatus(spent, budget);
    const left = budget - spent;
    const perDay = left > 0 ? left / daysLeft : 0;
    $('#heroBudget').innerHTML = `<div class="hero-budget">
      <div class="hero-track ${status}"><span style="width:${Math.min(100, share(spent, budget))}%"></span></div>
      <div class="hero-meta">
        <span>${left >= 0 ? `<strong>${money(left)}</strong> left of ${money(budget)}` : `<strong>${money(-left)} over</strong> your ${money(budget)} budget`}</span>
        <span>${left > 0 ? `≈ <strong>${money(perDay)}</strong>/day for ${daysLeft} day${daysLeft > 1 ? 's' : ''}` : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`}</span>
      </div></div>`;
  } else {
    $('#heroBudget').innerHTML = `<p class="hero-cta">No monthly budget yet. <button data-view="categories">Set one</button> to see how much you have left.</p>`;
  }

  const tk = todayKey();
  const todayList = state.expenses.filter(e => e.date === tk);
  const week = rangeFor('this-week');
  const weekList = expensesIn(week);
  const last = rangeFor('last-month');
  const lastDays = parseKey(last.to).getDate();
  const lastSamePoint = total(expensesIn({ from: last.from, to: toKey(new Date(now.getFullYear(), now.getMonth() - 1, Math.min(day, lastDays))) }));
  const diff = spent - lastSamePoint;

  $('#dashKpis').innerHTML = [
    kpiHTML('Today', money(todayList.length ? total(todayList) : 0), `${todayList.length} transaction${todayList.length === 1 ? '' : 's'}`),
    kpiHTML('This week', money(total(weekList)), `Mon – Sun · ${weekList.length} txn${weekList.length === 1 ? '' : 's'}`),
    kpiHTML('Daily average', money(spent / day), `over ${day} day${day > 1 ? 's' : ''} this month`),
    kpiHTML('vs last month',
      lastSamePoint ? `<span class="delta ${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '▲' : '▼'} ${money(Math.abs(diff))}</span>` : '—',
      lastSamePoint ? `same point last month: ${money(lastSamePoint)}` : 'no data for last month'),
  ].join('');

  const days = Array.from({ length: 7 }, (_, i) => addDays(now, i - 6));
  const weekVals = days.map(d => total(state.expenses.filter(e => e.date === toKey(d))));
  $('#weekTotal').textContent = `${money(weekVals.reduce((a, b) => a + b, 0))} total`;
  barChart('chartWeek',
    days.map(d => d.toLocaleDateString('en-IN', { weekday: 'short' })),
    weekVals,
    { titles: days.map(d => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })) });

  $('#dashModes').innerHTML = groupSplitHTML(list);
  $('#dashCats').innerHTML = categoryBarsHTML(list, 5);

  const recent = [...state.expenses].sort(byNewest).slice(0, 6);
  $('#dashRecent').innerHTML = recent.length
    ? `<div class="tx-list">${recent.map(e => txRowHTML(e, { showDate: true })).join('')}</div>`
    : emptyHTML('No expenses yet. Add your first one!', '👋', true);
}

/* ----- Transactions ----- */
function fillFilterSelects() {
  const catSel = $('#txCategory');
  catSel.innerHTML = `<option value="all">All categories</option>` +
    [...state.categories].sort((a, b) => a.name.localeCompare(b.name))
      .map(c => `<option value="${esc(c.id)}">${esc(c.icon)} ${esc(c.name)}</option>`).join('');
  if (!state.categories.some(c => c.id === state.tx.category)) state.tx.category = 'all';
  catSel.value = state.tx.category;

  const modeSel = $('#txMode');
  modeSel.innerHTML = `<option value="all">All payments</option>` +
    GROUPS.map(g => `<optgroup label="${g.name}">` +
      `<option value="group:${g.id}">${g.icon} All ${g.name.toLowerCase()}</option>` +
      MODES.filter(m => m.group === g.id).map(m => `<option value="${m.id}">${m.icon} ${m.name}</option>`).join('') +
      `</optgroup>`).join('');
  modeSel.value = state.tx.mode;
}

function filteredTransactions() {
  const f = state.tx;
  const r = rangeFor(f.period, f.from, f.to);
  const q = f.q.trim().toLowerCase();
  let list = expensesIn(r);
  if (f.category !== 'all') list = list.filter(e => e.category === f.category);
  if (f.mode.startsWith('group:')) {
    const g = f.mode.slice(6);
    list = list.filter(e => modeById(e.mode).group === g);
  } else if (f.mode !== 'all') {
    list = list.filter(e => e.mode === f.mode);
  }
  if (q) {
    list = list.filter(e => {
      const c = catById(e.category);
      return `${e.description} ${e.notes} ${c.name}`.toLowerCase().includes(q);
    });
  }
  const sorters = {
    newest: byNewest,
    oldest: (a, b) => -byNewest(a, b),
    highest: (a, b) => b.amount - a.amount,
    lowest: (a, b) => a.amount - b.amount,
  };
  return { list: list.sort(sorters[f.sort]), range: r };
}

function dayLabel(k) {
  const t = todayKey();
  if (k === t) return 'Today';
  if (k === toKey(addDays(new Date(), -1))) return 'Yesterday';
  return fmtDate(k, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function renderTransactions() {
  fillFilterSelects();
  $('#txPeriod').value = state.tx.period;
  $('#txSort').value = state.tx.sort;
  $('#txCustom').hidden = state.tx.period !== 'custom';
  if (state.tx.period === 'custom') {
    const r = rangeFor('custom', state.tx.from, state.tx.to);
    $('#txFrom').value = state.tx.from || r.from;
    $('#txTo').value = state.tx.to || r.to;
  }

  const { list, range } = filteredTransactions();
  const sum = total(list);
  $('#viewSub').textContent = `${fmtDate(range.from)} – ${fmtDate(range.to)}`;
  $('#txSummary').innerHTML = list.length
    ? `<span class="summary-chip"><strong>${list.length}</strong> transaction${list.length > 1 ? 's' : ''}</span>
       <span class="summary-chip">Total <strong>${money(sum, true)}</strong></span>
       <span class="summary-chip">Average <strong>${money(sum / list.length)}</strong></span>`
    : '';

  if (!list.length) {
    const hasAny = state.expenses.length > 0;
    $('#txList').innerHTML = `<div class="card">${emptyHTML(hasAny ? 'No transactions match these filters.' : 'No expenses yet. Add your first one!', hasAny ? '🔍' : '👋', !hasAny)}</div>`;
    return;
  }

  if (state.tx.sort === 'newest' || state.tx.sort === 'oldest') {
    const groups = new Map();
    for (const e of list) {
      if (!groups.has(e.date)) groups.set(e.date, []);
      groups.get(e.date).push(e);
    }
    $('#txList').innerHTML = [...groups].map(([date, items]) => `
      <div class="day-group">
        <div class="day-head"><span>${dayLabel(date)}</span><span>${money(total(items), true)}</span></div>
        <div class="card"><div class="tx-list">${items.map(e => txRowHTML(e)).join('')}</div></div>
      </div>`).join('');
  } else {
    $('#txList').innerHTML = `<div class="card"><div class="tx-list">${list.map(e => txRowHTML(e, { showDate: true })).join('')}</div></div>`;
  }
}

/* ----- Reports ----- */
function reportRange() {
  return rangeFor(state.rp.period, state.rp.from, state.rp.to);
}

function renderReports() {
  const p = state.rp.period;
  $$('#rpPeriod button').forEach(b => b.classList.toggle('active', b.dataset.rp === p));
  $('#rpCustom').hidden = p !== 'custom';
  const r = reportRange();
  if (p === 'custom') {
    $('#rpFrom').value = state.rp.from || r.from;
    $('#rpTo').value = state.rp.to || r.to;
  }

  const list = expensesIn(r);
  const sum = total(list);
  const prevR = previousRange(r, p);
  const prevList = prevR ? expensesIn(prevR) : null;
  const prevSum = prevList ? total(prevList) : null;
  const days = elapsedDays(r);

  $('#viewSub').textContent = PERIOD_LABELS[p];
  $('#rpRange').textContent = `${fmtDate(r.from)} – ${fmtDate(r.to)}${prevR ? ` · compared with ${fmtDate(prevR.from)} – ${fmtDate(prevR.to)}` : ''}`;

  const largest = list.reduce((m, e) => (!m || e.amount > m.amount ? e : m), null);
  $('#rpKpis').innerHTML = [
    kpiHTML('Total spent', money(sum), prevSum != null ? `${changeHTML(sum, prevSum)} vs ${money(prevSum)} before` : ''),
    kpiHTML('Transactions', String(list.length), prevList ? `${changeHTML(list.length, prevList.length)} vs ${prevList.length} before` : ''),
    kpiHTML('Daily average', money(sum / days), `across ${days} day${days > 1 ? 's' : ''}`),
    kpiHTML('Largest expense', largest ? money(largest.amount) : '—', largest ? esc(largest.description || catById(largest.category).name) : ''),
  ].join('');

  renderMonthsChart(r);

  const empty = !list.length;
  $('#rpBody').hidden = empty;
  $('#rpEmpty').hidden = !empty;
  if (empty) {
    $('#rpEmpty').innerHTML = `<div class="card">${emptyHTML(`No expenses in ${PERIOD_LABELS[p].toLowerCase()}. Try a different period${state.expenses.length ? '' : ', or load sample data from Settings to preview the reports'}.`, '📊', !state.expenses.length)}</div>`;
    return;
  }

  const cats = byCategory(list);
  const prevCats = prevList ? new Map(byCategory(prevList).map(c => [c.id, c.total])) : null;
  renderInsights({ list, sum, prevSum, cats, prevCats, r, p, days });
  renderCategoryReport(cats, sum, prevCats, p);

  $('#rpGroups').innerHTML = groupSplitHTML(list, true);
  const modes = byMode(list);
  $('#rpModes').innerHTML = `<table class="data-table">
    <thead><tr><th>Method</th><th>Spent</th><th>Share</th><th>Txns</th><th>Avg</th></tr></thead>
    <tbody>${modes.map(m => {
      const mode = modeById(m.id);
      return `<tr><td>${mode.icon} ${mode.name}</td><td>${money(m.total)}</td><td>${share(m.total, sum).toFixed(1)}%</td><td>${m.count}</td><td>${money(m.total / m.count)}</td></tr>`;
    }).join('')}</tbody></table>`;

  renderMatrix(list, cats);
  renderTrend(list, r);
  renderDow(list);

  const top = [...list].sort((a, b) => b.amount - a.amount).slice(0, 6);
  $('#rpTop').innerHTML = `<div class="tx-list">${top.map(e => txRowHTML(e, { showDate: true })).join('')}</div>`;
}

function renderInsights({ list, sum, prevSum, cats, prevCats, r, p, days }) {
  const items = [];
  const topCat = catById(cats[0].id);
  items.push(['🏆', `<b>${esc(topCat.name)}</b> is your biggest expense at <b>${money(cats[0].total)}</b> — ${share(cats[0].total, sum).toFixed(0)}% of all spending.`]);

  const g = byGroup(list);
  const topGroup = GROUPS.reduce((a, b) => (g[b.id].total > g[a.id].total ? b : a));
  const splitText = GROUPS.map(x => `${x.name.toLowerCase()} ${share(g[x.id].total, sum).toFixed(0)}%`).join(', ');
  items.push([topGroup.icon, `You pay mostly by <b>${topGroup.name.toLowerCase()}</b> (${splitText}).`]);

  if (prevSum != null && prevSum > 0) {
    const d = ((sum - prevSum) / prevSum) * 100;
    const cls = d > 5 ? 'bad' : d < -5 ? 'good' : '';
    items.push([d > 0 ? '📈' : '📉', `Spending is <b>${d > 0 ? 'up' : 'down'} ${Math.abs(d).toFixed(0)}%</b> (${money(Math.abs(sum - prevSum))}) compared with the same stretch of the previous period.`, cls]);
  }

  if (prevCats) {
    let jump = null;
    for (const c of cats) {
      const before = prevCats.get(c.id) || 0;
      const inc = c.total - before;
      if (inc > 0 && (!jump || inc > jump.inc)) jump = { id: c.id, inc, before };
    }
    if (jump && jump.inc >= sum * 0.05) {
      const c = catById(jump.id);
      items.push([c.icon, `<b>${esc(c.name)}</b> grew the most: +${money(jump.inc)}${jump.before ? ` (was ${money(jump.before)})` : ' (nothing spent here last period)'}.`, 'bad']);
    }
  }

  const dow = dowTotals(list);
  const maxDow = dow.totals.indexOf(Math.max(...dow.totals));
  items.push(['📅', `<b>${dow.long[maxDow]}s</b> are your heaviest days — ${money(dow.totals[maxDow])} spent on ${dow.long[maxDow]}s.`]);

  const small = list.filter(e => e.amount < 200);
  if (small.length >= 5) {
    items.push(['☕', `<b>${small.length}</b> small purchases under ₹200 added up to <b>${money(total(small))}</b>.`]);
  }

  if (p === 'this-month') {
    const daysInMonth = parseKey(r.to).getDate();
    const projected = (sum / days) * daysInMonth;
    const budget = state.settings.budget;
    if (budget > 0) {
      const over = projected > budget;
      items.push(['🎯', `At this pace you'll spend about <b>${money(projected)}</b> this month — ${over ? `<b>${money(projected - budget)} over</b>` : `${money(budget - projected)} under`} your ${money(budget)} budget.`, over ? 'bad' : 'good']);
    } else {
      items.push(['🎯', `At this pace you'll spend about <b>${money(projected)}</b> this month.`]);
    }
    const overCats = state.categories.filter(c => c.budget > 0 && (cats.find(x => x.id === c.id)?.total || 0) > c.budget);
    if (overCats.length) {
      items.push(['⚠️', `Over category budget: ${overCats.map(c => `<b>${esc(c.name)}</b> (${money(cats.find(x => x.id === c.id).total)} / ${money(c.budget)})`).join(', ')}.`, 'bad']);
    }
  }

  $('#rpInsights').innerHTML = items.map(([ico, text, cls = '']) => `<li class="${cls}"><span class="ico">${esc(ico)}</span><span>${text}</span></li>`).join('');
}

function renderCategoryReport(cats, sum, prevCats, p) {
  const MAX_SLICES = 7;
  const slices = cats.slice(0, MAX_SLICES).map(c => ({ ...catById(c.id), total: c.total }));
  const rest = cats.slice(MAX_SLICES);
  if (rest.length) slices.push({ name: `Other (${rest.length})`, color: '#94a3b8', total: rest.reduce((s, c) => s + c.total, 0) });

  drawChart('chartCat', {
    type: 'doughnut',
    data: {
      labels: slices.map(s => s.name),
      datasets: [{
        data: slices.map(s => s.total),
        backgroundColor: slices.map(s => safeColor(s.color)),
        borderColor: cssVar('--surface'),
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 12 } },
        tooltip: { callbacks: { label: c => ` ${c.label}: ${money(c.parsed)} (${share(c.parsed, sum).toFixed(1)}%)` } },
      },
    },
    plugins: [centerLabel(compact(sum), 'total spent')],
  });

  const showBudget = p === 'this-month' && state.categories.some(c => c.budget > 0);
  $('#rpCatHint').textContent = prevCats ? 'Change vs previous period' : '';
  $('#rpCatTable').innerHTML = `<table class="data-table">
    <thead><tr><th>Category</th><th>Spent</th><th>Share</th><th>Txns</th>${prevCats ? '<th>Change</th>' : ''}${showBudget ? '<th>Budget</th>' : ''}</tr></thead>
    <tbody>${cats.map(row => {
      const c = catById(row.id);
      const budgetCell = showBudget
        ? `<td>${c.budget ? `<span class="status-tag ${budgetStatus(row.total, c.budget)}">${share(row.total, c.budget).toFixed(0)}%</span>` : '—'}</td>`
        : '';
      return `<tr>
        <td><span class="cell-cat">${catIcon(c, 'sm')}<span>${esc(c.name)}</span></span></td>
        <td>${money(row.total)}</td>
        <td>${share(row.total, sum).toFixed(1)}%</td>
        <td>${row.count}</td>
        ${prevCats ? `<td>${changeHTML(row.total, prevCats.get(row.id) || 0)}</td>` : ''}
        ${budgetCell}
      </tr>`;
    }).join('')}</tbody>
    <tfoot><tr><td>Total</td><td>${money(sum)}</td><td>100%</td><td>${cats.reduce((s, c) => s + c.count, 0)}</td>${prevCats ? '<td></td>' : ''}${showBudget ? '<td></td>' : ''}</tr></tfoot>
  </table>`;
}

function renderMatrix(list, cats) {
  const cells = new Map();
  let max = 0;
  for (const e of list) {
    const key = `${e.category}|${modeById(e.mode).group}`;
    const v = (cells.get(key) || 0) + e.amount;
    cells.set(key, v);
    if (v > max) max = v;
  }
  const g = byGroup(list);
  $('#rpMatrix').innerHTML = `<table class="data-table">
    <thead><tr><th>Category</th>${GROUPS.map(x => `<th>${x.icon} ${x.name}</th>`).join('')}<th>Total</th></tr></thead>
    <tbody>${cats.map(row => {
      const c = catById(row.id);
      return `<tr><td><span class="cell-cat">${catIcon(c, 'sm')}<span>${esc(c.name)}</span></span></td>${GROUPS.map(x => {
        const v = cells.get(`${row.id}|${x.id}`) || 0;
        const mix = v ? Math.round(8 + (v / max) * 40) : 0;
        return `<td class="heat" style="${v ? `background:color-mix(in srgb, var(--s1) ${mix}%, transparent)` : ''}">${v ? money(v) : '<span class="muted">—</span>'}</td>`;
      }).join('')}<td><b>${money(row.total)}</b></td></tr>`;
    }).join('')}</tbody>
    <tfoot><tr><td>Total</td>${GROUPS.map(x => `<td>${money(g[x.id].total)}</td>`).join('')}<td>${money(total(list))}</td></tr></tfoot>
  </table>`;
}

function renderTrend(list, r) {
  const span = daysBetween(r.from, r.to) + 1;
  if (span <= 62) {
    const days = Array.from({ length: span }, (_, i) => addDays(parseKey(r.from), i));
    const map = new Map();
    for (const e of list) map.set(e.date, (map.get(e.date) || 0) + e.amount);
    const vals = days.map(d => map.get(toKey(d)) || 0);
    const active = vals.filter(v => v > 0).length;
    $('#rpTrendTitle').textContent = 'Daily spending';
    $('#rpTrendHint').textContent = `Spent on ${active} of ${span} days`;
    barChart('chartTrend',
      days.map(d => d.toLocaleDateString('en-IN', span > 14 ? { day: 'numeric' } : { weekday: 'short', day: 'numeric' })),
      vals,
      { titles: days.map(d => d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })) });
  } else {
    const start = parseKey(r.from), end = parseKey(r.to);
    const months = [];
    for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) months.push(d);
    const map = new Map();
    for (const e of list) { const k = e.date.slice(0, 7); map.set(k, (map.get(k) || 0) + e.amount); }
    const vals = months.map(d => map.get(toKey(d).slice(0, 7)) || 0);
    $('#rpTrendTitle').textContent = 'Monthly spending';
    $('#rpTrendHint').textContent = `${months.length} months`;
    barChart('chartTrend',
      months.map(d => d.toLocaleDateString('en-IN', { month: 'short', ...(months.length > 12 ? { year: '2-digit' } : {}) })),
      vals,
      { titles: months.map(d => d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })) });
  }
}

function dowTotals(list) {
  const totals = Array(7).fill(0);
  for (const e of list) totals[(parseKey(e.date).getDay() + 6) % 7] += e.amount;
  return {
    totals,
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    long: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  };
}

function renderDow(list) {
  const d = dowTotals(list);
  barChart('chartDow', d.short, d.totals, { titles: d.long });
}

function renderMonthsChart(r) {
  const anchor = parseKey(r.to < todayKey() ? r.to : todayKey());
  const months = Array.from({ length: 12 }, (_, i) => new Date(anchor.getFullYear(), anchor.getMonth() - 11 + i, 1));
  const map = new Map();
  for (const e of state.expenses) { const k = e.date.slice(0, 7); map.set(k, (map.get(k) || 0) + e.amount); }
  const vals = months.map(d => map.get(toKey(d).slice(0, 7)) || 0);
  const budget = state.settings.budget;
  const extra = budget > 0 ? [{
    type: 'line', label: 'Budget', order: 1,
    data: months.map(() => budget),
    borderColor: cssVar('--text-2'), borderWidth: 2, borderDash: [6, 4],
    pointRadius: 0, pointHoverRadius: 0, fill: false,
  }] : [];
  barChart('chartMonths',
    months.map(d => d.toLocaleDateString('en-IN', { month: 'short' })),
    vals,
    { titles: months.map(d => d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })), extra });
}

/* ----- Categories ----- */
function renderCategories() {
  const month = rangeFor('this-month');
  const list = expensesIn(month);
  const spent = total(list);
  const totals = new Map(byCategory(list).map(r => [r.id, r]));
  const budget = state.settings.budget;
  const catBudgetSum = state.categories.reduce((s, c) => s + (c.budget || 0), 0);

  $('#viewSub').textContent = `${state.categories.length} categories`;
  $('#budgetInput').value = budget || '';
  $('#budgetHint').textContent = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  let summary = '';
  if (budget > 0) {
    const status = budgetStatus(spent, budget);
    summary += `<div class="bar-main">
      <div class="bar-top"><span class="name">${money(spent)} of ${money(budget)}</span><span class="status-tag ${status}">${share(spent, budget).toFixed(0)}% used</span></div>
      <div class="bar-track budget"><span class="${status}" style="width:${Math.min(100, share(spent, budget))}%"></span></div>
    </div>`;
  }
  if (catBudgetSum > 0) {
    summary += `<p class="muted small" style="margin-top:10px">Category budgets add up to ${money(catBudgetSum)}${budget > 0 && catBudgetSum > budget ? ` — <b>${money(catBudgetSum - budget)} more</b> than your overall budget` : ''}.</p>`;
  }
  $('#budgetSummary').innerHTML = summary;

  const sorted = [...state.categories].sort((a, b) =>
    (a.id === 'other') - (b.id === 'other') || (totals.get(b.id)?.total || 0) - (totals.get(a.id)?.total || 0) || a.name.localeCompare(b.name));

  $('#catGrid').innerHTML = sorted.map(c => {
    const t = totals.get(c.id) || { total: 0, count: 0 };
    let budgetHTML = '<div class="bar-meta"><span>No budget set</span></div>';
    if (c.budget > 0) {
      const st = budgetStatus(t.total, c.budget);
      const left = c.budget - t.total;
      budgetHTML = `<div>
        <div class="bar-track budget"><span class="${st}" style="width:${Math.min(100, share(t.total, c.budget))}%"></span></div>
        <div class="bar-meta"><span>${left >= 0 ? `${money(left)} left of ${money(c.budget)}` : `${money(-left)} over ${money(c.budget)}`}</span><span class="status-tag ${st}">${share(t.total, c.budget).toFixed(0)}%</span></div>
      </div>`;
    }
    return `<button class="cat-card" data-edit-cat="${esc(c.id)}">
      <div class="cat-card-top">
        ${catIcon(c)}
        <div><div class="cat-card-name">${esc(c.name)}</div><div class="cat-card-sub">${t.count} txn${t.count === 1 ? '' : 's'} this month</div></div>
        <div class="cat-card-amt">${money(t.total)}<small>this month</small></div>
      </div>
      ${budgetHTML}
    </button>`;
  }).join('');
}

/* ----- Settings ----- */
function renderSettings() {
  $$('#themeSeg button').forEach(b => b.classList.toggle('active', b.dataset.themeSet === state.settings.theme));
  const hasSample = state.expenses.some(e => e.sample);
  $('#removeSampleBtn').hidden = !hasSample;
  $('#sampleBtn').hidden = hasSample;
  const n = state.expenses.length;
  $('#viewSub').textContent = '';
  $('#statsLine').textContent = n
    ? `${n} expense${n > 1 ? 's' : ''} stored · ${money(total(state.expenses))} total · since ${fmtDate([...state.expenses].sort((a, b) => a.date.localeCompare(b.date))[0].date)}`
    : 'No expenses stored yet.';
}

/* ============ Expense sheet ============ */
let lastFocus = null;

function openSheet(id) {
  lastFocus = document.activeElement;
  $(id).hidden = false;
  document.body.classList.add('no-scroll');
}
function closeSheets() {
  $$('.sheet-wrap').forEach(s => { s.hidden = true; });
  document.body.classList.remove('no-scroll');
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}

function renderFormChips() {
  $('#fCategories').innerHTML = state.categories.map(c =>
    `<button type="button" class="chip-tile" data-pick-cat="${esc(c.id)}" aria-pressed="${c.id === state.form.category}" style="--c:${safeColor(c.color)}">
      <span class="e">${esc(c.icon)}</span><span class="t">${esc(c.name)}</span></button>`).join('');
  $('#fModes').innerHTML = MODES.map(m => {
    const g = GROUPS.find(x => x.id === m.group);
    return `<button type="button" class="mode-chip" data-pick-mode="${m.id}" aria-pressed="${m.id === state.form.mode}">
      <b>${m.icon} ${m.name}</b><small><span class="dot" style="background:${g.color};width:7px;height:7px"></span>${g.name}</small></button>`;
  }).join('');
}

function setFormError(msg) {
  const el = $('#fError');
  el.textContent = msg || '';
  el.hidden = !msg;
}

function openExpense(id = null) {
  const e = id != null ? state.expenses.find(x => x.id === String(id)) : null;
  state.editingId = e ? e.id : null;
  state.form.category = e ? e.category : null;
  state.form.mode = e ? e.mode : state.settings.lastMode;
  $('#expenseSheetTitle').textContent = e ? 'Edit expense' : 'Add expense';
  $('#fAmount').value = e ? e.amount : '';
  $('#fDate').value = e ? e.date : todayKey();
  $('#fDesc').value = e ? e.description : '';
  $('#fNotes').value = e ? e.notes : '';
  $('#fDelete').hidden = !e;
  $('#fSaveAnother').hidden = !!e;
  setFormError('');
  renderFormChips();
  openSheet('#expenseSheet');
  $('#expenseSheet .sheet-body').scrollTop = 0;
  if (!e && window.matchMedia('(pointer: fine)').matches) $('#fAmount').focus();
}

function saveExpense(addAnother) {
  const amount = Math.round(parseFloat($('#fAmount').value) * 100) / 100;
  if (!(amount > 0) || !isFinite(amount)) { setFormError('Enter an amount greater than 0.'); $('#fAmount').focus(); return; }
  if (amount > 1e9) { setFormError('That amount looks too large.'); return; }
  if (!state.form.category) { setFormError('Pick a category.'); return; }
  const date = $('#fDate').value;
  if (!isDateKey(date)) { setFormError('Pick a valid date.'); return; }

  const data = {
    amount,
    category: state.form.category,
    mode: state.form.mode,
    date,
    description: $('#fDesc').value.trim().slice(0, 80),
    notes: $('#fNotes').value.trim().slice(0, 300),
  };
  const cat = catById(data.category);

  if (state.editingId) {
    const e = state.expenses.find(x => x.id === state.editingId);
    if (e) { Object.assign(e, data); delete e.sample; }
    toast('Expense updated');
  } else {
    state.expenses.push({ id: uid(), createdAt: Date.now(), ...data });
    toast(`Added ${money(amount, true)} · ${cat.name}`);
  }
  state.settings.lastMode = data.mode;
  persist();

  if (addAnother) {
    $('#fAmount').value = '';
    $('#fDesc').value = '';
    $('#fNotes').value = '';
    state.form.category = null;
    setFormError('');
    renderFormChips();
    $('#expenseSheet .sheet-body').scrollTop = 0;
    $('#fAmount').focus();
  } else {
    closeSheets();
  }
  render();
}

function deleteExpense() {
  const e = state.expenses.find(x => x.id === state.editingId);
  if (!e) return;
  if (!confirm(`Delete "${e.description || catById(e.category).name}" (${money(e.amount, true)})?`)) return;
  state.expenses = state.expenses.filter(x => x.id !== e.id);
  persist();
  closeSheets();
  toast('Expense deleted');
  render();
}

/* ============ Category sheet ============ */
function renderCatPreview() {
  const icon = $('#cIcon').value.trim() || '📌';
  const p = $('#cPreview');
  p.textContent = icon;
  p.style.setProperty('--c', state.catForm.color);
  $$('#cSwatches button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.color === state.catForm.color)));
}

function openCategory(id = null) {
  const c = id ? state.categories.find(x => x.id === id) : null;
  state.editingCat = c ? c.id : null;
  state.catForm.color = c ? c.color : SWATCHES[state.categories.length % SWATCHES.length];
  $('#categorySheetTitle').textContent = c ? 'Edit category' : 'New category';
  $('#cName').value = c ? c.name : '';
  $('#cIcon').value = c ? c.icon : '';
  $('#cBudget').value = c && c.budget ? c.budget : '';
  $('#cDelete').hidden = !c || c.id === 'other';
  $('#cError').hidden = true;
  $('#cEmojiRow').innerHTML = EMOJI_SUGGESTIONS.map(e => `<button type="button" data-emoji="${e}" aria-label="Use ${e}">${e}</button>`).join('');
  $('#cSwatches').innerHTML = SWATCHES.map(col => `<button type="button" data-color="${col}" style="background:${col}" aria-label="Colour ${col}"></button>`).join('');
  renderCatPreview();
  openSheet('#categorySheet');
  if (window.matchMedia('(pointer: fine)').matches) $('#cName').focus();
}

function saveCategory() {
  const name = $('#cName').value.trim().slice(0, 30);
  const err = $('#cError');
  const fail = msg => { err.textContent = msg; err.hidden = false; };
  if (!name) return fail('Give the category a name.');
  if (state.categories.some(c => c.id !== state.editingCat && c.name.toLowerCase() === name.toLowerCase()))
    return fail('A category with that name already exists.');
  const budget = Number($('#cBudget').value);
  if ($('#cBudget').value && !(budget >= 0)) return fail('Budget must be a positive number.');
  const data = {
    name,
    icon: ($('#cIcon').value.trim() || '📌').slice(0, 8),
    color: safeColor(state.catForm.color),
    budget: budget > 0 ? budget : 0,
  };
  if (state.editingCat) {
    Object.assign(state.categories.find(c => c.id === state.editingCat), data);
    toast('Category updated');
  } else {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'cat';
    state.categories.push({ id: `${slug}-${uid()}`, ...data });
    toast(`Category "${name}" added`);
  }
  persist();
  closeSheets();
  render();
}

function deleteCategory() {
  const c = state.categories.find(x => x.id === state.editingCat);
  if (!c || c.id === 'other') return;
  const used = state.expenses.filter(e => e.category === c.id).length;
  const msg = used
    ? `Delete "${c.name}"? Its ${used} expense${used > 1 ? 's' : ''} will move to "Other".`
    : `Delete "${c.name}"?`;
  if (!confirm(msg)) return;
  state.expenses.forEach(e => { if (e.category === c.id) e.category = 'other'; });
  state.categories = state.categories.filter(x => x.id !== c.id);
  if (state.tx.category === c.id) state.tx.category = 'all';
  persist();
  closeSheets();
  toast('Category deleted');
  render();
}

/* ============ Export / import ============ */
function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function exportCSV(list, name) {
  if (!list.length) { toast('Nothing to export for this period', true); return; }
  const rows = [['Date', 'Description', 'Category', 'Payment method', 'Payment type', 'Amount (INR)', 'Notes']];
  [...list].sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
    const m = modeById(e.mode);
    rows.push([e.date, e.description, catById(e.category).name, m.name, GROUPS.find(g => g.id === m.group).name, e.amount.toFixed(2), e.notes]);
  });
  const csv = '﻿' + rows.map(r => r.map((v, i) => (i === 5 && r !== rows[0] ? v : csvCell(v))).join(',')).join('\r\n');
  download(name, csv, 'text/csv;charset=utf-8');
  toast(`Exported ${list.length} expenses`);
}

function exportBackup() {
  const data = { app: 'expense-tracker', version: 2, exportedAt: new Date().toISOString(), ...{ expenses: state.expenses, categories: state.categories, settings: state.settings } };
  download(`expense-backup-${todayKey()}.json`, JSON.stringify(data, null, 2), 'application/json');
  toast('Backup downloaded');
}

function importBackup(file) {
  if (!file) return;
  if (file.size > 20 * 1024 * 1024) { toast('That file is too large', true); return; }
  const reader = new FileReader();
  reader.onload = () => {
    let raw;
    try { raw = JSON.parse(reader.result); } catch { toast('Not a valid backup file', true); return; }
    if (Array.isArray(raw)) raw = { expenses: raw };
    if (!raw || !Array.isArray(raw.expenses)) { toast('Not a valid backup file', true); return; }
    if (!confirm(`Replace the data on this device with this backup (${raw.expenses.length} expenses)?`)) return;
    hydrate({ expenses: raw.expenses, categories: raw.categories, settings: { ...state.settings, ...(raw.settings || {}) } });
    persist();
    applyTheme();
    toast(`Restored ${state.expenses.length} expenses`);
    render();
  };
  reader.readAsText(file);
}

function loadSample() {
  if (!confirm('Add about 3 months of example expenses? You can remove them later from Settings.')) return;
  const templates = [
    ['food', 'Lunch', 120, 380, ['upi', 'upi', 'cash'], 0.6],
    ['food', 'Dinner out', 450, 1800, ['credit', 'upi'], 0.15],
    ['food', 'Coffee & snacks', 50, 220, ['cash', 'upi'], 0.45],
    ['groceries', 'Groceries', 250, 2400, ['upi', 'card'], 0.35],
    ['transport', 'Auto / cab', 60, 420, ['upi', 'cash'], 0.5],
    ['fuel', 'Petrol', 600, 2200, ['card', 'credit'], 0.12],
    ['shopping', 'Online order', 350, 3800, ['credit', 'upi'], 0.12],
    ['entertainment', 'Movie', 250, 900, ['upi', 'card'], 0.06],
    ['personal', 'Salon', 200, 900, ['cash', 'upi'], 0.04],
    ['healthcare', 'Pharmacy', 90, 950, ['cash', 'upi'], 0.07],
    ['gifts', 'Gift', 500, 2500, ['upi', 'card'], 0.03],
    ['family', 'Kids stuff', 150, 1200, ['upi', 'cash'], 0.06],
  ];
  const fixed = [
    [1, 'rent', 'Monthly rent', 18000, 'netbanking'],
    [5, 'utilities', 'Electricity bill', null, 'upi'],
    [7, 'utilities', 'Mobile recharge', 299, 'upi'],
    [10, 'subscriptions', 'OTT subscription', 649, 'credit'],
    [12, 'utilities', 'Broadband', 799, 'netbanking'],
    [15, 'emi', 'Phone EMI', 2499, 'card'],
  ];
  const rand = (a, b) => Math.round(a + Math.random() * (b - a));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const now = new Date();
  const added = [];
  const ids = new Set(state.categories.map(c => c.id));
  for (let i = 95; i >= 0; i--) {
    const d = addDays(now, -i);
    const key = toKey(d);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    for (const [cat, desc, lo, hi, modes, p] of templates) {
      if (Math.random() < p * (weekend && ['food', 'shopping', 'entertainment'].includes(cat) ? 1.8 : 1)) {
        added.push({ category: cat, description: desc, amount: rand(lo, hi), mode: pick(modes), date: key });
      }
    }
    for (const [dom, cat, desc, amt, mode] of fixed) {
      if (d.getDate() === dom) added.push({ category: cat, description: desc, amount: amt ?? rand(900, 2600), mode, date: key });
    }
  }
  added.forEach((e, n) => {
    state.expenses.push({
      id: uid() + n, createdAt: Date.now() + n, notes: '', sample: true, ...e,
      category: ids.has(e.category) ? e.category : 'other',
    });
  });
  persist();
  toast(`Added ${added.length} sample expenses`);
  go('dashboard');
}

function removeSample() {
  const n = state.expenses.filter(e => e.sample).length;
  if (!confirm(`Remove ${n} sample expenses?`)) return;
  state.expenses = state.expenses.filter(e => !e.sample);
  persist();
  toast('Sample data removed');
  render();
}

function wipeAll() {
  if (!confirm('Delete ALL expenses, categories and budgets on this device? This cannot be undone.')) return;
  if (state.expenses.length && !confirm('Last check — have you downloaded a backup? Press OK to delete everything.')) return;
  hydrate({});
  persist();
  applyTheme();
  toast('All data deleted');
  render();
}

/* ============ Theme ============ */
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function isDark() {
  return state.settings.theme === 'dark' || (state.settings.theme === 'system' && darkQuery.matches);
}

function applyTheme() {
  const t = state.settings.theme;
  if (t === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  $('meta[name="theme-color"]').setAttribute('content', isDark() ? '#0c0f17' : '#4f46e5');
}

function setTheme(t) {
  state.settings.theme = t;
  persist();
  applyTheme();
  render();
}

/* ============ Toast ============ */
let toastTimer;
function toast(msg, isError = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.toggle('error', isError);
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ============ Events ============ */
function shiftDate(days) {
  $('#fDate').value = toKey(addDays(new Date(), days));
}

document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-view],[data-action],[data-edit],[data-edit-cat],[data-close],[data-rp],[data-theme-set],[data-date],[data-pick-cat],[data-pick-mode],[data-emoji],[data-color]');
  if (!t) return;
  const d = t.dataset;

  if ('close' in d) { closeSheets(); return; }
  if (d.view) { closeSheets(); go(d.view); return; }
  if (d.edit) { openExpense(d.edit); return; }
  if (d.editCat) { openCategory(d.editCat); return; }
  if (d.rp) { state.rp.period = d.rp; renderReports(); return; }
  if (d.themeSet) { setTheme(d.themeSet); return; }
  if (d.date) { shiftDate(Number(d.date)); return; }
  if (d.pickCat) { state.form.category = d.pickCat; setFormError(''); renderFormChips(); return; }
  if (d.pickMode) { state.form.mode = d.pickMode; renderFormChips(); return; }
  if (d.emoji) { $('#cIcon').value = d.emoji; renderCatPreview(); return; }
  if (d.color) { state.catForm.color = d.color; renderCatPreview(); return; }

  switch (d.action) {
    case 'add': openExpense(); break;
    case 'add-category': openCategory(); break;
    case 'toggle-theme': setTheme(isDark() ? 'light' : 'dark'); break;
    case 'report-csv': {
      const r = reportRange();
      exportCSV(expensesIn(r), `expenses-${r.from}-to-${r.to}.csv`);
      break;
    }
    case 'print': window.print(); break;
    case 'backup': exportBackup(); break;
    case 'all-csv': exportCSV(state.expenses, `expenses-all-${todayKey()}.csv`); break;
    case 'sample': loadSample(); break;
    case 'remove-sample': removeSample(); break;
    case 'wipe': wipeAll(); break;
  }
});

document.addEventListener('keydown', ev => {
  const open = $$('.sheet-wrap').some(s => !s.hidden);
  if (ev.key === 'Escape' && open) { closeSheets(); return; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
  if (!open && !typing && !ev.metaKey && !ev.ctrlKey && !ev.altKey && (ev.key === 'n' || ev.key === 'a')) {
    ev.preventDefault();
    openExpense();
  }
});

$('#expenseForm').addEventListener('submit', ev => { ev.preventDefault(); saveExpense(false); });
$('#fSaveAnother').addEventListener('click', () => saveExpense(true));
$('#fDelete').addEventListener('click', deleteExpense);

$('#categoryForm').addEventListener('submit', ev => { ev.preventDefault(); saveCategory(); });
$('#cDelete').addEventListener('click', deleteCategory);
$('#cIcon').addEventListener('input', renderCatPreview);

$('#budgetForm').addEventListener('submit', ev => {
  ev.preventDefault();
  const v = Number($('#budgetInput').value);
  state.settings.budget = v > 0 && isFinite(v) ? Math.round(v) : 0;
  persist();
  toast(state.settings.budget ? `Monthly budget set to ${money(state.settings.budget)}` : 'Monthly budget removed');
  render();
});

let searchTimer;
$('#txSearch').addEventListener('input', ev => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.tx.q = ev.target.value; renderTransactions(); }, 150);
});
$('#txPeriod').addEventListener('change', ev => { state.tx.period = ev.target.value; renderTransactions(); });
$('#txCategory').addEventListener('change', ev => { state.tx.category = ev.target.value; renderTransactions(); });
$('#txMode').addEventListener('change', ev => { state.tx.mode = ev.target.value; renderTransactions(); });
$('#txSort').addEventListener('change', ev => { state.tx.sort = ev.target.value; renderTransactions(); });
$('#txFrom').addEventListener('change', ev => { state.tx.from = ev.target.value; if (!state.tx.to) state.tx.to = $('#txTo').value; renderTransactions(); });
$('#txTo').addEventListener('change', ev => { state.tx.to = ev.target.value; if (!state.tx.from) state.tx.from = $('#txFrom').value; renderTransactions(); });
$('#rpFrom').addEventListener('change', ev => { state.rp.from = ev.target.value; if (!state.rp.to) state.rp.to = $('#rpTo').value; renderReports(); });
$('#rpTo').addEventListener('change', ev => { state.rp.to = ev.target.value; if (!state.rp.from) state.rp.from = $('#rpFrom').value; renderReports(); });

$('#importFile').addEventListener('change', ev => { importBackup(ev.target.files[0]); ev.target.value = ''; });

darkQuery.addEventListener('change', () => { if (state.settings.theme === 'system') { applyTheme(); render(); } });
window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (v !== state.view && VIEW_TITLES[v]) go(v); });
window.addEventListener('storage', ev => {
  if (!Object.values(KEYS).includes(ev.key)) return;
  loadFromStorage();
  applyTheme();
  render();
});

/* ============ Init ============ */
function loadFromStorage() {
  hydrate({
    expenses: load(KEYS.expenses, []),
    categories: load(KEYS.categories, null),
    settings: load(KEYS.settings, {}),
  });
}

loadFromStorage();
persist();
applyTheme();
go(location.hash.slice(1) || state.view);
if (typeof Chart === 'undefined') {
  window.addEventListener('load', () => { if (typeof Chart !== 'undefined') render(); });
}
