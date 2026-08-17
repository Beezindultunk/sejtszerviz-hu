// Netlify Scheduled Function — napi adatok írása Google Sheets-be
// Fut: minden nap 21:50 UTC = 23:50 Budapest
// Sheets táblázat: "Sejtszerviz web" → "Adatok" sheet

exports.handler = async () => {
  const PLAUSIBLE_KEY = process.env.PLAUSIBLE_API_KEY;
  const SHEETS_ID     = process.env.GOOGLE_SHEETS_ID;
  const SA_JSON_B64   = process.env.GOOGLE_SERVICE_JSON;
  const SITE          = 'sejtszerviz.hu';

  // Részletes debug log
  console.log('Env check:', {
    PLAUSIBLE_KEY: PLAUSIBLE_KEY ? 'OK ('+PLAUSIBLE_KEY.slice(0,6)+'...)' : 'MISSING',
    SHEETS_ID:     SHEETS_ID     ? 'OK ('+SHEETS_ID.slice(0,10)+'...)' : 'MISSING',
    SA_JSON_B64:   SA_JSON_B64   ? 'OK len='+SA_JSON_B64.length : 'MISSING'
  });

  if (!PLAUSIBLE_KEY || !SHEETS_ID || !SA_JSON_B64) {
    const missing = [
      !PLAUSIBLE_KEY && 'PLAUSIBLE_API_KEY',
      !SHEETS_ID     && 'GOOGLE_SHEETS_ID',
      !SA_JSON_B64   && 'GOOGLE_SERVICE_JSON'
    ].filter(Boolean).join(', ');
    return { statusCode: 500, body: `Missing env vars: ${missing}` };
  }

  // ── Plausible: mai adatok ─────────────────────────────────────────
  async function plausible(endpoint) {
    const r = await fetch(`https://plausible.io/api/v1/stats/${endpoint}&site_id=${SITE}`, {
      headers: { Authorization: `Bearer ${PLAUSIBLE_KEY}` }
    });
    if (!r.ok) { console.error('Plausible hiba:', r.status); return null; }
    return r.json();
  }

  const [day, goals] = await Promise.all([
    plausible('aggregate?period=day&metrics=visitors,pageviews,bounce_rate,visit_duration'),
    plausible('breakdown?period=day&property=event:name&limit=20'),
  ]);

  const today = new Date().toLocaleDateString('hu-HU', { timeZone: 'Europe/Budapest' });
  const w = day?.results || {};
  const getGoal = name => (goals?.results || []).find(g => g['event:name'] === name)?.visitors ?? 0;

  const row = [
    today,
    w.visitors?.value      ?? 0,
    w.pageviews?.value     ?? 0,
    w.bounce_rate?.value   ?? 0,
    Math.round((w.visit_duration?.value ?? 0) / 60),
    getGoal('KONVERZIÓ: Időpont lefoglalva'),
    getGoal('KONVERZIÓ: Hírlevél feliratkozás'),
    getGoal('CTA: Konzultáció'),
    getGoal('CTA: Csomag megrendelése'),
    getGoal('Elérte: Konzultációs szekció'),
    getGoal('Kvíz válasz'),
    getGoal('Videó lejátszás'),
  ];

  // ── Google Sheets auth ────────────────────────────────────────────
  let saJson;
  try {
    saJson = JSON.parse(Buffer.from(SA_JSON_B64, 'base64').toString('utf8'));
  } catch(e) {
    console.error('SA JSON parse hiba:', e.message);
    return { statusCode: 500, body: 'SA JSON parse failed' };
  }

  const token = await getGoogleToken(saJson);
  if (!token) { return { statusCode: 500, body: 'Google auth failed' }; }

  // ── Sor hozzáfűzése az Adatok sheethez ───────────────────────────
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Adatok!A:L:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] })
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.text();
    console.error('Sheets write hiba:', err);
    return { statusCode: 502, body: 'Sheets write failed: ' + err };
  }

  console.log('Napi adat beírva:', today, row);
  return { statusCode: 200, body: JSON.stringify({ date: today, visitors: w.visitors?.value }) };
};

// ── JWT helper (RSA-SHA256, Web Crypto API) ───────────────────────────
async function getGoogleToken(sa) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const enc = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const header  = enc({ alg: 'RS256', typ: 'JWT' });
    const claim   = enc({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, iat: now
    });
    const unsigned = `${header}.${claim}`;
    const keyPem   = sa.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\n/g, '');
    const binaryKey = Buffer.from(keyPem, 'base64');
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(unsigned)
    );
    const sigB64 = Buffer.from(sig).toString('base64url');
    const jwt = `${unsigned}.${sigB64}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });
    const data = await res.json();
    if (!data.access_token) console.error('Token hiba:', data);
    return data.access_token || null;
  } catch(e) {
    console.error('JWT hiba:', e.message);
    return null;
  }
}
