// Netlify Function: leiratkozás kezelése
// URL: /leiratkozas?email=xxx&token=xxx (GET)
// Visszaad egy HTML oldalt visszaigazolással

exports.handler = async (event) => {
  const email = event.queryStringParameters?.email || '';
  const token = event.queryStringParameters?.token || '';

  const RESEND_KEY  = process.env.RESEND_API_KEY;
  const SA_JSON_B64 = process.env.GOOGLE_SERVICE_JSON;
  const SHEETS_ID   = process.env.GOOGLE_SHEETS_ID;

  let success = false;
  let message = 'A leiratkozás feldolgozása sikertelen. Kérjük, írjon nekünk: sejtszerviz.hu';

  if (email && RESEND_KEY) {
    // 1. Resend-ben leiratkozottnak jelöljük
    try {
      const r = await fetch(`https://api.resend.com/contacts/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ unsubscribed: true })
      });
      if (r.ok || r.status === 404) success = true;
    } catch(e) { console.error('Resend unsub hiba:', e); }

    // 2. Sheets-ben leiratkozottnak jelöljük
    if (success && SA_JSON_B64 && SHEETS_ID) {
      try {
        const saJson = JSON.parse(Buffer.from(SA_JSON_B64, 'base64').toString());
        const token2 = await getGoogleToken(saJson);
        if (token2) {
          // Megkeressük a sort az email alapján
          const readRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Feliratkoz%C3%B3k!A:D`,
            { headers: { Authorization: `Bearer ${token2}` } }
          );
          if (readRes.ok) {
            const data = await readRes.json();
            const rows = data.values || [];
            const rowIdx = rows.findIndex(r => r[0]?.toLowerCase() === email.toLowerCase());
            if (rowIdx >= 0) {
              // D oszlop (index 3) = 'TRUE' = leiratkozott
              const range = `Feliratkoz%C3%B3k!D${rowIdx + 1}`;
              await fetch(
                `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/${range}?valueInputOption=USER_ENTERED`,
                {
                  method: 'PUT',
                  headers: { Authorization: `Bearer ${token2}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ values: [['TRUE']] })
                }
              );
            }
          }
        }
      } catch(e) { console.error('Sheets unsub hiba:', e); }
    }

    message = success
      ? 'Sikeresen leiratkozott a Sejtszerviz.hu hírleveléről.'
      : 'A leiratkozás feldolgozása sikertelen. Kérjük, írjon nekünk.';
  }

  const html = `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${success ? 'Leiratkozás sikeres' : 'Leiratkozás'} · Sejtszerviz.hu</title>
<style>
  body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
  .card{background:#fff;border-radius:16px;padding:40px 36px;max-width:440px;text-align:center;box-shadow:0 4px 32px rgba(0,0,0,.08)}
  .icon{font-size:48px;margin-bottom:16px}
  h1{font-size:20px;font-weight:800;color:#0b2425;margin:0 0 12px}
  p{font-size:15px;color:#4a5a5b;line-height:1.65;margin:0 0 24px}
  .email{font-size:13px;color:#8a9a9b;font-family:monospace;background:#f5f0e8;padding:6px 12px;border-radius:6px;display:inline-block;margin-bottom:24px}
  a{display:inline-block;background:#0b2425;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px}
</style>
</head>
<body>
<div class="card">
  <div class="icon">${success ? '✅' : '⚠️'}</div>
  <h1>${success ? 'Leiratkozás sikeres' : 'Hiba történt'}</h1>
  ${email ? `<div class="email">${email}</div>` : ''}
  <p>${message}</p>
  ${success ? '<p style="font-size:13px;color:#9a9a8a">Nem kap több levelet tőlünk. Ha meggondolta magát, bármikor újra feliratkozhat.</p>' : ''}
  <a href="https://sejtszerviz.hu">Vissza a főoldalra</a>
</div>
</body></html>`;

  return {
    statusCode: success ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html
  };
};

async function getGoogleToken(sa) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const enc = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const h = enc({ alg:'RS256', typ:'JWT' });
    const c = enc({ iss:sa.client_email, scope:'https://www.googleapis.com/auth/spreadsheets', aud:'https://oauth2.googleapis.com/token', exp:now+3600, iat:now });
    const u = `${h}.${c}`;
    const k = Buffer.from(sa.private_key.replace(/-----[^-]+-----/g,'').replace(/\n/g,''), 'base64');
    const ck = await crypto.subtle.importKey('pkcs8', k, {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'}, false, ['sign']);
    const s = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', ck, new TextEncoder().encode(u));
    const jwt = `${u}.${Buffer.from(s).toString('base64url')}`;
    const r = await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` });
    return (await r.json()).access_token || null;
  } catch(e) { return null; }
}
