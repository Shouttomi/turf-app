'use client';

import { useState, useRef, useEffect } from 'react';
import { css } from '@/lib/style';
import { Hov, Raw } from '@/lib/ui';
import {
  TURF, fmt, dateList, slotData, hourLabel, hourFull, waSvg, FEATURE_ICONS,
} from '@/lib/data';

const ROOT_VARS =
  "--bg:#f6f7f4; --surface:#ffffff; --surface-2:#f3f5f1; --brand:#15803d; --brand-deep:color-mix(in srgb, var(--brand) 80%, #07150c); --brand-soft:color-mix(in srgb, var(--brand) 11%, #fff); --ink:#17211b; --ink-2:#3d4843; --muted:#6b746d; --line:#e3e7e0; --line-2:#d5dad2; --amber:#a55a09; --amber-soft:#fbf1e1; --wa:#1ea861; --ig:#d6276e; --shadow-sm:0 1px 2px rgba(18,32,24,.06); --shadow-md:0 8px 24px -14px rgba(18,32,24,.3); min-height:100vh; background:var(--bg); color:var(--ink); font-family:'Hanken Grotesk',system-ui,sans-serif; -webkit-font-smoothing:antialiased; position:relative;";

export default function TurfBooking({ brandName = 'TurfSprint', accentColor = '#15803d' }) {
  const [screen, setScreen] = useState('owner');
  const [groundId, setGroundId] = useState('g1');
  const [dateKey, setDateKey] = useState('d0');
  const [selected, setSelected] = useState({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pay, setPay] = useState('full_payment');
  const [proof, setProof] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  const toastT = useRef(null);
  const submitT = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => () => { clearTimeout(toastT.current); clearTimeout(submitT.current); }, []);

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2600);
  };

  const goTo = (s) => { setScreen(s); window.scrollTo({ top: 0 }); };

  const toggleSlot = (h) => {
    const key = groundId + '|' + dateKey + '|' + h;
    setSelected((prev) => {
      const n = { ...prev };
      if (n[key]) delete n[key]; else n[key] = true;
      return n;
    });
  };

  // ---- 3D phone tilt ----
  const onSceneMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    if (sceneRef.current) sceneRef.current.style.transform = `rotateX(${8 - py * 14}deg) rotateY(${-16 + px * 18}deg)`;
  };
  const onSceneLeave = () => {
    if (sceneRef.current) sceneRef.current.style.transform = 'rotateX(8deg) rotateY(-16deg)';
  };

  // ---- derived ----
  const activeG = TURF.grounds.find((g) => g.id === groundId) || TURF.grounds[0];
  const dates = dateList();
  const dateObj = dates.find((d) => d.key === dateKey);

  const prefix = groundId + '|' + dateKey + '|';
  const sel = Object.keys(selected)
    .filter((k) => selected[k] && k.startsWith(prefix))
    .map((k) => parseInt(k.split('|')[2]))
    .sort((a, b) => a - b);
  const selSet = new Set(sel);

  const all = slotData(dateKey, groundId);
  const groupDefs = [
    { label: 'Morning', r: [6, 11] },
    { label: 'Afternoon', r: [12, 16] },
    { label: 'Evening', r: [17, 22] },
  ];

  const hours = sel.length;
  const subtotalN = hours * activeG.priceN;
  const hasDisc = hours >= 2 && TURF.multiHourDiscount > 0;
  const discN = hasDisc ? Math.round((subtotalN * TURF.multiHourDiscount) / 100) : 0;
  const totalN = subtotalN - discN;
  const selSummary = sel.length ? hourLabel(sel[0]) + (sel.length > 1 ? ' +' + (sel.length - 1) : '') : 'None';

  const payNowN = pay === 'advance_payment' ? TURF.advanceAmount * sel.length : pay === 'full_payment' ? totalN : 0;
  const venueDueN = totalN - payNowN;
  const showPay = pay !== 'pay_at_turf' && payNowN > 0;
  const payAtTurf = pay === 'pay_at_turf';

  const hasDiscount = TURF.multiHourDiscount > 0;
  const discountLabel = TURF.multiHourDiscount + '% off 2+ hrs';

  const shareUrl = 'turfsprint.app/' + TURF.igHandle;
  const pageQr = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=' + encodeURIComponent('https://' + shareUrl);
  const waLink = 'https://wa.me/' + TURF.waNumber + '?text=' + encodeURIComponent('Hi! I want to book a slot at ' + TURF.name);
  const waShareLink = 'https://wa.me/?text=' + encodeURIComponent('Book your slot at ' + TURF.name + ' → https://' + shareUrl);
  const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=' + encodeURIComponent('upi://pay?pa=' + TURF.upiId + '&pn=' + encodeURIComponent(TURF.name) + '&am=' + payNowN + '&cu=INR');

  const inputStyle = 'width:100%; border:1px solid var(--line-2); background:var(--surface); border-radius:9px; padding:12px 14px; font-family:inherit; font-size:15px; font-weight:500; color:var(--ink); outline:none;';
  const uploadStyle = 'cursor:pointer; margin-top:16px; border:1.5px dashed ' + (proof ? 'color-mix(in srgb, var(--brand) 45%, #fff)' : 'var(--line-2)') + '; background:' + (proof ? 'var(--brand-soft)' : 'var(--surface-2)') + '; border-radius:12px; padding:20px; text-align:center; transition:background .15s ease, border-color .15s ease;';

  const canSubmit = name.trim() && phone.trim() && sel.length && (pay === 'pay_at_turf' || proof);
  const submitStyle = 'cursor:' + (canSubmit && !submitting ? 'pointer' : 'not-allowed') + '; width:100%; margin-top:18px; border:none; padding:15px; border-radius:9px; font-family:inherit; font-weight:700; font-size:15.5px; color:#fff; transition:background .15s ease;' + (canSubmit && !submitting ? ' background:var(--brand);' : ' background:var(--line-2);');

  const payMeta = [
    { key: 'full_payment', title: 'Pay full online', sub: 'Settle everything now via UPI', amount: fmt(totalN) },
    { key: 'advance_payment', title: 'Pay advance', sub: fmt(TURF.advanceAmount) + '/slot now, rest at turf', amount: fmt(TURF.advanceAmount * Math.max(sel.length, 1)) },
    { key: 'pay_at_turf', title: 'Pay at turf', sub: 'Cash or UPI when you arrive', amount: fmt(0) },
  ];

  const groundCardBase = 'cursor:pointer; display:flex; flex-direction:column; font-family:inherit; padding:11px; border-radius:13px; transition:border-color .15s ease, box-shadow .15s ease, background .15s ease;';

  const submitBooking = () => {
    if (!canSubmit || submitting) {
      if (!name.trim() || !phone.trim()) flash('Add your name & phone');
      else if (pay !== 'pay_at_turf' && !proof) flash('Upload your payment screenshot');
      return;
    }
    setSubmitting(true);
    clearTimeout(submitT.current);
    submitT.current = setTimeout(() => { setSubmitting(false); goTo('success'); }, 1100);
  };

  const copyLink = () => {
    try { navigator.clipboard.writeText('https://' + shareUrl); } catch (e) {}
    setCopied(true);
    flash('Booking link copied');
  };
  const copyUpi = () => {
    try { navigator.clipboard.writeText(TURF.upiId); } catch (e) {}
    flash('UPI ID copied');
  };

  const rootStyle = { ...css(ROOT_VARS), '--brand': accentColor };

  const heroPoints = ['No commission', 'UPI payments built in', 'Live in minutes'];
  const steps = [
    { n: '1', title: 'Add your turf', body: 'Upload photos, set your price per hour, sports and operating hours. Add your UPI ID for payments.' },
    { n: '2', title: 'Open your slots', body: 'Generate daily time slots in a tap. Block out maintenance or fixed games whenever you need.' },
    { n: '3', title: 'Share the link', body: 'Drop your booking link in your Instagram bio and WhatsApp. Customers book and pay, then you just confirm.' },
  ];
  const features = [
    { title: 'Book straight from Instagram', body: 'One link in your bio turns followers into paying bookings, with no app for them to download.', icon: FEATURE_ICONS.ig },
    { title: 'UPI payments & proof', body: 'Customers pay by UPI QR and upload the screenshot. Take full, advance, or pay-at-turf.', icon: FEATURE_ICONS.upi },
    { title: 'WhatsApp at the centre', body: 'Every booking opens a WhatsApp chat so you confirm and coordinate the way you already do.', icon: FEATURE_ICONS.wa },
    { title: 'Live slot availability', body: 'Booked slots grey out instantly. No double bookings, no manual diary, no missed calls.', icon: FEATURE_ICONS.clock },
    { title: 'Multi-hour discounts', body: 'Reward longer bookings with an automatic percentage off two or more hours.', icon: FEATURE_ICONS.percent },
    { title: 'Your own console', body: 'Manage bookings, slots and earnings from one owner dashboard on any device.', icon: FEATURE_ICONS.grid },
  ];

  const reqSlots = sel.map((h) => hourFull(h));

  return (
    <div style={rootStyle}>
      {/* ====== TOP NAV ====== */}
      <nav style={css('position:sticky; top:0; z-index:60; background:color-mix(in srgb, var(--surface) 88%, transparent); backdrop-filter:blur(12px); border-bottom:1px solid var(--line);')}>
        <div style={css('max-width:1180px; margin:0 auto; padding:0 clamp(16px,4vw,32px); height:60px; display:flex; align-items:center; justify-content:space-between; gap:16px;')}>
          <div onClick={() => goTo('owner')} style={css('display:flex; align-items:center; gap:10px; cursor:pointer;')}>
            <div style={css('width:34px; height:34px; border-radius:8px; background:var(--brand); display:flex; align-items:center; justify-content:center;')}>
              <Raw html={'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18" opacity=".5"/><circle cx="12" cy="12" r="3.2" fill="#fff" stroke="none"/></svg>'} />
            </div>
            <div style={css('font-weight:800; font-size:18px; letter-spacing:-.02em;')}>{brandName}</div>
          </div>
          <div style={css('display:flex; align-items:center; gap:8px;')}>
            <Hov as="button" className="tbn-see" onClick={() => goTo('booking')} s="cursor:pointer; display:flex; align-items:center; gap:7px; background:transparent; border:none; padding:9px 14px; border-radius:8px; color:var(--ink-2); font-family:inherit; font-weight:600; font-size:13.5px;" hover="background:var(--surface-2);">See a live page</Hov>
            <Hov as="a" href="/console" title="Bookings" className="tbn-link" s="display:flex; align-items:center; gap:7px; text-decoration:none; border:1px solid var(--line-2); padding:9px 15px; border-radius:8px; background:var(--surface); color:var(--ink); font-family:inherit; font-weight:700; font-size:13.5px;" hover="background:var(--surface-2);"><Raw html={'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'} /><span className="tbn-label">Bookings</span></Hov>
            <Hov as="a" href="/console" className="tbn-login" s="display:flex; align-items:center; gap:7px; text-decoration:none; border:none; cursor:pointer; padding:9px 16px; border-radius:8px; background:var(--ink); color:#fff; font-family:inherit; font-weight:700; font-size:13.5px;" hover="background:#000;"><span className="tbn-full">Owner login</span><span className="tbn-short">Login</span></Hov>
          </div>
        </div>
      </nav>

      {/* ====================== OWNER LANDING ====================== */}
      {screen === 'owner' && (
        <div data-screen-label="Owner landing">
          {/* HERO */}
          <header style={css('border-bottom:1px solid var(--line); background:var(--surface); overflow:hidden;')}>
            <div style={css('max-width:1180px; margin:0 auto; padding:clamp(40px,5vw,72px) clamp(16px,4vw,32px); display:grid; grid-template-columns:repeat(auto-fit,minmax(min(400px,100%),1fr)); gap:clamp(32px,5vw,56px); align-items:center;')}>
              <div>
                <div style={css('display:inline-flex; align-items:center; gap:8px; background:var(--brand-soft); color:var(--brand-deep); font-weight:700; font-size:12.5px; padding:7px 13px; border-radius:99px; margin-bottom:20px;')}>
                  <span style={css('width:7px; height:7px; border-radius:50%; background:var(--brand);')} />For turf &amp; ground owners
                </div>
                <h1 style={css('font-weight:800; font-size:clamp(30px,4.6vw,50px); line-height:1.03; letter-spacing:-.03em; margin:0 0 16px; max-width:15ch;')}>Your booking page, ready for Instagram &amp; WhatsApp.</h1>
                <p style={css('font-size:clamp(15px,1.7vw,18px); line-height:1.5; color:var(--muted); max-width:48ch; margin:0 0 28px;')}>List your turf once and get a single link. Drop it in your Instagram bio or WhatsApp. Customers pick a slot, pay by UPI, and book directly. No back-and-forth, no commission.</p>
                <div style={css('display:flex; gap:11px; flex-wrap:wrap;')}>
                  <Hov as="button" onClick={() => goTo('booking')} s="border:none; cursor:pointer; padding:15px 26px; border-radius:9px; background:var(--brand); color:#fff; font-family:inherit; font-weight:700; font-size:15.5px; display:flex; align-items:center; gap:8px;" hover="background:var(--brand-deep);">List your turf<Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'} /></Hov>
                  <Hov as="button" onClick={() => goTo('booking')} s="cursor:pointer; border:1px solid var(--line-2); padding:15px 24px; border-radius:9px; background:var(--surface); color:var(--ink); font-family:inherit; font-weight:700; font-size:15.5px;" hover="background:var(--surface-2);">See a live page</Hov>
                </div>
                <div style={css('display:flex; gap:22px; flex-wrap:wrap; margin-top:26px;')}>
                  {heroPoints.map((f, i) => (
                    <div key={i} style={css('display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; color:var(--ink-2);')}>
                      <Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'} />{f}
                    </div>
                  ))}
                </div>
              </div>

              {/* 3D phone + field scene */}
              <div onMouseMove={onSceneMove} onMouseLeave={onSceneLeave} style={css('perspective:1500px; display:flex; justify-content:center; align-items:center; min-height:380px;')}>
                <div ref={sceneRef} style={css('position:relative; transform-style:preserve-3d; transition:transform .15s ease-out; transform:rotateX(8deg) rotateY(-16deg);')}>
                  <div style={css('position:relative; width:248px; height:508px; border-radius:38px; background:#0d1512; padding:11px; box-shadow:0 50px 70px -28px rgba(13,40,22,.5); border:1px solid #1d2a22;')}>
                    <div style={css('width:100%; height:100%; border-radius:28px; overflow:hidden; background:var(--surface); position:relative;')}>
                      <div style={css('height:152px; position:relative;')}>
                        <img src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80" alt="" style={css('width:100%; height:100%; object-fit:cover;')} />
                        <div style={css('position:absolute; inset:0; background:linear-gradient(180deg, transparent 40%, rgba(13,21,18,.55));')} />
                        <div style={css('position:absolute; left:13px; bottom:11px; color:#fff;')}>
                          <div style={css('font-weight:800; font-size:15px;')}>Pitch 22 Arena</div>
                          <div style={css('font-size:10.5px; opacity:.85; font-weight:600;')}>HSR Layout · Football</div>
                        </div>
                      </div>
                      <div style={css('padding:13px;')}>
                        <div style={css('display:flex; gap:6px; margin-bottom:11px;')}>
                          <div style={css('flex:1; text-align:center; background:var(--brand); color:#fff; font-weight:700; font-size:10px; padding:7px 0; border-radius:7px;')}>6 PM</div>
                          <div style={css('flex:1; text-align:center; background:var(--surface-2); color:var(--ink-2); font-weight:700; font-size:10px; padding:7px 0; border-radius:7px; border:1px solid var(--line);')}>7 PM</div>
                          <div style={css('flex:1; text-align:center; background:var(--surface-2); color:var(--line-2); font-weight:700; font-size:10px; padding:7px 0; border-radius:7px; border:1px solid var(--line); text-decoration:line-through;')}>8 PM</div>
                        </div>
                        <div style={css('display:grid; grid-template-columns:repeat(4,1fr); gap:6px;')}>
                          <div style={css('aspect-ratio:1; background:var(--surface-2); border:1px solid var(--line); border-radius:6px;')} />
                          <div style={css('aspect-ratio:1; background:var(--brand-soft); border:1px solid var(--brand); border-radius:6px;')} />
                          <div style={css('aspect-ratio:1; background:var(--surface-2); border:1px solid var(--line); border-radius:6px;')} />
                          <div style={css('aspect-ratio:1; background:var(--surface-2); border:1px solid var(--line); border-radius:6px;')} />
                        </div>
                        <div style={css('margin-top:13px; background:var(--brand); color:#fff; text-align:center; font-weight:700; font-size:12px; padding:11px 0; border-radius:9px;')}>Book this slot</div>
                        <div style={css('margin-top:9px; display:flex; gap:6px;')}>
                          <div style={css('flex:1; background:var(--wa); color:#fff; text-align:center; font-weight:700; font-size:10px; padding:8px 0; border-radius:7px;')}>WhatsApp</div>
                          <div style={css('flex:1; background:var(--surface-2); color:var(--ink-2); text-align:center; font-weight:700; font-size:10px; padding:8px 0; border-radius:7px; border:1px solid var(--line);')}>Share</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={css('position:absolute; top:42px; left:-66px; transform:translateZ(70px); animation:floaty 5s ease-in-out infinite;')}>
                    <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:13px; padding:11px 14px; box-shadow:0 24px 40px -16px rgba(13,40,22,.4); display:flex; align-items:center; gap:10px;')}>
                      <div style={css('width:32px; height:32px; border-radius:9px; background:var(--brand-soft); display:flex; align-items:center; justify-content:center;')}><Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand-deep)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'} /></div>
                      <div><div style={css('font-weight:700; font-size:12.5px; color:var(--ink);')}>New booking</div><div style={css('font-size:10.5px; color:var(--muted); font-weight:500;')}>Paid ₹1,200 · UPI</div></div>
                    </div>
                  </div>
                  <div style={css('position:absolute; bottom:60px; right:-58px; transform:translateZ(95px); animation:floaty2 6s ease-in-out infinite;')}>
                    <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:13px; padding:11px 14px; box-shadow:0 24px 40px -16px rgba(13,40,22,.4); display:flex; align-items:center; gap:10px;')}>
                      <div style={css('width:32px; height:32px; border-radius:9px; background:var(--ig); display:flex; align-items:center; justify-content:center;')}><Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg>'} /></div>
                      <div><div style={css('font-weight:700; font-size:12.5px; color:var(--ink);')}>Link in bio</div><div style={css('font-size:10.5px; color:var(--muted); font-weight:500;')}>tapped 1.2k times</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* HOW IT WORKS */}
          <section style={css('max-width:1180px; margin:0 auto; padding:clamp(44px,5vw,72px) clamp(16px,4vw,32px);')}>
            <div style={css('text-align:center; max-width:42ch; margin:0 auto 40px;')}>
              <h2 style={css('font-weight:800; font-size:clamp(24px,3vw,34px); letter-spacing:-.025em; margin:0 0 10px;')}>Live in three steps</h2>
              <p style={css('color:var(--muted); font-size:15.5px; line-height:1.5; margin:0;')}>No website, no developer. Set up your turf and start taking bookings the same day.</p>
            </div>
            <div style={css('display:grid; grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr)); gap:18px;')}>
              {steps.map((st, i) => (
                <div key={i} style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:26px 24px; box-shadow:var(--shadow-sm);')}>
                  <div style={css('width:42px; height:42px; border-radius:10px; background:var(--brand-soft); color:var(--brand-deep); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px; margin-bottom:16px; font-variant-numeric:tabular-nums;')}>{st.n}</div>
                  <h3 style={css('font-weight:700; font-size:18px; letter-spacing:-.01em; margin:0 0 8px;')}>{st.title}</h3>
                  <p style={css('color:var(--muted); font-size:14px; line-height:1.5; margin:0;')}>{st.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FEATURES */}
          <section style={css('background:var(--surface); border-top:1px solid var(--line); border-bottom:1px solid var(--line);')}>
            <div style={css('max-width:1180px; margin:0 auto; padding:clamp(44px,5vw,68px) clamp(16px,4vw,32px); display:grid; grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr)); gap:30px 24px;')}>
              {features.map((ft, i) => (
                <div key={i}>
                  <div style={css('width:40px; height:40px; border-radius:10px; background:var(--surface-2); border:1px solid var(--line); display:flex; align-items:center; justify-content:center; margin-bottom:14px; color:var(--brand-deep);')}><Raw html={ft.icon} /></div>
                  <h3 style={css('font-weight:700; font-size:16.5px; letter-spacing:-.01em; margin:0 0 7px;')}>{ft.title}</h3>
                  <p style={css('color:var(--muted); font-size:13.5px; line-height:1.5; margin:0;')}>{ft.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section style={css('max-width:1180px; margin:0 auto; padding:clamp(44px,5vw,72px) clamp(16px,4vw,32px);')}>
            <div style={css('background:var(--ink); border-radius:18px; padding:clamp(32px,4vw,52px); text-align:center; color:#fff;')}>
              <h2 style={css('font-weight:800; font-size:clamp(24px,3vw,36px); letter-spacing:-.025em; margin:0 0 12px;')}>Get your booking link today.</h2>
              <p style={css('color:rgba(255,255,255,.7); font-size:15.5px; line-height:1.5; max-width:46ch; margin:0 auto 26px;')}>Free to set up. Add your turf, slots and UPI, then share the link everywhere your customers already are.</p>
              <div style={css('display:flex; gap:11px; justify-content:center; flex-wrap:wrap;')}>
                <Hov as="button" onClick={() => goTo('booking')} s="border:none; cursor:pointer; padding:15px 28px; border-radius:9px; background:var(--brand); color:#fff; font-family:inherit; font-weight:700; font-size:15.5px;" hover="background:var(--brand-deep);">List your turf</Hov>
                <Hov as="button" onClick={() => goTo('booking')} s="cursor:pointer; border:1px solid rgba(255,255,255,.25); padding:15px 26px; border-radius:9px; background:transparent; color:#fff; font-family:inherit; font-weight:700; font-size:15.5px;" hover="background:rgba(255,255,255,.08);">Preview a live page</Hov>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ====================== BOOKING PAGE ====================== */}
      {screen === 'booking' && (
        <>
          <div data-screen-label="Booking page">
            <div style={css('background:var(--brand-soft); border-bottom:1px solid var(--line);')}>
              <div style={css('max-width:1080px; margin:0 auto; padding:9px clamp(16px,4vw,32px); display:flex; align-items:center; gap:9px; justify-content:center; font-size:12.5px; font-weight:600; color:var(--brand-deep); text-align:center;')}>
                <Raw html={'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v0"/></svg>'} />
                This is a live example of a turf&apos;s booking page, the link an owner shares on Instagram &amp; WhatsApp.
              </div>
            </div>

            <div style={css('max-width:1080px; margin:0 auto; padding:clamp(20px,3vw,32px) clamp(16px,4vw,32px) 150px;')}>
              {/* OWNER PROFILE HEADER */}
              <div style={css('display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:20px;')}>
                <div style={css('width:62px; height:62px; border-radius:15px; overflow:hidden; border:1px solid var(--line); flex-shrink:0;')}><img src={TURF.logo} alt="" style={css('width:100%; height:100%; object-fit:cover;')} /></div>
                <div style={css('flex:1; min-width:200px;')}>
                  <div style={css('display:flex; align-items:center; gap:8px; flex-wrap:wrap;')}>
                    <h1 style={css('font-weight:800; font-size:clamp(22px,3vw,28px); letter-spacing:-.02em; margin:0;')}>{TURF.name}</h1>
                    <span style={css('display:flex; align-items:center; gap:4px; background:var(--brand-soft); color:var(--brand-deep); font-weight:700; font-size:11px; padding:4px 9px; border-radius:99px;')}><Raw html={'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>'} />Verified</span>
                  </div>
                  <div style={css('display:flex; align-items:center; gap:9px; margin-top:5px; font-size:13px; font-weight:500; color:var(--muted); flex-wrap:wrap;')}>
                    <span style={css('display:flex; align-items:center; gap:5px;')}><Raw html={'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/></svg>'} />{TURF.location}</span>
                    <span style={css('color:var(--line-2);')}>·</span>
                    <span style={css('display:flex; align-items:center; gap:5px; color:var(--ink-2); font-weight:600;')}><Raw html={'<svg width="14" height="14" viewBox="0 0 24 24" fill="#e8a200" stroke="none"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>'} />{TURF.rating} ({TURF.reviews})</span>
                  </div>
                </div>
                <div style={css('display:flex; gap:8px;')}>
                  <Hov as="button" onClick={() => setShareOpen(true)} s="cursor:pointer; display:flex; align-items:center; gap:7px; border:1px solid var(--line-2); background:var(--surface); color:var(--ink); font-family:inherit; font-weight:700; font-size:13.5px; padding:10px 15px; border-radius:9px;" hover="background:var(--surface-2);"><Raw html={'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>'} />Share</Hov>
                  <Hov as="a" href={waLink} target="_blank" s="text-decoration:none; cursor:pointer; display:flex; align-items:center; gap:7px; border:none; background:var(--wa); color:#fff; font-family:inherit; font-weight:700; font-size:13.5px; padding:10px 16px; border-radius:9px;" hover="filter:brightness(.94);"><Raw html={waSvg(15)} />Chat</Hov>
                </div>
              </div>

              {/* GALLERY */}
              <div style={css('display:grid; grid-template-columns:2fr 1fr 1fr; grid-template-rows:repeat(2,1fr); gap:10px; height:clamp(260px,38vw,400px); border-radius:14px; overflow:hidden; margin-bottom:24px;')}>
                <div style={css('grid-row:span 2; overflow:hidden;')}><img src={TURF.images[0]} alt="" style={css('width:100%; height:100%; object-fit:cover;')} /></div>
                <div style={css('overflow:hidden;')}><img src={TURF.images[1]} alt="" style={css('width:100%; height:100%; object-fit:cover;')} /></div>
                <div style={css('overflow:hidden;')}><img src={TURF.images[2]} alt="" style={css('width:100%; height:100%; object-fit:cover;')} /></div>
                <div style={css('overflow:hidden;')}><img src={TURF.images[3]} alt="" style={css('width:100%; height:100%; object-fit:cover;')} /></div>
                <div style={css('overflow:hidden; position:relative;')}><img src={TURF.images[4]} alt="" style={css('width:100%; height:100%; object-fit:cover;')} /></div>
              </div>

              {/* GROUND SELECTOR */}
              <div style={css('margin-bottom:26px;')}>
                <div style={css('display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:12px;')}>
                  <h2 style={css('font-weight:800; font-size:19px; letter-spacing:-.02em; margin:0;')}>Choose a ground</h2>
                  <span style={css('font-size:13px; font-weight:500; color:var(--muted);')}>{TURF.grounds.length} grounds available</span>
                </div>
                <div style={css('display:grid; grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr)); gap:12px;')}>
                  {TURF.grounds.map((g) => {
                    const active = g.id === activeG.id;
                    const s = groundCardBase + (active
                      ? ' background:var(--surface); border:1.5px solid var(--brand); box-shadow:var(--shadow-md);'
                      : ' background:var(--surface); border:1.5px solid var(--line);');
                    return (
                      <button key={g.id} onClick={() => setGroundId(g.id)} style={css(s)}>
                        <div style={css('width:100%; height:118px; border-radius:10px; overflow:hidden; position:relative; margin-bottom:12px;')}>
                          <img src={g.image} alt="" style={css('width:100%; height:100%; object-fit:cover;')} />
                          {active && (
                            <span style={css('position:absolute; top:8px; right:8px; width:24px; height:24px; border-radius:50%; background:var(--brand); display:flex; align-items:center; justify-content:center;')}><Raw html={'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'} /></span>
                          )}
                        </div>
                        <div style={css('display:flex; align-items:flex-start; justify-content:space-between; gap:8px; width:100%;')}>
                          <span style={css('font-weight:700; font-size:15.5px; letter-spacing:-.01em; text-align:left;')}>{g.name}</span>
                          <span style={css('font-weight:800; font-size:14.5px; white-space:nowrap; font-variant-numeric:tabular-nums;')}>{fmt(g.priceN)}<span style={css('font-size:11px; color:var(--muted); font-weight:600;')}>/hr</span></span>
                        </div>
                        <div style={css('font-size:12px; font-weight:500; color:var(--muted); margin-top:3px; text-align:left;')}>{g.size}</div>
                        <div style={css('display:flex; gap:6px; flex-wrap:wrap; margin-top:11px;')}>
                          {g.sports.map((sp, i) => (
                            <span key={i} style={css('font-size:11px; font-weight:600; color:var(--ink-2); background:var(--surface-2); border:1px solid var(--line); padding:4px 9px; border-radius:6px; display:flex; align-items:center; gap:5px;')}>{sp}</span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={css('display:grid; grid-template-columns:repeat(auto-fit,minmax(min(340px,100%),1fr)); gap:24px; align-items:start;')}>
                {/* LEFT */}
                <div>
                  <div style={css('display:flex; gap:10px; flex-wrap:wrap; margin-bottom:22px;')}>
                    {[
                      { label: 'Grounds', value: TURF.grounds.length + ' grounds' },
                      { label: 'Hours', value: '6 AM to 11 PM' },
                      { label: 'Sports', value: '5 sports' },
                    ].map((qs, i) => (
                      <div key={i} style={css('flex:1; min-width:130px; background:var(--surface); border:1px solid var(--line); border-radius:11px; padding:13px 15px;')}>
                        <div style={css('font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted);')}>{qs.label}</div>
                        <div style={css('font-weight:800; font-size:16px; margin-top:4px; letter-spacing:-.01em;')}>{qs.value}</div>
                      </div>
                    ))}
                  </div>

                  <h2 style={css('font-weight:800; font-size:19px; letter-spacing:-.02em; margin:0 0 9px;')}>About this turf</h2>
                  <p style={css('color:var(--ink-2); font-size:14.5px; line-height:1.6; margin:0 0 24px;')}>{TURF.description}</p>

                  <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:20px 22px; margin-bottom:24px;')}>
                    <h3 style={css('font-weight:700; font-size:13px; margin:0 0 15px; color:var(--ink-2); text-transform:uppercase; letter-spacing:.06em;')}>Amenities</h3>
                    <div style={css('display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:12px;')}>
                      {TURF.amenities.map((am, i) => (
                        <div key={i} style={css('display:flex; align-items:center; gap:9px; font-size:14px; font-weight:500; color:var(--ink);')}>
                          <Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M20 6 9 17l-5-5"/></svg>'} />{am}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: booking widget */}
                <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:22px; box-shadow:var(--shadow-sm); position:sticky; top:78px;')}>
                  <div style={css('font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:4px;')}>{activeG.name}</div>
                  <div style={css('display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:14px;')}>
                    <div style={css('font-weight:800; font-size:23px; font-variant-numeric:tabular-nums;')}>{fmt(activeG.priceN)}<span style={css('font-size:13px; color:var(--muted); font-weight:600;')}> /hour</span></div>
                    {hasDiscount && (
                      <span style={css('background:var(--amber-soft); color:var(--amber); font-weight:700; font-size:11.5px; padding:5px 10px; border-radius:99px;')}>{discountLabel}</span>
                    )}
                  </div>
                  <div style={css('display:flex; gap:6px; flex-wrap:wrap; margin-bottom:18px;')}>
                    {activeG.sports.map((sp, i) => (
                      <span key={i} style={css('font-size:11px; font-weight:600; color:var(--brand-deep); background:var(--brand-soft); padding:4px 9px; border-radius:6px;')}>{sp}</span>
                    ))}
                  </div>

                  <div style={css('font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); margin-bottom:9px;')}>Select date</div>
                  <div style={css('display:flex; gap:7px; overflow-x:auto; padding-bottom:4px; margin-bottom:18px; scrollbar-width:none;')}>
                    {dates.map((d) => {
                      const active = dateKey === d.key;
                      const s = 'cursor:pointer; display:flex; flex-direction:column; align-items:center; min-width:56px; padding:10px 8px; border-radius:9px; font-family:inherit; transition:background .15s ease, border-color .15s ease;' + (active ? ' background:var(--brand); color:#fff; border:1px solid var(--brand);' : ' background:var(--surface-2); color:var(--ink); border:1px solid var(--line);');
                      return (
                        <button key={d.key} onClick={() => setDateKey(d.key)} style={css(s)}>
                          <span style={css('font-size:10.5px; font-weight:600; text-transform:uppercase; letter-spacing:.04em; opacity:.75;')}>{d.dow}</span>
                          <span style={css('font-weight:800; font-size:18px; line-height:1; margin-top:3px; font-variant-numeric:tabular-nums;')}>{d.day}</span>
                          <span style={css('font-size:10px; font-weight:600; opacity:.75; margin-top:2px;')}>{d.mon}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div style={css('font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:var(--muted); margin-bottom:11px; display:flex; align-items:center; justify-content:space-between;')}>
                    <span>Pick slots</span>
                    <span style={css('display:flex; gap:10px; font-size:10.5px; letter-spacing:0; text-transform:none; font-weight:500;')}>
                      <span style={css('display:flex; align-items:center; gap:5px; color:var(--muted);')}><span style={css('width:11px; height:11px; border-radius:4px; background:var(--brand);')} />Picked</span>
                      <span style={css('display:flex; align-items:center; gap:5px; color:var(--muted);')}><span style={css('width:11px; height:11px; border-radius:4px; background:var(--surface-2); border:1px solid var(--line-2);')} />Booked</span>
                    </span>
                  </div>
                  {groupDefs.map((gr, gi) => (
                    <div key={gi} style={css('margin-bottom:14px;')}>
                      <div style={css('font-size:12px; font-weight:600; color:var(--muted); margin-bottom:8px;')}>{gr.label}</div>
                      <div style={css('display:grid; grid-template-columns:repeat(3,1fr); gap:7px;')}>
                        {all.filter((sl) => sl.h >= gr.r[0] && sl.h <= gr.r[1]).map((sl) => {
                          const picked = selSet.has(sl.h);
                          let style = 'cursor:pointer; padding:9px 4px; border-radius:8px; font-family:inherit; font-weight:600; font-size:12px; font-variant-numeric:tabular-nums; transition:background .12s ease, border-color .12s ease; border:1px solid var(--line-2);';
                          if (sl.booked) style = 'padding:9px 4px; border-radius:8px; font-family:inherit; font-weight:500; font-size:12px; font-variant-numeric:tabular-nums; border:1px solid var(--line); background:var(--surface-2); color:var(--line-2); cursor:not-allowed; text-decoration:line-through;';
                          else if (picked) style += ' background:var(--brand); color:#fff; border-color:var(--brand);';
                          else style += ' background:var(--surface); color:var(--ink);';
                          return (
                            <button key={sl.h} onClick={sl.booked ? () => flash('That slot is already booked') : () => toggleSlot(sl.h)} style={css(style)}>{hourLabel(sl.h)}</button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* sticky booking bar */}
          {sel.length > 0 && (
            <div style={css('position:fixed; left:0; right:0; bottom:0; z-index:70; padding:13px clamp(16px,4vw,32px); background:color-mix(in srgb, var(--surface) 94%, transparent); backdrop-filter:blur(12px); border-top:1px solid var(--line-2); animation:fadeUp .25s ease both;')}>
              <div style={css('max-width:1080px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;')}>
                <div><div style={css('font-size:11.5px; font-weight:600; color:var(--muted);')}>{sel.length} slot(s) · {selSummary}</div><div style={css('font-weight:800; font-size:21px; font-variant-numeric:tabular-nums;')}>{fmt(totalN)}</div></div>
                <Hov as="button" onClick={() => goTo('checkout')} s="cursor:pointer; border:none; padding:14px 26px; border-radius:9px; background:var(--brand); color:#fff; font-family:inherit; font-weight:700; font-size:15px; display:flex; align-items:center; gap:8px;" hover="background:var(--brand-deep);">Continue to book<Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'} /></Hov>
              </div>
            </div>
          )}
        </>
      )}

      {/* ====================== CHECKOUT ====================== */}
      {screen === 'checkout' && (
        <div data-screen-label="Checkout" style={css('max-width:1000px; margin:0 auto; padding:clamp(16px,3vw,26px) clamp(16px,4vw,32px) 90px; animation:fadeUp .28s ease both;')}>
          <Hov as="button" onClick={() => goTo('booking')} s="cursor:pointer; display:flex; align-items:center; gap:7px; background:transparent; border:none; padding:6px 0; font-family:inherit; font-weight:600; font-size:13.5px; color:var(--ink-2); margin-bottom:14px;" hover="color:var(--ink);">
            <Raw html={'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'} />Back to slots
          </Hov>
          <h1 style={css('font-weight:800; font-size:clamp(24px,3.6vw,32px); letter-spacing:-.02em; margin:0 0 6px;')}>Confirm your booking</h1>
          <p style={css('color:var(--muted); font-weight:500; font-size:14.5px; margin:0 0 24px;')}>{TURF.name} · {activeG.name} · {dateObj ? dateObj.full : ''} · {selSummary}</p>

          <div style={css('display:grid; grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr)); gap:18px; align-items:start;')}>
            {/* LEFT */}
            <div style={css('display:flex; flex-direction:column; gap:18px;')}>
              <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:22px;')}>
                <div style={css('font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-2); margin-bottom:16px;')}>1 · Your details</div>
                <label style={css('display:block; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:7px;')}>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Mehta" style={css(inputStyle)} />
                <label style={css('display:block; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:16px 0 7px;')}>Phone number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile number" style={css(inputStyle)} />
                <label style={css('display:block; font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:16px 0 7px;')}>Email <span style={css('text-transform:none; font-weight:500; letter-spacing:0;')}>(optional)</span></label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={css(inputStyle)} />
              </div>

              <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:22px;')}>
                <div style={css('font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-2); margin-bottom:16px;')}>2 · Payment method</div>
                <div style={css('display:flex; flex-direction:column; gap:9px;')}>
                  {payMeta.map((p) => {
                    const active = pay === p.key;
                    const s = 'cursor:pointer; display:flex; align-items:center; gap:12px; padding:13px 15px; border-radius:11px; font-family:inherit; transition:background .12s ease, border-color .12s ease;' + (active ? ' background:var(--brand-soft); border:1.5px solid var(--brand);' : ' background:var(--surface); border:1.5px solid var(--line);');
                    return (
                      <button key={p.key} onClick={() => { setPay(p.key); setProof(false); }} style={css(s)}>
                        <span style={{ ...css('width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;'), border: '2px solid ' + (active ? 'var(--brand)' : 'var(--line-2)') }}><span style={{ ...css('width:9px; height:9px; border-radius:50%;'), background: active ? 'var(--brand)' : 'transparent' }} /></span>
                        <span style={css('text-align:left; flex:1;')}><span style={css('display:block; font-weight:700; font-size:14px; color:var(--ink);')}>{p.title}</span><span style={css('display:block; font-size:11.5px; font-weight:500; color:var(--muted);')}>{p.sub}</span></span>
                        <span style={css('font-weight:800; font-size:14px; color:var(--ink); font-variant-numeric:tabular-nums; flex-shrink:0;')}>{p.amount}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {showPay && (
                <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:22px;')}>
                  <div style={css('font-weight:700; font-size:13px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-2); margin-bottom:16px;')}>3 · Pay {fmt(payNowN)} via UPI</div>
                  <div style={css('display:flex; gap:18px; flex-wrap:wrap; align-items:center;')}>
                    <div style={css('width:148px; height:148px; background:#fff; border:1px solid var(--line-2); border-radius:12px; padding:9px; flex-shrink:0;')}><img src={qrSrc} alt="UPI QR" style={css('width:100%; height:100%; object-fit:contain;')} /></div>
                    <div style={css('flex:1; min-width:170px;')}>
                      <div style={css('font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:6px;')}>Pay to UPI ID</div>
                      <div style={css('font-weight:700; font-size:15px; background:var(--surface-2); border:1px solid var(--line); padding:9px 13px; border-radius:9px; display:flex; align-items:center; justify-content:space-between; gap:8px;')}><span style={css('user-select:all;')}>{TURF.upiId}</span><button onClick={copyUpi} style={css('cursor:pointer; border:none; background:transparent; color:var(--brand-deep); font-family:inherit; font-weight:700; font-size:12px;')}>Copy</button></div>
                      <p style={css('font-size:12.5px; color:var(--muted); line-height:1.5; margin:11px 0 0;')}>Scan with any UPI app, pay <b style={css('color:var(--ink);')}>{fmt(payNowN)}</b>, then upload the payment screenshot below.</p>
                    </div>
                  </div>
                  <div onClick={() => setProof(true)} style={css(uploadStyle)}>
                    {proof ? (
                      <div style={css('display:flex; align-items:center; gap:11px; justify-content:center;')}>
                        <Raw html={'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'} />
                        <span style={css('font-weight:700; font-size:13.5px; color:var(--brand-deep);')}>Screenshot added, tap to change</span>
                      </div>
                    ) : (
                      <div style={css('display:flex; flex-direction:column; align-items:center; gap:8px;')}>
                        <Raw html={'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>'} />
                        <span style={css('font-weight:700; font-size:13.5px; color:var(--ink);')}>Upload payment screenshot</span>
                        <span style={css('font-size:11.5px; color:var(--muted);')}>JPG, PNG or WEBP · max 5MB</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {payAtTurf && (
                <div style={css('background:var(--brand-soft); border:1px solid color-mix(in srgb, var(--brand) 22%, #fff); border-radius:14px; padding:18px 20px; display:flex; gap:11px; align-items:flex-start;')}>
                  <Raw html={'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-deep)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; margin-top:1px;"><path d="M20 6 9 17l-5-5"/></svg>'} />
                  <div style={css('font-size:13.5px; color:var(--brand-deep); font-weight:600; line-height:1.5;')}>No online payment needed. Pay <b>{fmt(totalN)}</b> in cash or UPI directly at the turf when you arrive. The owner confirms your slot on WhatsApp.</div>
                </div>
              )}
            </div>

            {/* RIGHT: summary */}
            <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:22px; box-shadow:var(--shadow-sm); position:sticky; top:78px;')}>
              <div style={css('font-weight:700; font-size:15px; margin-bottom:16px;')}>Booking summary</div>
              <div style={css('display:flex; gap:12px; padding-bottom:16px; border-bottom:1px solid var(--line);')}>
                <img src={TURF.images[0]} alt="" style={css('width:60px; height:60px; border-radius:11px; object-fit:cover; flex-shrink:0;')} />
                <div><div style={css('font-weight:700; font-size:15px;')}>{TURF.name}</div><div style={css('font-size:12.5px; color:var(--muted); font-weight:500; margin-top:3px;')}>{activeG.name} · {TURF.location}</div></div>
              </div>
              <div style={css('padding:15px 0; border-bottom:1px solid var(--line);')}>
                <div style={css('display:flex; align-items:center; gap:8px; font-weight:600; font-size:13.5px; margin-bottom:10px;')}><Raw html={'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'} />{dateObj ? dateObj.full : ''}</div>
                <div style={css('display:flex; flex-wrap:wrap; gap:7px;')}>
                  {reqSlots.map((rs, i) => (
                    <span key={i} style={css('background:var(--surface-2); border:1px solid var(--line); font-weight:600; font-size:12px; padding:6px 10px; border-radius:7px; display:flex; align-items:center; gap:6px; font-variant-numeric:tabular-nums;')}><Raw html={'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'} />{rs}</span>
                  ))}
                </div>
              </div>
              <div style={css('padding-top:15px; display:flex; flex-direction:column; gap:8px;')}>
                <div style={css('display:flex; justify-content:space-between; font-size:13.5px; font-weight:500; color:var(--muted); font-variant-numeric:tabular-nums;')}><span>{fmt(activeG.priceN)} × {sel.length} hr</span><span>{fmt(subtotalN)}</span></div>
                {hasDisc && (
                  <div style={css('display:flex; justify-content:space-between; font-size:13.5px; font-weight:600; color:var(--brand-deep); font-variant-numeric:tabular-nums;')}><span>{discountLabel}</span><span>-{fmt(discN)}</span></div>
                )}
                <div style={css('display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--line); padding-top:11px; margin-top:3px;')}><span style={css('font-weight:700; font-size:15px;')}>Total</span><span style={css('font-weight:800; font-size:23px; font-variant-numeric:tabular-nums;')}>{fmt(totalN)}</span></div>
                <div style={css('display:flex; justify-content:space-between; font-size:12.5px; font-weight:600; color:var(--ink-2); font-variant-numeric:tabular-nums;')}><span>{pay === 'advance_payment' ? 'Advance now' : 'Pay now'}</span><span>{fmt(payNowN)}</span></div>
                {venueDueN > 0 && pay !== 'pay_at_turf' && (
                  <div style={css('display:flex; justify-content:space-between; font-size:12.5px; font-weight:600; color:var(--amber); font-variant-numeric:tabular-nums;')}><span>Pay at venue</span><span>{fmt(venueDueN)}</span></div>
                )}
              </div>
              <button onClick={submitBooking} style={css(submitStyle)}>{submitting ? 'Placing booking…' : (pay === 'pay_at_turf' ? 'Confirm booking' : 'Confirm & place booking')}</button>
              <p style={css('text-align:center; font-size:11.5px; color:var(--muted); font-weight:500; margin:11px 0 0;')}>By booking you agree to the turf&apos;s cancellation policy.</p>
            </div>
          </div>
        </div>
      )}

      {/* ====================== SUCCESS ====================== */}
      {screen === 'success' && (
        <div data-screen-label="Success" style={css('max-width:560px; margin:0 auto; padding:clamp(40px,7vw,80px) clamp(16px,4vw,32px); text-align:center; animation:fadeUp .3s ease both;')}>
          <div style={css('width:72px; height:72px; margin:0 auto 24px; border-radius:50%; background:var(--brand); display:flex; align-items:center; justify-content:center;')}><Raw html={'<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'} /></div>
          <h1 style={css('font-weight:800; font-size:clamp(26px,4.4vw,36px); letter-spacing:-.02em; margin:0 0 12px;')}>Booking placed</h1>
          <p style={css('color:var(--muted); font-weight:500; font-size:15px; line-height:1.55; margin:0 0 18px;')}>Your slots at <b style={css('color:var(--ink); font-weight:700;')}>{TURF.name}</b> are reserved. The owner will confirm on <b style={css('color:var(--ink); font-weight:700;')}>{phone || 'your phone'}</b> shortly.</p>
          <div style={css('display:inline-flex; align-items:center; gap:8px; background:var(--amber-soft); color:var(--amber); font-weight:700; font-size:13px; padding:8px 15px; border-radius:99px; margin:0 0 28px;')}><span style={css('width:8px; height:8px; border-radius:50%; background:var(--amber);')} />{pay === 'pay_at_turf' ? 'Pending owner confirmation' : 'Payment under review'}</div>
          <div style={css('background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:18px; text-align:left; box-shadow:var(--shadow-sm);')}>
            <div style={css('display:flex; gap:13px; align-items:center;')}>
              <img src={TURF.images[0]} alt="" style={css('width:56px; height:56px; border-radius:11px; object-fit:cover;')} />
              <div style={css('flex:1;')}><div style={css('font-weight:700; font-size:15px;')}>{TURF.name}</div><div style={css('font-size:12.5px; color:var(--muted); font-weight:500; margin-top:2px;')}>{activeG.name} · {dateObj ? dateObj.full : ''} · {selSummary}</div></div>
              <div style={css('font-weight:800; font-size:19px; font-variant-numeric:tabular-nums;')}>{fmt(totalN)}</div>
            </div>
          </div>
          <div style={css('display:flex; gap:10px; margin-top:20px;')}>
            <Hov as="a" href={waLink} target="_blank" s="text-decoration:none; flex:1; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; border:none; padding:14px; border-radius:9px; background:var(--wa); color:#fff; font-family:inherit; font-weight:700; font-size:14.5px;" hover="filter:brightness(.94);"><Raw html={waSvg(16)} />Message owner</Hov>
            <Hov as="button" onClick={() => goTo('booking')} s="cursor:pointer; flex:1; border:1px solid var(--line-2); padding:14px; border-radius:9px; background:var(--surface); color:var(--ink); font-family:inherit; font-weight:700; font-size:14.5px;" hover="background:var(--surface-2);">Book again</Hov>
          </div>
        </div>
      )}

      {/* ====================== SHARE SHEET ====================== */}
      {shareOpen && (
        <div onClick={() => { setShareOpen(false); setCopied(false); }} style={css('position:fixed; inset:0; z-index:90; background:rgba(18,32,24,.45); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeUp .2s ease both;')}>
          <div onClick={(e) => e.stopPropagation()} style={css('background:var(--surface); border-radius:18px; padding:26px; max-width:380px; width:100%; box-shadow:0 30px 60px -20px rgba(18,32,24,.5);')}>
            <div style={css('display:flex; align-items:center; justify-content:space-between; margin-bottom:18px;')}>
              <h3 style={css('font-weight:800; font-size:19px; letter-spacing:-.02em; margin:0;')}>Share this turf</h3>
              <button onClick={() => { setShareOpen(false); setCopied(false); }} style={css('cursor:pointer; border:none; background:var(--surface-2); width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:var(--ink-2);')}><Raw html={'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'} /></button>
            </div>
            <div style={css('display:flex; gap:14px; align-items:center; background:var(--surface-2); border:1px solid var(--line); border-radius:12px; padding:14px; margin-bottom:16px;')}>
              <div style={css('width:84px; height:84px; background:#fff; border:1px solid var(--line-2); border-radius:10px; padding:6px; flex-shrink:0;')}><img src={pageQr} alt="QR" style={css('width:100%; height:100%; object-fit:contain;')} /></div>
              <div style={css('flex:1; min-width:0;')}><div style={css('font-size:11.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:5px;')}>Booking link</div><div style={css('font-size:12.5px; font-weight:600; color:var(--ink); word-break:break-all; line-height:1.35;')}>{shareUrl}</div></div>
            </div>
            <div style={css('display:flex; flex-direction:column; gap:9px;')}>
              <Hov as="button" onClick={copyLink} s="cursor:pointer; display:flex; align-items:center; gap:11px; border:1px solid var(--line-2); background:var(--surface); padding:13px 15px; border-radius:11px; font-family:inherit; font-weight:700; font-size:14px; color:var(--ink); text-align:left;" hover="background:var(--surface-2);"><span style={css('width:34px; height:34px; border-radius:9px; background:var(--surface-2); display:flex; align-items:center; justify-content:center; color:var(--ink-2);')}><Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>'} /></span>{copied ? 'Link copied' : 'Copy booking link'}</Hov>
              <Hov as="a" href={waShareLink} target="_blank" s="text-decoration:none; cursor:pointer; display:flex; align-items:center; gap:11px; border:1px solid var(--line-2); background:var(--surface); padding:13px 15px; border-radius:11px; font-family:inherit; font-weight:700; font-size:14px; color:var(--ink);" hover="background:var(--surface-2);"><span style={css('width:34px; height:34px; border-radius:9px; background:var(--wa); display:flex; align-items:center; justify-content:center; color:#fff;')}><Raw html={waSvg(17)} /></span>Share on WhatsApp</Hov>
              <Hov as="button" onClick={() => flash('Story image ready, opening Instagram')} s="cursor:pointer; display:flex; align-items:center; gap:11px; border:1px solid var(--line-2); background:var(--surface); padding:13px 15px; border-radius:11px; font-family:inherit; font-weight:700; font-size:14px; color:var(--ink); text-align:left;" hover="background:var(--surface-2);"><span style={css('width:34px; height:34px; border-radius:9px; background:var(--ig); display:flex; align-items:center; justify-content:center; color:#fff;')}><Raw html={'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg>'} /></span>Add to Instagram story</Hov>
            </div>
          </div>
        </div>
      )}

      {/* ====================== TOAST ====================== */}
      {toast && (
        <div style={css('position:fixed; left:50%; bottom:26px; z-index:95; background:var(--ink); color:#fff; padding:13px 18px; border-radius:9px; box-shadow:0 16px 36px -14px rgba(18,32,24,.5); display:flex; align-items:center; gap:10px; font-weight:600; font-size:13.5px; animation:toastIn .3s ease both; max-width:90vw;')}>
          <Raw html={'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></svg>'} />{toast}
        </div>
      )}
    </div>
  );
}
