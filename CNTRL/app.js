// ============================================================
// INIT
// ============================================================
const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

const els = {
  loginScreen: document.getElementById('login-screen'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  loginError: document.getElementById('login-error'),
  loginSubmit: document.getElementById('login-submit'),
  app: document.getElementById('app'),
  logoutBtn: document.getElementById('logout-btn'),
  todayDate: document.getElementById('today-date'),
  balanceTotal: document.getElementById('balance-total'),
  chatForm: document.getElementById('chat-form'),
  chatInput: document.getElementById('chat-input'),
  chatLog: document.getElementById('chat-log'),
  chatSubmit: document.getElementById('chat-submit'),
  eventsList: document.getElementById('events-list'),
  txBody: document.getElementById('tx-table-body'),
};

let monthlyChart = null;
let chartOffset = 0;       // 0 = últimos 6 meses terminando en el actual; +1 = 6 meses más atrás, etc.
let allTransactionsCache = [];

// ============================================================
// TOGGLE DEL CHAT (ocultar/mostrar, recuerda tu preferencia)
// ============================================================
const talkbackEl = document.querySelector('.talkback');
const talkbackHead = document.getElementById('talkback-head');
const talkbackToggle = document.getElementById('talkback-toggle');
const CHAT_COLLAPSE_KEY = 'cntrl-chat-collapsed';

function setChatCollapsed(collapsed) {
  talkbackEl.classList.toggle('collapsed', collapsed);
  talkbackToggle.textContent = collapsed ? '▸' : '▾';
  talkbackToggle.setAttribute('aria-label', collapsed ? 'Mostrar chat' : 'Ocultar chat');
  try { localStorage.setItem(CHAT_COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (e) {}
}

let storedCollapsed = '0';
try { storedCollapsed = localStorage.getItem(CHAT_COLLAPSE_KEY) || '0'; } catch (e) {}
setChatCollapsed(storedCollapsed === '1');

talkbackHead.addEventListener('click', () => {
  setChatCollapsed(!talkbackEl.classList.contains('collapsed'));
});

const fmtMoney = (n, currency = 'EUR') =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(n || 0);

const SOURCE_LABEL = {
  desarrollo_software: { chip: 'tag-dev', label: 'Ingeniería' },
  dj_productor: { chip: 'tag-dj', label: 'Music Life' },
  otro: { chip: 'tag-otro', label: 'Otro' },
};

// ============================================================
// AUTH
// ============================================================
async function checkSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    showApp();
  } else {
    showLogin();
  }
}

function showLogin() {
  els.loginScreen.classList.remove('hidden');
  els.app.classList.add('hidden');
}

function showApp() {
  els.loginScreen.classList.add('hidden');
  els.app.classList.remove('hidden');
  els.todayDate.textContent = new Date().toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' });
  loadAll();
  subscribeRealtime();
}

els.loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  els.loginError.textContent = '';
  els.loginSubmit.disabled = true;
  els.loginSubmit.textContent = 'Entrando…';
  const { error } = await sb.auth.signInWithPassword({
    email: els.loginEmail.value.trim(),
    password: els.loginPassword.value,
  });
  els.loginSubmit.disabled = false;
  els.loginSubmit.textContent = 'Entrar';
  if (error) {
    els.loginError.textContent = 'No se pudo entrar: ' + error.message;
    return;
  }
  showApp();
});

els.logoutBtn.addEventListener('click', async () => {
  await sb.auth.signOut();
  showLogin();
});

// ============================================================
// DATA LOADING
// ============================================================
async function loadAll() {
  const [{ data: transactions, error: txErr }, { data: events, error: evErr }] = await Promise.all([
    sb.from('transactions').select('*').order('created_at', { ascending: false }).limit(500),
    sb.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date', { ascending: true }).limit(10),
  ]);

  if (txErr) console.error(txErr);
  if (evErr) console.error(evErr);

  renderChannels(transactions || []);
  renderBalance(transactions || []);
  allTransactionsCache = transactions || [];
  renderChart(allTransactionsCache);
  renderPersonalExpenses(transactions || []);
  renderRecentTx((transactions || []).slice(0, 12));
  renderEvents(events || []);
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function renderChannels(transactions) {
  const channels = ['desarrollo_software', 'dj_productor'];
  const monthTx = transactions.filter(t => isThisMonth(t.transaction_date));

  const totals = {};
  channels.forEach(c => { totals[c] = { in: 0, out: 0 }; });
  monthTx.forEach(t => {
    if (!totals[t.source]) return;
    if (t.type === 'ingreso') totals[t.source].in += Number(t.amount);
    else totals[t.source].out += Number(t.amount);
  });

  const maxVal = Math.max(1, ...channels.map(c => Math.max(totals[c].in, totals[c].out)));

  const map = { desarrollo_software: 'dev', dj_productor: 'dj' };
  channels.forEach(c => {
    const key = map[c];
    const { in: inn, out } = totals[c];
    document.getElementById(`fader-in-${key}`).style.height = `${Math.min(100, (inn / maxVal) * 100)}%`;
    document.getElementById(`fader-out-${key}`).style.height = `${Math.min(100, (out / maxVal) * 100)}%`;
    document.getElementById(`${key}-in`).textContent = fmtMoney(inn);
    document.getElementById(`${key}-out`).textContent = fmtMoney(out);
    const neto = document.getElementById(`${key}-neto`);
    neto.textContent = fmtMoney(inn - out);
    neto.style.color = (inn - out) >= 0 ? 'var(--accent-dev)' : 'var(--danger)';
    const pctEl = document.getElementById(`${key}-pct`);
    pctEl.textContent = inn > 0 ? `${Math.round((out / inn) * 100)}%` : '—';
  });

  // % global gastado sobre ingresado (todos los canales + personal, mes actual)
  const totalIn = monthTx.filter(t => t.type === 'ingreso').reduce((a, t) => a + Number(t.amount), 0);
  const totalOut = monthTx.filter(t => t.type === 'gasto').reduce((a, t) => a + Number(t.amount), 0);
  const spendRatioEl = document.getElementById('spend-ratio');
  spendRatioEl.textContent = totalIn > 0 ? `${Math.round((totalOut / totalIn) * 100)}% del ingreso del mes ya gastado` : '';
}

function renderBalance(transactions) {
  const total = transactions.reduce((acc, t) => acc + (t.type === 'ingreso' ? Number(t.amount) : -Number(t.amount)), 0);
  els.balanceTotal.textContent = fmtMoney(total);
  els.balanceTotal.style.color = total >= 0 ? 'var(--text)' : 'var(--danger)';
}

function renderRecentTx(transactions) {
  if (!transactions.length) {
    els.txBody.innerHTML = '<tr><td colspan="4" class="empty-state">Sin movimientos todavía.</td></tr>';
    return;
  }
  els.txBody.innerHTML = transactions.map(t => {
    const src = SOURCE_LABEL[t.source] || SOURCE_LABEL.otro;
    const sign = t.type === 'ingreso' ? '+' : '−';
    const cls = t.type === 'ingreso' ? 'amount-in' : 'amount-out';
    const dateFmt = new Date(t.transaction_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    return `<tr>
      <td>${dateFmt}</td>
      <td><span class="tag-chip ${src.chip}">${src.label}</span></td>
      <td>${t.description || '—'}</td>
      <td class="num ${cls}">${sign} ${fmtMoney(Math.abs(t.amount), t.currency)}</td>
    </tr>`;
  }).join('');
}

function renderEvents(events) {
  if (!events.length) {
    els.eventsList.innerHTML = '<li class="empty-state">Sin eventos próximos.</li>';
    return;
  }
  const now = new Date();
  els.eventsList.innerHTML = events.map(ev => {
    const d = new Date(ev.event_date);
    const days = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    const countdown = days <= 0 ? 'Hoy' : `en ${days}d`;
    return `<li class="event-item">
      <div class="event-info">
        <span class="event-name">${ev.event_name}</span>
        <span class="event-venue">${ev.venue || ''} · ${d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
      </div>
      <span class="event-countdown">${countdown}</span>
    </li>`;
  }).join('');
}

function renderPersonalExpenses(transactions) {
  const monthTx = transactions.filter(t => isThisMonth(t.transaction_date) && t.type === 'gasto' && !t.source);
  const totals = {};
  monthTx.forEach(t => {
    const cat = t.personal_category || 'otro';
    totals[cat] = (totals[cat] || 0) + Number(t.amount);
  });

  const container = document.getElementById('personal-list');
  const totalEl = document.getElementById('personal-total');
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = entries.reduce((acc, [, v]) => acc + v, 0);
  totalEl.textContent = fmtMoney(grandTotal);

  if (!entries.length) {
    container.innerHTML = '<p class="empty-state">Sin gastos personales este mes.</p>';
    return;
  }

  const max = Math.max(...entries.map(([, v]) => v));
  container.innerHTML = entries.map(([cat, val]) => `
    <div class="personal-channel">
      <div class="personal-fader-track">
        <div class="personal-fader-fill" style="height:${Math.max(4, (val / max) * 100)}%"></div>
      </div>
      <span class="personal-label">${cat}</span>
      <span class="personal-amount">${fmtMoney(val)}</span>
      <span class="personal-pct">${grandTotal > 0 ? Math.round((val / grandTotal) * 100) : 0}%</span>
    </div>
  `).join('');
}

function renderChart(transactions) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - chartOffset * 6 - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('es-ES', { month: 'short' }), year: d.getFullYear(), in: 0, out: 0 });
  }
  transactions.forEach(t => {
    const d = new Date(t.transaction_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find(m => m.key === key);
    if (!m) return;
    if (t.type === 'ingreso') m.in += Number(t.amount); else m.out += Number(t.amount);
  });

  const rangeLabel = document.getElementById('chart-range-label');
  rangeLabel.textContent = `${months[0].label} – ${months[5].label} ${months[5].year}`;
  document.getElementById('chart-next').disabled = chartOffset === 0;

  const ctx = document.getElementById('monthly-chart');
  const data = {
    labels: months.map(m => m.label),
    datasets: [
      { label: 'Ingresos', data: months.map(m => m.in), backgroundColor: '#45c4b0', borderRadius: 4 },
      { label: 'Gastos', data: months.map(m => m.out), backgroundColor: '#ff5c5c', borderRadius: 4 },
    ],
  };
  if (monthlyChart) {
    monthlyChart.data = data;
    monthlyChart.update();
    return;
  }
  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#8a8d98', font: { family: 'Inter', size: 12 } } } },
      scales: {
        x: { ticks: { color: '#8a8d98' }, grid: { display: false } },
        y: { ticks: { color: '#8a8d98' }, grid: { color: '#2a2d36' } },
      },
    },
  });
}

document.getElementById('chart-prev').addEventListener('click', () => {
  chartOffset += 1;
  renderChart(allTransactionsCache);
});
document.getElementById('chart-next').addEventListener('click', () => {
  if (chartOffset === 0) return;
  chartOffset -= 1;
  renderChart(allTransactionsCache);
});

// ============================================================
// REALTIME
// ============================================================
function subscribeRealtime() {
  sb.channel('finanzas-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadAll())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadAll())
    .subscribe((status) => {
      console.log('[CNTRL] realtime status:', status);
    });
}

// ============================================================
// CHAT CON EL AGENTE (n8n)
// ============================================================
function appendMessage(text, who) {
  const p = document.createElement('p');
  p.className = who === 'user' ? 'user-msg' : 'agent-msg';
  p.textContent = text;
  els.chatLog.appendChild(p);
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

els.chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = els.chatInput.value.trim();
  if (!message) return;
  appendMessage(message, 'user');
  els.chatInput.value = '';
  els.chatSubmit.disabled = true;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (CONFIG.DASHBOARD_SHARED_SECRET) headers['x-dashboard-secret'] = CONFIG.DASHBOARD_SHARED_SECRET;

    const res = await fetch(CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch (e) { console.warn('Respuesta no era JSON:', raw); }
    appendMessage(data.reply || 'Registrado (sin confirmación de texto, revisa el dashboard).', 'agent');
  } catch (err) {
    console.error(err);
    appendMessage('No pude confirmar con el agente, pero si el dato se guardó debería aparecer abajo en unos segundos.', 'agent');
  } finally {
    els.chatSubmit.disabled = false;
    // el realtime debería refrescar solo, pero forzamos un par de reintentos por si acaso
    loadAll();
    setTimeout(loadAll, 1500);
    setTimeout(loadAll, 4000);
  }
});

// ============================================================
// START
// ============================================================
checkSession();
