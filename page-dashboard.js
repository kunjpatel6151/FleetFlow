// ─── DASHBOARD PAGE ────────────────────────────────────────────────────────────
function renderDashboard() {
  const active = DB.vehicles.filter(v => v.status === 'Active' || v.status === 'On Trip').length;
  const alerts = DB.maintenance.length + DB.drivers.filter(d => isExpiringSoon(d.expiry)).length;
  const utilRate = Math.round((DB.trips.filter(t => t.status === 'Dispatched' || t.status === 'Completed').length / DB.trips.length) * 100);
  const pending = DB.trips.filter(t => t.status === 'Draft').length;
  return `
    <div class="kpi-grid">
      <div class="kpi-card" style="--kpi-color:var(--green);--kpi-bg:var(--green-bg)">
        <div class="kpi-icon">${svgIcon('truck')}</div>
        <div class="kpi-label">Active Fleet</div>
        <div class="kpi-value" id="kpi-fleet">0</div>
        <div class="kpi-delta">↑ 2 vs last week</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--red);--kpi-bg:var(--red-bg)">
        <div class="kpi-icon">${svgIcon('tool')}</div>
        <div class="kpi-label">Maintenance Alerts</div>
        <div class="kpi-value" id="kpi-alerts">0</div>
        <div class="kpi-delta neg">↑ 3 new alerts</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--amber);--kpi-bg:var(--amber-glow)">
        <div class="kpi-icon">${svgIcon('chart')}</div>
        <div class="kpi-label">Utilization Rate</div>
        <div class="kpi-value"><span id="kpi-util">0</span><span class="unit">%</span></div>
        <div class="kpi-delta">↑ 5% this month</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--blue);--kpi-bg:var(--blue-bg)">
        <div class="kpi-icon">${svgIcon('map')}</div>
        <div class="kpi-label">Pending Cargo</div>
        <div class="kpi-value" id="kpi-pending">0</div>
        <div class="kpi-delta">↓ 1 dispatched today</div>
      </div>
    </div>
    <div class="section-header" style="margin-top:8px;">
      <div>
        <div class="section-title">LIVE VEHICLE STATUS</div>
        <div class="section-subtitle">Real-time fleet overview — updated 30s</div>
      </div>
      <div class="filter-pills" id="dash-filter">
        <div class="filter-pill active" onclick="dashFilter(this,'All')">All</div>
        <div class="filter-pill" onclick="dashFilter(this,'Truck')">Truck</div>
        <div class="filter-pill" onclick="dashFilter(this,'Van')">Van</div>
        <div class="filter-pill" onclick="dashFilter(this,'Bike')">Bike</div>
      </div>
    </div>
    <div class="dashboard-grid">
      <div class="card">
        <div class="table-wrap">
          <table id="dash-vehicle-table">
            <thead><tr>
              <th>Vehicle</th><th>Plate</th><th>Type</th><th>Odometer</th><th>Status</th><th>Driver</th>
            </tr></thead>
            <tbody id="dash-tbody">${renderDashTableRows('All')}</tbody>
          </table>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><span class="card-title">FLEET MAP</span><span class="pill green">Live</span></div>
          <div class="map-placeholder" id="fleet-map" style="padding:0;overflow:hidden;position:relative;">
            <canvas id="globe-canvas" style="width:100%;height:100%;display:block;"></canvas>
            <div style="position:absolute;top:10px;left:12px;font-family:var(--font-mono);font-size:10px;color:var(--amber);letter-spacing:1.5px;z-index:2;pointer-events:none;">◉ LIVE · 7 VEHICLES TRACKED</div>
            <div style="position:absolute;bottom:10px;right:12px;font-family:var(--font-mono);font-size:9px;color:var(--text-muted);z-index:2;pointer-events:none;">drag to rotate</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">FLEET COMPOSITION</span></div>
          <div class="card-body" style="padding:16px">
            ${['Truck', 'Van', 'Bike'].map(t => {
    const cnt = DB.vehicles.filter(v => v.type === t).length;
    const total = DB.vehicles.length;
    const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
    const barClass = t === 'Truck' ? 'progress-amber' : t === 'Van' ? 'progress-green' : 'progress-red';
    return `<div style="margin-bottom:12px">
                <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px;">
                  <span style="color:var(--text-secondary)">${t}s</span>
                  <span class="td-mono">${cnt} units · ${pct}%</span>
                </div>
                <div class="progress-wrap">
                  <div class="progress-fill ${barClass}" style="width:${pct}%"></div>
                </div>
              </div>`;
  }).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

function renderDashTableRows(filter) {
  return DB.vehicles
    .filter(v => filter === 'All' || v.type === filter)
    .map(v => {
      const driver = DB.trips.find(t => t.vehicleId === v.id && (t.status === 'Dispatched' || t.status === 'On Trip'));
      const driverName = driver ? (getDriver(driver.driverId)?.name || '—') : '—';
      return `<tr>
        <td><strong>${v.name}</strong><br><span style="font-size:10px;color:var(--text-muted)">${v.id}</span></td>
        <td class="td-mono">${v.plate}</td>
        <td>${v.type}</td>
        <td class="td-mono">${fmtNum(v.odometer)} km</td>
        <td>${pillHTML(v.status)}</td>
        <td style="color:var(--text-secondary);font-size:12px">${driverName}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No vehicles match filter</td></tr>';
}

function dashFilter(el, type) {
  document.querySelectorAll('#dash-filter .filter-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('dash-tbody').innerHTML = renderDashTableRows(type);
}

function initDashboardKPIs() {
  const totalVehicles = DB.vehicles.length;
  const active = DB.vehicles.filter(v => v.status === 'Active' || v.status === 'On Trip').length;
  const alerts = DB.maintenance.length + DB.drivers.filter(d => isExpiringSoon(d.expiry)).length;
  const totalTrips = DB.trips.length;
  const utilRate = totalTrips > 0 ? Math.round((DB.trips.filter(t => t.status === 'Dispatched' || t.status === 'Completed').length / totalTrips) * 100) : 0;
  const pending = DB.trips.filter(t => t.status === 'Draft').length;

  const k1 = document.getElementById('kpi-fleet'), k2 = document.getElementById('kpi-alerts');
  const k3 = document.getElementById('kpi-util'), k4 = document.getElementById('kpi-pending');
  if (k1) animateCount(k1, active);
  if (k2) animateCount(k2, alerts);
  if (k3) animateCount(k3, utilRate, '%');
  if (k4) animateCount(k4, pending);
}

function initMapDots() {
  const map = document.getElementById('fleet-map'); if (!map) return;
  map.querySelectorAll('.vehicle-map-dot').forEach(d => d.remove());
  DB.vehicles.forEach((v, idx) => {
    const dot = document.createElement('div');
    dot.className = 'vehicle-map-dot';
    const x = 15 + ((idx * 23) % 70);
    const y = 20 + ((idx * 17) % 65);
    const color = pillClass(v.status) === 'green' ? 'var(--green)' :
      pillClass(v.status) === 'amber' ? 'var(--amber)' :
        pillClass(v.status) === 'red' ? 'var(--red)' : 'var(--gray)';
    dot.setAttribute('data-tip', `${v.name} · ${v.status}`);
    dot.style.cssText = `left:${x}%;top:${y}%;background:${color};box-shadow:0 0 8px ${color}`;
    map.appendChild(dot);
  });
}
