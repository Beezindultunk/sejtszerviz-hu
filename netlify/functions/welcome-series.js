// Netlify Function — Üdvözlő e-mail sorozat hírlevél feliratkozás után
// Ez a függvény a subscribe.js-ből hívódik meg, illetve manuálisan is tesztelhető.

const EMAIL_SERIES = [
  // ─────────────────────────────────────────────────────────────────
  // 1. EMAIL — Azonnal (0. nap)
  // Téma: A teszt — miért ne találgassunk?
  // ─────────────────────────────────────────────────────────────────
  {
    delay_days: 0,
    subject: 'Honnan tudod biztosan, hogy rendben van a szervezeted?',
    html: (firstName) => `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a2a2b}
  .wrap{max-width:580px;margin:32px auto;padding:0 16px}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.08)}
  .header{background:#0b2425;padding:28px 36px}
  .logo{color:#fff;font-size:17px;font-weight:800;letter-spacing:-.02em}
  .logo span{color:#c9a96e}
  .tag{color:rgba(255,255,255,.5);font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-top:4px}
  .body{padding:36px}
  h1{font-size:22px;font-weight:800;color:#0b2425;margin:0 0 20px;line-height:1.3}
  p{font-size:15px;line-height:1.75;color:#3a4a4b;margin:0 0 18px}
  .highlight{background:#f5f0e8;border-left:3px solid #8b2234;padding:16px 20px;border-radius:0 10px 10px 0;margin:24px 0}
  .highlight p{margin:0;color:#1a2a2b;font-size:14px}
  .stat{text-align:center;padding:24px;background:#0b2425;border-radius:12px;margin:28px 0}
  .stat-num{font-size:52px;font-weight:900;color:#c9a96e;line-height:1;letter-spacing:-.03em}
  .stat-label{color:rgba(255,255,255,.75);font-size:13px;margin-top:6px;line-height:1.5}
  .cta{display:block;background:#8b2234;color:#fff;text-align:center;padding:16px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;margin:28px 0}
  .footer{padding:20px 36px 28px;border-top:1px solid #f0e8dc}
  .sig{font-size:14px;color:#6a7a7b;line-height:1.6}
  .sig strong{color:#0b2425}
</style>
</head>
<body>
<div class="wrap">
<div class="card">
  <div class="header">
    <div class="logo">Sejt<span>szerviz</span>.hu</div>
    <div class="tag">Heti Egészség-morzsák</div>
  </div>
  <div class="body">
    ${firstName ? `<p style="margin-bottom:24px;font-size:14px;color:#6a7a7b">Kedves ${firstName},</p>` : '<p style="margin-bottom:24px;font-size:14px;color:#6a7a7b">Kedves Olvasó,</p>'}

    <h1>„Jól érzem magam" — de vajon tényleg így van sejtszinten?</h1>

    <p>Legtöbbünk az egészségét érzés alapján ítéli meg. Ha nincs fájdalom, nincs betegség — azt mondjuk, rendben vagyunk. Ez az a pont, ahol a modern orvostudomány és a megelőzés útjai elválnak egymástól.</p>

    <p>A zsírsav-egyensúlyhiány — különösen az omega-6 és omega-3 arány felborulása — évekig, akár évtizedekig tünetmentesen zajlik. Közben a sejtmembránokon, a gyulladásos folyamatokban és az immunrendszer válaszkészségében nagyon is mérhetők a következmények.</p>

    <div class="stat">
      <div class="stat-num">97%</div>
      <div class="stat-label">Az eddig elvégzett első BalanceTest-ek<br>97%-ánál az arány nem volt egyensúlyban.</div>
    </div>

    <p>Ez nem azt jelenti, hogy mindenki beteg. Azt jelenti, hogy a szervezet egy olyan tartományban működik, ahol a sejtszintű regeneráció, a gyulladásszabályozás és az energiatermelés nem a legjobb feltételek között zajlik. Hosszú távon ez számít.</p>

    <div class="highlight">
      <p><strong>A BalanceTest egy otthon elvégezhető vérmintából</strong> — egyetlen szárított csepp ujjhegyből — 11 zsírsavat vizsgál, köztük az omega-3 és omega-6 arányt. Az eredményt ~20 nap múlva egy független svéd laboratórium közli, az Ön nevéhez nem köthető, anonim módon.</p>
    </div>

    <p>Nem találgatás. Nem általánosság. Hanem a saját tested aktuális állapota, számokban.</p>

    <p>A következő levelemben megmutatom, <strong>mit tesznek pontosan a Vitas Lab munkatársai ezzel a vércseppel</strong> — és miért tekintik ezt a módszert az egyik legmegbízhatóbb sejtszintű állapotfelmérésnekek az EU-ban.</p>

    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=sorozat-1">Tudj meg többet a BalanceTest-ről →</a>

  </div>
  <div class="footer">
    <div class="sig">
      Üdvözlettel,<br>
      <strong>Éva Széplábi</strong><br>
      Sejtszerviz.hu · Zinzino Wellness-tanácsadó<br>
      <span style="font-size:12px;color:#9aaa9b">9 éve kutatom és alkalmazom ezt a programot. Több száz embernek segítettem már visszaállítani az egyensúlyt.</span>
    </div>
  </div>
</div>
</div>
</body></html>`
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. EMAIL — 3. nap
  // Téma: A Vitas Lab és a tudomány mögötte
  // ─────────────────────────────────────────────────────────────────
  {
    delay_days: 3,
    subject: 'Hogy kerül az ujjhegyed vére egy svéd laboratóriumba?',
    html: (firstName) => `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a2a2b}
  .wrap{max-width:580px;margin:32px auto;padding:0 16px}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.08)}
  .header{background:#0b2425;padding:28px 36px}
  .logo{color:#fff;font-size:17px;font-weight:800;letter-spacing:-.02em}
  .logo span{color:#c9a96e}
  .tag{color:rgba(255,255,255,.5);font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-top:4px}
  .body{padding:36px}
  h1{font-size:22px;font-weight:800;color:#0b2425;margin:0 0 20px;line-height:1.3}
  h2{font-size:16px;font-weight:700;color:#0b2425;margin:28px 0 10px}
  p{font-size:15px;line-height:1.75;color:#3a4a4b;margin:0 0 18px}
  .steps{margin:24px 0;border-left:2px solid #c9a96e;padding-left:20px}
  .step{margin-bottom:20px}
  .step-num{font-size:11px;font-weight:800;color:#8b2234;letter-spacing:.08em;text-transform:uppercase}
  .step-text{font-size:14px;color:#3a4a4b;line-height:1.65;margin-top:3px}
  .lab-box{background:#f0f8f5;border-radius:12px;padding:20px 24px;margin:24px 0}
  .lab-box p{font-size:14px;margin:0;color:#1a2a2b}
  .research{background:#0b2425;border-radius:12px;padding:24px;margin:24px 0}
  .research-num{font-size:36px;font-weight:900;color:#c9a96e;line-height:1}
  .research-text{color:rgba(255,255,255,.8);font-size:13px;margin-top:4px;line-height:1.5}
  .research-row{display:flex;gap:24px;flex-wrap:wrap}
  .research-item{flex:1;min-width:120px}
  .cta{display:block;background:#8b2234;color:#fff;text-align:center;padding:16px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;margin:28px 0}
  .footer{padding:20px 36px 28px;border-top:1px solid #f0e8dc}
  .sig{font-size:14px;color:#6a7a7b;line-height:1.6}
  .sig strong{color:#0b2425}
</style>
</head>
<body>
<div class="wrap">
<div class="card">
  <div class="header">
    <div class="logo">Sejt<span>szerviz</span>.hu</div>
    <div class="tag">Heti Egészség-morzsák · 3. nap</div>
  </div>
  <div class="body">
    ${firstName ? `<p style="margin-bottom:24px;font-size:14px;color:#6a7a7b">Kedves ${firstName},</p>` : '<p style="margin-bottom:24px;font-size:14px;color:#6a7a7b">Kedves Olvasó,</p>'}

    <h1>A Vitas Labor: ahol egyetlen vércsepp mindent elárul</h1>

    <p>Az első levélben arról írtam, hogy miért nem elég az érzéseinkre hagyatkozni. Ma megmutatom, mi történik pontosan, miután Ön elküldi a tesztet.</p>

    <h2>A folyamat lépései</h2>
    <div class="steps">
      <div class="step">
        <div class="step-num">1. lépés · Otthon, 2 perc</div>
        <div class="step-text">Az ujjhegyéből egyetlen cseppnyi vért csepegteti a tesztkártyára. Nem kell laborba menni, nem kell orvos — a CE-tanúsítvánnyal rendelkező kit mindent tartalmaz.</div>
      </div>
      <div class="step">
        <div class="step-num">2. lépés · Postán Svédországba</div>
        <div class="step-text">A megszáradt mintát visszaküldi a mellékelt borítékban a Vitas Analytical Services laborba, Stockholmba. Ez az EU egyik vezető klinikai kémiai laboratóriuma, amelyet az ISO 17025 szabvány szerint akkreditáltak.</div>
      </div>
      <div class="step">
        <div class="step-num">3. lépés · A labor elemzi</div>
        <div class="step-text">Gázkromatográfiás módszerrel megmérik az Ön vérének 11 zsírsavát. Teljes névtelenséggel — az eredményt csak Ön látja a saját kódjával.</div>
      </div>
      <div class="step">
        <div class="step-num">4. lépés · ~20 nap múlva</div>
        <div class="step-text">Online jelentést kap: látja az Omega-6:3 arányát, összehasonlítva az ideálissal (3:1), és az összes mért zsírsav részletes bontását.</div>
      </div>
    </div>

    <div class="lab-box">
      <p>🔬 <strong>Miért fontos az ISO 17025 akkreditáció?</strong><br>
      Ez a szabvány garantálja, hogy az eredmény ugyanolyan megbízható, mint amit egy kórházi laborban kapna. A Vitas Lab pontossága összevethető a hagyományos vénás vérvétel útján kapott eredményekkel — ezt több független tanulmány is igazolta.</p>
    </div>

    <h2>Mi az, amit a mérés valójában mutat?</h2>

    <p>Az Omega-6:3 arány egy pillanatfelvétel a sejtmembránjairól. Minél magasabb ez a szám, annál több omega-6 van a sejtjeiben az omega-3-hoz képest. Ez közvetlenül befolyásolja, hogy a sejtmembránok mennyire rugalmasak, a szervezet mennyire képes csillapítani a gyulladásos folyamatokat, és milyen hatékonysággal zajlik a sejtek energiatermelése.</p>

    <div class="research">
      <div class="research-row">
        <div class="research-item">
          <div class="research-num">1,86M+</div>
          <div class="research-text">feldolgozott teszteredmény a Zinzino adatbázisában</div>
        </div>
        <div class="research-item">
          <div class="research-num">95%</div>
          <div class="research-text">a 120 napos program után 3:1 közelébe kerül az arány</div>
        </div>
        <div class="research-item">
          <div class="research-num">15:1</div>
          <div class="research-text">az európai átlag — az ideális 3:1-gyel szemben</div>
        </div>
      </div>
    </div>

    <p>A következő levelemben arról írok, amit a longevity-kutatók egyre határozottabban állítanak: hogy a zsírsav-egyensúly nemcsak az egészségérzetet, hanem a biológiai öregedés sebességét is befolyásolja. Valós klinikai adatokkal, nem marketing-szövegekkel.</p>

    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=sorozat-2">Nézze meg az eredményes programot →</a>

  </div>
  <div class="footer">
    <div class="sig">
      Üdvözlettel,<br>
      <strong>Éva Széplábi</strong><br>
      Sejtszerviz.hu · Zinzino Wellness-tanácsadó
    </div>
  </div>
</div>
</div>
</body></html>`
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. EMAIL — 7. nap
  // Téma: Longevity, sejtöregedés, BalanceOil és konzultáció
  // ─────────────────────────────────────────────────────────────────
  {
    delay_days: 7,
    subject: 'Amit a longevity-kutatók az omega-3-ról tudnak (és sokan nem hallottak róla)',
    html: (firstName) => `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a2a2b}
  .wrap{max-width:580px;margin:32px auto;padding:0 16px}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.08)}
  .header{background:#0b2425;padding:28px 36px}
  .logo{color:#fff;font-size:17px;font-weight:800;letter-spacing:-.02em}
  .logo span{color:#c9a96e}
  .tag{color:rgba(255,255,255,.5);font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-top:4px}
  .body{padding:36px}
  h1{font-size:22px;font-weight:800;color:#0b2425;margin:0 0 20px;line-height:1.3}
  h2{font-size:16px;font-weight:700;color:#0b2425;margin:28px 0 10px}
  p{font-size:15px;line-height:1.75;color:#3a4a4b;margin:0 0 18px}
  .study{border:1px solid #e8e0d5;border-radius:12px;padding:18px 20px;margin:16px 0}
  .study-tag{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8b2234;margin-bottom:6px}
  .study-text{font-size:13px;color:#3a4a4b;line-height:1.6}
  .oil-box{background:#0b2425;border-radius:12px;padding:24px;margin:28px 0}
  .oil-box h2{color:#c9a96e;margin-top:0}
  .oil-box p{color:rgba(255,255,255,.8);font-size:14px;margin-bottom:10px}
  .oil-feature{display:flex;gap:10px;margin-bottom:8px;align-items:flex-start}
  .oil-dot{width:6px;height:6px;border-radius:50%;background:#c9a96e;flex-shrink:0;margin-top:7px}
  .oil-feat-text{font-size:14px;color:rgba(255,255,255,.85);line-height:1.55}
  .eva-box{background:#f5f0e8;border-radius:12px;padding:24px;margin:28px 0;text-align:center}
  .eva-box h2{margin-top:0;font-size:18px}
  .eva-box p{font-size:14px;color:#4a5a5b;margin-bottom:6px}
  .cta-big{display:block;background:#8b2234;color:#fff;text-align:center;padding:18px 32px;border-radius:999px;text-decoration:none;font-weight:800;font-size:16px;margin:20px 0 0}
  .cta-note{font-size:12px;color:#8a9a9b;text-align:center;margin-top:8px}
  .footer{padding:20px 36px 28px;border-top:1px solid #f0e8dc}
  .sig{font-size:14px;color:#6a7a7b;line-height:1.6}
  .sig strong{color:#0b2425}
</style>
</head>
<body>
<div class="wrap">
<div class="card">
  <div class="header">
    <div class="logo">Sejt<span>szerviz</span>.hu</div>
    <div class="tag">Heti Egészség-morzsák · 7. nap</div>
  </div>
  <div class="body">
    ${firstName ? `<p style="margin-bottom:24px;font-size:14px;color:#6a7a7b">Kedves ${firstName},</p>` : '<p style="margin-bottom:24px;font-size:14px;color:#6a7a7b">Kedves Olvasó,</p>'}

    <h1>Sejtszintű öregedés — és ami tényleg lassíthatja</h1>

    <p>A longevity — a hosszú és egészséges élet tudománya — ma már nem csak az étrend-kiegészítők piaci marketingszava. Komoly klinikai kutatások vizsgálják, hogy mit tehetünk a biológiai öregedés ütemének lassításáért. Az omega-3 zsírsavak ebben kiemelkedő szerepet kapnak.</p>

    <h2>Mit mutatnak a kutatások?</h2>

    <div class="study">
      <div class="study-tag">Svájc, 2025 — klinikai vizsgálat</div>
      <div class="study-text">777 résztvevőn végzett, háromévnyi megfigyelés kimutatta, hogy napi 1 g omega-3 bevitele <strong>átlagosan 3 hónappal csökkentette a biológiai életkort.</strong> Ha omega-3-at D-vitaminnal és mozgással kombinálták, a hatás 4 hónapra nőtt.</div>
    </div>

    <div class="study">
      <div class="study-tag">VITAL-vizsgálat — USA, 25 000 résztvevő</div>
      <div class="study-text">Az egyik leghosszabb futamidejű omega-3 kutatás megerősítette: <strong>a rendszeres omega-3-fogyasztók telomerei szignifikánsan lassabban rövidültek.</strong> A telomerhossz a sejtek biológiai korának egyik legmegbízhatóbb jelzője.</div>
    </div>

    <div class="study">
      <div class="study-tag">Longevity Magazin — 2022-es metaanalízis</div>
      <div class="study-text">A modern nyugati étrend omega-6:3 aránya elérheti a <strong>20:1-et</strong> — szemben az egészséges 3-4:1 értékkel. Ez a felborult arány tartós, alacsony fokú gyulladást tart fenn a szervezetben, amely hozzájárul az életkorral összefüggő legtöbb krónikus állapothoz.</div>
    </div>

    <p>Ezek nem marketinganyagból vett idézetek. Ezek a The Lancet, a JAMA és más referált folyóiratok cikkei. Az összefüggés egyre egyértelműbb: <strong>aki megméri és optimalizálja a zsírsav-arányát, az kedvezőbb feltételeket teremt a saját sejtjeinek.</strong></p>

    <div class="oil-box">
      <h2>Miért nem elég egy átlagos halolaj?</h2>
      <p>A BalanceOil nem ugyanaz, mint amit a szupermarketben vásárol. Néhány kulcskülönbség:</p>
      <div class="oil-feature"><div class="oil-dot"></div><div class="oil-feat-text"><strong>Polifenolok az oxidációs védelem miatt:</strong> Az omega-3 molekulák oxigénérzékenyek. A BalanceOil extra szűz olívaolajjal van kombinálva (min. 350 mg/kg polifenol-tartalom), amely megvédi az omega-3-at az oxidációtól — mind az üvegben, mind a szervezetben.</div></div>
      <div class="oil-feature"><div class="oil-dot"></div><div class="oil-feat-text"><strong>Testsúlyhoz igazított dózis:</strong> Az adagolás nem egységes. A program figyelembe veszi a testsúlyt, a kiindulási teszteredményt és a célértéket.</div></div>
      <div class="oil-feature"><div class="oil-dot"></div><div class="oil-feat-text"><strong>Mérhető eredmény 120 nap alatt:</strong> A záró teszt megmutatja, mennyit mozdult el az arány. Nem találgatás — szám.</div></div>
      <div class="oil-feature"><div class="oil-dot"></div><div class="oil-feat-text"><strong>MSC fenntartható halászat:</strong> A halolaj szardíniából, szardellából és makrélából — kis testű, rövid életű halfajokból — származik, amelyek nem halmoznak fel nehézfémeket.</div></div>
    </div>

    <div class="eva-box">
      <h2>Kérdése van? Én szívesen átbeszélem.</h2>
      <p>9 éve foglalkozom ezzel a programmal. Látom a teszteredményeket, kísérem végig az embereket a 120 napos folyamaton, és tudom, mire kell figyelni a saját helyzetükben.</p>
      <p>Nem adok el. Válaszolok, segítek eligazodni, és ha úgy dönt — összeállítom Önnek a személyre szabott programot.</p>
      <p style="font-size:12px;color:#8a9a9b;margin-top:12px">Az időpont ingyenes. Kötelezettség nélkül.</p>
      <a class="cta-big" href="https://sejtszerviz.hu/#konzultacio?utm_source=email&utm_medium=newsletter&utm_campaign=sorozat-3">Foglaljon ingyenes 30 perces konzultációt →</a>
      <p class="cta-note">Online, az Ön otthonából · Nincs értékesítési nyomás</p>
    </div>

  </div>
  <div class="footer">
    <div class="sig">
      Üdvözlettel,<br>
      <strong>Éva Széplábi</strong><br>
      Sejtszerviz.hu · Zinzino Wellness-tanácsadó<br>
      <span style="font-size:12px;color:#9aaa9b">9 éve kutatom ezt a területet. Több száz embernek segítettem már megtalálni az egyensúlyt.</span>
    </div>
  </div>
</div>
</div>
</body></html>`
  }
];

// Az 1. email azonnali küldéséhez
async function sendWelcomeEmail(email, firstName, resendKey) {
  const template = EMAIL_SERIES[0];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Éva Széplábi · Sejtszerviz.hu <onboarding@resend.dev>',
      to: [email],
      subject: template.subject,
      html: template.html(firstName)
    })
  });
  return res.ok;
}

// Manuális teszt / ütemezett 3. és 7. napi küldéshez
exports.handler = async (event) => {
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
        from: 'Éva Széplábi · Sejtszerviz.hu <onboarding@resend.dev>',
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
