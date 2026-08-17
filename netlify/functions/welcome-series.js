// Netlify Function — Üdvözlő e-mail sorozat hírlevél feliratkozás után
// Ezt a subscribe.js hívja meg háttérben minden új feliratkozónál.
// A 3 e-mail ütemezetten megy ki: azonnal, 3. nap, 7. nap.
//
// Megjegyzés: A késleltetett küldéshez (3. nap, 7. nap) Resend Broadcasts
// helyett Netlify Scheduled Functions + Resend Contacts API-t használunk.
// Az 1. e-mail azonnal megy, a 2-3. e-mailhez a kontakt feliratkozás dátuma
// alapján a napi scheduled function küldi ki (daily-email-check.js).

const EMAIL_SERIES = [
  {
    delay_days: 0,
    subject: '👋 Üdvözlöm! Egy fontos szám, amit érdemes tudni…',
    html: (firstName) => `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#f8f9fa;font-family:-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="520" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <tr><td style="background:#0d1117;padding:24px 32px">
    <div style="color:#fff;font-size:18px;font-weight:800">🔬 Sejtszerviz.hu</div>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="font-size:16px;color:#0d1117;margin:0 0 16px">
      ${firstName ? `Kedves ${firstName}!` : 'Kedves Olvasó!'}
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      Köszönöm, hogy feliratkozott a Heti Egészség-morzsák hírlevélre! 🎉
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 20px">
      Tudta, hogy a világ eddig elvégzett zsírsavtesztek <strong>97%-ánál</strong> az Omega-6:3 arány nem volt egyensúlyban?
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px">
      Ez nem betegség — hanem egy <strong>mérhető, visszafordítható állapot</strong>. És a legjobb rész: egy egyszerű otthoni vérmintával pontosan láthatjuk, hol tart az Ön szervezete.
    </p>
    <div style="background:#fdf2f4;border-left:3px solid #8b2234;padding:16px;border-radius:0 8px 8px 0;margin:0 0 24px">
      <div style="font-size:13px;color:#8b2234;font-weight:700;margin-bottom:4px">Közelgő hírleveleimben:</div>
      <div style="font-size:13px;color:#4b5563;line-height:1.6">
        ✓ Mit jelent az Omega-6:3 arány a gyakorlatban?<br>
        ✓ Mitől romlik és hogyan javítható?<br>
        ✓ Hogyan zajlik a BalanceTest otthon?
      </div>
    </div>
    <a href="https://sejtszerviz.hu" style="display:block;background:#8b2234;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      🌐 Látogasson el az oldalra →
    </a>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;line-height:1.5">
      Éva Széplábi · Sejtszerviz.hu · Zinzino Wellness-tanácsadó<br>
      <a href="https://sejtszerviz.hu" style="color:#8b2234">sejtszerviz.hu</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
  },
  {
    delay_days: 3,
    subject: '🩸 Mi mutatja meg igazán, mi zajlik a szervezetében?',
    html: (firstName) => `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#f8f9fa;font-family:-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="520" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <tr><td style="background:#0d1117;padding:24px 32px">
    <div style="color:#fff;font-size:18px;font-weight:800">🔬 Sejtszerviz.hu</div>
    <div style="color:#9ca3af;font-size:12px;margin-top:4px">Heti Egészség-morzsák · 3. nap</div>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="font-size:16px;color:#0d1117;margin:0 0 20px;font-weight:700">
      A BalanceTest — amit az emberek 97%-a nem tudott magáról
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px">
      ${firstName ? `Kedves ${firstName},` : 'Kedves Olvasó,'} pár napja írtam arról, hogy a legtöbb ember Omega-6:3 aránya nincs egyensúlyban.
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px">
      A <strong>Zinzino BalanceTest</strong> egy otthon elvégezhető szárított vércseppből végzett vizsgálat. 11 zsírsavat mér — köztük az esszenciális omega-3 zsírsavakat.
    </p>
    <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:0 0 24px">
      <div style="font-size:13px;font-weight:700;color:#0d1117;margin-bottom:12px">Mit mutat meg?</div>
      <div style="font-size:13px;color:#4b5563;line-height:1.8">
        📊 Omega-6:3 arány (ideális: 3:1)<br>
        📊 Zsírsavprofil teljes képe<br>
        📊 Kiindulási állapot, amivel a változás mérhető<br>
        📊 120 nap után újramérés — fekete-fehéren látja az eredményt
      </div>
    </div>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px">
      Ha kíváncsi rá, <strong>hol tart az Ön szervezete</strong>, szívesen segítek egy ingyenes, 30 perces konzultáción eligazodni.
    </p>
    <a href="https://sejtszerviz.hu/#konzultacio" style="display:block;background:#8b2234;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px">
      📅 Ingyenes konzultáció foglalása →
    </a>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px">
      Éva Széplábi · <a href="https://sejtszerviz.hu" style="color:#8b2234">sejtszerviz.hu</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
  },
  {
    delay_days: 7,
    subject: '⏰ Utolsó alkalom — ingyenes konzultáció Évával',
    html: (firstName) => `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"></head>
<body style="margin:0;background:#f8f9fa;font-family:-apple-system,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="520" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <tr><td style="background:#8b2234;padding:24px 32px">
    <div style="color:#fff;font-size:18px;font-weight:800">🔬 Sejtszerviz.hu</div>
    <div style="color:rgba(255,255,255,.7);font-size:12px;margin-top:4px">Heti Egészség-morzsák · 7. nap</div>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="font-size:22px;font-weight:800;color:#0d1117;margin:0 0 16px;line-height:1.3">
      Ne találgass — mérd meg, és szívesen beszélek veled róla
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 16px">
      ${firstName ? `Kedves ${firstName},` : 'Kedves Olvasó,'} egy hete csatlakozott hozzánk. Remélem, hasznos volt az, amit küldtem.
    </p>
    <p style="font-size:14px;color:#4b5563;line-height:1.7;margin:0 0 24px">
      Ha maradt kérdése a BalanceTest-tel, az Omega-3-mal, vagy a személyre szabott programmal kapcsolatban — foglaljon egy <strong>ingyenes, kötelezettségmentes 30 perces konzultációt</strong>. Nincs értékesítési nyomás, csak válaszok.
    </p>
    <div style="background:#fdf2f4;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center">
      <div style="font-size:13px;color:#8b2234;font-weight:700;margin-bottom:8px">● INGYENES, KÖTELEZETTSÉGMENTES</div>
      <div style="font-size:28px;font-weight:800;color:#0d1117">30 perces konzultáció</div>
      <div style="font-size:13px;color:#6b7280;margin-top:8px">Online, a saját otthonából · Foglaljon időpontot most</div>
    </div>
    <a href="https://sejtszerviz.hu/#konzultacio" style="display:block;background:#8b2234;color:#fff;text-align:center;padding:16px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
      📅 Időpont foglalása →
    </a>
    <p style="font-size:12px;color:#9ca3af;margin-top:24px;line-height:1.5;text-align:center">
      Üdvözlettel,<br>
      <strong style="color:#0d1117">Éva Széplábi</strong><br>
      Sejtszerviz.hu · Zinzino Wellness-tanácsadó<br>
      <a href="https://sejtszerviz.hu" style="color:#8b2234">sejtszerviz.hu</a>
      <br><br>
      <a href="#" style="color:#9ca3af">Leiratkozás</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
  }
];

// Ez a függvény a subscribe.js-ből hívódik az azonnali (0. nap) emailhez
async function sendWelcomeEmail(email, firstName, resendKey) {
  const template = EMAIL_SERIES[0];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Éva Széplábi · Sejtszerviz.hu <noreply@sejtszerviz.hu>',
      to: [email],
      subject: template.subject,
      html: template.html(firstName)
    })
  });
  return res.ok;
}

// Ez a függvény az ütemezett (3. és 7. nap) emailekhez
exports.handler = async (event) => {
  // Manuális teszthíváshoz
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { email, firstName, day } = body;
    const template = EMAIL_SERIES.find(t => t.delay_days === day);
    if (!template || !email) return { statusCode: 400, body: 'Missing params' };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Éva Széplábi · Sejtszerviz.hu <noreply@sejtszerviz.hu>',
        to: [email],
        subject: template.subject,
        html: template.html(firstName)
      })
    });
    return { statusCode: res.ok ? 200 : 502, body: res.ok ? 'sent' : 'error' };
  }
  return { statusCode: 405, body: 'Method not allowed' };
};

module.exports.sendWelcomeEmail = sendWelcomeEmail;
module.exports.EMAIL_SERIES = EMAIL_SERIES;
