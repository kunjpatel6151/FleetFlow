// ─── MODALS ────────────────────────────────────────────────────────────────────
function renderModals() {
    const vehicles = DB.vehicles.map(v => `<option value="${v.id}">${v.name} (${v.plate})</option>`).join('');
    const avVehicles = DB.vehicles.filter(v => v.status === 'Active').map(v => `<option value="${v.id}">${v.name} — ${fmtNum(v.capacity)}kg max</option>`).join('');
    const avDrivers = DB.drivers.filter(d => d.status === 'On Duty' && !isExpired(d.expiry)).map(d => `<option value="${d.id}">${d.name} · ${d.category}</option>`).join('');

    return `
  <!-- ADD VEHICLE MODAL -->
  <div class="modal-overlay" id="add-vehicle-modal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title" id="add-vehicle-modal-title">Add Vehicle</span>
        <button class="modal-close" onclick="closeModal('add-vehicle-modal')">✕</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="v-id" />
        <div class="form-row">
          <div class="form-group"><label class="form-label">Vehicle Name *</label><input class="form-input" id="v-name" placeholder="e.g. Iron Rhino" /></div>
          <div class="form-group"><label class="form-label">Plate Number *</label><input class="form-input" id="v-plate" placeholder="TRK-0000" oninput="this.value=this.value.toUpperCase()" />
            <div class="form-error" id="v-plate-err">Plate number already registered</div>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Vehicle Type *</label>
            <select class="form-select" id="v-type"><option value="Truck">Truck</option><option value="Van">Van</option><option value="Bike">Bike</option></select>
          </div>
          <div class="form-group"><label class="form-label">Capacity (kg) *</label><input class="form-input" id="v-capacity" type="number" placeholder="8000" min="1" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Odometer (km)</label><input class="form-input" id="v-odometer" type="number" placeholder="0" min="0" /></div>
          <div class="form-group"><label class="form-label">Acquisition Cost ($)</label><input class="form-input" id="v-cost" type="number" placeholder="50000" min="0" /></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('add-vehicle-modal')">Cancel</button>
        <button class="btn btn-amber" onclick="submitVehicle()">Save Vehicle</button>
      </div>
    </div>
  </div>

  <!-- ADD TRIP MODAL -->
  <div class="modal-overlay" id="add-trip-modal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Create New Trip</span>
        <button class="modal-close" onclick="closeModal('add-trip-modal')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Vehicle (Available) *</label>
            <select class="form-select" id="t-vehicle" onchange="checkCargoCapacity()">
              <option value="">Select vehicle...</option>${avVehicles}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Driver (On Duty) *</label>
            <select class="form-select" id="t-driver"><option value="">Select driver...</option>${avDrivers}</select>
          </div>
        </div>
        <div class="form-group"><label class="form-label">Cargo Weight (kg) *</label>
          <input class="form-input" id="t-cargo" type="number" placeholder="Enter cargo weight" oninput="checkCargoCapacity()" />
          <div class="form-error" id="t-cargo-err">Cargo exceeds vehicle capacity!</div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Origin *</label><input class="form-input" id="t-origin" placeholder="City, State" /></div>
          <div class="form-group"><label class="form-label">Destination *</label><input class="form-input" id="t-dest" placeholder="City, State" /></div>
        </div>
        <div class="form-group"><label class="form-label">Scheduled Date *</label><input class="form-input" id="t-date" type="date" /></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('add-trip-modal')">Cancel</button>
        <button class="btn btn-amber" onclick="submitTrip()">Create Trip</button>
      </div>
    </div>
  </div>

  <!-- ADD MAINTENANCE MODAL -->
  <div class="modal-overlay" id="add-maint-modal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Log Service</span>
        <button class="modal-close" onclick="closeModal('add-maint-modal')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Vehicle *</label>
          <select class="form-select" id="m-vehicle"><option value="">Select vehicle...</option>${vehicles}</select>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Service Type *</label>
            <select class="form-select" id="m-type">
              <option value="Oil Change">Oil Change</option><option value="Tyre Rotation">Tyre Rotation</option>
              <option value="Brake Replacement">Brake Replacement</option><option value="Engine Overhaul">Engine Overhaul</option>
              <option value="Electrical Repair">Electrical Repair</option><option value="Suspension Repair">Suspension Repair</option>
              <option value="Full Inspection">Full Inspection</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Service Date *</label><input class="form-input" id="m-date" type="date" /></div>
        </div>
        <div class="form-group"><label class="form-label">Cost ($)</label><input class="form-input" id="m-cost" type="number" placeholder="0.00" step="0.01" /></div>
        <div class="form-group"><label class="form-label">Notes</label><textarea class="form-input" id="m-notes" placeholder="Service description and findings..."></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('add-maint-modal')">Cancel</button>
        <button class="btn btn-amber" onclick="submitMaintenance()">Log Service</button>
      </div>
    </div>
  </div>

  <!-- ADD FUEL MODAL -->
  <div class="modal-overlay" id="add-fuel-modal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Log Fuel Entry</span>
        <button class="modal-close" onclick="closeModal('add-fuel-modal')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Vehicle *</label>
          <select class="form-select" id="f-vehicle"><option value="">Select vehicle...</option>${vehicles}</select>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Liters *</label><input class="form-input" id="f-liters" type="number" placeholder="0" oninput="calcFuelTotal()" /></div>
          <div class="form-group"><label class="form-label">Cost / Liter ($) *</label><input class="form-input" id="f-cpl" type="number" placeholder="1.40" step="0.01" oninput="calcFuelTotal()" /></div>
        </div>
        <div class="form-group"><label class="form-label">Date *</label><input class="form-input" id="f-date" type="date" /></div>
        <div id="f-total" style="font-family:var(--font-mono);font-size:14px;color:var(--amber);margin-top:8px;font-weight:700">Total: $0.00</div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('add-fuel-modal')">Cancel</button>
        <button class="btn btn-amber" onclick="submitFuel()">Log Entry</button>
      </div>
    </div>
  </div>

  <!-- ADD DRIVER MODAL -->
  <div class="modal-overlay" id="add-driver-modal">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">Add Driver</span>
        <button class="modal-close" onclick="closeModal('add-driver-modal')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Full Name *</label><input class="form-input" id="dr-name" placeholder="First Last" /></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">License Number *</label><input class="form-input" id="dr-license" placeholder="LIC-0000-A" /></div>
          <div class="form-group"><label class="form-label">License Expiry *</label><input class="form-input" id="dr-expiry" type="date" /></div>
        </div>
        <div class="form-group"><label class="form-label">Vehicle Category *</label>
          <select class="form-select" id="dr-category">
            <option value="Heavy">Heavy</option><option value="Light">Light</option><option value="Motorcycle">Motorcycle</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal('add-driver-modal')">Cancel</button>
        <button class="btn btn-amber" onclick="submitDriver()">Add Driver</button>
      </div>
    </div>
  </div>`;
}

function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    // Reset if vehicle modal
    if (id === 'add-vehicle-modal') {
        document.getElementById('v-id').value = '';
        document.getElementById('v-name').value = '';
        document.getElementById('v-plate').value = '';
        document.getElementById('v-capacity').value = '';
        document.getElementById('v-odometer').value = '';
        document.getElementById('v-cost').value = '';
        document.getElementById('add-vehicle-modal-title').textContent = 'Add Vehicle';
        document.getElementById('v-plate-err').classList.remove('show');
    }
    m.classList.add('show');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('show');
}

// Close modal on overlay click
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('show');
    }
});

// ─── BOOTSTRAP ─────────────────────────────────────────────────────────────────
renderLoading();
