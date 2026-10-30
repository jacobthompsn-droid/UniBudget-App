/* UniBudget: student budgeting app. Plain JS, no build step.
   All data is stored on the device in localStorage. */
(function () {
  'use strict';

  const D = window.UB_DATA;
  const CATS = D.categories;
  const CAT_KEYS = Object.keys(CATS);
  const KEY = 'unibudget:v1';

  /* ================= icons ================= */
  const I = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    budget: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    deals: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    goals: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h12v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 13.5h2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  };

  /* ================= helpers ================= */
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const round2 = (n) => Math.round(n * 100) / 100;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  function money(n, dec) {
    n = round2(n || 0);
    const d = dec != null ? dec : (n % 1 ? 2 : 0);
    return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function parseAmt(v) { const n = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isFinite(n) ? round2(n) : NaN; }
  function startOfWeek(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function weekBounds(offset) { const s = addDays(startOfWeek(new Date()), offset * 7); return [s, addDays(s, 7)]; }
  const fmtDay = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  function dayLabel(t) {
    const d = new Date(t), today = new Date(); today.setHours(0, 0, 0, 0);
    const day = new Date(d); day.setHours(0, 0, 0, 0);
    const diff = Math.round((today - day) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }
  const timeLabel = (t) => new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  function toDateInput(t) { const d = new Date(t); const p = (n) => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
  function fromDateInput(v, keepTime) {
    const [y, m, dd] = v.split('-').map(Number); if (!y) return Date.now();
    const base = keepTime ? new Date(keepTime) : new Date();
    const d = new Date(y, m - 1, dd, base.getHours(), base.getMinutes()); return +d;
  }

  /* ================= storage ================= */
  function blank() {
    return { v: 1, profile: { name: '', onboarded: false }, plan: { food: 0, transport: 0, school: 0, fun: 0, other: 0 },
      expenses: [], goals: [], dealUses: {}, dealSaved: 0, created: Date.now() };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const s = Object.assign(blank(), JSON.parse(raw));
      s.plan = Object.assign(blank().plan, s.plan || {});
      s.profile = Object.assign(blank().profile, s.profile || {});
      if (!Array.isArray(s.expenses)) s.expenses = [];
      if (!Array.isArray(s.goals)) s.goals = [];
      if (!s.dealUses || typeof s.dealUses !== 'object') s.dealUses = {};
      return s;
    } catch (e) { return blank(); }
  }
  let storageOK = true;
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { if (storageOK) { storageOK = false; toast('Could not save on this device. Private browsing may block storage.', 'bad'); } }
  }
  let S = load();

  /* ================= derived ================= */
  const planTotal = () => CAT_KEYS.reduce((a, k) => a + (+S.plan[k] || 0), 0);
  function expIn(offset) { const [a, b] = weekBounds(offset); return S.expenses.filter((e) => e.t >= +a && e.t < +b).sort((x, y) => y.t - x.t); }
  const sum = (list) => round2(list.reduce((a, e) => a + e.amt, 0));
  const spentCat = (list, k) => sum(list.filter((e) => e.cat === k));
  const goalSaved = () => round2(S.goals.reduce((a, g) => a + g.saved, 0));
  function daysLeft() { const [, end] = weekBounds(0); return Math.max(1, Math.ceil((end - new Date()) / 86400000)); }

  /* ================= ui state ================= */
  const ui = { tab: 'home', week: 0, dealCat: 'All', dealQ: '', onb: 0, lastFocus: null };

  /* ================= toast ================= */
  let toastTimer, toastUndo = null;
  function toast(msg, kind, undo) {
    const t = $('toast');
    toastUndo = undo || null;
    t.className = 'toast ' + (kind || '');
    t.innerHTML = '<span class="msg">' + esc(msg) + '</span>' + (undo ? '<button type="button" data-act="undo">Undo</button>' : '');
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.classList.remove('show'); toastUndo = null; }, undo ? 5000 : 3000);
  }

  /* ================= sheet ================= */
  function openSheet(html) {
    ui.lastFocus = document.activeElement;
    const sh = $('sheet'), bd = $('backdrop');
    sh.innerHTML = '<div class="grab" aria-hidden="true"></div>' + html;
    sh.hidden = false; bd.hidden = false;
    requestAnimationFrame(() => { sh.classList.add('show'); bd.classList.add('show'); });
    setTimeout(() => {
      const f = sh.querySelector('[data-autofocus]') || sh.querySelector('input,button.btn');
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
    }, 320);
  }
  function closeSheet() {
    const sh = $('sheet'), bd = $('backdrop');
    if (sh.hidden) return;
    sh.classList.remove('show'); bd.classList.remove('show');
    setTimeout(() => { sh.hidden = true; bd.hidden = true; sh.innerHTML = ''; }, 300);
    if (ui.lastFocus && document.contains(ui.lastFocus)) { try { ui.lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }
  const sheetOpen = () => !$('sheet').hidden;

  /* ================= render ================= */
  const TABS = [['home', 'Home'], ['budget', 'Budget'], ['deals', 'Deals'], ['goals', 'Goals']];
  function render() {
    const onb = !S.profile.onboarded;
    $('tabbar').hidden = onb;
    $('fab').hidden = onb || ui.tab !== 'budget';
    $('content').classList.toggle('no-tabs', onb);
    $('topbar').classList.toggle('hidden', onb);
    if (onb) { $('content').innerHTML = Onboarding(); return; }
    $('tabbar').innerHTML = TABS.map(([k, l]) => '<button type="button" class="tab" data-act="go" data-arg="' + k + '"' + (ui.tab === k ? ' aria-current="page"' : '') + '>' + I[k] + '<span>' + l + '</span></button>').join('');
    $('topbar').innerHTML = Top();
    const html = { home: Home, budget: Budget, deals: Deals, goals: Goals }[ui.tab]();
    $('content').innerHTML = '<div class="fade">' + html + '</div>';
    if (ui.tab === 'deals') renderDealList();
  }
  function Top() {
    const t = {
      home: ['<div class="brand">UniBudget</div>', S.profile.name ? 'Hi, ' + esc(S.profile.name) : ''],
      budget: ['<h1 class="title">Weekly Planner</h1>', ''],
      deals: ['<h1 class="title">Student Deals</h1>', 'Local discounts near campus'],
      goals: ['<h1 class="title">Savings Goals</h1>', S.goals.length + ' goal' + (S.goals.length === 1 ? '' : 's')]
    }[ui.tab];
    return '<div class="grow">' + t[0] + (t[1] ? '<div class="sub">' + t[1] + '</div>' : '') + '</div>' +
      '<button type="button" class="iconbtn" data-act="settings" aria-label="Settings">' + I.gear + '</button>';
  }

  /* ---------- onboarding ---------- */
  function Onboarding() {
    const steps = (n) => '<div class="steps" aria-hidden="true">' + [0, 1, 2].map((i) => '<i class="' + (i <= n ? 'on' : '') + '"></i>').join('') + '</div>';
    if (ui.onb === 0) {
      return '<div class="onb fade">' +
        '<div class="logo-big">' + I.wallet + '</div>' +
        '<h1>Save more.<br>Stress less.</h1>' +
        '<p class="lead">UniBudget helps college students plan each week, find student deals, and save for what matters.</p>' +
        '<div class="features">' +
        '<div class="feature"><div class="num">1</div><div><b>Weekly Budget Planner</b><span>Know what you can spend and get alerts before you overspend.</span></div></div>' +
        '<div class="feature"><div class="num">2</div><div><b>Student Discounts</b><span>Local deals near campus, all in one place.</span></div></div>' +
        '<div class="feature"><div class="num">3</div><div><b>Savings Tracker</b><span>Set goals and watch your progress grow.</span></div></div>' +
        '</div><div class="spacer"></div>' +
        '<button type="button" class="btn primary" data-act="onbNext">Get started</button>' +
        '<p class="pilot" style="text-align:center">No bank login needed. Your data stays on this device.</p></div>';
    }
    if (ui.onb === 1) {
      return '<form class="onb fade" data-form="onbPlan" novalidate>' + steps(1) +
        '<h1 style="margin-top:0">Your week</h1><p class="lead">How much money do you have to spend each week? Include food, rides, school costs and fun.</p>' +
        '<div class="field"><label for="oName">Your first name (optional)</label><input id="oName" name="name" autocomplete="given-name" maxlength="24" value="' + esc(S.profile.name) + '"></div>' +
        '<div class="field"><label for="oTotal">Weekly spending money</label><input id="oTotal" name="total" inputmode="decimal" placeholder="e.g. 150" value="' + (planTotal() || '') + '" data-autofocus></div>' +
        '<p class="pilot">We will split it into a starter plan: 40% food, 15% transport, 15% school, 20% fun, 10% other. You can change it anytime.</p>' +
        '<div class="err" id="oErr"></div><div class="spacer"></div>' +
        '<div class="btnrow"><button type="button" class="btn plain" data-act="onbBack">Back</button><button type="submit" class="btn primary">Continue</button></div></form>';
    }
    return '<form class="onb fade" data-form="onbGoal" novalidate>' + steps(2) +
      '<h1 style="margin-top:0">Something to save for?</h1><p class="lead">Add a first savings goal, like a trip, a laptop, or an emergency fund.</p>' +
      '<div class="field"><label for="ogName">Goal name</label><input id="ogName" name="name" maxlength="28" placeholder="e.g. Spring break trip"></div>' +
      '<div class="field"><label for="ogTarget">Target amount</label><input id="ogTarget" name="target" inputmode="decimal" placeholder="e.g. 400"></div>' +
      '<div class="err" id="oErr"></div><div class="spacer"></div>' +
      '<div class="btnrow"><button type="button" class="btn plain" data-act="onbFinish">Skip for now</button><button type="submit" class="btn primary">Finish</button></div></form>';
  }

  /* ---------- home ---------- */
  function Home() {
    const T = planTotal(), list = expIn(0), sp = sum(list), left = round2(T - sp);
    const pct = T ? sp / T * 100 : 0;
    const cls = pct > 100 ? 'over' : pct >= 80 ? 'warn' : '';
    const status = pct > 100 ? 'Over budget by ' + money(sp - T) : pct >= 80 ? 'Careful, ' + Math.round(pct) + '% used' : 'You are on track';
    const perDay = Math.max(left, 0) / daysLeft();
    const deals = D.deals.slice().sort((a, b) => (S.dealUses[a.id] ? 1 : 0) - (S.dealUses[b.id] ? 1 : 0)).slice(0, 3);
    return '<button type="button" class="hero ' + cls + '" data-act="go" data-arg="budget" aria-label="Weekly budget details">' +
      '<div class="top"><span>Weekly Budget</span>' + I.wallet + '</div>' +
      '<div class="amt">' + money(Math.max(left, 0), 0) + ' <small>left of ' + money(T, 0) + '</small></div>' +
      '<div class="bar"><i style="width:' + Math.min(100, pct) + '%"></i></div>' +
      '<div class="foot"><span>' + status + '</span><span>' + daysLeft() + 'd left · ~' + money(perDay, 0) + '/day</span></div></button>' +
      '<div class="quick">' +
      '<button type="button" data-act="addExpense"><span class="qi">' + I.plus + '</span>Add Expense</button>' +
      '<button type="button" data-act="go" data-arg="deals"><span class="qi">' + I.deals + '</span>Discounts</button>' +
      '<button type="button" data-act="go" data-arg="goals"><span class="qi">' + I.goals + '</span>Goals</button>' +
      '<button type="button" data-act="plan"><span class="qi">' + I.cal + '</span>Plan</button></div>' +
      '<div class="stats">' +
      '<button type="button" class="card stat" data-act="go" data-arg="goals"><div class="lbl">Saved toward goals</div><div class="val">' + money(goalSaved(), 0) + '</div></button>' +
      '<button type="button" class="card stat" data-act="go" data-arg="deals"><div class="lbl">Saved with deals</div><div class="val" style="color:var(--green-dark)">' + money(S.dealSaved) + '</div></button></div>' +
      '<div class="section"><h2>Top Student Discounts</h2><button type="button" class="link" data-act="go" data-arg="deals">See all ›</button></div>' +
      '<div class="card list">' + deals.map(dealRow).join('') + '</div>' +
      '<div class="section"><h2>Recent Spending</h2><button type="button" class="link" data-act="go" data-arg="budget">See all ›</button></div>' +
      '<div class="card list">' + (list.length ? list.slice(0, 3).map(expRow).join('') : '<div class="empty">No spending logged this week yet.<br>Tap Add Expense when you buy something.</div>') + '</div>';
  }
  function dealRow(d) {
    const uses = S.dealUses[d.id] || 0;
    return '<button type="button" class="item" data-act="deal" data-arg="' + d.id + '">' +
      '<span class="logo" style="background:' + d.color + '" aria-hidden="true">' + esc(d.name[0]) + '</span>' +
      '<span class="grow"><span class="name ellip" style="display:block">' + esc(d.name) + '</span><span class="small ellip" style="display:block">' + esc(d.offer) + '</span></span>' +
      (uses ? '<span class="tag gray">Used</span>' : '') + '<span class="chev">' + I.chev + '</span></button>';
  }
  function expRow(e) {
    const c = CATS[e.cat] || CATS.other;
    return '<button type="button" class="item" data-act="editExpense" data-arg="' + e.id + '">' +
      '<span class="emoji" style="background:' + c.soft + '" aria-hidden="true">' + c.icon + '</span>' +
      '<span class="grow"><span class="name ellip" style="display:block">' + esc(e.note || c.label) + '</span><span class="small" style="display:block">' + c.label + ' · ' + (dayLabel(e.t) === 'Today' ? 'Today, ' : '') + timeLabel(e.t) + '</span></span>' +
      '<span class="amt-neg">-' + money(e.amt, 2) + '</span></button>';
  }

  /* ---------- budget ---------- */
  function Budget() {
    const [ws, we] = weekBounds(ui.week);
    const list = expIn(ui.week), T = planTotal(), sp = sum(list);
    const label = ui.week === 0 ? 'This week' : ui.week === -1 ? 'Last week' : fmtDay(ws) + ' week';
    let html = '<div class="weeknav">' +
      '<button type="button" class="iconbtn" data-act="week" data-arg="-1" aria-label="Previous week">' + I.left + '</button>' +
      '<div class="wk">' + label + '<div class="small" style="font-weight:500">' + fmtDay(ws) + ' to ' + fmtDay(addDays(we, -1)) + '</div></div>' +
      '<button type="button" class="iconbtn" data-act="week" data-arg="1" aria-label="Next week"' + (ui.week >= 0 ? ' disabled style="opacity:.35"' : '') + '>' + I.chev + '</button></div>' +
      '<div class="card summary">' +
      '<div><div class="small">Budget</div><div class="big">' + money(T, 0) + '</div></div>' +
      '<div><div class="small">Spent</div><div class="big">' + money(sp) + '</div></div>' +
      '<div><div class="small">Left</div><div class="big" style="color:' + (T - sp < 0 ? 'var(--red)' : 'var(--green-dark)') + '">' + money(T - sp) + '</div></div></div>' +
      '<div class="section"><h2>Spending by category</h2><button type="button" class="link" data-act="plan">Edit plan</button></div><div class="card" style="padding:4px 16px">';
    html += CAT_KEYS.map((k) => {
      const c = CATS[k], s = spentCat(list, k), lim = +S.plan[k] || 0, p = lim ? s / lim * 100 : (s ? 100 : 0);
      const col = p > 100 ? 'var(--red)' : p >= 80 ? 'var(--amber)' : c.color;
      const note = p > 100 ? ' <span class="over">· over</span>' : '';
      return '<div class="catrow"><div class="top"><span>' + c.icon + ' <b>' + c.label + '</b>' + note + '</span>' +
        '<span class="' + (p > 100 ? 'over' : '') + '">' + money(s) + ' <span class="muted">/ ' + money(lim, 0) + '</span></span></div>' +
        '<div class="bar" role="progressbar" aria-label="' + c.label + ' spending" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(Math.min(100, p)) + '"><i style="width:' + Math.min(100, p) + '%;background:' + col + '"></i></div></div>';
    }).join('');
    html += '</div><div class="section"><h2>Expenses</h2><span class="small">' + list.length + ' item' + (list.length === 1 ? '' : 's') + '</span></div>';
    if (!list.length) return html + '<div class="card"><div class="empty">' + (ui.week === 0 ? 'Nothing logged this week.<br>Tap + to add your first expense.' : 'No expenses that week.') + '</div></div>';
    let day = '';
    html += list.map((e) => {
      const dl = dayLabel(e.t); let h = '';
      if (dl !== day) { h = (day ? '</div>' : '') + '<div class="daylabel">' + dl + '</div><div class="card list">'; day = dl; }
      return h + expRow(e);
    }).join('') + '</div>';
    return html;
  }

  function expenseSheet(e) {
    const editing = !!e;
    e = e || { amt: '', cat: 'food', note: '', t: Date.now() };
    return '<form data-form="expense" data-id="' + (editing ? e.id : '') + '" novalidate>' +
      '<h2 id="sheetTitle">' + (editing ? 'Edit expense' : 'Add expense') + '</h2><div class="small">Log a purchase to keep your week on track.</div>' +
      '<div class="bigamt"><span aria-hidden="true">$</span><input name="amt" inputmode="decimal" placeholder="0.00" aria-label="Amount in dollars" value="' + (editing ? e.amt.toFixed(2) : '') + '" data-autofocus></div>' +
      '<div class="catpick" role="group" aria-label="Category">' + CAT_KEYS.map((k) => '<button type="button" class="cp" data-act="pickCat" data-arg="' + k + '" aria-pressed="' + (k === e.cat) + '"><span aria-hidden="true">' + CATS[k].icon + '</span>' + CATS[k].label + '</button>').join('') + '</div>' +
      '<input type="hidden" name="cat" value="' + e.cat + '">' +
      '<div class="field"><label for="eNote">What was it for?</label><input id="eNote" name="note" maxlength="40" placeholder="e.g. Lunch with friends" value="' + esc(e.note) + '"></div>' +
      '<div class="field"><label for="eDate">Date</label><input id="eDate" name="date" type="date" max="' + toDateInput(Date.now()) + '" value="' + toDateInput(e.t) + '"></div>' +
      '<div class="err" id="sErr"></div>' +
      '<div class="btnrow">' + (editing ? '<button type="button" class="btn danger" data-act="deleteExpense" data-arg="' + e.id + '">Delete</button>' : '') +
      '<button type="submit" class="btn primary">' + (editing ? 'Save' : 'Add expense') + '</button></div></form>';
  }
  function afterExpense(e, beforeCat) {
    const offset = Math.round((+startOfWeek(e.t) - +startOfWeek(new Date())) / (7 * 86400000));
    const list = expIn(offset), lim = +S.plan[e.cat] || 0, after = spentCat(list, e.cat), c = CATS[e.cat];
    const T = planTotal(), sp = sum(list);
    if (offset !== 0) return toast('Saved to the week of ' + fmtDay(startOfWeek(e.t)), 'good');
    if (lim && after > lim) return toast('You are ' + money(after - lim) + ' over your ' + c.label + ' budget this week', 'bad');
    if (lim && after / lim >= 0.8 && beforeCat / lim < 0.8) return toast('Heads up: ' + Math.round(after / lim * 100) + '% of your ' + c.label + ' budget is used', 'warn');
    if (T && sp > T) return toast('You are over your weekly budget', 'bad');
    toast('Added. ' + money(T - sp) + ' left this week', 'good');
  }

  function planSheet() {
    return '<form data-form="plan" novalidate><h2 id="sheetTitle">Your weekly plan</h2><div class="small">Enter your weekly spending money, tap Auto plan, then adjust any category.</div>' +
      '<div class="field"><label for="pTotal">Money available per week</label><div class="row"><input id="pTotal" name="total" inputmode="decimal" value="' + planTotal() + '" style="flex:1"><button type="button" class="btn ghost sm" data-act="autoSplit">Auto plan</button></div></div>' +
      '<div class="field"><span class="lbl">Category limits</span>' + CAT_KEYS.map((k) =>
        '<div class="planrow"><span class="emoji" style="background:' + CATS[k].soft + ';width:36px;height:36px;font-size:18px" aria-hidden="true">' + CATS[k].icon + '</span>' +
        '<label class="grow" for="p_' + k + '" style="font-weight:600">' + CATS[k].label + '</label><span aria-hidden="true">$</span><input id="p_' + k + '" name="' + k + '" inputmode="decimal" value="' + (+S.plan[k] || 0) + '" data-input="syncTotal"></div>').join('') +
      '</div><div class="err" id="sErr"></div><button type="submit" class="btn primary" style="margin-top:14px">Save plan</button></form>';
  }
  function splitInto(total) {
    const out = {}; let acc = 0;
    CAT_KEYS.forEach((k, i) => { const v = i === CAT_KEYS.length - 1 ? round2(total - acc) : Math.round(total * D.split[k]); out[k] = v; acc += v; });
    return out;
  }

  /* ---------- deals ---------- */
  function Deals() {
    return '<div class="card banner"><div><div class="small" style="color:var(--green-dark);font-weight:700">You have saved with deals</div><div style="font-size:26px;font-weight:800;color:var(--green-dark)">' + money(S.dealSaved) + '</div></div><div style="font-size:32px" aria-hidden="true">💸</div></div>' +
      '<label class="search" style="margin-top:14px">' + I.search + '<span class="sr" style="position:absolute;left:-9999px">Search deals</span><input id="dq" type="search" placeholder="Search deals or stores" value="' + esc(ui.dealQ) + '" data-input="dealSearch"></label>' +
      '<div class="chips" role="group" aria-label="Filter by category">' + D.dealCats.map((c) => '<button type="button" class="chip" data-act="dealCat" data-arg="' + c + '" aria-pressed="' + (c === ui.dealCat) + '">' + c + '</button>').join('') + '</div>' +
      '<div id="dealList" style="margin-top:10px"></div>' +
      '<p class="pilot">Pilot offers from early partners. Show the code and your student ID at checkout.</p>';
  }
  function renderDealList() {
    const box = $('dealList'); if (!box) return;
    const q = ui.dealQ.trim().toLowerCase();
    const items = D.deals.filter((d) => (ui.dealCat === 'All' || d.cat === ui.dealCat) && (d.name + ' ' + d.offer + ' ' + d.cat).toLowerCase().includes(q));
    box.innerHTML = items.length ? items.map((d) => {
      const uses = S.dealUses[d.id] || 0;
      return '<button type="button" class="card deal" data-act="deal" data-arg="' + d.id + '">' +
        '<span class="logo" style="background:' + d.color + '" aria-hidden="true">' + esc(d.name[0]) + '</span>' +
        '<span class="grow"><span class="name ellip" style="display:block">' + esc(d.name) + '</span><span class="small ellip" style="display:block">' + esc(d.offer) + '</span>' +
        '<span class="meta"><span class="tag' + (uses ? ' gray' : '') + '">' + (uses ? 'Used ' + uses + '×' : 'Save ~' + money(d.save)) + '</span><span class="pin">' + I.pin + esc(d.where) + '</span></span></span>' +
        '<span class="chev">' + I.chev + '</span></button>';
    }).join('') : '<div class="empty">No deals match your search.</div>';
  }
  function dealSheet(id) {
    const d = D.deals.find((x) => x.id === id); if (!d) return '';
    const uses = S.dealUses[id] || 0;
    return '<div class="row"><span class="logo" style="background:' + d.color + ';width:54px;height:54px;font-size:20px" aria-hidden="true">' + esc(d.name[0]) + '</span>' +
      '<div><h2 id="sheetTitle">' + esc(d.name) + '</h2><div class="small">' + d.cat + ' · ' + esc(d.where) + '</div></div></div>' +
      '<div style="font-size:17px;font-weight:700;margin-top:16px">' + esc(d.offer) + '</div>' +
      '<div class="small" style="margin-top:4px">' + esc(d.terms) + ' Estimated savings: <b>' + money(d.save) + '</b> per use.</div>' +
      '<div class="code" aria-label="Discount code ' + esc(d.code) + '">' + esc(d.code) + '</div>' +
      (uses ? '<div class="small" style="text-align:center;margin-bottom:10px">You have used this deal ' + uses + ' time' + (uses === 1 ? '' : 's') + '.</div>' : '') +
      '<button type="button" class="btn primary" data-act="useDeal" data-arg="' + id + '">' + (uses ? 'I used it again' : 'I used this deal') + '</button>' +
      '<button type="button" class="btn plain" style="margin-top:10px" data-act="close">Close</button>';
  }

  /* ---------- goals ---------- */
  function Goals() {
    const tgt = round2(S.goals.reduce((a, g) => a + g.target, 0)), sv = goalSaved();
    let html = '<div class="hero" style="padding:16px 18px"><div class="top"><span>Total saved</span><span aria-hidden="true" style="font-size:24px">🐷</span></div>' +
      '<div class="amt" style="font-size:32px">' + money(sv, 0) + ' <small>of ' + money(tgt, 0) + '</small></div>' +
      '<div class="bar" style="margin-bottom:0"><i style="width:' + (tgt ? Math.min(100, sv / tgt * 100) : 0) + '%"></i></div></div>' +
      '<div class="section"><h2>Your goals</h2><button type="button" class="btn ghost sm" data-act="newGoal">+ New goal</button></div>';
    if (!S.goals.length) return html + '<div class="card"><div class="empty">No goals yet.<br>Tap + New goal to start saving for something.</div></div>';
    return html + S.goals.map((g) => {
      const p = Math.min(100, g.saved / g.target * 100), done = g.saved >= g.target;
      return '<div class="card goal"><div class="row" style="margin-bottom:12px">' +
        '<span class="emoji" style="background:var(--green-soft)" aria-hidden="true">' + g.icon + '</span>' +
        '<div class="grow"><div class="name ellip">' + esc(g.name) + '</div><div class="small">' + money(g.saved) + ' of ' + money(g.target, 0) + '</div></div>' +
        (done ? '<span class="done-badge">DONE</span>' : '<span class="pct">' + Math.round(p) + '%</span>') + '</div>' +
        '<div class="bar" role="progressbar" aria-label="' + esc(g.name) + ' progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(p) + '"><i style="width:' + p + '%;background:var(--green)"></i></div>' +
        '<div class="row" style="margin-top:12px;justify-content:space-between"><span class="small">' + (done ? 'Goal reached 🎉' : money(g.target - g.saved) + ' to go') + '</span>' +
        '<div class="row" style="gap:8px"><button type="button" class="btn plain sm" data-act="manageGoal" data-arg="' + g.id + '">Edit</button>' +
        '<button type="button" class="btn primary sm" data-act="addMoney" data-arg="' + g.id + '">+ Add money</button></div></div></div>';
    }).join('');
  }
  function moneySheet(g) {
    return '<form data-form="goalMoney" data-id="' + g.id + '" novalidate><h2 id="sheetTitle">' + g.icon + ' ' + esc(g.name) + '</h2><div class="small">' + money(g.saved) + ' saved · ' + money(Math.max(0, g.target - g.saved)) + ' to go</div>' +
      '<div class="bigamt"><span aria-hidden="true">$</span><input name="amt" inputmode="decimal" placeholder="0" aria-label="Amount to add" data-autofocus></div>' +
      '<div class="amtchips">' + [5, 10, 25, 50].map((v) => '<button type="button" class="chip" data-act="setAmt" data-arg="' + v + '">$' + v + '</button>').join('') + '</div>' +
      '<div class="err" id="sErr"></div>' +
      '<div class="btnrow"><button type="button" class="btn plain" data-act="withdraw" data-arg="' + g.id + '">Take out</button><button type="submit" class="btn primary">Add to goal</button></div></form>';
  }
  function goalForm(g) {
    const editing = !!g;
    g = g || { name: '', target: '', icon: D.goalIcons[0] };
    return '<form data-form="goal" data-id="' + (editing ? g.id : '') + '" novalidate><h2 id="sheetTitle">' + (editing ? 'Edit goal' : 'New savings goal') + '</h2><div class="small">Pick something worth saving for.</div>' +
      '<div class="field"><label for="gName">Goal name</label><input id="gName" name="name" maxlength="28" placeholder="e.g. Concert tickets" value="' + esc(g.name) + '" data-autofocus></div>' +
      '<div class="field"><label for="gTarget">Target amount</label><input id="gTarget" name="target" inputmode="decimal" placeholder="250" value="' + (g.target || '') + '"></div>' +
      '<div class="field"><span class="lbl">Icon</span><div class="chips" role="group" aria-label="Goal icon" style="margin:0 -20px;flex-wrap:wrap">' + D.goalIcons.map((i) => '<button type="button" class="chip" style="font-size:20px;padding:6px 12px" data-act="pickIcon" data-arg="' + i + '" aria-pressed="' + (i === g.icon) + '">' + i + '</button>').join('') + '</div></div>' +
      '<input type="hidden" name="icon" value="' + g.icon + '">' +
      '<div class="err" id="sErr"></div>' +
      '<div class="btnrow">' + (editing ? '<button type="button" class="btn danger" data-act="deleteGoal" data-arg="' + g.id + '">Delete</button>' : '') +
      '<button type="submit" class="btn primary">' + (editing ? 'Save' : 'Create goal') + '</button></div></form>';
  }

  /* ---------- settings ---------- */
  function settingsSheet() {
    return '<form data-form="settings" novalidate><h2 id="sheetTitle">Settings</h2><div class="small">Your data stays on this device. No bank login, and nothing is sold.</div>' +
      '<div class="field"><label for="sName">Your name</label><input id="sName" name="name" maxlength="24" value="' + esc(S.profile.name) + '"></div>' +
      '<button type="submit" class="btn ghost" style="margin-top:10px">Save name</button>' +
      '<div style="display:grid;gap:10px;margin-top:18px">' +
      '<button type="button" class="btn ghost" data-act="plan">Edit weekly plan</button>' +
      '<button type="button" class="btn plain" data-act="export">Back up my data</button>' +
      '<label class="btn plain" style="display:block;text-align:center">Restore from backup<input type="file" accept="application/json,.json" data-input="import" style="display:none"></label>' +
      '<button type="button" class="btn plain" data-act="sample">Load sample data</button>' +
      '<button type="button" class="btn danger" data-act="reset">Erase all data</button></div>' +
      '<p class="pilot" style="text-align:center">UniBudget v1.0 · Pilot</p></form>';
  }
  function sampleData() {
    const ws = +startOfWeek(new Date()), now = Date.now();
    const at = (d, h) => Math.min(now - 60000 * (d + 1), ws + d * 86400000 + h * 3600000);
    return {
      plan: { food: 100, transport: 40, school: 35, fun: 50, other: 25 },
      expenses: [
        { id: uid(), amt: 4.75, cat: 'food', note: 'Coffee before class', t: at(0, 8) },
        { id: uid(), amt: 32.4, cat: 'food', note: 'Groceries', t: at(1, 17) },
        { id: uid(), amt: 15, cat: 'transport', note: 'Bus pass top up', t: at(1, 9) },
        { id: uid(), amt: 12, cat: 'school', note: 'Lab notebook', t: at(2, 13) },
        { id: uid(), amt: 11, cat: 'fun', note: 'Movie night', t: at(2, 20) },
        { id: uid(), amt: 6, cat: 'other', note: 'Laundry', t: at(0, 11) }
      ],
      goals: [
        { id: uid(), name: 'Spring Break Trip', icon: '🏖️', target: 400, saved: 150 },
        { id: uid(), name: 'Emergency Fund', icon: '🛟', target: 300, saved: 85 },
        { id: uid(), name: 'New Laptop', icon: '💻', target: 900, saved: 220 }
      ]
    };
  }

  /* ================= actions ================= */
  const A = {
    go(tab) { ui.tab = tab; ui.week = 0; closeSheet(); render(); $('content').scrollTop = 0; },
    settings() { openSheet(settingsSheet()); },
    close() { closeSheet(); },
    undo() { if (toastUndo) { toastUndo(); toastUndo = null; $('toast').classList.remove('show'); } },
    onbNext() { ui.onb = 1; render(); },
    onbBack() { ui.onb = 0; render(); },
    onbFinish() { S.profile.onboarded = true; save(); ui.tab = 'home'; render(); toast('You are all set. Log your first expense!', 'good'); },
    week(d) { ui.week = Math.min(0, ui.week + +d); render(); },
    addExpense() { openSheet(expenseSheet()); },
    editExpense(id) { const e = S.expenses.find((x) => x.id === id); if (e) openSheet(expenseSheet(e)); },
    pickCat(k, btn) {
      const f = btn.closest('form'); f.cat.value = k;
      f.querySelectorAll('.cp').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.arg === k)));
    },
    deleteExpense(id) {
      const i = S.expenses.findIndex((x) => x.id === id); if (i < 0) return;
      const [gone] = S.expenses.splice(i, 1); save(); closeSheet(); render();
      toast('Expense deleted', '', () => { S.expenses.push(gone); save(); render(); });
    },
    plan() { openSheet(planSheet()); },
    autoSplit(_, btn) {
      const f = btn.closest('form'); const T = parseAmt(f.total.value);
      if (!(T > 0)) { $('sErr').textContent = 'Enter your weekly money first.'; return; }
      const sp = splitInto(T); CAT_KEYS.forEach((k) => { f[k].value = sp[k]; }); $('sErr').textContent = '';
    },
    deal(id) { openSheet(dealSheet(id)); },
    dealCat(c) { ui.dealCat = c; document.querySelectorAll('.chips .chip[data-act="dealCat"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.arg === c))); renderDealList(); },
    useDeal(id) {
      const d = D.deals.find((x) => x.id === id); if (!d) return;
      S.dealUses[id] = (S.dealUses[id] || 0) + 1; S.dealSaved = round2(S.dealSaved + d.save); save(); closeSheet(); render();
      toast('Nice! You saved ' + money(d.save) + ' at ' + d.name, 'good', () => { S.dealUses[id] -= 1; if (!S.dealUses[id]) delete S.dealUses[id]; S.dealSaved = round2(S.dealSaved - d.save); save(); render(); });
    },
    newGoal() { openSheet(goalForm()); },
    manageGoal(id) { const g = S.goals.find((x) => x.id === id); if (g) openSheet(goalForm(g)); },
    pickIcon(i, btn) {
      const f = btn.closest('form'); f.icon.value = i;
      f.querySelectorAll('[data-act="pickIcon"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.arg === i)));
    },
    deleteGoal(id) {
      const i = S.goals.findIndex((x) => x.id === id); if (i < 0) return;
      const [gone] = S.goals.splice(i, 1); save(); closeSheet(); render();
      toast('Goal deleted', '', () => { S.goals.splice(i, 0, gone); save(); render(); });
    },
    addMoney(id) { const g = S.goals.find((x) => x.id === id); if (g) openSheet(moneySheet(g)); },
    setAmt(v, btn) { btn.closest('form').amt.value = v; },
    withdraw(id, btn) {
      const g = S.goals.find((x) => x.id === id); const amt = parseAmt(btn.closest('form').amt.value);
      if (!(amt > 0)) { $('sErr').textContent = 'Enter how much to take out.'; return; }
      if (amt > g.saved) { $('sErr').textContent = 'You only have ' + money(g.saved) + ' in this goal.'; return; }
      g.saved = round2(g.saved - amt); save(); closeSheet(); render(); toast(money(amt) + ' taken out of ' + g.name);
    },
    export() {
      try {
        const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'unibudget-backup-' + toDateInput(Date.now()) + '.json';
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        toast('Backup downloaded', 'good');
      } catch (e) { toast('Could not create a backup on this device', 'bad'); }
    },
    sample() {
      if (!confirm('Replace your budget, expenses and goals with sample data?')) return;
      Object.assign(S, sampleData()); S.profile.onboarded = true; save(); closeSheet(); ui.tab = 'home'; render(); toast('Sample data loaded', 'good');
    },
    reset() {
      if (!confirm('Erase all UniBudget data on this device? This cannot be undone.')) return;
      S = blank(); save(); closeSheet(); ui.onb = 0; ui.tab = 'home'; render();
    }
  };

  /* ================= forms ================= */
  const F = {
    onbPlan(f) {
      const T = parseAmt(f.total.value);
      if (!(T > 0)) { $('oErr').textContent = 'Enter how much you have to spend each week.'; f.total.focus(); return; }
      S.profile.name = f.name.value.trim().slice(0, 24); S.plan = splitInto(T); save(); ui.onb = 2; render();
    },
    onbGoal(f) {
      const name = f.name.value.trim(), target = parseAmt(f.target.value);
      if (!name && !f.target.value) return A.onbFinish();
      if (!name || !(target > 0)) { $('oErr').textContent = 'Add a goal name and a target amount, or skip for now.'; return; }
      S.goals.push({ id: uid(), name: name, icon: '🎓', target: target, saved: 0 }); A.onbFinish();
    },
    expense(f) {
      const amt = parseAmt(f.amt.value);
      if (!(amt > 0)) { $('sErr').textContent = 'Enter an amount above $0.'; f.amt.focus(); return; }
      if (amt > 100000) { $('sErr').textContent = 'That amount looks too large.'; return; }
      const id = f.dataset.id, cat = f.cat.value, note = f.note.value.trim().slice(0, 40);
      let e;
      if (id) {
        e = S.expenses.find((x) => x.id === id); if (!e) return closeSheet();
        e.amt = amt; e.cat = cat; e.note = note; e.t = fromDateInput(f.date.value, e.t);
        save(); closeSheet(); render(); return toast('Expense updated', 'good');
      }
      const t = fromDateInput(f.date.value);
      const off = Math.round((+startOfWeek(t) - +startOfWeek(new Date())) / (7 * 86400000));
      const before = spentCat(expIn(off), cat);
      e = { id: uid(), amt: amt, cat: cat, note: note, t: t };
      S.expenses.push(e); save(); closeSheet(); render(); afterExpense(e, before);
    },
    plan(f) {
      const p = {}; let bad = false;
      CAT_KEYS.forEach((k) => { const v = parseAmt(f[k].value || '0'); if (!(v >= 0)) bad = true; p[k] = v >= 0 ? v : 0; });
      if (bad) { $('sErr').textContent = 'Use numbers only for each category.'; return; }
      if (CAT_KEYS.reduce((a, k) => a + p[k], 0) <= 0) { $('sErr').textContent = 'Your plan needs a budget above $0.'; return; }
      S.plan = p; save(); closeSheet(); render(); toast('Plan saved: ' + money(planTotal(), 0) + ' per week', 'good');
    },
    goal(f) {
      const name = f.name.value.trim(), target = parseAmt(f.target.value);
      if (!name || !(target > 0)) { $('sErr').textContent = 'Add a name and a target amount.'; return; }
      if (f.dataset.id) { const g = S.goals.find((x) => x.id === f.dataset.id); if (g) { g.name = name; g.target = target; g.icon = f.icon.value; } }
      else S.goals.push({ id: uid(), name: name, icon: f.icon.value, target: target, saved: 0 });
      save(); closeSheet(); render(); toast(f.dataset.id ? 'Goal updated' : 'Goal created', 'good');
    },
    goalMoney(f) {
      const amt = parseAmt(f.amt.value); if (!(amt > 0)) { $('sErr').textContent = 'Enter an amount first.'; return; }
      const g = S.goals.find((x) => x.id === f.dataset.id); if (!g) return closeSheet();
      const was = g.saved >= g.target; g.saved = round2(g.saved + amt); save(); closeSheet(); render();
      if (!was && g.saved >= g.target) toast('Goal reached: ' + g.name + '! 🎉', 'good');
      else toast(money(amt) + ' added. ' + Math.round(Math.min(100, g.saved / g.target * 100)) + '% of the way there', 'good');
    },
    settings(f) { S.profile.name = f.name.value.trim().slice(0, 24); save(); closeSheet(); render(); toast('Saved', 'good'); }
  };

  /* ================= inputs ================= */
  const INP = {
    dealSearch(el) { ui.dealQ = el.value; renderDealList(); },
    syncTotal(el) { const f = el.closest('form'); f.total.value = round2(CAT_KEYS.reduce((a, k) => a + (parseAmt(f[k].value || '0') || 0), 0)); },
    import(el) {
      const file = el.files && el.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          if (!data || typeof data !== 'object' || !Array.isArray(data.expenses) || !data.plan) throw new Error('bad');
          localStorage.setItem(KEY, JSON.stringify(data)); S = load(); S.profile.onboarded = true; save();
          closeSheet(); ui.tab = 'home'; render(); toast('Backup restored', 'good');
        } catch (e) { toast('That file is not a UniBudget backup', 'bad'); }
      };
      r.readAsText(file);
    }
  };

  /* ================= wiring ================= */
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-act]');
    if (btn) {
      if (btn.disabled) return;
      const fn = A[btn.dataset.act]; if (fn) { ev.preventDefault(); fn(btn.dataset.arg, btn); }
      return;
    }
    if (ev.target === $('backdrop')) closeSheet();
  });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('form[data-form]'); if (!f) return;
    ev.preventDefault(); const fn = F[f.dataset.form]; if (fn) fn(f);
  });
  document.addEventListener('input', (ev) => { const el = ev.target; if (el.dataset && el.dataset.input && el.type !== 'file') { const fn = INP[el.dataset.input]; if (fn) fn(el); } });
  document.addEventListener('change', (ev) => { const el = ev.target; if (el.dataset && el.dataset.input === 'import') INP.import(el); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && sheetOpen()) closeSheet(); });
  $('fab').addEventListener('click', () => A.addExpense());
  /* Keep the week view fresh if the app stays open past midnight. */
  document.addEventListener('visibilitychange', () => { if (!document.hidden && S.profile.onboarded && !sheetOpen()) render(); });

  render();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
  }
})();
