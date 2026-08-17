// Netlify Scheduled Function — heti hírlevél küldés
// Fut: minden kedd 08:00 UTC = 10:00 Budapest
// Minden feliratkozónak kiküldi a feliratkozásától számított N. hetes emailt
// A feliratkozók és küldési hét adatait Google Sheets-ben tárolja

exports.handler = async () => {
  const RESEND_KEY    = process.env.RESEND_API_KEY;
  const SA_JSON_B64   = process.env.GOOGLE_SERVICE_JSON;
  const SHEETS_ID     = process.env.GOOGLE_SHEETS_ID;

  if (!RESEND_KEY || !SA_JSON_B64 || !SHEETS_ID) {
    return { statusCode: 500, body: 'Missing env vars' };
  }

  // ── Google auth ────────────────────────────────────────────────────
  const saJson = JSON.parse(Buffer.from(SA_JSON_B64, 'base64').toString());
  const token = await getGoogleToken(saJson);
  if (!token) return { statusCode: 500, body: 'Google auth failed' };

  // ── Feliratkozók lekérése a Sheets-ből (Feliratkozók sheet) ────────
  const sheetRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Feliratkoz%C3%B3k!A2:D`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!sheetRes.ok) return { statusCode: 502, body: 'Sheets read failed' };

  const sheetData = await sheetRes.json();
  const rows = sheetData.values || [];
  // Oszlopok: A=email, B=firstName, C=feliratkozás dátuma (ISO), D=leiratkozott (TRUE/FALSE)

  const { SERIES } = require('./welcome-series');
  const today = new Date();
  const sent = [];

  for (const row of rows) {
    const [email, firstName, subDate, unsub] = row;
    if (!email || unsub === 'TRUE') continue;

    const subDt = new Date(subDate || today);
    const daysSince = Math.floor((today - subDt) / (1000 * 60 * 60 * 24));
    const weekNum = Math.floor(daysSince / 7);

    // Max 52 hét
    if (weekNum < 1 || weekNum > 52) continue;

    const template = SERIES.find(s => s.week === weekNum);
    if (!template) continue;

    // Email küldése
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Éva Széplábi · Sejtszerviz.hu <onboarding@resend.dev>',
        to: [email],
        subject: `${weekNum}. hét · ${template.subject}`,
        html: template.body(firstName || '', email)
      })
    });

    if (r.ok) sent.push({ email, weekNum });

    // Ne bombázzuk a Resend rate-limitet
    await new Promise(res => setTimeout(res, 100));
  }

  console.log(`Heti hírlevél: ${sent.length} email elküldve`, sent);
  return { statusCode: 200, body: JSON.stringify({ sent: sent.length, details: sent }) };
};

// ── JWT helper ─────────────────────────────────────────────────────────
async function getGoogleToken(sa) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const claim  = btoa(JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, iat: now
    })).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');

    const unsigned = `${header}.${claim}`;
    const keyData = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\n/g, '');
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned));
    const jwt = `${unsigned}.${btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    return (await res.json()).access_token || null;
  } catch(e) { return null; }
}
