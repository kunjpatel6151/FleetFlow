// ─── DRIVER PROFILES PAGE ──────────────────────────────────────────────────────
function renderDrivers() {
  return `
    <div class="section-header">
      <div><div class="section-title">DRIVER PROFILES & SAFETY</div><div class="section-subtitle">${DB.drivers.length} registered drivers</div></div>
      <button class="btn btn-amber" onclick="openModal('add-driver-modal')">${svgIcon('plus')} Add Driver</button>
    </div>
    <div class="driver-grid" id="driver-grid">${renderDriverCards()}</div>`;
}

function renderDriverCards() {
  return DB.drivers.map(d => {
    const expiring = isExpiringSoon(d.expiry);
    const expired = isExpired(d.expiry);
    const days = daysUntil(d.expiry);
    const completionRate = Math.round((d.tripsCompleted / d.totalTrips) * 100);
    const scoreColor = d.safetyScore >= 80 ? 'var(--green)' : d.safetyScore >= 60 ? 'var(--amber)' : 'var(--red)';
    return `<div class="driver-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <div class="driver-avatar">${d.name.split(' ').map(n => n[0]).join('')}</div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          ${pillHTML(d.status)}
          ${expired ? `<span class="warning-badge">🚫 EXPIRED</span>` : ''}
          ${!expired && expiring ? `<span class="warning-badge">⚠ EXP ${days}d</span>` : ''}
        </div>
      </div>
      <div class="driver-name">${d.name}</div>
      <div class="driver-meta">${d.license} · ${d.category} · Expires ${d.expiry}</div>
      <div class="driver-stat"><label>Safety Score</label><span style="color:${scoreColor}">${d.safetyScore}/100</span></div>
      <div class="progress-wrap" style="margin-bottom:10px">
        <div class="progress-fill" style="width:${d.safetyScore}%;background:${scoreColor}"></div>
      </div>
      <div class="driver-stat"><label>Trip Completion</label><span>${completionRate}%</span></div>
      <div class="progress-wrap" style="margin-bottom:12px">
        <div class="progress-fill progress-green" style="width:${completionRate}%"></div>
      </div>
      <div class="driver-stat"><label>Trips Done</label><span>${d.tripsCompleted}/${d.totalTrips}</span></div>
      <div style="display:flex;gap:8px;margin-top:14px;">
        <label class="toggle-wrap" style="flex:1;">
          <label class="toggle">
            <input type="checkbox" ${d.status === 'On Duty' ? 'checked' : ''} onchange="toggleDriverStatus('${d.id}',this.checked)">
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label">${d.status === 'On Duty' ? 'On Duty' : 'Off Duty'}</span>
        </label>
        <button class="btn btn-sm ${d.status === 'Suspended' ? 'btn-success' : 'btn-danger'}" onclick="suspendDriver('${d.id}')">
          ${d.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
        </button>
      </div>
    </div>`;
  }).join('');
}

function toggleDriverStatus(id, onDuty) {
  const d = getDriver(id); if (!d) return;
  if (d.status === 'Suspended') { showToast(`${d.name} is suspended — cannot change status`, 'red'); return; }
  const newStatus = onDuty ? 'On Duty' : 'Off Duty';
  API.updateDriver(id, { status: newStatus })
    .then(() => {
      d.status = newStatus;
      document.getElementById('driver-grid').innerHTML = renderDriverCards();
      showToast(`${d.name} → ${newStatus}`, onDuty ? 'green' : 'gray');
    }).catch(err => showToast(err.message, 'red'));
}

function suspendDriver(id) {
  const d = getDriver(id); if (!d) return;
  const newStatus = d.status === 'Suspended' ? 'Off Duty' : 'Suspended';
  API.updateDriver(id, { status: newStatus })
    .then(() => {
      d.status = newStatus;
      document.getElementById('driver-grid').innerHTML = renderDriverCards();
      showToast(`${d.name} ${newStatus === 'Suspended' ? 'suspended' : 'reinstated'}`, newStatus === 'Suspended' ? 'red' : 'green');
    }).catch(err => showToast(err.message, 'red'));
}

function submitDriver() {
  const name = document.getElementById('dr-name').value.trim();
  const license = document.getElementById('dr-license').value.trim().toUpperCase();
  const expiry = document.getElementById('dr-expiry').value;
  const category = document.getElementById('dr-category').value;
  if (!name || !license || !expiry) { showToast('Fill all required fields', 'red'); return; }
  API.createDriver({ name, license, expiry, category, status: 'Off Duty', safetyScore: 80, tripsCompleted: 0, totalTrips: 0 })
    .then(() => {
      closeModal('add-driver-modal');
      showToast(`${name} added to driver roster`, 'green');
      loadDataFromBackend();
    }).catch(err => showToast(err.message, 'red'));
}

// ─── ANALYTICS PAGE ────────────────────────────────────────────────────────────
function renderAnalytics() {
  if (currentUser?.role === 'Dispatcher') {
    return `<div class="access-denied">
      <div class="lock-icon">🔒</div>
      <h2>ACCESS RESTRICTED</h2>
      <p>Financial Reports are restricted to Managers and Financial Analysts</p>
    </div>`;
  }
  const totalRevenue = DB.trips.filter(t => t.status === 'Completed').reduce((s, t) => s + t.revenue, 0);
  const totalFuel = DB.fuel.reduce((s, f) => s + f.liters * f.costPerLiter, 0);
  const totalMaint = DB.maintenance.reduce((s, m) => s + m.cost, 0);
  const netProfit = totalRevenue - totalFuel - totalMaint;
  return `
    <div class="section-header">
      <div><div class="section-title">ANALYTICS & REPORTS</div><div class="section-subtitle">Fleet performance metrics and ROI analysis</div></div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="date-range">
          <input type="date" value="2026-01-01" />
          <span>to</span>
          <input type="date" value="2026-02-21" />
        </div>
        <button class="btn btn-ghost" onclick="showToast('CSV export ready','green')">${svgIcon('download')} CSV</button>
        <button class="btn btn-ghost" onclick="showToast('PDF generation started','amber')">${svgIcon('download')} PDF</button>
      </div>
    </div>
    <div class="kpi-grid">
      <div class="kpi-card" style="--kpi-color:var(--green);--kpi-bg:var(--green-bg)">
        <div class="kpi-icon">${svgIcon('chart')}</div>
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value" style="font-size:30px">${fmtCurrency(totalRevenue)}</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--red);--kpi-bg:var(--red-bg)">
        <div class="kpi-label">Total Fuel Cost</div>
        <div class="kpi-value" style="font-size:30px">${fmtCurrency(totalFuel)}</div>
      </div>
      <div class="kpi-card" style="--kpi-color:var(--amber);--kpi-bg:var(--amber-glow)">
        <div class="kpi-label">Maintenance Cost</div>
        <div class="kpi-value" style="font-size:30px">${fmtCurrency(totalMaint)}</div>
      </div>
      <div class="kpi-card" style="--kpi-color:${netProfit >= 0 ? 'var(--green)' : 'var(--red)'};--kpi-bg:${netProfit >= 0 ? 'var(--green-bg)' : 'var(--red-bg)'}">
        <div class="kpi-label">Net Profit</div>
        <div class="kpi-value" style="font-size:30px;color:${netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">${fmtCurrency(netProfit)}</div>
      </div>
    </div>
    <div class="analytics-grid">
      <div class="chart-card">
        <div class="section-title" style="font-size:16px;margin-bottom:16px">FUEL EFFICIENCY (km/L)</div>
        <div class="chart-container"><canvas id="chart-fuel"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="section-title" style="font-size:16px;margin-bottom:16px">FLEET UTILIZATION TREND</div>
        <div class="chart-container"><canvas id="chart-util"></canvas></div>
      </div>
    </div>
    <div style="margin-top:20px">
      <div class="roi-card">
        <div class="section-title" style="font-size:16px;margin-bottom:14px">VEHICLE ROI ANALYSIS</div>
        <div class="roi-formula">ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost × 100%</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Vehicle</th><th>Revenue</th><th>Fuel Cost</th><th>Maintenance</th><th>Acquisition</th><th>ROI</th><th>Performance</th></tr></thead>
            <tbody>${renderROITable()}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function renderROITable() {
  return DB.vehicles.map(v => {
    const vTrips = DB.trips.filter(t => t.vehicleId === v.id && t.status === 'Completed');
    const rev = vTrips.reduce((s, t) => s + t.revenue, 0);
    const fuel = DB.fuel.filter(f => f.vehicleId === v.id).reduce((s, f) => s + f.liters * f.costPerLiter, 0);
    const maint = DB.maintenance.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
    const roi = v.acquisitionCost > 0 ? ((rev - (maint + fuel)) / v.acquisitionCost * 100) : 0;
    const isTop = roi >= 5, isBot = roi < 0;
    const badge = isTop ? '<span class="pill green">⭐ Top</span>' : isBot ? '<span class="pill red">⬇ Low</span>' : '<span class="pill gray">Average</span>';
    const roiColor = roi >= 0 ? 'var(--green)' : 'var(--red)';
    return `<tr>
      <td><strong>${v.name}</strong></td>
      <td class="td-mono" style="color:var(--green)">${fmtCurrency(rev)}</td>
      <td class="td-mono">${fmtCurrency(fuel)}</td>
      <td class="td-mono">${fmtCurrency(maint)}</td>
      <td class="td-mono">${fmtCurrency(v.acquisitionCost)}</td>
      <td class="td-mono" style="color:${roiColor}">${roi.toFixed(2)}%</td>
      <td>${badge}</td>
    </tr>`;
  }).join('');
}

function initCharts() {
  const chartDefaults = {
    color: '#8B8FA8',
    borderColor: '#2A2D3E',
  };
  Chart.defaults.color = '#8B8FA8';
  Chart.defaults.borderColor = '#2A2D3E';

  // Fuel efficiency chart
  const fuelEl = document.getElementById('chart-fuel');
  if (fuelEl) {
    if (charts['chart-fuel']) charts['chart-fuel'].destroy();

    const effData = DB.vehicles.slice(0, 7).map(v => {
      const entries = DB.fuel.filter(f => f.vehicleId === v.id);
      const totalLiters = entries.reduce((s, f) => s + f.liters, 0);
      const eff = totalLiters > 0 ? (v.odometer / (totalLiters * 10)).toFixed(1) : 0;
      return { label: v.name.split(' ')[0], eff: parseFloat(eff) };
    });

    charts['chart-fuel'] = new Chart(fuelEl, {
      type: 'bar',
      data: {
        labels: effData.map(d => d.label),
        datasets: [{ label: 'km/L', data: effData.map(d => d.eff), backgroundColor: 'rgba(245,158,11,0.7)', borderColor: '#F59E0B', borderWidth: 2, borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
  }

  // Utilization line chart
  const utilEl = document.getElementById('chart-util');
  if (utilEl) {
    if (charts['chart-util']) charts['chart-util'].destroy();
    charts['chart-util'] = new Chart(utilEl, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{ label: 'Utilization %', data: [65, 78, 72, 85, 80, 88], borderColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', tension: 0.4, fill: true, pointBackgroundColor: '#F59E0B', pointBorderColor: '#0F1117', pointBorderWidth: 2, pointRadius: 5 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: 50, max: 100 } } }
    });
  }
}
