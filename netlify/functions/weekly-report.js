// Netlify Scheduled Function — csütörtöki heti riport email
// Ütemezés: netlify.toml → minden csütörtök 07:00 UTC = 09:00 Budapest
// Az email tartalmaz: vonaldiagramot (SVG), látogatók, kattintások,
// foglalások, oldalmegtekintések — minden az emailben, átirányítás nélkül.

exports.handler = async () => {
  const PLAUSIBLE_KEY = process.env.PLAUSIBLE_API_KEY;
  const RESEND_KEY    = process.env.RESEND_API_KEY;
  const TO_EMAIL      = process.env.REPORT_EMAIL || 'tetested.hu@gmail.com';
  const SITE          = 'sejtszerviz.hu';

  if (!PLAUSIBLE_KEY || !RESEND_KEY) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  // ── Adatok lekérése ───────────────────────────────────────────────
  async function plausible(endpoint) {
    const r = await fetch(`https://plausible.io/api/v1/stats/${endpoint}&site_id=${SITE}`, {
      headers: { Authorization: `Bearer ${PLAUSIBLE_KEY}` }
    });
    if (!r.ok) return null;
    return r.json();
  }

  // Az elmúlt 7 nap napi bontásban
  const [timeseries, aggregate, prevWeek, goals] = await Promise.all([
    plausible('timeseries?period=7d&metrics=visitors,pageviews'),
    plausible('aggregate?period=7d&metrics=visitors,pageviews,bounce_rate,visit_duration'),
    plausible('aggregate?period=7d&date=' + getPrevWeekDate() + '&metrics=visitors'),
    plausible('breakdown?period=7d&property=event:name&limit=20'),
  ]);

  const agg = aggregate?.results || {};
  const visitors   = agg.visitors?.value    ?? 0;
  const pageviews  = agg.pageviews?.value   ?? 0;
  const bounceRate = agg.bounce_rate?.value ?? 0;
  const duration   = Math.round((agg.visit_duration?.value ?? 0) / 60);
  const prevVis    = prevWeek?.results?.visitors?.value ?? 0;
  const change     = prevVis > 0 ? Math.round(((visitors - prevVis) / prevVis) * 100) : null;
  const changeSign = change === null ? '' : change >= 0 ? `▲ ${change}%` : `▼ ${Math.abs(change)}%`;
  const changeColor = (change ?? 0) >= 0 ? '#16a34a' : '#dc2626';

  // Cél-konverziók
  const goalResults = goals?.results || [];
  const getGoal = n => goalResults.find(g => g['event:name'] === n)?.visitors ?? 0;
  const bookings    = getGoal('KONVERZIÓ: Időpont lefoglalva');
  const newsletter  = getGoal('KONVERZIÓ: Hírlevél feliratkozás');
  const ctaClick    = getGoal('CTA: Konzultáció');
  const packageClick = getGoal('CTA: Csomag megrendelése');

  // Napi adatok a diagramhoz
  const days = (timeseries?.results || []).map(d => ({
    date: d.date,
    label: formatDayLabel(d.date),
    visitors: d.visitors ?? 0,
    pageviews: d.pageviews ?? 0,
  }));

  const maxV = Math.max(...days.map(d => d.visitors), 1);
  const maxP = Math.max(...days.map(d => d.pageviews), 1);
  const chartMax = Math.max(maxV, maxP);

  // ── SVG vonaldiagram ─────────────────────────────────────────────
  const W = 540, H = 160, PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const n = days.length;

  function xPos(i) { return PAD.left + (i / (n - 1)) * chartW; }
  function yPos(v) { return PAD.top + chartH - (v / chartMax) * chartH; }

  // Rácsvonalak
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const val = Math.round(f * chartMax);
    const y = yPos(val);
    return `<line x1="${PAD.left}" y1="${y}" x2="${W - PAD.right}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,3"/>
            <text x="${PAD.left - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#9ca3af">${val}</text>`;
  }).join('');

  // Oldalmegtekinntések (halvány terület)
  const pPath = days.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.pageviews)}`).join(' ');
  const pArea = pPath + ` L${xPos(n-1)},${PAD.top + chartH} L${xPos(0)},${PAD.top + chartH} Z`;

  // Látogatók vonal
  const vPath = days.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(d.visitors)}`).join(' ');

  // X tengelycímkék
  const xLabels = days.map((d, i) =>
    `<text x="${xPos(i)}" y="${H - 4}" text-anchor="middle" font-size="10" fill="#9ca3af">${d.label}</text>`
  ).join('');

  // Látogató-pontok
  const dots = days.map((d, i) =>
    `<circle cx="${xPos(i)}" cy="${yPos(d.visitors)}" r="3.5" fill="#8b2234" stroke="#fff" stroke-width="1.5"/>
     <title>${d.label}: ${d.visitors} látogató</title>`
  ).join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="font-family:-apple-system,sans-serif">
  <defs>
    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c9a96e" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#c9a96e" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  ${gridLines}
  <path d="${pArea}" fill="url(#pg)"/>
  <path d="${pPath}" fill="none" stroke="#c9a96e" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.6"/>
  <path d="${vPath}" fill="none" stroke="#8b2234" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
  ${dots}
  ${xLabels}
</svg>`;

  const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

  // ── Hétre vonatkozó dátumcímke ────────────────────────────────────
  const weekLabel = getWeekLabel();
  const today = new Date().toLocaleDateString('hu-HU', { timeZone: 'Europe/Budapest', year: 'numeric', month: 'long', day: 'numeric' });

  // ── Email HTML ────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a2a2b}
  .wrap{max-width:600px;margin:28px auto;padding:0 12px}
  .card{background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.09)}
  .header{background:#0b2425;padding:24px 32px}
  .logo{color:#fff;font-size:18px;font-weight:900;letter-spacing:-.02em}
  .logo span{color:#c9a96e}
  .week{color:rgba(255,255,255,.5);font-size:12px;margin-top:3px;letter-spacing:.02em}
  /* KPI kártyák */
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-bottom:1px solid #f0e8dc}
  .kpi{padding:20px 16px;text-align:center;border-right:1px solid #f0e8dc}
  .kpi:last-child{border-right:none}
  .kpi-val{font-size:26px;font-weight:900;color:#0b2425;line-height:1;letter-spacing:-.03em}
  .kpi-label{font-size:11px;color:#8a9a9b;margin-top:4px;letter-spacing:.03em;text-transform:uppercase}
  .kpi-change{font-size:11px;font-weight:700;margin-top:3px}
  /* Diagram */
  .chart-section{padding:24px 28px 16px}
  .section-title{font-size:12px;font-weight:700;color:#6a7a7b;letter-spacing:.08em;text-transform:uppercase;margin-bottom:14px}
  .chart-img{width:100%;max-width:540px;display:block}
  .legend{display:flex;gap:20px;margin-top:10px;padding-bottom:4px}
  .leg-item{display:flex;align-items:center;gap:6px;font-size:11px;color:#6a7a7b}
  .leg-line{width:24px;height:3px;border-radius:2px}
  /* Konverziók */
  .conv-section{padding:8px 28px 24px}
  .conv-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
  .conv-card{background:#f5f0e8;border-radius:10px;padding:14px 16px;position:relative}
  .conv-card.highlight{background:#0b2425}
  .conv-icon{font-size:18px;margin-bottom:6px}
  .conv-num{font-size:24px;font-weight:900;color:#0b2425;line-height:1}
  .conv-card.highlight .conv-num{color:#c9a96e}
  .conv-name{font-size:11px;color:#8a9a9b;margin-top:3px;letter-spacing:.02em}
  .conv-card.highlight .conv-name{color:rgba(255,255,255,.6)}
  /* Vásárlás */
  .purchase-section{padding:0 28px 24px}
  .purchase-box{border:1px dashed #c9a96e;border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px}
  .purchase-label{font-size:12px;color:#8a9a9b;letter-spacing:.02em}
  .purchase-val{font-size:22px;font-weight:900;color:#0b2425}
  .purchase-note{font-size:11px;color:#b0a090;margin-top:2px}
  /* Footer */
  .footer-bar{background:#f5f0e8;padding:16px 28px;border-top:1px solid #e8e0d5;text-align:center}
  .footer-bar p{font-size:11px;color:#9a9a8a;margin:0;line-height:1.6}
</style>
</head>
<body>
<div class="wrap">
<div class="card">

  <!-- FEJLÉC -->
  <div class="header">
    <div class="logo">Sejt<span>szerviz</span>.hu</div>
    <div class="week">Heti riport · ${weekLabel} · Küldve: ${today}</div>
  </div>

  <!-- KPI-K -->
  <div class="kpis">
    <div class="kpi">
      <div class="kpi-val">${visitors}</div>
      <div class="kpi-label">Látogató</div>
      ${change !== null ? `<div class="kpi-change" style="color:${changeColor}">${changeSign}</div>` : ''}
    </div>
    <div class="kpi">
      <div class="kpi-val">${pageviews}</div>
      <div class="kpi-label">Oldalmegt.</div>
    </div>
    <div class="kpi">
      <div class="kpi-val">${duration}p</div>
      <div class="kpi-label">Átlag idő</div>
    </div>
    <div class="kpi">
      <div class="kpi-val">${bounceRate}%</div>
      <div class="kpi-label">Visszaf.</div>
    </div>
  </div>

  <!-- DIAGRAM -->
  <div class="chart-section">
    <div class="section-title">📈 Napi trend — látogatók & oldalmegtekintések</div>
    <img class="chart-img" src="${svgDataUri}" alt="Heti forgalmi diagram" width="540" height="160">
    <div class="legend">
      <div class="leg-item">
        <div class="leg-line" style="background:#8b2234"></div>
        Látogatók
      </div>
      <div class="leg-item">
        <div class="leg-line" style="background:#c9a96e;opacity:.7"></div>
        Oldalmegtekintések
      </div>
    </div>
  </div>

  <!-- KONVERZIÓK -->
  <div class="conv-section">
    <div class="section-title">🎯 Konverziók ezen a héten</div>
    <div class="conv-grid">
      <div class="conv-card highlight">
        <div class="conv-icon">📅</div>
        <div class="conv-num">${bookings}</div>
        <div class="conv-name">Időpont lefoglalva</div>
      </div>
      <div class="conv-card highlight">
        <div class="conv-icon">📧</div>
        <div class="conv-num">${newsletter}</div>
        <div class="conv-name">Hírlevél feliratkozás</div>
      </div>
      <div class="conv-card">
        <div class="conv-icon">👆</div>
        <div class="conv-num" style="color:#8b2234">${ctaClick}</div>
        <div class="conv-name">Konzultáció CTA kattintás</div>
      </div>
      <div class="conv-card">
        <div class="conv-icon">🛒</div>
        <div class="conv-num" style="color:#8b2234">${packageClick}</div>
        <div class="conv-name">Csomag CTA kattintás</div>
      </div>
    </div>
  </div>

  <!-- VÁSÁRLÁS (manuálisan töltendő) -->
  <div class="purchase-section">
    <div class="section-title">💰 Vásárlások (manuális)</div>
    <div class="purchase-box">
      <div style="font-size:28px">🛍️</div>
      <div>
        <div class="purchase-label">Ezen a héten leadott megrendelések</div>
        <div class="purchase-val">— db &nbsp;/&nbsp; — Ft</div>
        <div class="purchase-note">Ezt Ön tölti ki hetente a Zinzino partnerfelületéről</div>
      </div>
    </div>
  </div>

  <!-- LÁBLÉC -->
  <div class="footer-bar">
    <p>Sejtszerviz.hu automatikus heti riport · minden csütörtök 09:00<br>
    Plausible Analytics · cookie-mentes, GDPR-megfelelő mérés</p>
  </div>

</div>
</div>
</body></html>`;

  // ── Email küldése ─────────────────────────────────────────────────
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sejtszerviz Admin <onboarding@resend.dev>',
      to: [TO_EMAIL],
      subject: `📊 Heti riport · ${weekLabel} · ${visitors} látogató${bookings > 0 ? ` · ${bookings} foglalás` : ''}`,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    return { statusCode: 502, body: 'Email send failed: ' + err };
  }

  return { statusCode: 200, body: JSON.stringify({ sent: true, to: TO_EMAIL, visitors, bookings }) };
};

// ── Segédfüggvények ───────────────────────────────────────────────
function getPrevWeekDate() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
}

function getWeekLabel() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const fmt = d => d.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' });
  return `${fmt(start)} – ${fmt(now)}`;
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr);
  const days = ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Szo'];
  return days[d.getDay()] + ' ' + d.getDate();
}
