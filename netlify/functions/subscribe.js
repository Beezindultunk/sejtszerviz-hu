// Netlify Function: hírlevél-feliratkozás
// Elvégzi: Resend kontakt felvétel + üdvözlő email + Google Sheets Feliratkozók lap bejegyzés

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const RESEND_API_KEY  = process.env.RESEND_API_KEY;
  const SA_JSON_B64     = process.env.GOOGLE_SERVICE_JSON;
  const SHEETS_ID       = process.env.GOOGLE_SHEETS_ID;

  if (!RESEND_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Konfiguráció hiányzik.' }) };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, body: JSON.stringify({ error: 'Érvénytelen kérés.' }) }; }

  const email     = (payload.email || '').trim().toLowerCase();
  const firstName = (payload.firstName || '').trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Érvénytelen e-mail cím.' }) };
  }

  // ── 1. Resend kontakt felvétel ────────────────────────────────────
  const resendRes = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, first_name: firstName || undefined, unsubscribed: false })
  });
  if (!resendRes.ok && resendRes.status !== 409) {
    const errText = await resendRes.text();
    console.error('Resend API hiba:', resendRes.status, errText);
    return { statusCode: 502, body: JSON.stringify({ error: 'Feliratkozás sikertelen.' }) };
  }

  // ── 2. Üdvözlő email azonnal ──────────────────────────────────────
  try {
    const { sendWelcomeEmail } = require('./welcome-series');
    await sendWelcomeEmail(email, firstName, RESEND_API_KEY);
  } catch(e) { console.error('Üdvözlő email hiba:', e); }

  // ── 3. Google Sheets Feliratkozók lap bejegyzés ───────────────────
  if (SA_JSON_B64 && SHEETS_ID) {
    try {
      const saJson = JSON.parse(Buffer.from(SA_JSON_B64, 'base64').toString());
      const token  = await getGoogleToken(saJson);
      if (token) {
        const today = new Date().toISOString().split('T')[0];
        const row   = [email, firstName, today, 'FALSE'];
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SHEETS_ID}/values/Feliratkoz%C3%B3k!A:D:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: [row] })
          }
        );
      }
    } catch(e) { console.error('Sheets bejegyzés hiba:', e); }
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};

// JWT helper
async function getGoogleToken(sa) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const enc = s => btoa(JSON.stringify(s)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const header  = enc({ alg: 'RS256', typ: 'JWT' });
    const claim   = enc({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/spreadsheets', aud: 'https://oauth2.googleapis.com/token', exp: now+3600, iat: now });
    const unsigned = `${header}.${claim}`;
    const keyData  = sa.private_key.replace(/-----[^-]+-----/g,'').replace(/\n/g,'');
    const binKey   = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    const key      = await crypto.subtle.importKey('pkcs8', binKey, { name:'RSASSA-PKCS1-v1_5', hash:'SHA-256' }, false, ['sign']);
    const sig      = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
    const jwt      = `${unsigned}.${btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}`;
    const res      = await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}` });
    return (await res.json()).access_token || null;
  } catch(e) { return null; }
}
