// Netlify Function: hírlevél-feliratkozás fogadása és továbbítása a Resend
// kontakt-adatbázisába. Az API-kulcsot a Netlify Environment Variables
// (RESEND_API_KEY) tárolja — soha nem kerül a repóba vagy a kliens-oldali
// kódba, így a böngészőből nem érhető el.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY nincs beállítva a Netlify Environment Variables között.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'A hírlevél-szolgáltatás jelenleg nincs konfigurálva.' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Érvénytelen kérés.' }) };
  }

  const email = (payload.email || '').trim();
  const firstName = (payload.firstName || '').trim();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Érvénytelen e-mail cím.' }) };
  }

  try {
    const resendRes = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        first_name: firstName || undefined,
        unsubscribed: false
      })
    });

    // A Resend 409-et (vagy hasonlót) adhat vissza, ha a kontakt már létezik —
    // ezt sikerként kezeljük, hiszen a felhasználó szempontjából a
    // feliratkozás ilyenkor is "sikeres".
    if (!resendRes.ok && resendRes.status !== 409) {
      const errText = await resendRes.text();
      console.error('Resend API hiba:', resendRes.status, errText);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: 'A hírlevél-szolgáltatóval való kommunikáció sikertelen.' })
      };
    }

    // Üdvözlő e-mail sorozat 1. emailje azonnal
    try {
      const { sendWelcomeEmail } = require('./welcome-series');
      await sendWelcomeEmail(email, firstName, RESEND_API_KEY);
    } catch(e) {
      console.error('Üdvözlő email hiba:', e);
      // Nem blokkoló — a feliratkozás sikerét nem befolyásolja
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Feliratkozási hiba:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Váratlan hiba történt.' })
    };
  }
};
