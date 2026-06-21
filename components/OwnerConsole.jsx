'use client';

import { useState, useEffect, useRef } from 'react';
import { css } from '@/lib/style';
import { Hov, Raw } from '@/lib/ui';
import {
  SC, AV, IMG, VENUE_SPORT, TURF_META, RE_DATES, RE_TIMES, SCH_HOURS,
  seedBookings, seedNotifs, fmt, initials, ico, N_ICON, N_COLOR,
  ST_LABEL, statusStyle, ROOT_VARS_ERP,
} from '@/lib/erpData';

export default function OwnerConsole({ brandName = 'TurfSprint' }) {
  const [view, setView] = useState('dashboard');
  const [vw, setVw] = useState(1280);
  const [notifOpen, setNotifOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [drawerId, setDrawerId] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [reDate, setReDate] = useState(null);
  const [reTime, setReTime] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');
  const [bookings, setBookings] = useState(seedBookings);
  const [notifs, setNotifs] = useState(seedNotifs);
  const toastT = useRef(null);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(toastT.current); };
  }, []);

  const flash = (msg, type) => {
    setToast(msg); setToastType(type || 'success');
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2800);
  };

  const setStatus = (id, status, note) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    if (note) {
      const type = status === 'approved' ? 'approved' : status === 'rejected' ? 'reject' : 'reschedule';
      setNotifs((prev) => [{ id: 'n' + Date.now(), type, text: note, time: 'just now', unread: false }, ...prev]);
    }
  };

  // ---- derived ----
  const isMobile = vw < 860;
  const pending = bookings.filter((b) => b.status === 'pending');
  const approved = bookings.filter((b) => b.status === 'approved');
  const rejected = bookings.filter((b) => b.status === 'rejected');
  const unread = notifs.filter((n) => n.unread).length;
  const pendingBadge = pending.length || null;

  const navKeys = ['dashboard', 'bookings', 'schedule', 'turfs', 'payments'];
  const navStyleOf = (k) => {
    const active = view === k;
    return 'cursor:pointer; width:100%; display:flex; align-items:center; justify-content:space-between; padding:11px 13px; border-radius:12px; font-weight:800; font-size:14px; transition:all .12s ease; border:none; text-align:left;' + (active ? ' background:rgba(21,163,74,.13); color:#0e7a36; box-shadow:inset 3px 0 0 #15a34a;' : ' background:transparent; color:#5d6d62;');
  };
  const navMStyleOf = (k) => {
    const active = view === k;
    return 'cursor:pointer; flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; padding:6px 2px; border:none; background:transparent; transition:color .12s ease;' + (active ? ' color:var(--turf-deep);' : ' color:var(--muted);');
  };
  const navTo = (k) => { setView(k); setNotifOpen(false); setDrawerId(null); };

  const titles = {
    dashboard: ['Console overview', 'Live snapshot of requests, schedule & revenue'],
    bookings: ['Bookings', 'Review requests, approve, reschedule or call customers'],
    schedule: ["Today's schedule", 'Pitch-by-pitch hourly availability'],
    turfs: ['Your turfs', 'Manage venues, pricing and time slots'],
    payments: ['Payments', 'Revenue and transaction history'],
  };

  const notifVals = notifs.map((n) => ({
    key: n.id, text: n.text, time: n.time, unread: n.unread,
    icon: ico(N_ICON[n.type] || N_ICON.request, 17),
    iconBg: (N_COLOR[n.type] || N_COLOR.request)[0], iconColor: (N_COLOR[n.type] || N_COLOR.request)[1],
    style: 'padding:13px 18px; display:flex; gap:12px; border-bottom:1px solid var(--line);' + (n.unread ? ' background:color-mix(in srgb,var(--turf) 5%,transparent);' : ''),
  }));

  const todayCount = bookings.filter((b) => b.when.startsWith('Today') && b.status !== 'rejected').length;
  const revenue = approved.reduce((a, b) => a + b.amount, 0);
  const stats = [
    { label: 'Pending requests', value: String(pending.length), accent: 'var(--amber)', iconBg: 'color-mix(in srgb,var(--amber) 15%,transparent)', icon: ico(['M12 8v4l3 2', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z'], 20), sub: 'Needs your approval', pulse: pending.length ? ' animation:erpPop .4s ease;' : '' },
    { label: "Today's bookings", value: String(todayCount), accent: 'var(--turf)', iconBg: 'color-mix(in srgb,var(--turf) 13%,transparent)', icon: ico(['M8 2v4M16 2v4M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'], 20), sub: 'Across all pitches', pulse: '' },
    { label: 'Revenue (week)', value: fmt(revenue), accent: 'var(--sky)', iconBg: 'color-mix(in srgb,var(--sky) 13%,transparent)', icon: ico(['M3 17l6-6 4 4 8-8', 'M21 7v6h-6'], 20), sub: 'From confirmed bookings', pulse: '' },
    { label: 'Occupancy', value: '72%', accent: '#7c3aed', iconBg: 'color-mix(in srgb,#7c3aed 13%,transparent)', icon: ico(['M22 12A10 10 0 1 1 12 2', 'M12 12l5-3'], 20), sub: 'Avg this week', pulse: '' },
  ];

  const pendingList = pending.slice(0, 4).map((b) => ({
    key: b.id, customer: b.customer, turf: b.turf, when: b.when.replace(', ', ' · ') + ' · ' + b.time,
    initials: initials(b.customer), avBg: AV[b.av % AV.length],
    onApprove: () => { setStatus(b.id, 'approved', 'You confirmed ' + b.customer + ' · ' + b.turf); flash('Approved · ' + b.customer + ' notified', 'success'); },
    onReject: () => { setStatus(b.id, 'rejected', 'You declined ' + b.customer + ' · ' + b.turf); flash('Request rejected', 'reject'); },
    onCall: () => flash('📞 Calling ' + b.customer + '…', 'call'),
  }));

  const timelineVenues = ['Greenfield Arena', 'Boundary Line Box', 'Smash Court Club'];
  const timelineRows = timelineVenues.map((name) => {
    const cells = [];
    for (let i = 0; i < 12; i++) {
      const seed = (name.charCodeAt(0) + i * 7) % 10;
      let st = 'free'; if (seed < 4) st = 'booked'; else if (seed < 6) st = 'pending';
      const bg = st === 'booked' ? 'var(--turf)' : st === 'pending' ? 'var(--amber)' : 'var(--surface2)';
      cells.push({ booked: st === 'booked', style: 'flex:1; height:24px; border-radius:5px; background:' + bg + (st === 'free' ? '; border:1px solid var(--line);' : '') + ';' });
    }
    return { name, cells, booked: cells.filter((c) => c.booked).length, total: 12 };
  });

  const counts = { all: bookings.length, pending: pending.length, approved: approved.length, rejected: rejected.length };
  const tabMeta = [['all', 'All'], ['pending', 'Pending'], ['approved', 'Confirmed'], ['rejected', 'Rejected']];
  const filterTabs = tabMeta.map(([key, label]) => {
    const active = filter === key;
    return {
      key, label, count: counts[key],
      style: 'cursor:pointer; display:flex; align-items:center; gap:8px; white-space:nowrap; padding:10px 16px; border-radius:12px; font-weight:800; font-size:13.5px; border:1px solid var(--line); transition:all .12s ease;' + (active ? ' background:var(--ink); color:#fff; border-color:var(--ink);' : ' background:var(--surface); color:var(--ink);'),
      countStyle: 'font-size:11px; font-weight:800; padding:2px 7px; border-radius:99px;' + (active ? ' background:rgba(255,255,255,.2);' : ' background:var(--surface2); color:var(--muted);'),
      onClick: () => setFilter(key),
    };
  });
  const filtered = bookings.filter((b) => filter === 'all' || b.status === filter);
  const bookingRows = filtered.map((b) => ({
    key: b.id, id: b.id, customer: b.customer, turf: b.turf, sport: b.sport, when: b.when, time: b.time,
    amount: fmt(b.amount), pay: b.pay, initials: initials(b.customer), avBg: AV[b.av % AV.length],
    statusStyle: statusStyle(b.status), statusLabel: ST_LABEL[b.status],
    onOpen: () => { setDrawerId(b.id); setRescheduleOpen(false); setReDate(null); setReTime(null); },
  }));

  const hourLabels = SCH_HOURS.map((h) => { const hr = h % 12 === 0 ? 12 : h % 12; return hr + (h < 12 ? 'a' : 'p'); });
  const schVenues = ['Greenfield Arena', 'Boundary Line Box', 'Smash Court Club', 'Skyline Hoops', 'Shuttle Smash Hall', 'Spike Sands Beach'];
  const scheduleRows = schVenues.map((name) => {
    const cells = SCH_HOURS.map((h, i) => {
      const seed = (name.charCodeAt(2) + h * 3) % 11;
      let st = 'free'; if (seed < 4) st = 'booked'; else if (seed < 6) st = 'pending';
      const bg = st === 'booked' ? 'linear-gradient(145deg,var(--turf),var(--turf-deep))' : st === 'pending' ? 'var(--amber)' : 'var(--surface2)';
      const label = st === 'booked' ? '●' : st === 'pending' ? '◐' : '';
      return { tip: name + ' ' + hourLabels[i], label, style: 'height:34px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:10px; color:' + (st === 'free' ? 'transparent' : '#fff') + '; background:' + bg + (st === 'free' ? '; border:1px solid var(--line);' : '') + ';' };
    });
    return { name, cells };
  });
  const schGrid = 'display:grid; grid-template-columns:140px repeat(' + SCH_HOURS.length + ', 1fr); gap:5px;';

  const turfCards = TURF_META.map((t) => ({
    key: t.name, name: t.name, sport: t.sport, price: fmt(t.price), slots: t.slots,
    sportColor: SC[t.sport], image: IMG[t.name],
    onSlots: () => flash('Opening slot manager for ' + t.name, 'success'),
    onEdit: () => flash('Editing ' + t.name, 'success'),
  }));

  const payStats = [
    { label: 'This week', value: fmt(revenue), color: 'var(--turf-deep)', sub: '+18% vs last week' },
    { label: 'Pending settlement', value: fmt(pending.reduce((a, b) => a + b.amount, 0)), color: 'var(--amber)', sub: pending.length + ' awaiting confirmation' },
    { label: 'This month', value: fmt(revenue + 48600), color: 'var(--ink)', sub: '62 bookings settled' },
  ];
  const transactions = approved.concat(pending.slice(0, 1)).map((b, i) => ({
    key: b.id + i, who: b.customer, turf: b.turf, method: b.pay,
    amount: (b.status === 'approved' ? '+ ' : '') + fmt(b.amount),
    time: b.when.replace('Today, ', 'Today · ').replace(', ', ' · '),
    amtColor: b.status === 'approved' ? 'var(--turf-deep)' : 'var(--amber)',
    bg: b.status === 'approved' ? 'color-mix(in srgb,var(--turf) 13%,transparent)' : 'color-mix(in srgb,var(--amber) 15%,transparent)',
    fg: b.status === 'approved' ? 'var(--turf-deep)' : '#b45309',
    icon: ico(b.status === 'approved' ? ['M20 6 9 17l-5-5'] : ['M12 8v4l3 2', 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z'], 17),
  }));

  const db = bookings.find((b) => b.id === drawerId) || null;
  const drawer = db ? {
    id: db.id, customer: db.customer, phone: db.phone, turf: db.turf, sport: db.sport,
    when: db.when, time: db.time, amount: fmt(db.amount), pay: db.pay,
    initials: initials(db.customer), avBg: AV[db.av % AV.length], sportColor: SC[db.sport], image: IMG[db.turf],
    statusStyle: statusStyle(db.status), statusLabel: ST_LABEL[db.status],
    isPending: db.status === 'pending', isResolved: db.status !== 'pending',
  } : null;

  const reDates = RE_DATES.map((d) => {
    const active = reDate === d;
    return { key: d, dow: d.split(' ')[0], day: d.split(' ')[1], style: 'cursor:pointer; display:flex; flex-direction:column; align-items:center; min-width:52px; padding:8px 6px; border-radius:11px; transition:all .12s ease; border:none;' + (active ? ' background:linear-gradient(145deg,var(--turf),var(--turf-deep)); color:#fff;' : ' background:var(--surface2); color:var(--ink); border:1px solid var(--line);'), onClick: () => setReDate(d) };
  });
  const reTimes = RE_TIMES.map((tm) => {
    const active = reTime === tm;
    return { key: tm, label: tm, style: 'cursor:pointer; padding:9px 4px; border-radius:9px; font-weight:800; font-size:12px; transition:all .12s ease;' + (active ? ' background:linear-gradient(145deg,var(--turf),var(--turf-deep)); color:#fff; border:1px solid var(--turf-deep);' : ' background:var(--surface); color:var(--ink); border:1px solid var(--line);'), onClick: () => setReTime(tm) };
  });

  const callCustomer = () => flash('📞 Calling ' + (db ? db.customer : 'customer') + '…', 'call');
  const msgCustomer = () => flash('💬 WhatsApp opened for ' + (db ? db.customer : 'customer'), 'success');
  const closeDrawer = () => { setDrawerId(null); setRescheduleOpen(false); };
  const confirmReschedule = () => {
    if (!reDate || !reTime) { flash('Pick a date and time first', 'reject'); return; }
    if (db) setStatus(db.id, db.status, 'Reschedule proposed to ' + db.customer + ' · ' + reDate + ' ' + reTime);
    flash('New time sent to ' + (db ? db.customer : 'customer'), 'success');
    setRescheduleOpen(false); setReDate(null); setReTime(null);
  };
  const drawerApprove = () => { if (db) { setStatus(db.id, 'approved', 'You confirmed ' + db.customer + ' · ' + db.turf); flash('Approved · ' + db.customer + ' notified', 'success'); setDrawerId(null); } };
  const drawerReject = () => { if (db) { setStatus(db.id, 'rejected', 'You declined ' + db.customer); flash('Request rejected', 'reject'); setDrawerId(null); } };

  const toastBg = toastType === 'reject' ? 'var(--rose)' : toastType === 'call' ? 'var(--sky)' : 'var(--turf)';
  const toastIcon = ico(toastType === 'reject' ? ['M18 6 6 18M6 6l12 12'] : toastType === 'call' ? ['M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z'] : ['M20 6 9 17l-5-5'], 16);

  const brand = brandName;

  return (
    <div style={css(ROOT_VARS_ERP)}>
      {/* ===== SIDEBAR ===== */}
      {!isMobile && (
        <aside style={css('width:248px; flex-shrink:0; background:var(--surface); border-right:1px solid var(--line); height:100vh; position:sticky; top:0; display:flex; flex-direction:column; padding:20px 16px;')}>
          <div style={css('display:flex; align-items:center; gap:11px; padding:6px 8px 22px;')}>
            <div style={css('width:40px; height:40px; border-radius:12px; background:linear-gradient(145deg, var(--turf), var(--turf-deep)); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 16px -6px var(--turf);')}>
              <Raw html={'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18" opacity=".55"/><circle cx="12" cy="12" r="3.2" fill="#fff" stroke="none"/></svg>'} />
            </div>
            <div style={css('line-height:1;')}><div style={css("font-family:'Outfit'; font-weight:900; font-size:17px; letter-spacing:-.4px;")}>{brand}</div><div style={css('font-size:10px; font-weight:700; color:var(--muted); letter-spacing:.14em; text-transform:uppercase; margin-top:3px;')}>Owner Console</div></div>
          </div>

          <nav style={css('display:flex; flex-direction:column; gap:3px; flex:1;')}>
            <button onClick={() => navTo('dashboard')} style={css(navStyleOf('dashboard'))}>
              <span style={css('display:flex; align-items:center; gap:12px;')}><Raw html={'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>'} /><span>Dashboard</span></span>
            </button>
            <button onClick={() => navTo('bookings')} style={css(navStyleOf('bookings'))}>
              <span style={css('display:flex; align-items:center; gap:12px;')}><Raw html={'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'} /><span>Bookings</span></span>
              {pendingBadge && <span style={css('background:var(--rose); color:#fff; font-size:10.5px; font-weight:800; min-width:19px; height:19px; padding:0 6px; border-radius:99px; display:flex; align-items:center; justify-content:center;')}>{pendingBadge}</span>}
            </button>
            <button onClick={() => navTo('schedule')} style={css(navStyleOf('schedule'))}>
              <span style={css('display:flex; align-items:center; gap:12px;')}><Raw html={'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="17" rx="2"/></svg>'} /><span>Schedule</span></span>
            </button>
            <button onClick={() => navTo('turfs')} style={css(navStyleOf('turfs'))}>
              <span style={css('display:flex; align-items:center; gap:12px;')}><Raw html={'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>'} /><span>Turfs</span></span>
            </button>
            <button onClick={() => navTo('payments')} style={css(navStyleOf('payments'))}>
              <span style={css('display:flex; align-items:center; gap:12px;')}><Raw html={'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'} /><span>Payments</span></span>
            </button>
          </nav>

          <div style={css('border-top:1px solid var(--line); padding-top:14px; margin-top:8px;')}>
            <Hov as="a" href="/" s="display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--muted); font-weight:700; font-size:13px; padding:10px 12px; border-radius:11px;" hover="background:var(--surface2); color:var(--ink);">
              <Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 3h6v6M21 3l-9 9M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>'} />
              View public site
            </Hov>
            <div style={css('display:flex; align-items:center; gap:11px; padding:11px 12px; margin-top:4px;')}>
              <div style={css("width:34px; height:34px; border-radius:10px; background:linear-gradient(145deg,#0284c7,#0369a1); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:800; font-size:14px;")}>RK</div>
              <div style={css('line-height:1.2; flex:1; min-width:0;')}><div style={css('font-weight:800; font-size:13.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>Ravi Kumar</div><div style={css('font-size:11px; color:var(--muted); font-weight:600;')}>Turf owner</div></div>
            </div>
          </div>
        </aside>
      )}

      {/* ===== MAIN ===== */}
      <main style={css('flex:1; min-width:0; display:flex; flex-direction:column; height:100vh; overflow:hidden;')}>
        <header style={css('flex-shrink:0; background:color-mix(in srgb, var(--bg) 80%, transparent); backdrop-filter:blur(12px); border-bottom:1px solid var(--line); padding:14px clamp(16px,3vw,30px); display:flex; align-items:center; justify-content:space-between; gap:14px; z-index:40;')}>
          <div style={css('display:flex; align-items:center; gap:13px; min-width:0;')}>
            <div style={css('min-width:0;')}>
              <h1 style={css("font-family:'Outfit'; font-weight:900; font-size:clamp(19px,2.4vw,25px); letter-spacing:-.02em; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;")}>{titles[view][0]}</h1>
              <p style={css('font-size:12px; color:var(--muted); font-weight:600; margin:2px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{titles[view][1]}</p>
            </div>
          </div>
          <div style={css('display:flex; align-items:center; gap:10px; flex-shrink:0;')}>
            <div style={css('position:relative;')}>
              <Hov as="button" onClick={() => setNotifOpen((o) => !o)} s="cursor:pointer; width:42px; height:42px; border-radius:12px; border:1px solid var(--line); background:var(--surface); display:flex; align-items:center; justify-content:center; position:relative;" hover="background:var(--surface2);">
                <Raw html={'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>'} />
                {unread > 0 && <span style={css('position:absolute; top:-4px; right:-4px; background:var(--rose); color:#fff; font-size:10px; font-weight:800; min-width:18px; height:18px; padding:0 5px; border-radius:99px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 2px var(--surface);')}>{unread}</span>}
              </Hov>
              {notifOpen && (
                <div style={css('position:absolute; right:0; top:52px; width:min(370px,92vw); background:var(--surface); border:1px solid var(--line); border-radius:18px; box-shadow:0 30px 60px -22px rgba(13,40,22,.4); z-index:60; overflow:hidden; animation:erpPop .2s ease both;')}>
                  <div style={css('padding:16px 18px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between;')}>
                    <div style={css("font-family:'Outfit'; font-weight:800; font-size:16px;")}>Notifications</div>
                    <button onClick={() => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })))} style={css('cursor:pointer; border:none; background:transparent; color:var(--turf-deep); font-weight:800; font-size:12px;')}>Mark all read</button>
                  </div>
                  <div style={css('max-height:420px; overflow-y:auto;')}>
                    {notifVals.map((nf) => (
                      <div key={nf.key} style={css(nf.style)}>
                        <div style={{ ...css('width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0;'), background: nf.iconBg, color: nf.iconColor }}><Raw html={nf.icon} /></div>
                        <div style={css('flex:1; min-width:0;')}>
                          <div style={css('font-weight:700; font-size:13px; line-height:1.35; color:var(--ink);')}>{nf.text}</div>
                          <div style={css('font-size:11px; color:var(--muted); font-weight:600; margin-top:3px;')}>{nf.time}</div>
                        </div>
                        {nf.unread && <span style={css('width:8px; height:8px; border-radius:50%; background:var(--turf); flex-shrink:0; margin-top:6px;')} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={css("width:42px; height:42px; border-radius:12px; background:linear-gradient(145deg,#0284c7,#0369a1); color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:800; font-size:15px;")}>RK</div>
          </div>
        </header>

        <div style={css('flex:1; overflow-y:auto; padding:clamp(16px,3vw,28px) clamp(16px,3vw,30px) 100px;')}>
          {/* ===== DASHBOARD ===== */}
          {view === 'dashboard' && (
            <div>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr)); gap:16px; margin-bottom:22px;')}>
                {stats.map((st, i) => (
                  <div key={i} style={css('background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:18px 19px; box-shadow:0 8px 22px -16px var(--shadow); position:relative; overflow:hidden;')}>
                    <div style={{ ...css('position:absolute; top:0; left:0; width:4px; height:100%;'), background: st.accent }} />
                    <div style={css('display:flex; align-items:flex-start; justify-content:space-between;')}>
                      <div><div style={css('font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--muted);')}>{st.label}</div><div style={css("font-family:'Outfit'; font-weight:900; font-size:30px; letter-spacing:-.02em; margin-top:8px;")}>{st.value}</div></div>
                      <div style={{ ...css('width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center;' + st.pulse), background: st.iconBg, color: st.accent }}><Raw html={st.icon} /></div>
                    </div>
                    <div style={css('font-size:11.5px; font-weight:600; color:var(--muted); margin-top:12px;')}>{st.sub}</div>
                  </div>
                ))}
              </div>

              <div style={css('display:grid; grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr)); gap:18px; align-items:start;')}>
                <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:20px; box-shadow:0 10px 26px -18px var(--shadow); overflow:hidden;')}>
                  <div style={css('padding:18px 20px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between;')}>
                    <div style={css('display:flex; align-items:center; gap:9px;')}>
                      <span style={css('position:relative; width:9px; height:9px;')}><span style={css('position:absolute; inset:0; border-radius:50%; background:var(--amber);')} /><span style={css('position:absolute; inset:0; border-radius:50%; background:var(--amber); animation:erpRing 1.8s ease-out infinite;')} /></span>
                      <h3 style={css("font-family:'Outfit'; font-weight:800; font-size:16px; margin:0;")}>Action needed</h3>
                    </div>
                    <span style={css('font-size:12px; font-weight:800; color:var(--muted);')}>{pending.length} requests</span>
                  </div>
                  <div>
                    {pendingList.map((b) => (
                      <div key={b.key} style={css('padding:15px 20px; border-bottom:1px solid var(--line); display:flex; align-items:center; gap:13px; flex-wrap:wrap;')}>
                        <div style={{ ...css("width:42px; height:42px; border-radius:12px; color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:800; font-size:15px; flex-shrink:0;"), background: b.avBg }}>{b.initials}</div>
                        <div style={css('flex:1; min-width:140px;')}>
                          <div style={css('font-weight:800; font-size:14px;')}>{b.customer}</div>
                          <div style={css('font-size:12px; color:var(--muted); font-weight:600; margin-top:2px;')}>{b.turf} · {b.when}</div>
                        </div>
                        <div style={css('display:flex; align-items:center; gap:7px;')}>
                          <Hov as="button" onClick={b.onCall} title="Call customer" s="cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid var(--line); background:var(--surface2); color:var(--sky); display:flex; align-items:center; justify-content:center;" hover="transform:translateY(-1px);"><Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>'} /></Hov>
                          <Hov as="button" onClick={b.onReject} s="cursor:pointer; height:36px; padding:0 12px; border-radius:10px; border:1px solid color-mix(in srgb,var(--rose) 25%,transparent); background:color-mix(in srgb,var(--rose) 9%,transparent); color:var(--rose); font-weight:800; font-size:13px; display:flex; align-items:center; gap:5px;" hover="background:var(--rose); color:#fff;"><Raw html={'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'} /></Hov>
                          <Hov as="button" onClick={b.onApprove} s="cursor:pointer; height:36px; padding:0 14px; border-radius:10px; border:none; background:linear-gradient(145deg,var(--turf),var(--turf-deep)); color:#fff; font-weight:800; font-size:13px; display:flex; align-items:center; gap:6px; box-shadow:0 8px 16px -8px var(--turf);" hover="transform:translateY(-1px);"><Raw html={'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'} />Approve</Hov>
                        </div>
                      </div>
                    ))}
                    {pending.length === 0 && (
                      <div style={css('padding:34px 20px; text-align:center; color:var(--muted);')}><div style={css('font-weight:800; font-size:14px; color:var(--ink);')}>All caught up 🎉</div><div style={css('font-size:12.5px; margin-top:4px;')}>No pending requests right now.</div></div>
                    )}
                  </div>
                </div>

                <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:20px; box-shadow:0 10px 26px -18px var(--shadow); overflow:hidden;')}>
                  <div style={css('padding:18px 20px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between;')}>
                    <h3 style={css("font-family:'Outfit'; font-weight:800; font-size:16px; margin:0;")}>Today&apos;s pitch timeline</h3>
                    <button onClick={() => setView('schedule')} style={css('cursor:pointer; border:none; background:transparent; color:var(--turf-deep); font-weight:800; font-size:12px; display:flex; align-items:center; gap:4px;')}>Full view<Raw html={'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'} /></button>
                  </div>
                  <div style={css('padding:16px 20px;')}>
                    {timelineRows.map((tr, i) => (
                      <div key={i} style={css('margin-bottom:14px;')}>
                        <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:7px;')}><span style={css('font-weight:800; font-size:13px;')}>{tr.name}</span><span style={css('font-size:11px; font-weight:700; color:var(--muted);')}>{tr.booked}/{tr.total} booked</span></div>
                        <div style={css('display:flex; gap:3px;')}>
                          {tr.cells.map((c, ci) => <span key={ci} style={css(c.style)} />)}
                        </div>
                      </div>
                    ))}
                    <div style={css('display:flex; gap:16px; margin-top:14px; padding-top:14px; border-top:1px solid var(--line); font-size:11px; font-weight:700; color:var(--muted);')}>
                      <span style={css('display:flex; align-items:center; gap:6px;')}><span style={css('width:12px; height:12px; border-radius:4px; background:var(--turf);')} />Booked</span>
                      <span style={css('display:flex; align-items:center; gap:6px;')}><span style={css('width:12px; height:12px; border-radius:4px; background:var(--amber);')} />Pending</span>
                      <span style={css('display:flex; align-items:center; gap:6px;')}><span style={css('width:12px; height:12px; border-radius:4px; background:var(--surface2); border:1px solid var(--line);')} />Free</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== BOOKINGS ===== */}
          {view === 'bookings' && (
            <div>
              <div style={css('display:flex; gap:8px; margin-bottom:18px; overflow-x:auto; padding-bottom:4px;')}>
                {filterTabs.map((f) => (
                  <button key={f.key} onClick={f.onClick} style={css(f.style)}><span>{f.label}</span><span style={css(f.countStyle)}>{f.count}</span></button>
                ))}
              </div>
              <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:20px; box-shadow:0 10px 26px -18px var(--shadow); overflow:hidden;')}>
                {bookingRows.map((b) => (
                  <Hov key={b.key} onClick={b.onOpen} s="cursor:pointer; padding:16px 20px; border-bottom:1px solid var(--line); display:flex; align-items:center; gap:14px; flex-wrap:wrap; transition:background .12s ease;" hover="background:var(--surface2);">
                    <div style={{ ...css("width:44px; height:44px; border-radius:12px; color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:800; font-size:15px; flex-shrink:0;"), background: b.avBg }}>{b.initials}</div>
                    <div style={css('flex:1; min-width:150px;')}>
                      <div style={css('display:flex; align-items:center; gap:8px;')}><span style={css('font-weight:800; font-size:14.5px;')}>{b.customer}</span><span style={css("font-size:11px; color:var(--muted); font-weight:700; font-family:'Outfit';")}>{b.id}</span></div>
                      <div style={css('font-size:12.5px; color:var(--muted); font-weight:600; margin-top:3px;')}>{b.turf} · {b.sport}</div>
                    </div>
                    <div style={css('min-width:130px;')}><div style={css('font-weight:800; font-size:13px;')}>{b.when}</div><div style={css('font-size:12px; color:var(--muted); font-weight:600; margin-top:2px;')}>{b.time}</div></div>
                    <div style={css('min-width:90px; text-align:right;')}><div style={css("font-family:'Outfit'; font-weight:900; font-size:16px; color:var(--turf-deep);")}>{b.amount}</div><div style={css('font-size:11px; font-weight:700; color:var(--muted);')}>{b.pay}</div></div>
                    <span style={css(b.statusStyle)}>{b.statusLabel}</span>
                  </Hov>
                ))}
                {filtered.length === 0 && (
                  <div style={css('padding:46px 20px; text-align:center; color:var(--muted); font-weight:700; font-size:13.5px;')}>No bookings in this filter.</div>
                )}
              </div>
            </div>
          )}

          {/* ===== SCHEDULE ===== */}
          {view === 'schedule' && (
            <div>
              <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:20px; box-shadow:0 10px 26px -18px var(--shadow); padding:20px; overflow-x:auto;')}>
                <div style={css('display:flex; align-items:center; gap:14px; margin-bottom:18px; flex-wrap:wrap;')}>
                  <div style={css("font-family:'Outfit'; font-weight:900; font-size:18px;")}>Sun, 14 Jun</div>
                  <div style={css('display:flex; gap:16px; font-size:11.5px; font-weight:700; color:var(--muted);')}>
                    <span style={css('display:flex; align-items:center; gap:6px;')}><span style={css('width:12px; height:12px; border-radius:4px; background:var(--turf);')} />Confirmed</span>
                    <span style={css('display:flex; align-items:center; gap:6px;')}><span style={css('width:12px; height:12px; border-radius:4px; background:var(--amber);')} />Pending</span>
                    <span style={css('display:flex; align-items:center; gap:6px;')}><span style={css('width:12px; height:12px; border-radius:4px; background:var(--surface2); border:1px solid var(--line);')} />Free</span>
                  </div>
                </div>
                <div style={css('min-width:760px;')}>
                  <div style={css(schGrid + ' margin-bottom:7px;')}>
                    <div />
                    {hourLabels.map((h, i) => <div key={i} style={css('font-size:10.5px; font-weight:800; color:var(--muted); text-align:center;')}>{h}</div>)}
                  </div>
                  {scheduleRows.map((r, ri) => (
                    <div key={ri} style={css(schGrid + ' margin-bottom:5px; align-items:center;')}>
                      <div style={css('display:flex; align-items:center; gap:8px; min-width:0;')}><span style={css('font-weight:800; font-size:12.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;')}>{r.name}</span></div>
                      {r.cells.map((c, ci) => <div key={ci} title={c.tip} style={css(c.style)}>{c.label}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TURFS ===== */}
          {view === 'turfs' && (
            <div>
              <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; flex-wrap:wrap; gap:10px;')}>
                <p style={css('font-size:13px; color:var(--muted); font-weight:600; margin:0;')}>{TURF_META.length} active venues · tap a venue to manage slots &amp; pricing</p>
                <Hov as="button" onClick={() => flash('Add-turf form would open here', 'success')} s="cursor:pointer; border:none; background:linear-gradient(145deg,var(--turf),var(--turf-deep)); color:#fff; font-family:'Outfit'; font-weight:800; font-size:13.5px; padding:11px 18px; border-radius:12px; display:flex; align-items:center; gap:7px; box-shadow:0 10px 20px -8px var(--turf);" hover="transform:translateY(-2px);"><Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'} />Add new turf</Hov>
              </div>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr)); gap:18px;')}>
                {turfCards.map((t) => (
                  <div key={t.key} style={css('background:var(--surface); border:1px solid var(--line); border-radius:18px; overflow:hidden; box-shadow:0 10px 26px -18px var(--shadow);')}>
                    <div style={css('position:relative; height:130px;')}>
                      <img src={t.image} alt={t.name} style={css('width:100%; height:100%; object-fit:cover;')} />
                      <div style={css('position:absolute; inset:0; background:linear-gradient(180deg,transparent 40%,rgba(13,28,18,.45));')} />
                      <span style={{ ...css('position:absolute; top:11px; left:11px; color:#fff; font-weight:800; font-size:10.5px; padding:5px 10px; border-radius:99px;'), background: t.sportColor }}>{t.sport}</span>
                      <div style={css("position:absolute; bottom:10px; left:13px; color:#fff; font-family:'Outfit'; font-weight:800; font-size:16px; text-shadow:0 1px 6px rgba(0,0,0,.5);")}>{t.name}</div>
                    </div>
                    <div style={css('padding:15px 16px;')}>
                      <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:13px;')}>
                        <div><span style={css("font-family:'Outfit'; font-weight:900; font-size:18px; color:var(--turf-deep);")}>{t.price}</span><span style={css('font-size:11.5px; font-weight:700; color:var(--muted);')}>/hr</span></div>
                        <div style={css('font-size:12px; font-weight:700; color:var(--muted);')}>{t.slots} slots/day</div>
                      </div>
                      <div style={css('display:grid; grid-template-columns:1fr 1fr; gap:8px;')}>
                        <Hov as="button" onClick={t.onSlots} s="cursor:pointer; border:1px solid var(--line); background:var(--surface2); color:var(--ink); font-weight:800; font-size:12.5px; padding:9px; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:6px;" hover="background:var(--bg);"><Raw html={'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'} />Slots</Hov>
                        <Hov as="button" onClick={t.onEdit} s="cursor:pointer; border:1px solid var(--line); background:var(--surface2); color:var(--ink); font-weight:800; font-size:12.5px; padding:9px; border-radius:10px; display:flex; align-items:center; justify-content:center; gap:6px;" hover="background:var(--bg);"><Raw html={'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'} />Edit</Hov>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== PAYMENTS ===== */}
          {view === 'payments' && (
            <div>
              <div style={css('display:grid; grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr)); gap:16px; margin-bottom:20px;')}>
                {payStats.map((p, i) => (
                  <div key={i} style={css('background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:19px; box-shadow:0 8px 22px -16px var(--shadow);')}>
                    <div style={css('font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--muted);')}>{p.label}</div>
                    <div style={{ ...css("font-family:'Outfit'; font-weight:900; font-size:28px; margin-top:8px;"), color: p.color }}>{p.value}</div>
                    <div style={css('font-size:11.5px; font-weight:600; color:var(--muted); margin-top:6px;')}>{p.sub}</div>
                  </div>
                ))}
              </div>
              <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:20px; box-shadow:0 10px 26px -18px var(--shadow); overflow:hidden;')}>
                <div style={css("padding:18px 20px; border-bottom:1px solid var(--line); font-family:'Outfit'; font-weight:800; font-size:16px;")}>Recent transactions</div>
                {transactions.map((x) => (
                  <div key={x.key} style={css('padding:14px 20px; border-bottom:1px solid var(--line); display:flex; align-items:center; gap:13px; flex-wrap:wrap;')}>
                    <div style={{ ...css('width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0;'), background: x.bg, color: x.fg }}><Raw html={x.icon} /></div>
                    <div style={css('flex:1; min-width:140px;')}><div style={css('font-weight:800; font-size:13.5px;')}>{x.who}</div><div style={css('font-size:12px; color:var(--muted); font-weight:600; margin-top:2px;')}>{x.turf} · {x.method}</div></div>
                    <div style={css('text-align:right;')}><div style={{ ...css("font-family:'Outfit'; font-weight:900; font-size:15px;"), color: x.amtColor }}>{x.amount}</div><div style={css('font-size:11px; font-weight:700; color:var(--muted);')}>{x.time}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      {isMobile && (
        <div style={css('position:fixed; left:0; right:0; bottom:0; z-index:50; background:color-mix(in srgb,var(--surface) 95%,transparent); backdrop-filter:blur(12px); border-top:1px solid var(--line); display:flex; justify-content:space-around; padding:8px 6px calc(8px + env(safe-area-inset-bottom));')}>
          <button onClick={() => navTo('dashboard')} style={css(navMStyleOf('dashboard'))}><span style={css('position:relative;')}><Raw html={'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>'} /></span><span style={css('font-size:10px; font-weight:800;')}>Home</span></button>
          <button onClick={() => navTo('bookings')} style={css(navMStyleOf('bookings'))}><span style={css('position:relative;')}><Raw html={'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'} />{pendingBadge && <span style={css('position:absolute; top:-6px; right:-9px; background:var(--rose); color:#fff; font-size:9px; font-weight:800; min-width:15px; height:15px; padding:0 4px; border-radius:99px; display:flex; align-items:center; justify-content:center;')}>{pendingBadge}</span>}</span><span style={css('font-size:10px; font-weight:800;')}>Bookings</span></button>
          <button onClick={() => navTo('schedule')} style={css(navMStyleOf('schedule'))}><span style={css('position:relative;')}><Raw html={'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="17" rx="2"/></svg>'} /></span><span style={css('font-size:10px; font-weight:800;')}>Schedule</span></button>
          <button onClick={() => navTo('turfs')} style={css(navMStyleOf('turfs'))}><span style={css('position:relative;')}><Raw html={'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/></svg>'} /></span><span style={css('font-size:10px; font-weight:800;')}>Turfs</span></button>
          <button onClick={() => navTo('payments')} style={css(navMStyleOf('payments'))}><span style={css('position:relative;')}><Raw html={'<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'} /></span><span style={css('font-size:10px; font-weight:800;')}>Pay</span></button>
        </div>
      )}

      {/* ===== BOOKING DRAWER ===== */}
      {drawer && (
        <>
          <div onClick={closeDrawer} style={css('position:fixed; inset:0; z-index:80; background:rgba(13,28,18,.4); backdrop-filter:blur(2px); animation:erpFade .2s ease both;')} />
          <div style={css('position:fixed; top:0; right:0; bottom:0; z-index:81; width:min(440px,100vw); background:var(--surface); box-shadow:-20px 0 50px -20px rgba(13,40,22,.4); display:flex; flex-direction:column; animation:erpSlideR .28s ease both;')}>
            <div style={css('padding:18px 22px; border-bottom:1px solid var(--line); display:flex; align-items:center; justify-content:space-between;')}>
              <div style={css("font-family:'Outfit'; font-weight:900; font-size:18px;")}>Booking {drawer.id}</div>
              <button onClick={closeDrawer} style={css('cursor:pointer; width:36px; height:36px; border-radius:10px; border:1px solid var(--line); background:var(--surface2); display:flex; align-items:center; justify-content:center;')}><Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'} /></button>
            </div>
            <div style={css('flex:1; overflow-y:auto; padding:22px;')}>
              <div style={css('display:flex; align-items:center; gap:13px; margin-bottom:18px;')}>
                <div style={{ ...css("width:54px; height:54px; border-radius:15px; color:#fff; display:flex; align-items:center; justify-content:center; font-family:'Outfit'; font-weight:800; font-size:19px;"), background: drawer.avBg }}>{drawer.initials}</div>
                <div><div style={css('font-weight:800; font-size:17px;')}>{drawer.customer}</div><div style={css('font-size:13px; color:var(--muted); font-weight:600; margin-top:2px;')}>{drawer.phone}</div></div>
                <span style={{ ...css(drawer.statusStyle), marginLeft: 'auto' }}>{drawer.statusLabel}</span>
              </div>
              <div style={css('display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;')}>
                <Hov as="button" onClick={callCustomer} s="cursor:pointer; border:1px solid var(--line); background:var(--surface2); color:var(--sky); font-weight:800; font-size:13.5px; padding:12px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:8px;" hover="background:var(--bg);"><Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>'} />Call</Hov>
                <Hov as="button" onClick={msgCustomer} s="cursor:pointer; border:1px solid var(--line); background:var(--surface2); color:var(--turf-deep); font-weight:800; font-size:13.5px; padding:12px; border-radius:12px; display:flex; align-items:center; justify-content:center; gap:8px;" hover="background:var(--bg);"><Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>'} />Message</Hov>
              </div>
              <div style={css('background:var(--surface2); border:1px solid var(--line); border-radius:14px; padding:16px; margin-bottom:16px;')}>
                <div style={css('display:flex; align-items:center; gap:10px; margin-bottom:13px;')}>
                  <img src={drawer.image} alt="" style={css('width:46px; height:46px; border-radius:11px; object-fit:cover;')} />
                  <div><div style={css('font-weight:800; font-size:14.5px;')}>{drawer.turf}</div><span style={{ ...css('display:inline-block; margin-top:4px; color:#fff; font-weight:800; font-size:10px; padding:3px 8px; border-radius:99px;'), background: drawer.sportColor }}>{drawer.sport}</span></div>
                </div>
                <div style={css('display:flex; flex-direction:column; gap:9px; font-size:13px;')}>
                  <div style={css('display:flex; justify-content:space-between;')}><span style={css('color:var(--muted); font-weight:600;')}>Date</span><span style={css('font-weight:800;')}>{drawer.when}</span></div>
                  <div style={css('display:flex; justify-content:space-between;')}><span style={css('color:var(--muted); font-weight:600;')}>Time</span><span style={css('font-weight:800;')}>{drawer.time}</span></div>
                  <div style={css('display:flex; justify-content:space-between;')}><span style={css('color:var(--muted); font-weight:600;')}>Payment</span><span style={css('font-weight:800;')}>{drawer.pay}</span></div>
                  <div style={css('display:flex; justify-content:space-between; border-top:1px solid var(--line); padding-top:9px;')}><span style={css('color:var(--muted); font-weight:700;')}>Total</span><span style={css("font-family:'Outfit'; font-weight:900; font-size:18px; color:var(--turf-deep);")}>{drawer.amount}</span></div>
                </div>
              </div>

              {rescheduleOpen && (
                <div style={css('background:var(--surface); border:1.5px solid var(--turf); border-radius:14px; padding:16px; margin-bottom:16px; animation:erpFade .2s ease both;')}>
                  <div style={css('font-weight:800; font-size:14px; margin-bottom:11px; display:flex; align-items:center; gap:7px;')}><Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--turf-deep)" stroke-width="2.3"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>'} />Propose a new time</div>
                  <div style={css('display:flex; gap:7px; overflow-x:auto; padding-bottom:5px; margin-bottom:11px;')}>
                    {reDates.map((d) => <button key={d.key} onClick={d.onClick} style={css(d.style)}><span style={css('font-size:10px; font-weight:700; opacity:.7;')}>{d.dow}</span><span style={css("font-family:'Outfit'; font-weight:900; font-size:16px;")}>{d.day}</span></button>)}
                  </div>
                  <div style={css('display:grid; grid-template-columns:repeat(auto-fill,minmax(72px,1fr)); gap:7px; margin-bottom:13px;')}>
                    {reTimes.map((tm) => <button key={tm.key} onClick={tm.onClick} style={css(tm.style)}>{tm.label}</button>)}
                  </div>
                  <div style={css('display:flex; gap:8px;')}>
                    <button onClick={confirmReschedule} style={css('cursor:pointer; flex:1; border:none; background:linear-gradient(145deg,var(--turf),var(--turf-deep)); color:#fff; font-weight:800; font-size:13.5px; padding:11px; border-radius:11px;')}>Confirm new time</button>
                    <button onClick={() => setRescheduleOpen(false)} style={css('cursor:pointer; border:1px solid var(--line); background:var(--surface2); color:var(--muted); font-weight:800; font-size:13.5px; padding:11px 16px; border-radius:11px;')}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div style={css('padding:16px 22px; border-top:1px solid var(--line); display:flex; gap:9px;')}>
              {drawer.isPending && (
                <>
                  <button onClick={drawerReject} style={css("cursor:pointer; flex:1; border:1px solid color-mix(in srgb,var(--rose) 30%,transparent); background:color-mix(in srgb,var(--rose) 9%,transparent); color:var(--rose); font-family:'Outfit'; font-weight:800; font-size:14px; padding:13px; border-radius:12px;")}>Reject</button>
                  <button onClick={() => setRescheduleOpen((o) => !o)} style={css("cursor:pointer; border:1px solid var(--line); background:var(--surface2); color:var(--ink); font-family:'Outfit'; font-weight:800; font-size:14px; padding:13px 16px; border-radius:12px;")}>Reschedule</button>
                  <button onClick={drawerApprove} style={css("cursor:pointer; flex:1.4; border:none; background:linear-gradient(145deg,var(--turf),var(--turf-deep)); color:#fff; font-family:'Outfit'; font-weight:800; font-size:14px; padding:13px; border-radius:12px; box-shadow:0 10px 20px -8px var(--turf); display:flex; align-items:center; justify-content:center; gap:7px;")}><Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'} />Approve</button>
                </>
              )}
              {drawer.isResolved && (
                <>
                  <button onClick={() => setRescheduleOpen((o) => !o)} style={css("cursor:pointer; flex:1; border:1px solid var(--line); background:var(--surface2); color:var(--ink); font-family:'Outfit'; font-weight:800; font-size:14px; padding:13px; border-radius:12px;")}>Reschedule</button>
                  <button onClick={callCustomer} style={css("cursor:pointer; flex:1; border:none; background:var(--ink); color:#fff; font-family:'Outfit'; font-weight:800; font-size:14px; padding:13px; border-radius:12px;")}>Call customer</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div style={css('position:fixed; left:50%; bottom:26px; transform:translateX(-50%); z-index:95; background:var(--ink); color:#fff; padding:13px 19px; border-radius:13px; box-shadow:0 20px 40px -14px rgba(13,40,22,.6); display:flex; align-items:center; gap:11px; font-weight:700; font-size:13.5px; animation:erpToast .35s ease both; max-width:90vw;')}>
          <span style={{ ...css('width:28px; height:28px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0;'), background: toastBg }}><Raw html={toastIcon} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}
