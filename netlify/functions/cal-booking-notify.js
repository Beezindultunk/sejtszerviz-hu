// Netlify Function: Cal.com webhook fogadó
// Cal.com foglalásnál POST-olja ezt az URL-t, mi pedig
// küldünk egy szép, forrást jelölő email értesítőt
// URL: https://sejtszerviz.hu/.netlify/functions/cal-booking-notify

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return { statusCode: 500, body: 'Missing RESEND_API_KEY' };

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  // Cal.com webhook payload
  const booking   = payload.payload || payload;
  const eventType = booking.eventTitle || booking.type || '';
  const attendee  = booking.attendees?.[0] || {};
  const name      = attendee.name || booking.attendeeName || 'Ismeretlen';
  const email     = attendee.email || booking.attendeeEmail || '';
  const startTime = booking.startTime || '';
  const meetUrl   = booking.metadata?.videoCallUrl || booking.videoCallUrl || '';
  const status    = payload.triggerEvent || 'BOOKING_CREATED';

  // Csak új foglalást kezelünk
  if (status !== 'BOOKING_CREATED' && !status.includes('CREATED')) {
    return { statusCode: 200, body: 'Ignored: ' + status };
  }

  // Forrás meghatározása az eseménytípus neve alapján
  const isSejtszerviz   = eventType.toLowerCase().includes('sejtszerviz');
  const isErthetobb     = eventType.toLowerCase().includes('érthetőbb') || eventType.toLowerCase().includes('erthetobb');
  const sourceLabel     = isSejtszerviz ? '🔬 sejtszerviz.hu' : isErthetobb ? '💚 erthetobbegeszseg.hu' : '📅 Cal.com';
  const sourceBg        = isSejtszerviz ? '#8b2234' : isErthetobb ? '#16a34a' : '#1d4ed8';
  const sourceText      = isSejtszerviz ? '#fff' : '#fff';

  // Dátum formázás
  const dt = startTime ? new Date(startTime).toLocaleString('hu-HU', {
    timeZone: 'Europe/Budapest', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '–';

  const html = `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 16px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">

  <!-- FEJLÉC -->
  <tr><td style="background:#0b2425;padding:22px 28px">
    <div style="color:#fff;font-size:17px;font-weight:900;letter-spacing:-.02em">📅 Új foglalás érkezett</div>
  </td></tr>

  <!-- FORRÁS BANNER -->
  <tr><td style="padding:0">
    <div style="background:${sourceBg};padding:10px 28px;display:flex;align-items:center">
      <span style="color:${sourceText};font-size:15px;font-weight:800">${sourceLabel}</span>
    </div>
  </td></tr>

  <!-- TARTALOM -->
  <tr><td style="padding:24px 28px">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;border-radius:12px;padding:20px">
      <tr><td style="padding:6px 0;font-size:14px;color:#1a2a2b"><strong>👤 Név:</strong> ${name}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#1a2a2b"><strong>📧 Email:</strong> ${email}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#1a2a2b"><strong>📋 Esemény:</strong> ${eventType}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#1a2a2b"><strong>📅 Időpont:</strong> ${dt}</td></tr>
      ${meetUrl ? `<tr><td style="padding:6px 0;font-size:14px;color:#1a2a2b"><strong>🎥 Meet:</strong> <a href="${meetUrl}" style="color:#8b2234">${meetUrl}</a></td></tr>` : ''}
    </table>

    ${meetUrl ? `<a href="${meetUrl}" style="display:block;margin-top:20px;background:#0b2425;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">Csatlakozás a megbeszéléshez →</a>` : ''}

    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #f0e8dc;font-size:11px;color:#9aaa9b;text-align:center">
      ${sourceLabel} · admin értesítő · Cal.com webhook
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  // Email küldése
  const subjectSource = isSejtszerviz ? '🔬 SEJTSZERVIZ.HU' : isErthetobb ? '💚 ÉRTHETŐBB EGÉSZSÉG' : '📅 CAL.COM';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Cal.com értesítő <eva@erthetobbegeszseg.hu>',
      to: ['tetested.hu@gmail.com'],
      subject: `${subjectSource} – Új foglalás: ${name} – ${dt}`,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Resend hiba:', err);
    return { statusCode: 502, body: 'Email failed: ' + err };
  }

  console.log(`Foglalás értesítő: ${sourceLabel} | ${name} | ${dt}`);
  return { statusCode: 200, body: JSON.stringify({ sent: true, source: sourceLabel, name, dt }) };
};
