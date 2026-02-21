// ─── MAINTENANCE PAGE ──────────────────────────────────────────────────────────
function renderMaintenance() {
  const OVERDUE_KM = 15000;
  return `
    <div class="section-header">
      <div><div class="section-title">MAINTENANCE & SERVICE LOGS</div><div class="section-subtitle">Track service history and vehicle health</div></div>
      <button class="btn btn-amber" onclick="openModal('add-maint-modal')">${svgIcon('plus')} Log Service</button>
    </div>
    <div class="stat-row">
      <div class="stat-mini"><div class="stat-mini-label">Total Services</div><div class="stat-mini-value">${DB.maintenance.length}</div></div>
      <div class="stat-mini"><div class="stat-mini-label">In Shop</div><div class="stat-mini-value" style="color:var(--red)">${DB.vehicles.filter(v => v.status === 'In Shop').length}</div></div>
      <div class="stat-mini"><div class="stat-mini-label">Total Service Cost</div><div class="stat-mini-value" style="color:var(--amber)">${fmtCurrency(DB.maintenance.reduce((s, m) => s + m.cost, 0))}</div></div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">SERVICE LOG</span><span style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">Sorted by date</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Service ID</th><th>Vehicle</th><th>Service Type</th><th>Date</th><th>Cost</th><th>Odometer</th><th>Notes</th><th>Status</th></tr></thead>
          <tbody id="maint-tbody">${renderMaintRows()}</tbody>
        </table>
      </div>
    </div>
    <div style="margin-top:20px">
      <div class="section-header"><div class="section-title">OVERDUE SERVICE WARNINGS</div></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px" id="overdue-cards">
        ${renderOverdueCards(OVERDUE_KM)}
      </div>
    </div>`;
}

function renderMaintRows() {
  return [...DB.maintenance].sort((a, b) => b.date.localeCompare(a.date)).map(m => {
    const v = getVehicle(m.vehicleId);
    return `<tr>
      <td class="td-mono">${m.id}</td>
      <td><strong>${v?.name || m.vehicleId}</strong></td>
      <td>${m.type}</td>
      <td class="td-mono">${m.date}</td>
      <td class="td-mono" style="color:var(--amber)">${fmtCurrency(m.cost)}</td>
      <td class="td-mono">${fmtNum(m.odometer)} km</td>
      <td style="font-size:12px;color:var(--text-muted);max-width:180px;white-space:normal">${m.notes}</td>
      <td>${v ? pillHTML(v.status) : ''}</td>
    </tr>`;
  }).join('');
}

function renderOverdueCards(overdueKm) {
  const cards = DB.vehicles.filter(v => {
    const lastService = DB.maintenance.filter(m => m.vehicleId === v.id).sort((a, b) => b.odometer - a.odometer)[0];
    return !lastService || (v.odometer - lastService.odometer) > overdueKm;
  });
  if (!cards.length) return `<div style="color:var(--text-muted);font-size:13px;padding:12px">✅ All vehicles are within service intervals</div>`;
  return cards.map(v => {
    const lastService = DB.maintenance.filter(m => m.vehicleId === v.id).sort((a, b) => b.odometer - a.odometer)[0];
    const kmSince = lastService ? fmtNum(v.odometer - lastService.odometer) : 'No record';
    return `<div class="card" style="border-color:rgba(239,68,68,0.3)">
      <div class="card-body" style="padding:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong>${v.name}</strong>
          <span class="warning-badge">⚠ OVERDUE</span>
        </div>
        <div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${v.plate} · ${v.type}</div>
        <div style="font-size:12px;color:var(--red);margin-top:8px">Km since last service: <strong>${kmSince}</strong></div>
        <button class="btn btn-sm btn-amber" style="margin-top:10px;width:100%" onclick="openModal('add-maint-modal')">Schedule Service</button>
      </div>
    </div>`;
  }).join('');
}

function submitMaintenance() {
  const vehicleId = document.getElementById('m-vehicle').value;
  const type = document.getElementById('m-type').value;
  const date = document.getElementById('m-date').value;
  const cost = parseFloat(document.getElementById('m-cost').value) || 0;
  const notes = document.getElementById('m-notes').value.trim();
  const v = getVehicle(vehicleId);
  if (!vehicleId || !type || !date) { showToast('Fill all required fields', 'red'); return; }
  API.createMaintenance({ vehicleId, type, date, cost, notes, odometer: v?.odometer || 0 })
    .then(() => {
      closeModal('add-maint-modal');
      showToast(`Service logged — ${v?.name || 'Vehicle'} marked In Shop`, 'amber');
      loadDataFromBackend();
    }).catch(err => showToast(err.message, 'red'));
}

// ─── FUEL & EXPENSES PAGE ──────────────────────────────────────────────────────
function renderFuel() {
  const fuelByVehicle = {};
  DB.vehicles.forEach(v => { fuelByVehicle[v.id] = { fuelCost: 0, maintCost: 0 }; });
  DB.fuel.forEach(f => { if (fuelByVehicle[f.vehicleId]) fuelByVehicle[f.vehicleId].fuelCost += f.liters * f.costPerLiter; });
  DB.maintenance.forEach(m => { if (fuelByVehicle[m.vehicleId]) fuelByVehicle[m.vehicleId].maintCost += m.cost; });

  return `
    <div class="section-header">
      <div><div class="section-title">EXPENSES & FUEL LOGGING</div><div class="section-subtitle">Per-vehicle operational cost tracking</div></div>
      <button class="btn btn-amber" onclick="openModal('add-fuel-modal')">${svgIcon('plus')} Log Fuel Entry</button>
    </div>
    <div class="fuel-summary-grid" id="fuel-summary">${renderFuelCards(fuelByVehicle)}</div>
    <div class="section-header"><div class="section-title">FUEL LOG</div></div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Entry ID</th><th>Vehicle</th><th>Liters</th><th>Cost/L</th><th>Total Cost</th><th>Date</th><th>Odometer</th></tr></thead>
          <tbody id="fuel-tbody">${renderFuelRows()}</tbody>
        </table>
      </div>
    </div>`;
}

function renderFuelCards(fuelByVehicle) {
  return DB.vehicles.slice(0, 5).map(v => {
    const data = fuelByVehicle[v.id] || { fuelCost: 0, maintCost: 0 };
    const total = data.fuelCost + data.maintCost;
    return `<div class="fuel-card">
      <div class="fuel-card-name">${v.name} ${pillHTML(v.status)}</div>
      <div class="fuel-breakdown">
        <div class="fuel-line"><span>Fuel Cost</span><span>${fmtCurrency(data.fuelCost)}</span></div>
        <div class="fuel-line"><span>Maintenance</span><span>${fmtCurrency(data.maintCost)}</span></div>
        <div class="fuel-total-line"><span>Total OpEx</span><span>${fmtCurrency(total)}</span></div>
      </div>
    </div>`;
  }).join('');
}

function renderFuelRows() {
  return [...DB.fuel].sort((a, b) => b.date.localeCompare(a.date)).map(f => {
    const v = getVehicle(f.vehicleId);
    const total = f.liters * f.costPerLiter;
    return `<tr>
      <td class="td-mono">${f.id}</td>
      <td>${v?.name || f.vehicleId}</td>
      <td class="td-mono">${f.liters} L</td>
      <td class="td-mono">${fmtCurrency(f.costPerLiter)}</td>
      <td class="td-mono" style="color:var(--amber)">${fmtCurrency(total)}</td>
      <td class="td-mono">${f.date}</td>
      <td class="td-mono">${fmtNum(f.odometer)} km</td>
    </tr>`;
  }).join('');
}

function submitFuel() {
  const vehicleId = document.getElementById('f-vehicle').value;
  const liters = parseFloat(document.getElementById('f-liters').value) || 0;
  const costPerLiter = parseFloat(document.getElementById('f-cpl').value) || 0;
  const date = document.getElementById('f-date').value;
  if (!vehicleId || !liters || !costPerLiter || !date) { showToast('Fill all required fields', 'red'); return; }
  API.createFuel({ vehicleId, liters, costPerLiter, date, odometer: getVehicle(vehicleId)?.odometer || 0 })
    .then(() => {
      closeModal('add-fuel-modal');
      showToast(`Fuel entry logged — ${fmtCurrency(liters * costPerLiter)} total`, 'green');
      loadDataFromBackend();
    }).catch(err => showToast(err.message, 'red'));
}

function calcFuelTotal() {
  const l = parseFloat(document.getElementById('f-liters').value) || 0;
  const c = parseFloat(document.getElementById('f-cpl').value) || 0;
  const el = document.getElementById('f-total');
  if (el) el.textContent = `Total: ${fmtCurrency(l * c)}`;
}
