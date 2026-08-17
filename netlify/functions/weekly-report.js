// Netlify Scheduled Function — heti riport emailben
// Ütemezés: netlify.toml-ban van beállítva (minden hétfő 07:00 UTC = 09:00 Budapest)
//
// Szükséges env változók (Netlify → Project configuration → Environment variables):
//   RESEND_API_KEY      — már beállítva a hírlevélhez
//   PLAUSIBLE_API_KEY   — stjQ7Pghr_AEWwUT5tsu_4WqMfZ90ahEmqbJ7DMJlkg
//   REPORT_EMAIL        — tetested.hu@gmail.com (ahova a riport megy)

exports.handler = async () => {
  const PLAUSIBLE_KEY = process.env.PLAUSIBLE_API_KEY;
  const RESEND_KEY    = process.env.RESEND_API_KEY;
  const TO_EMAIL      = process.env.REPORT_EMAIL || 'tetested.hu@gmail.com';
  const SITE          = 'sejtszerviz.hu';

  if (!PLAUSIBLE_KEY || !RESEND_KEY) {
    console.error('Hiányzó env változók: PLAUSIBLE_API_KEY vagy RESEND_API_KEY');
    return { statusCode: 500, body: 'Missing env vars' };
  }

  // ── Adatok lekérése a Plausible API-ból ──────────────────────────────
  async function plausible(endpoint) {
    const r = await fetch(`https://plausible.io/api/v1/stats/${endpoint}&site_id=${SITE}`, {
      headers: { Authorization: `Bearer ${PLAUSIBLE_KEY}` }
    });
    if (!r.ok) { console.error('Plausible hiba:', r.status, await r.text()); return null; }
    return r.json();
  }

  const [week, prevWeek, goals, sources] = await Promise.all([
    plausible('aggregate?period=7d&metrics=visitors,pageviews,bounce_rate,visit_duration'),
    plausible('aggregate?period=7d&date=' + getPrevWeekDate() + '&metrics=visitors,pageviews'),
    plausible('breakdown?period=7d&property=event:name&limit=10'),
    plausible('breakdown?period=7d&property=visit:source&limit=5'),
  ]);

  const w  = week?.results   || {};
  const pw = prevWeek?.results || {};
  const visitors   = w.visitors?.value   ?? 0;
  const pageviews  = w.pageviews?.value  ?? 0;
  const bounceRate = w.bounce_rate?.value ?? 0;
  const duration   = Math.round((w.visit_duration?.value ?? 0) / 60);
  const prevVis    = pw.visitors?.value  ?? 0;
  const change     = prevVis > 0 ? Math.round(((visitors - prevVis) / prevVis) * 100) : null;
  const changeTxt  = change === null ? '' : change >= 0 ? `▲ ${change}%` : `▼ ${Math.abs(change)}%`;
  const changeColor = change >= 0 ? '#16a34a' : '#dc2626';

  const goalRows = (goals?.results || [])
    .filter(g => !['Form: Submission','File Download','Outbound Link: Click','404'].includes(g['event:name']))
    .map(g => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px">${g['event:name']}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;text-align:right">${g.visitors}</td>
      </tr>`).join('');

  const sourceRows = (sources?.results || [])
    .map(s => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px">${s['visit:source'] || 'Közvetlen'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;text-align:right">${s.visitors}</td>
      </tr>`).join('');

  const weekLabel = getWeekLabel();

  // ── Email HTML ────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="hu">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        
        <!-- FEJLÉC -->
        <tr><td style="background:#0d1117;padding:28px 32px">
          <div style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-.02em">🔬 Sejtszerviz.hu</div>
          <div style="color:#9ca3af;font-size:12px;margin-top:4px">Heti riport · ${weekLabel}</div>
        </td></tr>

        <!-- FŐ SZÁMOK -->
        <tr><td style="padding:28px 32px">
          <div style="font-size:14px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px">Heti összefoglaló</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:25%;padding:16px;background:#f8f9fa;border-radius:12px;text-align:center">
                <div style="font-size:28px;font-weight:800;color:#0d1117">${visitors}</div>
                <div style="font-size:11px;color:#6b7280;margin-top:4px">Látogató</div>
                ${change !== null ? `<div style="font-size:11px;color:${changeColor};font-weight:700;margin-top:4px">${changeTxt}</div>` : ''}
              </td>
              <td width="8"></td>
              <td style="width:25%;padding:16px;background:#f8f9fa;border-radius:12px;text-align:center">
                <div style="font-size:28px;font-weight:800;color:#0d1117">${pageviews}</div>
                <div style="font-size:11px;color:#6b7280;margin-top:4px">Oldalmegt.</div>
              </td>
              <td width="8"></td>
              <td style="width:25%;padding:16px;background:#f8f9fa;border-radius:12px;text-align:center">
                <div style="font-size:28px;font-weight:800;color:#0d1117">${duration}p</div>
                <div style="font-size:11px;color:#6b7280;margin-top:4px">Átlag idő</div>
              </td>
              <td width="8"></td>
              <td style="width:25%;padding:16px;background:#f8f9fa;border-radius:12px;text-align:center">
                <div style="font-size:28px;font-weight:800;color:#0d1117">${bounceRate}%</div>
                <div style="font-size:11px;color:#6b7280;margin-top:4px">Visszaf.</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- KONVERZIÓK -->
        ${goalRows ? `
        <tr><td style="padding:0 32px 24px">
          <div style="font-size:14px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px">🏆 Konverziók</div>
          <table width="100%" style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden">
            <tr style="background:#f9fafb">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:600">Esemény</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#9ca3af;font-weight:600">Látogató</th>
            </tr>
            ${goalRows}
          </table>
        </td></tr>` : ''}

        <!-- FORGALOMFORRÁSOK -->
        ${sourceRows ? `
        <tr><td style="padding:0 32px 24px">
          <div style="font-size:14px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px">📡 Forgalomforrások</div>
          <table width="100%" style="border:1px solid #f3f4f6;border-radius:10px;overflow:hidden">
            <tr style="background:#f9fafb">
              <th style="padding:8px 12px;text-align:left;font-size:11px;color:#9ca3af;font-weight:600">Forrás</th>
              <th style="padding:8px 12px;text-align:right;font-size:11px;color:#9ca3af;font-weight:600">Látogató</th>
            </tr>
            ${sourceRows}
          </table>
        </td></tr>` : ''}

        <!-- CTA -->
        <tr><td style="padding:0 32px 32px">
          <a href="https://plausible.io/sejtszerviz.hu" style="display:block;background:#8b2234;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
            📊 Teljes dashboard megnyitása →
          </a>
        </td></tr>

        <!-- LÁBLÉC -->
        <tr><td style="background:#f8f9fa;padding:16px 32px;border-top:1px solid #e5e7eb">
          <div style="font-size:11px;color:#9ca3af;text-align:center">
            Sejtszerviz.hu automatikus heti riport · minden hétfő 09:00<br>
            <a href="https://sejtszerviz.hu" style="color:#8b2234">sejtszerviz.hu</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ── Email küldése Resenden át ─────────────────────────────────────────
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Sejtszerviz Admin <onboarding@resend.dev>',
      to: [TO_EMAIL],
      subject: `📊 Heti riport · ${weekLabel} · ${visitors} látogató`,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend hiba:', err);
    return { statusCode: 502, body: 'Email send failed: ' + err };
  }

  console.log('Heti riport elküldve:', TO_EMAIL);
  return { statusCode: 200, body: JSON.stringify({ sent: true, to: TO_EMAIL, visitors }) };
};

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
