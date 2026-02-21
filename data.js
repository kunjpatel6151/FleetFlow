const DB = {
  vehicles: [],
  drivers: [],
  trips: [],
  maintenance: [],
  fuel: [],
  notifications: [
    { id: 'N001', type: 'red', icon: '⚠️', title: 'System Initialized', detail: 'Connected to MongoDB Fleet Database', time: 'Just now' },
    { id: 'N002', type: 'blue', icon: '📦', title: 'Ready for Dispatch', detail: 'All systems operational.', time: '1m ago' },
  ]
};

// Helpers
function getVehicle(id) { return DB.vehicles.find(v => v.id === id); }
function getDriver(id) { return DB.drivers.find(d => d.id === id); }
function nextId(prefix, arr) {
  const nums = arr.map(x => parseInt(x.id.replace(prefix + '-', ''))).filter(n => !isNaN(n));
  return prefix + '-' + (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
}
function fmtCurrency(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtNum(n) { return Number(n).toLocaleString(); }
function daysUntil(dateStr) {
  const d = new Date(dateStr), now = new Date('2026-02-21');
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}
function isExpiringSoon(dateStr) { return daysUntil(dateStr) <= 30; }
function isExpired(dateStr) { return daysUntil(dateStr) < 0; }
function pillClass(status) {
  const map = {
    'Active': 'green', 'Available': 'green', 'On Duty': 'green', 'Completed': 'green',
    'On Trip': 'amber', 'Dispatched': 'amber', 'In Shop': 'red', 'Suspended': 'red',
    'Cancelled': 'red', 'Expired': 'red', 'Idle': 'gray', 'Off Duty': 'gray', 'Draft': 'gray',
  };
  return map[status] || 'gray';
}
function pillHTML(status) { return `<span class="pill ${pillClass(status)}">${status}</span>`; }
function svgIcon(name) {
  const icons = {
    truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
    dash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    tool: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>`,
    fuel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22l4-17h10l4 17"/><rect x="5" y="9" width="14" height="4"/><path d="M17 5h2a2 2 0 012 2v6"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
    logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  };
  return `<span style="display:inline-flex;align-items:center;width:18px;height:18px;">${icons[name] || ''}</span>`;
}
