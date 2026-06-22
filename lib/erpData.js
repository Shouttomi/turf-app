// Owner Console data + pure helpers, ported from the original Design Component.

export const SC = { Football: '#15a34a', Cricket: '#0284c7', Basketball: '#ea580c', Badminton: '#7c3aed', Volleyball: '#dc2626', Pickleball: '#0d9488' };
export const AV = ['#0284c7', '#7c3aed', '#ea580c', '#15a34a', '#dc2626', '#0d9488', '#d97706', '#4f46e5'];
export const IMG = {
  'Greenfield Arena': 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500&q=80',
  'Boundary Line Box': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&q=80',
  'Smash Court Club': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&q=80',
  'Skyline Hoops': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&q=80',
  'Shuttle Smash Hall': 'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=500&q=80',
  'Spike Sands Beach': 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=500&q=80',
};

export const VENUE_SPORT = {
  'Greenfield Arena': 'Football', 'Boundary Line Box': 'Cricket', 'Smash Court Club': 'Pickleball',
  'Skyline Hoops': 'Basketball', 'Shuttle Smash Hall': 'Badminton', 'Spike Sands Beach': 'Volleyball',
};

export const TURF_META = [
  { name: 'Greenfield Arena', sport: 'Football', price: 1200, slots: 17 },
  { name: 'Boundary Line Box', sport: 'Cricket', price: 1500, slots: 15 },
  { name: 'Smash Court Club', sport: 'Pickleball', price: 600, slots: 18 },
  { name: 'Skyline Hoops', sport: 'Basketball', price: 900, slots: 16 },
  { name: 'Shuttle Smash Hall', sport: 'Badminton', price: 450, slots: 20 },
  { name: 'Spike Sands Beach', sport: 'Volleyball', price: 700, slots: 14 },
];

export const RE_DATES = ['Mon 15', 'Tue 16', 'Wed 17', 'Thu 18', 'Fri 19'];
export const RE_TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '4:00 PM', '6:00 PM', '8:00 PM'];
export const SCH_HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];

export function seedBookings() {
  return [
    { id: '#1042', customer: 'Arjun Mehta', phone: '+91 98765 43210', turf: 'Greenfield Arena', sport: 'Football', when: 'Today, 14 Jun', time: '8:00 to 9:00 PM', amount: 1200, pay: 'Pay at turf', status: 'pending', av: 0 },
    { id: '#1041', customer: 'Priya Nair', phone: '+91 90123 45678', turf: 'Smash Court Club', sport: 'Pickleball', when: 'Tomorrow, 15 Jun', time: '6:00 to 7:00 AM', amount: 600, pay: 'Advance ₹200', status: 'pending', av: 1 },
    { id: '#1040', customer: 'Karthik Rao', phone: '+91 99887 76655', turf: 'Boundary Line Box', sport: 'Cricket', when: 'Today, 14 Jun', time: '5:00 to 7:00 PM', amount: 3000, pay: 'Full prepay', status: 'pending', av: 2 },
    { id: '#1039', customer: 'Rohan Das', phone: '+91 90909 80808', turf: 'Skyline Hoops', sport: 'Basketball', when: 'Today, 14 Jun', time: '7:00 to 8:00 PM', amount: 900, pay: 'Full prepay', status: 'approved', av: 3 },
    { id: '#1038', customer: 'Meera Iyer', phone: '+91 98111 22333', turf: 'Shuttle Smash Hall', sport: 'Badminton', when: 'Mon, 15 Jun', time: '9:00 to 10:00 AM', amount: 450, pay: 'Pay at turf', status: 'approved', av: 4 },
    { id: '#1037', customer: 'Sahil Kapoor', phone: '+91 97000 11122', turf: 'Greenfield Arena', sport: 'Football', when: 'Sun, 14 Jun', time: '6:00 to 7:00 AM', amount: 1200, pay: 'Advance ₹400', status: 'approved', av: 5 },
    { id: '#1036', customer: 'Neha Gupta', phone: '+91 96655 44332', turf: 'Spike Sands Beach', sport: 'Volleyball', when: 'Sat, 13 Jun', time: '4:00 to 5:00 PM', amount: 700, pay: 'Full prepay', status: 'rejected', av: 6 },
    { id: '#1035', customer: 'Vikram Shetty', phone: '+91 95544 33221', turf: 'Boundary Line Box', sport: 'Cricket', when: 'Fri, 12 Jun', time: '8:00 to 10:00 PM', amount: 3000, pay: 'Full prepay', status: 'rejected', av: 7 },
  ];
}

export function seedNotifs() {
  return [
    { id: 'n1', type: 'request', text: 'New booking request from Arjun Mehta · Greenfield Arena', time: '2 min ago', unread: true },
    { id: 'n2', type: 'request', text: 'New booking request from Priya Nair · Smash Court Club', time: '18 min ago', unread: true },
    { id: 'n3', type: 'payment', text: 'Payment received · ₹3,000 from Karthik Rao', time: '40 min ago', unread: true },
    { id: 'n4', type: 'approved', text: 'You confirmed Rohan Das · Skyline Hoops', time: '1 hr ago', unread: false },
    { id: 'n5', type: 'reschedule', text: 'Meera Iyer accepted the new time you proposed', time: '3 hrs ago', unread: false },
  ];
}

export const fmt = (n) => '₹' + n.toLocaleString('en-IN');
export const initials = (name) => name.split(' ').map((x) => x[0]).join('').slice(0, 2);

// Build an inline-SVG string from one or more path `d` values.
export function ico(d, w = 18) {
  const paths = (Array.isArray(d) ? d : [d]).map((p) => `<path d="${p}"/>`).join('');
  return `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

export const N_ICON = {
  request: ['M12 5v14M5 12h14'],
  payment: ['M2 8h20v12H2z', 'M2 12h20'],
  approved: ['M20 6 9 17l-5-5'],
  reschedule: ['M21 12a9 9 0 1 1-3-6.7L21 8', 'M21 3v5h-5'],
  reject: ['M18 6 6 18M6 6l12 12'],
};
export const N_COLOR = {
  request: ['color-mix(in srgb,var(--turf) 14%,transparent)', 'var(--turf-deep)'],
  payment: ['color-mix(in srgb,var(--sky) 14%,transparent)', 'var(--sky)'],
  approved: ['color-mix(in srgb,var(--turf) 14%,transparent)', 'var(--turf-deep)'],
  reschedule: ['color-mix(in srgb,var(--amber) 16%,transparent)', '#b45309'],
  reject: ['color-mix(in srgb,var(--rose) 12%,transparent)', 'var(--rose)'],
};

export const ST_LABEL = { approved: 'Confirmed', rejected: 'Rejected', pending: 'Pending' };

export function statusStyle(st) {
  const base = 'font-weight:800; font-size:11px; text-transform:uppercase; letter-spacing:.05em; padding:6px 11px; border-radius:99px; white-space:nowrap;';
  if (st === 'approved') return base + ' background:color-mix(in srgb,var(--turf) 14%,transparent); color:var(--turf-deep);';
  if (st === 'rejected') return base + ' background:color-mix(in srgb,var(--rose) 12%,transparent); color:var(--rose);';
  return base + ' background:color-mix(in srgb,var(--amber) 16%,transparent); color:#b45309;';
}

export const ROOT_VARS_ERP =
  "--bg:#eef2e7; --surface:#ffffff; --surface2:#f6f9f1; --turf:#15a34a; --turf-deep:#0e7a36; --lime:#cdf564; --ink:#0d1c12; --muted:#5d6d62; --line:#e4ebdd; --sky:#0284c7; --amber:#f59e0b; --rose:#e11d48; --shadow:rgba(14,42,24,.1); min-height:100vh; background:var(--bg); color:var(--ink); font-family:'Plus Jakarta Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; display:flex;";
