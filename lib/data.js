// Turf data + pure helpers, ported from the original Design Component.

export const TURF = {
  name: 'Pitch 22 Sports Arena',
  location: 'HSR Layout, Bengaluru',
  rating: '4.9',
  reviews: '214 reviews',
  advanceAmount: 300,
  multiHourDiscount: 10,
  upiId: 'pitch22@okhdfc',
  waNumber: '919845012345',
  igHandle: 'pitch22.blr',
  logo: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=200&q=80',
  images: [
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=900&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80',
    'https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=600&q=80',
    'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?w=600&q=80',
  ],
  description:
    'A premium multi-sport complex in the heart of HSR Layout. Floodlit football turfs, a covered box-cricket arena and an indoor multi-court for basketball, pickleball and badminton, open 6 AM to 11 PM. Free parking, changing rooms and chilled drinking water on site.',
  amenities: [
    'Floodlit grounds', 'FIFA-grade turf', 'Changing rooms', 'Free parking',
    'Drinking water', 'Bibs & balls', 'Seating area', 'Washrooms',
  ],
  grounds: [
    { id: 'g1', name: 'Football Turf A', sports: ['Football'], priceN: 1200, size: '5 & 7-a-side · Astro turf', image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80' },
    { id: 'g2', name: 'Football Turf B', sports: ['Football', 'Volleyball'], priceN: 1000, size: '5-a-side · Astro turf', image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80' },
    { id: 'g3', name: 'Box Cricket Arena', sports: ['Cricket', 'Football'], priceN: 1500, size: 'Covered · Roof netting', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80' },
    { id: 'g4', name: 'Indoor Multi-Court', sports: ['Basketball', 'Pickleball', 'Badminton'], priceN: 800, size: 'Indoor · Wooden floor', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80' },
  ],
};

export const fmt = (n) => '₹' + n.toLocaleString('en-IN');

export function dateList() {
  const base = new Date(2026, 5, 14);
  const dows = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mons = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      key: 'd' + i,
      dow: i === 0 ? 'Today' : dows[d.getDay()],
      day: String(d.getDate()),
      mon: mons[d.getMonth()],
      full: dows[d.getDay()] + ', ' + d.getDate() + ' ' + mons[d.getMonth()],
    });
  }
  return out;
}

export function slotData(dateKey, groundId) {
  const gseed = groundId ? groundId.charCodeAt(1) : 0;
  const seed = parseInt(dateKey.slice(1)) * 7 + 3 + gseed * 11;
  const hours = [];
  for (let h = 6; h <= 22; h++) hours.push(h);
  return hours.map((h) => ({ h, booked: ((h * 13 + seed * 5) % 7) < 2 }));
}

export function hourLabel(h) {
  const hr = h % 12 === 0 ? 12 : h % 12;
  return hr + (h < 12 ? ' AM' : ' PM');
}

export function hourFull(h) {
  const f = (x) => {
    const a = x < 12 ? 'AM' : 'PM';
    const hr = x % 12 === 0 ? 12 : x % 12;
    return hr + ':00 ' + a;
  };
  return f(h) + ' to ' + f(h + 1);
}

// Reusable WhatsApp glyph (used in several places).
export const waSvg = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm5.5 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.2.5-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.1.1.6-.1 1.1z"/></svg>`;

export const FEATURE_ICONS = {
  ig: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  upi: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v7M17 21h-3"/></svg>',
  wa: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z"/></svg>',
  clock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  percent: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5 5 19"/><circle cx="7" cy="7" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  grid: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
};
