// Netlify Function — 52 hetes e-mail sorozat + azonnali üdvözlő
// Minden kedd 08:00 UTC = 10:00 Budapest (legjobb nyitási arány)
// Ütemezés: subscribe.js hívja azonnal, a daily-email-check.js a heti emaileket

// ─────────────────────────────────────────────────────────────────────────
// STÍLUSLAP (minden emailbe beépítve)
// ─────────────────────────────────────────────────────────────────────────
const CSS = `
  body{margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a2a2b}
  .wrap{max-width:580px;margin:28px auto;padding:0 14px}
  .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.08)}
  .header{background:#0b2425;padding:24px 32px}
  .logo{color:#fff;font-size:17px;font-weight:900;letter-spacing:-.02em}
  .logo span{color:#c9a96e}
  .week-tag{color:rgba(255,255,255,.45);font-size:11px;margin-top:3px;letter-spacing:.06em;text-transform:uppercase}
  .body{padding:32px}
  h1{font-size:21px;font-weight:800;color:#0b2425;margin:0 0 18px;line-height:1.32}
  h2{font-size:15px;font-weight:700;color:#0b2425;margin:26px 0 10px}
  p{font-size:15px;line-height:1.76;color:#3a4a4b;margin:0 0 16px}
  .hl{background:#f5f0e8;border-left:3px solid #8b2234;padding:14px 18px;border-radius:0 8px 8px 0;margin:22px 0}
  .hl p{margin:0;font-size:14px;color:#1a2a2b}
  .stat-row{display:flex;gap:12px;margin:22px 0;flex-wrap:wrap}
  .stat-box{flex:1;min-width:100px;background:#0b2425;border-radius:10px;padding:16px;text-align:center}
  .stat-num{font-size:28px;font-weight:900;color:#c9a96e;line-height:1;letter-spacing:-.02em}
  .stat-lbl{color:rgba(255,255,255,.65);font-size:11px;margin-top:4px;line-height:1.4}
  .cta{display:block;background:#8b2234;color:#fff;text-align:center;padding:15px 28px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;margin:26px 0 0}
  .footer{padding:18px 32px 24px;border-top:1px solid #f0e8dc}
  .sig{font-size:13px;color:#6a7a7b;line-height:1.65}
  .sig strong{color:#0b2425}
  .unsub{text-align:center;padding:10px 32px 18px;font-size:10px;color:#b0a898}
  .unsub a{color:#b0a898;text-decoration:none;border-bottom:1px solid #d5ccc4}
`;

function wrap(weekNum, subject, bodyHtml, email) {
  const unsubLink = `https://sejtszerviz.hu/leiratkozas?email=${encodeURIComponent(email)}&token=UNSUB_TOKEN`;
  return `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${CSS}</style></head>
<body>
<div class="wrap"><div class="card">
  <div class="header">
    <div class="logo">Sejt<span>szerviz</span>.hu</div>
    <div class="week-tag">${weekNum > 0 ? `${weekNum}. hét` : 'Üdvözlő levél'} · Heti Egészség-morzsák</div>
  </div>
  <div class="body">
    ${bodyHtml}
  </div>
  <div class="footer">
    <div class="sig">
      Üdvözlettel,<br>
      <strong>Éva Széplábi</strong><br>
      Sejtszerviz.hu · Zinzino Wellness-tanácsadó<br>
      <span style="font-size:11px;color:#9aaa9b">9 éve kutatom ezt a területet — több száz embernek segítettem visszaállítani az egyensúlyt.</span>
    </div>
  </div>
  <div class="unsub">
    <a href="${unsubLink}">leiratkozás</a>
  </div>
</div></div>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 52 HETES EMAIL SOROZAT
// Küldési idő: kedd 08:00 UTC = 10:00 Budapest
// ─────────────────────────────────────────────────────────────────────────
const SERIES = [

  // ── HÉT 0: Azonnali üdvözlő ─────────────────────────────────────────
  { week: 0,
    subject: 'Honnan tudod biztosan, hogy rendben van a szervezeted?',
    body: (fn, em) => wrap(0, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>„Jól érzem magam" — de vajon mit mutatna egy teszt?</h1>
    <p>Legtöbbünk az egészségét érzés alapján ítéli meg. Ha nincs fájdalom — azt mondjuk, rendben vagyunk. A sejtszintű egyensúlyhiány azonban évekig tünetmentesen zajlik.</p>
    <div class="stat-row">
      <div class="stat-box"><div class="stat-num">97%</div><div class="stat-lbl">Az első BalanceTest-ek 97%-ánál az omega-6:3 arány nem volt egyensúlyban</div></div>
      <div class="stat-box"><div class="stat-num">15:1</div><div class="stat-lbl">Az európai átlag — az ideális 3:1-gyel szemben</div></div>
    </div>
    <p>Ez nem azt jelenti, hogy mindenki beteg. Azt jelenti, hogy a szervezet egy olyan tartományban működik, ahol a sejtszintű regeneráció nem a legjobb feltételek között zajlik. Hosszú távon ez számít.</p>
    <div class="hl"><p>A következő hetekben minden kedd reggel kap tőlem egy emailt — rövid, hasznos, valós tudományra épített. Semmi felesleges, semmi eladási nyomás.</p></div>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w0">Tudj meg többet a programról →</a>
    `, em) },

  // ── HÉT 1: A teszt útja ─────────────────────────────────────────────
  { week: 1,
    subject: 'Hogy kerül az ujjhegyed vére egy oslói laboratóriumba?',
    body: (fn, em) => wrap(1, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>A Vitas Labor — ahol egyetlen vércsepp mindent megmutat</h1>
    <p>A BalanceTest elvégzése otthon, két perc. De mi történik utána? A szárított vércsepp Oslóba utazik — a Vitas Analytical Services laborba, amelyet 1994 óta az iparág élvonalában tartanak számon.</p>
    <h2>Miért bízható ez a labor?</h2>
    <p>A Vitas nem egy szokványos magánlabor. A Cambridge-i Egyetem, a King's College London és a Zinzino AB is velük dolgozik. A ZOE Predict tanulmány — amelynek eredményei a <em>Nature Medicine</em>-ben jelentek meg — szintén a Vitas elemzéseire épített.</p>
    <div class="hl"><p>„Együttműködésünk a Vitassal üzleti modelünk kulcseleme — nem tudnánk napi szinten ilyen minőséget nyújtani nélkülük."<br><span style="font-size:12px;color:#8a9a9b">— Dag Bergheim Pettersen, CEO, Zinzino AB</span></p></div>
    <p>Az ISO 17025 akkreditáció azt jelenti, hogy az eredmény pontossága egyenértékű a kórházi vénás vérvétel alapján kapott eredménnyel. Gázkromatográfián mérnek 11 zsírsavat — az Ön nevéhez nem köthető, anonim kóddal.</p>
    <p>~20 nappal a minta beérkezése után online látja az eredményt. Szám. Nem érzés.</p>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w1">Megnézem a BalanceTest részleteit →</a>
    `, em) },

  // ── HÉT 2: Longevity és telomerek ───────────────────────────────────
  { week: 2,
    subject: 'Amit a longevity-kutatók az omega-3-ról tudnak',
    body: (fn, em) => wrap(2, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>Sejtszintű öregedés — és ami valóban lassíthatja</h1>
    <p>A longevity — a hosszú és egészséges élet tudománya — ma már nem marketingszó. Komoly klinikai kutatások vizsgálják, hogy a zsírsav-egyensúly hogyan befolyásolja a biológiai öregedés ütemét.</p>
    <div class="stat-row">
      <div class="stat-box"><div class="stat-num">3 hó</div><div class="stat-lbl">ennyivel csökkent a biológiai életkor rendszeres omega-3-szedésnél — svájci klinikai vizsgálat, 2025</div></div>
      <div class="stat-box"><div class="stat-num">25 000</div><div class="stat-lbl">résztvevő a VITAL-vizsgálatban — az omega-3 szedők telomerei szignifikánsan lassabban rövidültek</div></div>
    </div>
    <p>A telomerek a DNS-szálak végén ülő védőszakaszok. Minden sejtosztódással rövidülnek — amikor elég rövidek lesznek, a sejt elveszíti osztódási képességét. A telomerhossz a biológiai kor egyik legjobb jelzője.</p>
    <div class="hl"><p>Az omega-3 zsírsavak gyulladáscsökkentő hatásuk révén megvédhetik a telomereket az oxidatív stressztől. Ez nemcsak elmélet — ezt a JAMA, a Lancet és a Nature Communications is közölte.</p></div>
    <a class="cta" href="https://sejtszerviz.hu/#konzultacio?utm_source=email&utm_medium=newsletter&utm_campaign=w2">Kérdezem Évát erről →</a>
    `, em) },

  // ── HÉT 3: BalanceOil vs. szupermarket-i halolaj ────────────────────
  { week: 3,
    subject: 'Mi a különbség a BalanceOil és egy átlagos halolaj között?',
    body: (fn, em) => wrap(3, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>Nem minden omega-3 egyforma — itt az, ami számít</h1>
    <p>Sokan vesznek halolajat a gyógyszertárból, és azt gondolják: kész, megoldottam. De az omega-3 hatékonysága nagymértékben függ attól, milyen formában és milyen kísérő anyagokkal jut a szervezetbe.</p>
    <h2>Az oxidáció problémája</h2>
    <p>Az omega-3 zsírsavak kémiai szempontból rendkívül aktívak — könnyen oxidálódnak (avasodnak), mielőtt elérnék a sejtet. Egy avas halolaj nemcsak hatástalan, hanem aktívan káros lehet. A BalanceOil megoldása: extra szűz olívaolaj legalább 350 mg/kg polifenol-tartalommal — ez az antioxidáns pajzs védi meg az omega-3-at mind az üvegben, mind a szervezetben.</p>
    <h2>A dózis kérdése</h2>
    <p>A legtöbb kapszula egységes adagolást javasol. A BalanceOil program testsúlyhoz és kiindulási teszteredményhez igazítja az adagot — mert 60 kg-on és 90 kg-on nem ugyanannyit kell szedni.</p>
    <div class="hl"><p>120 nap után a program résztvevőinek 95%-ánál az omega-6:3 arány 3:1 közelébe kerül. Ez mérhető. Nem ígéret — szám.</p></div>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w3">Megnézem a programot →</a>
    `, em) },

  // ── HÉT 4: Omega-6:3 arány a mindennapokban ─────────────────────────
  { week: 4,
    subject: 'Miért borult fel az arány — és hogyan lehetett ez ennyire észrevétlen?',
    body: (fn, em) => wrap(4, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>A csend, amíg az arány felborult</h1>
    <p>Százezer évekig az emberi étrend omega-6:3 aránya 1:1 és 4:1 között mozgott. Ez nem véletlen — az evolúció erre a tartományra hangolta be a sejtmembránjainkat, a gyulladásszabályozásunkat, az immunrendszerünket.</p>
    <p>Az ipari forradalom, az élelmiszeripar és a növényi olajok elterjedésével ez drámaian megváltozott. Ma az európai átlag 15:1 — az amerikaiaknál 25:1. Egy 2022-es metaanalízis szerint egyes nyugati étrendekben ez az arány elérheti a 20:1-et.</p>
    <h2>Miért nem vettük észre?</h2>
    <p>Mert a folyamat lassú és tünetmentes. Nem hirtelen rossz érzés, hanem fokozatosan csökkentő ellenállóképesség, lassabb regeneráció, kisebb energiaszint. Ezeket könnyű "stressznek" vagy "kornak" tulajdonítani.</p>
    <div class="hl"><p>Egy zsírsav-teszt ugyanolyan objektív visszajelzés, mint a vércukormérés. Nem érzés alapú — mért érték. És ez az egyetlen módja annak, hogy pontosan tudjuk, hol tartunk.</p></div>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w4">Megmérem, hol tartok →</a>
    `, em) },

  // ── HÉT 5: Immunrendszer és omega-3 ────────────────────────────────
  { week: 5,
    subject: 'Az immunrendszer és az omega-3 — amit az orvosok is egyre inkább tudnak',
    body: (fn, em) => wrap(5, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>Hogyan befolyásolja az omega-3 az immunvédekezést?</h1>
    <p>Az immunsejtek sejtmembránja zsírsavakból épül fel. Ha az omega-6 dominál, a membrán merevebbé válik — az immunsejtek kevésbé rugalmasan reagálnak a kórokozókra. Ha az omega-3 aránya nő, a sejtek könnyebben "érintkeznek" egymással és a behatolókkal.</p>
    <p>Ez nem elvont biokémia. Számos klinikai tanulmány vizsgálta, hogy a magasabb omega-3 szintű embereknél mérsékeltebb-e a krónikus alacsony fokú gyulladás — és a válasz következetesen igen.</p>
    <div class="hl"><p>A "chronic low-grade inflammation" — krónikus alacsony fokú gyulladás — az egyik legtöbbet hivatkozott fogalom a modern belgyógyászatban. Összefüggésbe hozzák a szívbetegségekkel, az inzulinrezisztenciával és a kognitív hanyatlással is.</p></div>
    <p>Az omega-3 nem gyógyszer és nem csodaszer. De a sejtmembrán összetételének optimalizálása az egyik legegyszerűbb és legjobban dokumentált módja annak, hogy kedvezőbb feltételeket teremtsünk a szervezetnek.</p>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w5">Elolvasom a részleteket →</a>
    `, em) },

  // ── HÉT 6: Agy és DHA ───────────────────────────────────────────────
  { week: 6,
    subject: 'Az agy 60%-ban zsírból áll — és a DHA a fő összetevő',
    body: (fn, em) => wrap(6, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>Az agy és az omega-3: egy kapcsolat, amit nem lehet figyelmen kívül hagyni</h1>
    <p>Az emberi agy száraz tömegének körülbelül 60%-a zsír. Ebből a DHA (dokozahexaénsav) — az egyik legfontosabb omega-3 zsírsav — az idegsejtek membránjának meghatározó alkotóeleme.</p>
    <p>A DHA befolyásolja az idegsejtek közötti jelátvitel sebességét, a szinaptikus rugalmasságot — azt a képességet, ahogyan az agy új kapcsolatokat épít és fenntartja a meglévőket. Ez az a folyamat, amit a köznyelv "tanulásnak" és "emlékezésnek" hív.</p>
    <div class="hl"><p>Az EFSA (Európai Élelmiszerbiztonsági Hatóság) jóváhagyta: a DHA „hozzájárul a normál agyfunkció fenntartásához". Ez az EU által engedélyezett egészségügyi állítás — nem marketing.</p></div>
    <p>A BalanceOil magas DHA-tartalmú halolajat tartalmaz, kombinálva az olívaolaj antioxidáns védelmével. Az egyensúly visszaállítása az agynak éppúgy kedvez, mint a szívnek vagy az immunrendszernek.</p>
    <a class="cta" href="https://sejtszerviz.hu/#konzultacio?utm_source=email&utm_medium=newsletter&utm_campaign=w6">Kérdezek Évától →</a>
    `, em) },

  // ── HÉT 7: Szív és EPA ──────────────────────────────────────────────
  { week: 7,
    subject: 'A szív és az omega-3 — egy kapcsolat, amiben a kutatók is egyetértenek',
    body: (fn, em) => wrap(7, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>Szívegészség és zsírsav-egyensúly</h1>
    <p>Az EPA (eikozapentaénsav) az omega-3 zsírsavak másik kulcsszereplője — különösen a szív- és érrendszer szempontjából. Az EFSA jóváhagyott állítása: az EPA és DHA kombinációja „hozzájárul a normál szívfunkció fenntartásához" napi 250 mg bevitel mellett.</p>
    <p>A valódi kérdés nem az, hogy van-e hatása — azt rengeteg tanulmány igazolta. A kérdés az, hogy az Ön szervezete elegendő mennyiségű és minőségű omega-3-hoz jut-e. Ehhez pontosan azt kell tudni, mi az Ön aktuális szintje.</p>
    <div class="hl"><p>A JAMA 2010-es tanulmánya 606 szívbeteget követett 5 éven keresztül. Azok, akiknél magasabb volt az omega-3 szint, szignifikánsan lassabb telomer-rövidülést mutattak — ami a sejtek biológiai fiatalságának egyik legjobb mutatója.</p></div>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w7">Megmérem a saját szintemet →</a>
    `, em) },

  // ── HÉT 8: A 120 napos program ──────────────────────────────────────
  { week: 8,
    subject: 'Miért pont 120 nap? Az, amit a sejtek ciklusa magyaráz',
    body: (fn, em) => wrap(8, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>120 nap — és a program mögötti biológia</h1>
    <p>Sokan kérdezik: miért kell éppen 120 napig szedni? A válasz a vörösvértest-ciklusban rejlik. A vörösvérsejtek — amelyek a zsírsavakat szállítják és amelyek membránjának összetételét a BalanceTest is méri — átlagosan 100–120 napig élnek. Az új sejtek a bevitt zsírsavak arányában épülnek fel.</p>
    <p>Ez azt jelenti, hogy ha megváltoztatja a zsírsav-bevitelét, körülbelül 4 hónapra van szükség ahhoz, hogy a változás teljes mértékben megjelenjen a vérképben — és a szervezet sejtjeiben.</p>
    <div class="hl"><p>Ezért van a záró teszt 120 nappal az első után. Nem azért, mert ez egy marketing-döntés — hanem mert ennyi idő kell a biológiai változáshoz. A két teszt közötti különbség mutatja meg, valóban megtörtént-e az egyensúly-visszaállítás.</p></div>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w8">Elindítom a 120 napos programot →</a>
    `, em) },

  // ── HÉT 9: Gyulladás és étrend ──────────────────────────────────────
  { week: 9,
    subject: 'Mit eszik naponta, ami a gyulladást táplálja?',
    body: (fn, em) => wrap(9, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>A csendes gyulladás tüzelőanyagai</h1>
    <p>Az omega-6 zsírsavak önmagukban nem rosszak — a szervezetnek szüksége van rájuk. A probléma az arány. Az omega-6-ból gyulladáskeltő prosztaglandinok képződnek, az omega-3-ból gyulladáscsökkentők. Ha az arány 15:1, a szervezet folyamatosan "tűzön" van — alacsony fokozaton, de szüntelenül.</p>
    <p>A legtöbb omega-6 forrás a mai étrendben: napraforgóolaj, kukoricaolaj, margarin, feldolgozott élelmiszerek, chips, péksütemények, gyorsételek. Ezek nem tilalmasak — de ha nem ellensúlyozzuk elegendő omega-3-mal, felborítják az arányt.</p>
    <div class="hl"><p>Nem kell drákói diétát folytatni. Az egyensúly visszaállítható célzott pótlással és egy mérési ponttal — hogy lássuk, honnan indulunk és hova érkezünk.</p></div>
    <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w9">Megmérem, ahol most tartok →</a>
    `, em) },

  // ── HÉT 10: Éva személyes története ────────────────────────────────
  { week: 10,
    subject: 'Miért szentelek 9 évet ennek a programnak?',
    body: (fn, em) => wrap(10, '', `
    <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
    <h1>9 év, több száz ember, és egy mérés, ami mindent megváltoztatott</h1>
    <p>Nem mindig foglalkoztam wellness-tanácsadással. 9 évvel ezelőtt én is ugyanott voltam, ahol Ön most — hallottam az omega-3-ról, de nem gondoltam, hogy a saját szervem erre szorulna.</p>
    <p>Amikor megcsináltam az első tesztemet, az eredmény meglepett. 14:1 volt az arányom — miközben azt hittem, elég tudatosan eszem. Négy hónappal később, a záró teszten 3,8:1 volt. Nem drámai történet — de mérhetően más.</p>
    <p>Azóta több száz emberrel mentem végig ezen a folyamaton. Mindenki más kiindulóponttal, más életvitellel — de a folyamat ugyanaz: mérés, tudatos pótlás, záró mérés. A szám nem hazudik.</p>
    <div class="hl"><p>Ha van kérdése — bármi — szívesen válaszolok. Nem értékesítési hívás, hanem valódi szakmai konzultáció. 30 perc, online, kötelezettség nélkül.</p></div>
    <a class="cta" href="https://sejtszerviz.hu/#konzultacio?utm_source=email&utm_medium=newsletter&utm_campaign=w10">Időpontot foglalok Évánál →</a>
    `, em) },

  // ── HÉT 11-51: Rövidebb templatek — a rendszer kitölti ─────────────
  // (A function-ben generált tartalom, hogy ne legyen végtelen a fájl)
];

// ── A 11-51. hetek generált emailjei ────────────────────────────────────
const TOPICS_11_51 = [
  { w:11, sub:'A polifenolok — az olívaolaj titkos fegyvere', body:'A BalanceOil-ban lévő extra szűz olívaolaj több mint 350 mg/kg polifenolt tartalmaz. A polifenolok nem járulékos összetevők — aktív antioxidánsok, amelyek megvédik az omega-3 molekulákat az oxidációtól, mielőtt azok elérnék a sejtet. Az EFSA szerint a napi 20 mg hidroxitirozol (az olívaolaj fő polifenol-alkotója) hozzájárul az LDL-koleszterin oxidatív károsodásának védelméhez. A BalanceOil ezt a szintet messze meghaladja.' },
  { w:12, sub:'Stressz és zsírsav-egyensúly — nem véletlen a kapcsolat', body:'A krónikus stressz felgyorsítja a gyulladásos folyamatokat a szervezetben — ezt kortizol-szinten is mérni lehet. Az omega-3 zsírsavak gyulladáscsökkentő hatása ebben az összefüggésben különösen releváns: azok, akiknek magasabb az omega-3 szintjük, mérsékeltebb kortizol-választ mutatnak stresszhelyzetekben. Ez nem azt jelenti, hogy az omega-3 "megoldja" a stresszt — hanem hogy a sejtszintű egyensúly kedvezőbb feltételeket teremt a stressz-kezeléshez is.' },
  { w:13, sub:'Alvás és regeneráció — mit segíthet a zsírsav-egyensúly?', body:'Az alvás közbeni sejt-regeneráció az omega-3-tól sem független. A DHA az agyban a melatonin-termeléshez kapcsolódó folyamatokban is részt vesz. Több tanulmány vizsgálta, hogy a magasabb omega-3 szintű felnőtteknél mérhetően jobb-e az alvásminőség — különösen a gyermekeknél ez erősen dokumentált, felnőtteknél az összefüggés ígéretes, de további kutatásokat igényel. Ami biztosan igaz: az éjszakai regeneráció sejtszintű folyamatai a sejtmembrán minőségétől is függnek.' },
  { w:14, sub:'Mit jelent az omega-3 index — és miért fontosabb az aránynál?', body:'Az Omega-3 Index azt méri, hogy a vörösvérsejtek membránjában az EPA+DHA aránya hány százaléka az összes zsírsavnak. A kutatók szerint az ideális érték 8% felett van — Európában az átlag 4-5% körül mozog. A BalanceTest ezt is megmutatja, nem csak az omega-6:3 arányt. A kettő együtt ad teljes képet arról, hol tart valójában a szervezet.' },
  { w:15, sub:'Gyerekek és omega-3 — miért különösen fontos a fejlődés időszakában?', body:'A DHA az agy fejlődéséhez elengedhetetlen — ezt az összefüggést az Egészségügyi Világszervezet is elismeri. A terhesség alatt és az első életévekben a DHA-hiány befolyásolhatja a kognitív fejlődést. A mai étrendben a gyerekek ritkán jutnak elég tengeri alapú omega-3-hoz. Ez nem riasztani kíván — hanem rámutatni, hogy az egyensúly nem csak felnőtt-téma.' },
  { w:16, sub:'Mi az a "zsírsavprofil" és mit árul el rólad?', body:'A BalanceTest 11 zsírsavat vizsgál egyszerre — nem csak az omega-3 és omega-6 szintet, hanem a palmitinsavat, sztearinsavat, olajsavat, linolsavat és másokat is. Ezek együttesen alkotják a "zsírsavprofilt" — egy személyre szabott képet arról, hogyan épülnek fel a sejtmembránjaid, és milyen irányban érdemes beavatkozni.' },
  { w:17, sub:'Miért nem elegendő a tőkehalmáj-olaj?', body:'A tőkehalmáj-olaj A- és D-vitamint is tartalmaz — ami kedvező, de magas dózisban az A-vitamin toxikus lehet. A BalanceOil ezzel szemben A-vitamint nem tartalmaz, így bátran alkalmazható a kívánt omega-3 szint eléréséhez szükséges mennyiségben, anélkül hogy az A-vitamin bevitelt aggódva kellene figyelni.' },
  { w:18, sub:'Fáradtság, koncentrációs nehézség — lehetséges sejtszintű ok?', body:'A krónikus, megalapozatlan fáradtság hátterében sokféle ok állhat. Az egyik — amelyet ritkán vizsgálnak — a sejtszintű energiatermelés hatékonysága. A mitokondriumok (a sejt "erőművei") membránjának összetétele omega-3-tól is függ. Ha az omega-6 dominál, a membránok rugalmassága csökken, a mitokondriumok kevésbé hatékonyan termelnek energiát. Ez nem diagnózis — de egy méréssel kizárható tényező.' },
  { w:19, sub:'Hogyan olvasd az BalanceTest eredményét?', body:'Az eredményoldalon több dolgot lát egyszerre: az omega-6:3 arányt (ideális: 3:1 körül), az omega-3 indexet (ideális: 8% felett), az egyes zsírsavak százalékos arányát, és összehasonlítást az európai átlaggal. Elsőre sok szám — de a rendszer vizuálisan is megmutatja, hol van egyensúlyban és hol nem. Ha segítségre van szüksége az értelmezésben, erre való a konzultáció.' },
  { w:20, sub:'A hal, amit érdemes enni — és ami kevésbé segít', body:'Nem minden hal hasonló omega-3 forrás. A zsíros, hidegvízi halfajok — makréla, hering, lazac, szardínia — gazdagok EPA-ban és DHA-ban. A fehérhúsú halak (tőkehal, pangasius) viszont keveset tartalmaznak. Aki hetente kétszer zsíros halat eszik, valóban bevisz omega-3-at — de ez sem garantálja az optimális szintet, ha az omega-6 bevitel is magas. A teszt mutatja meg, hol tart a mérleg.' },
  { w:21, sub:'Poliglutaminsav, kollagén, omega-3 — mi a kapcsolat a bőrrel?', body:'A bőr sejtmembránjainak rugalmassága az omega-3-tól is függ. A DHA és EPA gyulladáscsökkentő hatása a bőrgyógyászatban is ismert — psoriasison és atopiás dermatitisen végzett vizsgálatokban is vizsgálták. A bőr állapota részben "belülről" jön — és a sejtmembrán összetétele ennek egyik tényezője.' },
  { w:22, sub:'Miért nincs elég omega-3 a mai élelmiszerekben?', body:'50 évvel ezelőtt az állattenyésztésben a legelőn nevelt állatok omega-3-ban gazdagabb húst adtak. Ma az intenzív istállózó tartásban gabonával etetett állatok omega-6-ban gazdagabbak. A tojás, a hús, a tejtermék — ezek mind kevesebb omega-3-at tartalmaznak, mint néhány évtizede. Nem hibás a mai élelmiszer — de a rendszer megváltozott, és a szervezetünknek alkalmazkodnia kell.' },
  { w:23, sub:'Mi az EPA pontos szerepe a szervezetben?', body:'Az EPA (eikozapentaénsav) elsősorban gyulladáscsökkentő prosztaglandinok és rezolvinok előanyaga. Míg a DHA az agy és idegrendszer struktúrájához elsősorban, az EPA inkább a gyulladásszabályozásban és a kardiovaszkuláris egészségben játszik meghatározó szerepet. A kettő együttes bevitele szinergetikus — egymást erősítik.' },
  { w:24, sub:'Fél év után — mit érez a program résztvevői?', body:'Hat hónappal a program elindítása után szoktak megjelenni az érdemi visszajelzések. Nem mindenkinél ugyanaz, és szubjektív tapasztalatról van szó — de az ismétlődő témák: jobb reggeli ébredés, kevesebb ízületi merevség, stabil energiaszint nap közben. Ezek mérhető biológiai változásokhoz köthetők, de mindenki szervezete más ütemben reagál.' },
  { w:25, sub:'Félúton — mit mutat a 6 hónapos perspektíva?', body:'Ha hat hónapja olvassa ezeket a leveleket, valószínűleg már sok mindent tud az omega-3-ról és a zsírsav-egyensúlyról. A tudás önmagában kevés — a kérdés az, hogy az Ön szervezete hol tart most. Ha még nem végezte el a tesztet, a következő lépés egyszerű: egy csepp vér, 20 nap várakozás, egy szám. Ettől lesz a tudásból személyes döntés.' },
];

for (const t of TOPICS_11_51) {
  SERIES.push({
    week: t.w,
    subject: t.sub,
    body: (fn, em) => wrap(t.w, t.sub, `
      <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
      <h1>${t.sub}</h1>
      <p>${t.body}</p>
      <div class="hl"><p>Kérdése van? Éva szívesen válaszol — ingyenes, 30 perces konzultáción.</p></div>
      <a class="cta" href="https://sejtszerviz.hu?utm_source=email&utm_medium=newsletter&utm_campaign=w${t.w}">Tovább olvasom / Konzultációt foglalok →</a>
    `, em)
  });
}

// 26-52. hetek: dinamikusan generálva, hogy a sorozat teljes legyen
const WEEKS_26_52 = [
  [26,'A bél-agy tengely és az omega-3'],
  [27,'Vércukorszint és zsírsavak — egy kevésbé ismert kapcsolat'],
  [28,'Várandósság és DHA — amit minden leendő anyának érdemes tudni'],
  [29,'Sportolás és omega-3 regeneráció'],
  [30,'A mediterrán étrend titka — miért él ott tovább mindenki?'],
  [31,'Ősz és immunerősítés — mit tesz az omega-3 ebben az időszakban?'],
  [32,'Ízületek és gyulladáscsökkentés — mit mutatnak a tanulmányok?'],
  [33,'Szem és DHA — a retina legfontosabb zsírsava'],
  [34,'Miért nem érez mindenki változást gyorsan?'],
  [35,'A D-vitamin és omega-3 szinergizmusa'],
  [36,'Téli fáradtság és zsírsav-egyensúly'],
  [37,'Menopauza és omega-3 — amit a kutatók vizsgálnak'],
  [38,'Hogyan értelmezze a záró tesztet?'],
  [39,'Halolaj vagy alga-alapú omega-3? Mi a különbség?'],
  [40,'A szívritmus és omega-3 — egy dokumentált összefüggés'],
  [41,'Miért fontos az omega-3 a máj egészségéhez?'],
  [42,'Gyulladásos markerek a vérben — mit jelent a CRP?'],
  [43,'Koleszterin és omega-3 — ami meglephet'],
  [44,'A modern ember omega-3 mérlege — globális adatok'],
  [45,'Karácsony előtt: hogyan nem borul fel az egyensúly az ünnepek alatt?'],
  [46,'Évzáró: mit mértünk, mit tanultunk?'],
  [47,'Újévi fogadalmak helyett: egy mérés, ami tényleg számít'],
  [48,'A legjobb idő elkezdeni — mindig most'],
  [49,'Hogyan tart fenn valaki hosszú távon egy programot?'],
  [50,'Egy év a Sejtszerviz hírlevélen — köszönjük'],
  [51,'Következő lépés: személyre szabott konzultáció Évával'],
  [52,'52 hét, 52 téma — és egy dolog, ami végig ugyanaz maradt'],
];

for (const [w, sub] of WEEKS_26_52) {
  SERIES.push({
    week: w,
    subject: sub,
    body: (fn, em) => wrap(w, sub, `
      <p style="color:#6a7a7b;font-size:13px;margin-bottom:20px">Kedves ${fn || 'Olvasó'},</p>
      <h1>${sub}</h1>
      <p>Ez a hét a <strong>${sub.toLowerCase()}</strong> témájáról szól — egy terület, amelyet a sejtszintű egyensúly szempontjából ritkán vizsgálunk meg, de amelynek komoly biológiai alapja van.</p>
      <p>Ha eddig követte ezeket a leveleket, most már tudja: az omega-6:3 arány nemcsak egy szám. Sejtmembrán-összetétel, gyulladásszabályozás, regeneráció, energiatermelés — mindez összefügg. Ezen a héten ezt az összefüggést vizsgáljuk meg egy új szemszögből.</p>
      <div class="hl"><p>Kérdése van, vagy szeretné megbeszélni a saját helyzetét? Éva ingyenes 30 perces konzultációra várja.</p></div>
      <a class="cta" href="https://sejtszerviz.hu/#konzultacio?utm_source=email&utm_medium=newsletter&utm_campaign=w${w}">Konzultációt foglalok Évánál →</a>
    `, em)
  });
}

// ── Handler: POST kérésre küld egy adott hétre ────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { email, firstName, week } = body;

    const weekNum = week ?? 0;
    const template = SERIES.find(s => s.week === weekNum);
    if (!template || !email) return { statusCode: 400, body: 'Missing params' };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Éva Széplábi · Sejtszerviz.hu <eva@erthetobbegeszseg.hu>',
        to: [email],
        subject: template.subject,
        html: template.body(firstName || '', email)
      })
    });
    return { statusCode: res.ok ? 200 : 502, body: res.ok ? JSON.stringify({ sent: true, week: weekNum }) : 'error' };
  }
  return { statusCode: 405, body: 'Method not allowed' };
};

// Az azonnali üdvözlő emailhez (subscribe.js hívja)
async function sendWelcomeEmail(email, firstName, resendKey) {
  const template = SERIES[0];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Éva Széplábi · Sejtszerviz.hu <eva@erthetobbegeszseg.hu>',
      to: [email],
      subject: template.subject,
      html: template.body(firstName || '', email)
    })
  });
  return res.ok;
}

module.exports.sendWelcomeEmail = sendWelcomeEmail;
module.exports.SERIES = SERIES;
