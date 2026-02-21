// ─── FLEETFLOW MAIN APP ────────────────────────────────────────────────────────
let currentPage = 'dashboard';
let currentUser = null;
let notifOpen = false;
let charts = {};

// KPI counter animation
function animateCount(el, target, suffix = '', duration = 1200) {
  let start = 0, step = target / 60;
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start).toLocaleString() + suffix;
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ─── RENDER LOADING ────────────────────────────────────────────────────────────
function renderLoading() {
  document.getElementById('app').innerHTML = `
    <div id="loading-screen">
      <div class="loading-logo">FLEETFLOW</div>
      <div class="loading-bar-wrap"><div class="loading-bar-fill"></div></div>
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted);letter-spacing:2px">INITIALIZING SYSTEMS...</div>
    </div>`;

  const token = localStorage.getItem('ff_token');
  const user = localStorage.getItem('ff_user');

  setTimeout(() => {
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        currentUser = {
          email: parsedUser.email,
          role: parsedUser.role,
          initials: parsedUser.email.slice(0, 2).toUpperCase()
        };
        renderApp();
        loadDataFromBackend();
        return;
      } catch (e) {
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');
      }
    }
    renderLogin();
    setTimeout(initLoginScene, 80);
  }, 1200);
}

// ─── RENDER LOGIN ──────────────────────────────────────────────────────────────
function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div id="login-page">
      <canvas id="login-canvas" style="position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>
      <div class="login-bg-glow"></div>
      <div class="login-card">
        <div class="login-logo-mark">
          <div class="logo-icon"><svg viewBox="0 0 24 24" fill="currentColor" style="width:22px;height:22px;"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5" fill="#0F1117"/><circle cx="18.5" cy="18.5" r="2.5" fill="#0F1117"/><rect x="1" y="3" width="15" height="13" fill="none" stroke="#0F1117" stroke-width="1.5"/></svg></div>
          <div class="logo-text">FLEET<span>FLOW</span></div>
        </div>
        <div class="login-title">COMMAND ACCESS</div>
        <div class="login-subtitle">Fleet & Logistics Management System v2.1</div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-input" id="login-email" type="email" placeholder="ops@fleetflow.io" value="admin@fleetflow.io" autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="login-pass" type="password" placeholder="••••••••" value="fleet2024" />
          <div class="login-error" id="login-err">Invalid credentials. Please try again.</div>
        </div>
        <a href="#" class="forgot-link" onclick="showToast('Password reset link sent!','amber');return false;">Forgot Password?</a>
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-select" id="login-role">
            <option value="Manager">Manager</option>
            <option value="Dispatcher">Dispatcher</option>
            <option value="Safety Officer">Safety Officer</option>
            <option value="Financial Analyst">Financial Analyst</option>
          </select>
        </div>
        <button class="btn-primary" id="login-btn" onclick="doLogin()">LOGIN TO FLEETFLOW</button>
        <hr class="login-divider" />
        <div class="login-role-hint">🔐 Role-based access enforced · All data encrypted in transit</div>
        <div class="login-register-link">
          Don't have an account? <a href="#" onclick="renderRegister(); setTimeout(initLoginScene, 80); return false;">Create Account</a>
        </div>
      </div>
    </div>`;
}

// ─── RENDER REGISTER ───────────────────────────────────────────────────────────
function renderRegister() {
  if (typeof destroyLoginScene === 'function') destroyLoginScene();
  document.getElementById('app').innerHTML = `
    <div id="login-page">
      <canvas id="login-canvas" style="position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;"></canvas>
      <div class="login-bg-glow"></div>
      <div class="login-card">
        <div class="login-logo-mark">
          <div class="logo-icon"><svg viewBox="0 0 24 24" fill="currentColor" style="width:22px;height:22px;"><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5" fill="#0F1117"/><circle cx="18.5" cy="18.5" r="2.5" fill="#0F1117"/><rect x="1" y="3" width="15" height="13" fill="none" stroke="#0F1117" stroke-width="1.5"/></svg></div>
          <div class="logo-text">FLEET<span>FLOW</span></div>
        </div>
        <div class="login-title">CREATE ACCOUNT</div>
        <div class="login-subtitle">Register for Fleet & Logistics Management System v2.1</div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input class="form-input" id="reg-email" type="email" placeholder="yourname@company.io" autocomplete="off" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="reg-pass" type="password" placeholder="Min. 6 characters" />
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <input class="form-input" id="reg-pass-confirm" type="password" placeholder="Re-enter password" />
          <div class="login-error" id="reg-err">Registration failed.</div>
        </div>
        <div class="form-group">
          <label class="form-label">Role</label>
          <select class="form-select" id="reg-role">
            <option value="Manager">Manager</option>
            <option value="Dispatcher">Dispatcher</option>
            <option value="Safety Officer">Safety Officer</option>
            <option value="Financial Analyst">Financial Analyst</option>
          </select>
        </div>
        <button class="btn-primary" id="reg-btn" onclick="doRegister()">CREATE ACCOUNT</button>
        <hr class="login-divider" />
        <div class="login-role-hint">🔐 Role-based access enforced · All data encrypted in transit</div>
        <div class="login-register-link">
          Already have an account? <a href="#" onclick="renderLogin(); setTimeout(initLoginScene, 80); return false;">Sign In</a>
        </div>
      </div>
    </div>`;
}

function doRegister() {
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const passConfirm = document.getElementById('reg-pass-confirm').value;
  const role = document.getElementById('reg-role').value;
  const errEl = document.getElementById('reg-err');

  if (!email || !pass || !passConfirm) {
    errEl.textContent = 'All fields are required.';
    errEl.classList.add('show');
    return;
  }
  if (pass.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.classList.add('show');
    return;
  }
  if (pass !== passConfirm) {
    errEl.textContent = 'Passwords do not match.';
    errEl.classList.add('show');
    return;
  }

  const btn = document.getElementById('reg-btn');
  btn.textContent = 'CREATING ACCOUNT...'; btn.disabled = true;
  errEl.classList.remove('show');

  API.register(email, pass, role)
    .then(data => {
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));
      currentUser = { email: data.user.email, role: data.user.role, initials: data.user.email.slice(0, 2).toUpperCase() };
      if (typeof destroyLoginScene === 'function') destroyLoginScene();
      renderApp();
      API.seed().finally(() => loadDataFromBackend());
      showToast('Account created successfully! Welcome to FleetFlow.', 'green');
    })
    .catch(err => {
      btn.textContent = 'CREATE ACCOUNT'; btn.disabled = false;
      errEl.textContent = err.message || 'Registration failed. Please try again.';
      errEl.classList.add('show');
    });
}

function doLogin() {
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  const role = document.getElementById('login-role').value;
  if (!email || !pass) { document.getElementById('login-err').classList.add('show'); return; }

  const btn = document.getElementById('login-btn');
  btn.textContent = 'AUTHENTICATING...'; btn.disabled = true;

  API.login(email, pass)
    .then(data => {
      // Token + user stored in localStorage
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_user', JSON.stringify(data.user));
      currentUser = { email: data.user.email, role: data.user.role, initials: data.user.email.slice(0, 2).toUpperCase() };
      if (typeof destroyLoginScene === 'function') destroyLoginScene();
      renderApp();
      // Seed once, then load live data
      API.seed().finally(() => loadDataFromBackend());
    })
    .catch(err => {
      btn.textContent = 'LOGIN TO FLEETFLOW'; btn.disabled = false;
      const errEl = document.getElementById('login-err');
      if (errEl) { errEl.textContent = err.message || 'Invalid credentials'; errEl.classList.add('show'); }
    });
}

// ─── RENDER APP SHELL ──────────────────────────────────────────────────────────
function renderApp() {
  const hiddenForDispatcher = currentUser.role === 'Dispatcher' ? 'style="display:none"' : '';
  document.getElementById('app').innerHTML = `
    <div id="app-shell">
      ${renderSidebar()}
      <div class="topbar">
        <div class="topbar-title" id="topbar-title">COMMAND CENTER</div>
        <div class="topbar-time" id="topbar-time"></div>
        <div style="position:relative">
          <button class="notif-btn" id="notif-btn" onclick="toggleNotif()">
            ${svgIcon('bell')}
            <div class="notif-dot"></div>
          </button>
          <div class="notif-panel" id="notif-panel">${renderNotifPanel()}</div>
        </div>
      </div>
      <div class="main-content" id="main-content">
        <div class="page active" id="page-dashboard">${renderDashboard()}</div>
        <div class="page" id="page-vehicles">${renderVehicles()}</div>
        <div class="page" id="page-trips">${renderTrips()}</div>
        <div class="page" id="page-maintenance">${renderMaintenance()}</div>
        <div class="page" id="page-fuel">${renderFuel()}</div>
        <div class="page" id="page-drivers">${renderDrivers()}</div>
        <div class="page" id="page-analytics">${renderAnalytics()}</div>
      </div>
    </div>
    <div id="modals-container">${renderModals()}</div>
    ${renderToastEl()}`;

  startClock();
  setTimeout(initDashboardKPIs, 100);
  setTimeout(initGlobeScene, 350);
  document.addEventListener('click', e => {
    if (notifOpen && !e.target.closest('#notif-btn') && !e.target.closest('#notif-panel')) {
      document.getElementById('notif-panel').classList.remove('show');
      notifOpen = false;
    }
  });
}

function renderSidebar() {
  const dispatcher = currentUser.role === 'Dispatcher';
  const navItems = [
    { page: 'dashboard', icon: 'dash', label: 'Command Center' },
    { page: 'vehicles', icon: 'truck', label: 'Vehicle Registry' },
    { page: 'trips', icon: 'map', label: 'Trip Dispatcher' },
    { page: 'maintenance', icon: 'tool', label: 'Maintenance Logs' },
    { page: 'fuel', icon: 'fuel', label: 'Expenses & Fuel' },
    { page: 'drivers', icon: 'user', label: 'Driver Profiles' },
    { page: 'analytics', icon: 'chart', label: 'Analytics', restricted: dispatcher },
  ];
  const items = navItems.map(n => {
    const hidden = n.restricted ? 'style="display:none"' : '';
    return `<div class="nav-item${n.page === currentPage ? ' active' : ''}" onclick="switchPage('${n.page}')" ${hidden}>
      <span class="nav-icon">${svgIcon(n.icon)}</span>${n.label}
    </div>`;
  }).join('');

  return `
    <div class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon" style="background:var(--amber);display:flex;align-items:center;justify-content:center;border-radius:8px;">
           <svg viewBox="0 0 24 24" fill="#0F1117" style="width:20px;height:20px;"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5" fill="#F59E0B"/></svg>
        </div>
        <span class="logo-text">FLEET<span style="color:var(--amber)">FLOW</span></span>
      </div>
      <div class="sidebar-section-label">Navigation</div>
      <nav class="sidebar-nav">
        ${items}
        <div style="margin-top:auto; padding-top:20px; border-top:1px solid var(--border);">
            <div class="nav-item" onclick="loadDataFromBackend(); showToast('Syncing data...','blue')">
                <span class="nav-icon">${svgIcon('download')}</span>Sync Data
            </div>
            <div class="nav-item" style="color:var(--red);" onclick="doLogout()">
                <span class="nav-icon">${svgIcon('logout')}</span>Logout
            </div>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar">${currentUser.initials}</div>
          <div class="user-info">
            <div class="user-name">${currentUser.email}</div>
            <div class="user-role">${currentUser.role}</div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderNotifPanel() {
  return `
    <div class="notif-header">
      <h3>Notifications</h3>
      <span class="notif-count">${DB.notifications.length}</span>
    </div>
    ${DB.notifications.map(n => `
      <div class="notif-item">
        <div class="notif-ico ${n.type}">${n.icon}</div>
        <div class="notif-text"><strong>${n.title}</strong><span>${n.detail} · ${n.time}</span></div>
      </div>`).join('')}`;
}

function toggleNotif() {
  notifOpen = !notifOpen;
  document.getElementById('notif-panel').classList.toggle('show', notifOpen);
}

function switchPage(page) {
  if (page === 'analytics' && currentUser.role === 'Dispatcher') {
    showToast('Access denied: Dispatchers cannot view Financial Reports', 'red'); return;
  }
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  const navEl = document.getElementById('nav-' + page);
  if (pageEl) pageEl.classList.add('active');
  if (navEl) navEl.classList.add('active');
  const titles = { dashboard: 'COMMAND CENTER', vehicles: 'VEHICLE REGISTRY', trips: 'TRIP DISPATCHER', maintenance: 'MAINTENANCE LOGS', fuel: 'EXPENSES & FUEL', drivers: 'DRIVER PROFILES', analytics: 'ANALYTICS & REPORTS' };
  document.getElementById('topbar-title').textContent = titles[page] || page.toUpperCase();
  if (page === 'analytics') setTimeout(initCharts, 200);
}

function doLogout() {
  localStorage.removeItem('ff_token');
  localStorage.removeItem('ff_user');
  currentUser = null;
  document.querySelectorAll('canvas').forEach(c => { if (charts[c.id]) charts[c.id].destroy(); });
  charts = {};
  if (typeof destroyGlobeScene === 'function') destroyGlobeScene();
  renderLogin();
  setTimeout(initLoginScene, 80);
}

function startClock() {
  const update = () => {
    const el = document.getElementById('topbar-time');
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  };
  update(); setInterval(update, 1000);
}

function renderToastEl() {
  return `<div id="toast" style="position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;"></div>`;
}

function showToast(msg, type = 'green') {
  const colors = { green: 'var(--green)', amber: 'var(--amber)', red: 'var(--red)', blue: 'var(--blue)' };
  const t = document.createElement('div');
  t.style.cssText = `background:var(--bg-elevated);border:1px solid var(--border);border-left:3px solid ${colors[type] || colors.green};border-radius:8px;padding:12px 18px;font-size:13px;color:var(--text-primary);box-shadow:0 8px 32px rgba(0,0,0,0.5);pointer-events:all;animation:toast-in 0.3s ease both;max-width:320px;`;
  t.textContent = msg;
  const toast = document.getElementById('toast');
  if (toast) { toast.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = 'all 0.3s'; setTimeout(() => t.remove(), 300); }, 3000); }
}
const style = document.createElement('style');
style.textContent = '@keyframes toast-in{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}';
document.head.appendChild(style);
