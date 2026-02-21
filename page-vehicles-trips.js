// ─── VEHICLE REGISTRY ──────────────────────────────────────────────────────────
function renderVehicles() {
  return `
    <div class="section-header">
      <div>
        <div class="section-title">VEHICLE REGISTRY</div>
        <div class="section-subtitle">${DB.vehicles.length} vehicles registered</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <div class="search-wrap">
          <span class="search-icon">${svgIcon('search')}</span>
          <input class="search-input" id="veh-search" placeholder="Search vehicles..." oninput="filterVehicles()" />
        </div>
        ${canCreate() ? `<button class="btn btn-amber" onclick="openModal('add-vehicle-modal')">${svgIcon('plus')} Add Vehicle</button>` : ''}
      </div>
    </div>
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th onclick="sortVehicles('name')">Vehicle Name ↕</th>
            <th>Plate</th>
            <th onclick="sortVehicles('type')">Type ↕</th>
            <th onclick="sortVehicles('capacity')">Capacity (kg) ↕</th>
            <th onclick="sortVehicles('odometer')">Odometer (km) ↕</th>
            <th>Status</th>
            <th>Out of Service</th>
            <th>Actions</th>
          </tr></thead>
          <tbody id="vehicles-tbody">${renderVehicleRows()}</tbody>
        </table>
      </div>
    </div>`;
}

function renderVehicleRows(list) {
  const vl = list || DB.vehicles;
  return vl.map(v => `
    <tr id="vrow-${v.id}" class="${v.status === 'In Shop' ? '' : ''}">
      <td><strong>${v.name}</strong><br><span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">${v.id}</span></td>
      <td class="td-mono">${v.plate}</td>
      <td>${v.type}</td>
      <td class="td-mono">${fmtNum(v.capacity)} kg</td>
      <td class="td-mono">${fmtNum(v.odometer)} km</td>
      <td>${pillHTML(v.status)}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${v.status === 'In Shop' ? 'checked' : ''} onchange="toggleOutOfService('${v.id}',this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="btn btn-sm btn-ghost" onclick="openEditVehicle('${v.id}')">${svgIcon('edit')}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${v.id}')">${svgIcon('trash')}</button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">No vehicles found</td></tr>';
}

let vSortCol = '', vSortAsc = true;
function sortVehicles(col) {
  if (vSortCol === col) vSortAsc = !vSortAsc; else { vSortCol = col; vSortAsc = true; }
  const sorted = [...DB.vehicles].sort((a, b) => { const va = a[col], vb = b[col]; return vSortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1); });
  document.getElementById('vehicles-tbody').innerHTML = renderVehicleRows(sorted);
}

function filterVehicles() {
  const q = document.getElementById('veh-search').value.toLowerCase();
  const f = DB.vehicles.filter(v => (v.name + v.plate + v.type).toLowerCase().includes(q));
  document.getElementById('vehicles-tbody').innerHTML = renderVehicleRows(f);
}

function toggleOutOfService(id, checked) {
  const v = getVehicle(id); if (!v) return;
  const newStatus = checked ? 'In Shop' : 'Active';
  API.updateVehicle(id, { status: newStatus })
    .then(() => {
      v.status = newStatus;
      document.getElementById('vehicles-tbody').innerHTML = renderVehicleRows();
      showToast(`${v.name} marked as ${newStatus}`, checked ? 'red' : 'green');
    }).catch(err => showToast(err.message, 'red'));
}

function deleteVehicle(id) {
  const v = getVehicle(id); if (!v) return;
  if (!confirm(`Remove ${v.name} from registry?`)) return;
  API.deleteVehicle(id)
    .then(() => {
      DB.vehicles = DB.vehicles.filter(x => x.id !== id);
      document.getElementById('vehicles-tbody').innerHTML = renderVehicleRows();
      showToast(`${v.name} removed from registry`, 'amber');
    }).catch(err => showToast(err.message, 'red'));
}

function openEditVehicle(id) {
  const v = getVehicle(id); if (!v) return;
  document.getElementById('v-id').value = v.id;
  document.getElementById('v-name').value = v.name;
  document.getElementById('v-plate').value = v.plate;
  document.getElementById('v-type').value = v.type;
  document.getElementById('v-capacity').value = v.capacity;
  document.getElementById('v-odometer').value = v.odometer;
  document.getElementById('v-cost').value = v.acquisitionCost;
  document.getElementById('add-vehicle-modal-title').textContent = 'Edit Vehicle';
  openModal('add-vehicle-modal');
}

function submitVehicle() {
  const id = document.getElementById('v-id').value;
  const name = document.getElementById('v-name').value.trim();
  const plate = document.getElementById('v-plate').value.trim().toUpperCase();
  const type = document.getElementById('v-type').value;
  const capacity = parseInt(document.getElementById('v-capacity').value);
  const odometer = parseInt(document.getElementById('v-odometer').value) || 0;
  const cost = parseInt(document.getElementById('v-cost').value) || 0;
  const plateErr = document.getElementById('v-plate-err');

  if (!name || !plate || !capacity) { showToast('Please fill all required fields', 'red'); return; }
  const dupPlate = DB.vehicles.find(v => v.plate === plate && v.id !== id);
  if (dupPlate) { plateErr.classList.add('show'); return; }
  plateErr.classList.remove('show');

  const payload = { name, plate, type, capacity, odometer, acquisitionCost: cost };
  const call = id ? API.updateVehicle(id, payload) : API.createVehicle(payload);
  call.then(saved => {
    closeModal('add-vehicle-modal');
    showToast(id ? `${name} updated` : `${name} added to registry`, 'green');
    return loadDataFromBackend();
  }).catch(err => showToast(err.message, 'red'));
}

// ─── TRIPS PAGE ────────────────────────────────────────────────────────────────
function renderTrips() {
  const avVehicles = DB.vehicles.filter(v => v.status === 'Active');
  const avDrivers = DB.drivers.filter(d => d.status === 'On Duty' && !isExpired(d.expiry));
  return `
    <div class="section-header">
      <div><div class="section-title">TRIP DISPATCHER</div><div class="section-subtitle">Manage and dispatch cargo trips</div></div>
      ${canCreate() ? `<button class="btn btn-amber" onclick="openModal('add-trip-modal')">${svgIcon('plus')} New Trip</button>` : ''}
    </div>
    <div class="card" style="margin-bottom:20px;">
      <div class="card-header"><span class="card-title">ACTIVE TRIPS</span>
        <div class="filter-pills" id="trip-filter">
          <div class="filter-pill active" onclick="filterTrips(this,'All')">All</div>
          <div class="filter-pill" onclick="filterTrips(this,'Draft')">Draft</div>
          <div class="filter-pill" onclick="filterTrips(this,'Dispatched')">Dispatched</div>
          <div class="filter-pill" onclick="filterTrips(this,'Completed')">Completed</div>
          <div class="filter-pill" onclick="filterTrips(this,'Cancelled')">Cancelled</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Route</th><th>Cargo (kg)</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="trips-tbody">${renderTripRows('All')}</tbody>
        </table>
      </div>
    </div>`;
}

function renderTripRows(filter) {
  return DB.trips
    .filter(t => filter === 'All' || t.status === filter)
    .map(t => {
      const v = getVehicle(t.vehicleId), d = getDriver(t.driverId);
      const transitions = {
        Draft: [['Dispatched', 'btn-amber', 'Dispatch'], ['Cancelled', 'btn-danger', 'Cancel']],
        Dispatched: [['Completed', 'btn-success', 'Complete'], ['Cancelled', 'btn-danger', 'Cancel']],
        Completed: [], Cancelled: []
      };
      const btns = (transitions[t.status] || []).map(([ns, cls, lbl]) =>
        `<button class="btn btn-sm ${cls}" onclick="updateTripStatus('${t.id}','${ns}')">${lbl}</button>`).join('');
      return `<tr>
        <td class="td-mono">${t.id}</td>
        <td>${v?.name || t.vehicleId}<br><span style="font-size:10px;color:var(--text-muted)">${v?.plate || ''}</span></td>
        <td style="font-size:12px">${d?.name || t.driverId}</td>
        <td style="font-size:12px;color:var(--text-secondary)">${t.origin}<br>→ ${t.destination}</td>
        <td class="td-mono">${fmtNum(t.cargo)}</td>
        <td class="td-mono">${t.date}</td>
        <td>${pillHTML(t.status)}</td>
        <td><div style="display:flex;gap:5px;flex-wrap:wrap">${btns}</div></td>
      </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">No trips found</td></tr>';
}

function filterTrips(el, filter) {
  document.querySelectorAll('#trip-filter .filter-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('trips-tbody').innerHTML = renderTripRows(filter);
}

function updateTripStatus(id, newStatus) {
  API.updateTrip(id, { status: newStatus })
    .then(() => {
      // Update vehicle status locally for instant feedback
      const t = DB.trips.find(x => x.id === id || x.id === id);
      if (t) {
        t.status = newStatus;
        if (newStatus === 'Dispatched') { const v = getVehicle(t.vehicleId); if (v) v.status = 'On Trip'; }
        if (newStatus === 'Completed' || newStatus === 'Cancelled') { const v = getVehicle(t.vehicleId); if (v && v.status === 'On Trip') v.status = 'Active'; }
      }
      document.getElementById('trips-tbody').innerHTML = renderTripRows('All');
      document.querySelectorAll('#trip-filter .filter-pill').forEach(p => p.classList.remove('active'));
      document.querySelector('#trip-filter .filter-pill').classList.add('active');
      showToast(`Trip → ${newStatus}`, pillClass(newStatus) === 'green' ? 'green' : pillClass(newStatus) === 'amber' ? 'amber' : 'red');
      loadDataFromBackend();
    }).catch(err => showToast(err.message, 'red'));
}

function submitTrip() {
  const vehicleId = document.getElementById('t-vehicle').value;
  const driverId = document.getElementById('t-driver').value;
  const cargo = parseInt(document.getElementById('t-cargo').value);
  const origin = document.getElementById('t-origin').value.trim();
  const dest = document.getElementById('t-dest').value.trim();
  const date = document.getElementById('t-date').value;
  const errEl = document.getElementById('t-cargo-err');
  if (!vehicleId || !driverId || !origin || !dest || !date) { showToast('Fill all required fields', 'red'); return; }
  const v = getVehicle(vehicleId);
  if (v && cargo > v.capacity) { errEl.classList.add('show'); return; }
  errEl.classList.remove('show');

  API.createTrip({ vehicleId, driverId, cargo, origin, destination: dest, date, revenue: 0 })
    .then(() => {
      closeModal('add-trip-modal');
      showToast('Trip created — status: Draft', 'amber');
      loadDataFromBackend();
    }).catch(err => showToast(err.message, 'red'));
}

function checkCargoCapacity() {
  const vehicleId = document.getElementById('t-vehicle').value;
  const cargo = parseInt(document.getElementById('t-cargo').value) || 0;
  const v = getVehicle(vehicleId);
  const errEl = document.getElementById('t-cargo-err');
  if (v && cargo > v.capacity) {
    errEl.textContent = `Exceeds max capacity! ${v.name} holds ${fmtNum(v.capacity)} kg`;
    errEl.classList.add('show');
  } else {
    errEl.classList.remove('show');
  }
}
