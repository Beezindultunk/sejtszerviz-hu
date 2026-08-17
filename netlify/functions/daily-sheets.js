// Netlify Scheduled Function — napi adatok írása Google Sheets-be
// Ütemezés: minden nap 23:50 UTC (= 01:50 Budapest) — a nap végén összegyűjt
//
// Szükséges env változók:
//   PLAUSIBLE_API_KEY   — Plausible Stats API kulcs
//   GOOGLE_SHEETS_ID    — A táblázat ID-ja az URL-ből (docs.google.com/spreadsheets/d/XXXX)
//   GOOGLE_SERVICE_JSON — Google Service Account JSON (base64 kódolva)

exports.handler = async () => {
  const PLAUSIBLE_KEY = process.env.PLAUSIBLE_API_KEY;
  const SHEETS_ID     = process.env.GOOGLE_SHEETS_ID;
  const SA_JSON_B64   = process.env.GOOGLE_SERVICE_JSON;
  const SITE          = 'sejtszerviz.hu';

  if (!PLAUSIBLE_KEY || !SHEETS_ID || !SA_JSON_B64) {
    console.error('Hiányzó env változók');
    return { statusCode: 500, body: 'Missing env vars' };
  }

  // ── Plausible: mai adatok ─────────────────────────────────────────────
  async function plausible(endpoint) {
    const r = await fetch(`https://plausible.io/api/v1/stats/${endpoint}&site_id=${SITE}`, {
      headers: { Authorization: `Bearer ${PLAUSIBLE_KEY}` }
    });
    if (!r.ok) return null;
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

  // ── Google Sheets auth (Service Account JWT) ───────────────────────────
  const sa = JSON.parse(Buffer.from(SA_JSON_B64, 'base64').toString('utf8'));

  // JWT token generálása a Google API-hoz
  const token = await getGoogleToken(sa);
  if (!token) return { statusCode: 500, body: 'Google auth failed' };

  // Sor hozzáfűzése a táblázathoz
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
    console.error('Sheets hiba:', err);
    return { statusCode: 502, body: 'Sheets write failed: ' + err };
  }

  console.log('Napi adat beírva:', today, row);
  return { statusCode: 200, body: JSON.stringify({ date: today, visitors: w.visitors?.value }) };
};

// Google Service Account JWT generálás (no külső library)
async function getGoogleToken(sa) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const claim  = btoa(JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now
    }));

    const unsigned = `${header}.${claim}`;

    // RSA-SHA256 aláírás Web Crypto API-val
    const keyData = sa.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\n/g, '');
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8', binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false, ['sign']
    );

    const sig = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5', cryptoKey,
      new TextEncoder().encode(unsigned)
    );

    const jwt = `${unsigned}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
    });

    const data = await res.json();
    return data.access_token || null;
  } catch (e) {
    console.error('JWT hiba:', e);
    return null;
  }
}
