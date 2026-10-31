import { firma } from "../dane/firma.mjs";

export const ikony = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.4A8.4 8.4 0 1 1 20.5 11.6z"/><path d="M9 8.6c.2 1.9 2.3 4.5 4.6 5.4l1.2-1.2 2 1-.4 1.6c-3.4.4-7.4-3.6-7.6-7l1.5-.5 1 2-1 1"/></svg>',
  tel: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 6.8 6.8l1.4-2.2 4.3 1.7V19a1.8 1.8 0 0 1-2 1.8A16.5 16.5 0 0 1 3.2 5.5 1.8 1.8 0 0 1 5 3.5z"/></svg>',
};

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function btnWa(miejsce, tekst = "Napisz na WhatsApp") {
  return `<a class="btn btn--wa" href="${firma.whatsapp}" data-kontakt="whatsapp" data-miejsce="${miejsce}">${ikony.wa}${tekst}</a>`;
}
export function btnTel(miejsce, tekst = `Zadzwoń ${firma.telefon}`) {
  return `<a class="btn btn--tel" href="tel:${firma.telefonLink}" data-kontakt="telefon" data-miejsce="${miejsce}">${ikony.tel}${tekst}</a>`;
}
export const przyciski = (miejsce) => `<div class="przyciski">${btnWa(miejsce)}${btnTel(miejsce)}</div>`;

const menu = [
  ["/uslugi/", "Usługi"],
  ["/cennik/", "Cennik"],
  ["/naprawa-roweru-elektrycznego/", "E-rowery"],
  ["/bon-podarunkowy-rower/", "Bony"],
  ["/kontakt/", "Kontakt"],
];

function schemaFirmy() {
  return {
    "@context": "https://schema.org",
    "@type": "BicycleStore",
    "@id": `${firma.domena}/#firma`,
    name: `${firma.marka} – ${firma.podpis}`,
    alternateName: firma.marka,
    description: "Serwis rowerowy w Komprachcicach, 10 minut od Opola: przeglądy, naprawy, centrowanie kół, napęd, rowery elektryczne, części i akcesoria z montażem.",
    url: `${firma.domena}/`,
    logo: `${firma.domena}/img/logo.png`,
    image: `${firma.domena}/img/warsztat-wnetrze-1280.webp`,
    telephone: firma.telefonLink,
    email: firma.email,
    priceRange: "20–279 zł",
    paymentAccepted: "Gotówka, karta, BLIK",
    currenciesAccepted: "PLN",
    address: { "@type": "PostalAddress", streetAddress: "Kościelna 2", postalCode: firma.kod, addressLocality: firma.miasto, addressRegion: "opolskie", addressCountry: "PL" },
    openingHoursSpecification: firma.godziny.filter((g) => !g.zamkniete).map((g) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: g.schema, opens: g.otw, closes: g.zam })),
    areaServed: firma.obszar.map((m) => ({ "@type": "Place", name: m })),
    sameAs: [firma.facebook, firma.instagram, firma.allegro],
    parentOrganization: { "@type": "Organization", name: firma.spolka.nazwa, taxID: firma.spolka.nip, identifier: `KRS ${firma.spolka.krs}` },
  };
}

export function strona({ sciezka, tytul, opis, tresc, schema = [], okruszki = null, foto = "warsztat-wnetrze" }) {
  const url = `${firma.domena}${sciezka}`;
  const schematy = [schemaFirmy(), ...schema];
  if (okruszki) {
    schematy.push({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [["/", "Strona główna"], ...okruszki].map(([u, n], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: `${firma.domena}${u}` })),
    });
  }
  const navLinks = (cls) => menu.map(([u, n]) => `<li><a href="${u}"${u === sciezka ? ' aria-current="page"' : ""}>${n}</a></li>`).join("");

  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tytul)}</title>
<meta name="description" content="${esc(opis)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pl_PL">
<meta property="og:title" content="${esc(tytul)}">
<meta property="og:description" content="${esc(opis)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${firma.domena}/img/${foto}-1280.webp">
<meta name="theme-color" content="#24282b">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="preload" href="/fonts/archivo-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/style.css">
${schematy.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join("\n")}
</head>
<body>
<a class="skip" href="#tresc">Przejdź do treści</a>
<header class="naglowek">
  <div class="wrap">
    <a class="logo" href="/" aria-label="${firma.marka} – strona główna"><img src="/img/logo-240.png" width="92" height="43" alt="${firma.marka}"><span>${firma.podpis}<br>Komprachcice</span></a>
    <nav class="menu" aria-label="Menu główne"><ul>${navLinks()}</ul></nav>
    <a class="btn btn--wa tel-desktop" href="${firma.whatsapp}" data-kontakt="whatsapp" data-miejsce="naglowek">${ikony.wa}WhatsApp</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-mobilne">Menu</button>
  </div>
  <nav class="menu-mobilne wrap" id="menu-mobilne" aria-label="Menu"><ul>${navLinks()}</ul></nav>
</header>
<main id="tresc">
${tresc}
</main>
<footer class="stopka">
  <div class="wrap">
    <p class="stopka-motto">${firma.motto}</p>
    <div class="stopka-siatka">
      <div>
        <h2>${firma.marka}</h2>
        <p>${firma.ulica}, ${firma.kod} ${firma.miasto}<br>10 minut od Opola · duży darmowy parking</p>
        <p><a href="tel:${firma.telefonLink}" data-kontakt="telefon" data-miejsce="stopka">${firma.telefon}</a> (także WhatsApp)<br>
        <a href="tel:${firma.telefonStacjonarnyLink}" data-kontakt="telefon" data-miejsce="stopka-stacjonarny">${firma.telefonStacjonarny}</a> (stacjonarny)<br>
        <a href="mailto:${firma.email}" data-kontakt="email" data-miejsce="stopka">${firma.email}</a></p>
      </div>
      <div>
        <h2>Godziny</h2>
        <ul>${firma.godziny.map((g) => `<li>${g.dni}: ${g.zamkniete ? "zamknięte" : `${g.od}–${g.do}`}</li>`).join("")}</ul>
      </div>
      <div>
        <h2>Usługi</h2>
        <ul>
          <li><a href="/przeglad-roweru/">Przegląd roweru</a></li>
          <li><a href="/konserwacja-zimowa/">Konserwacja zimowa</a></li>
          <li><a href="/naprawa-roweru-elektrycznego/">Rowery elektryczne</a></li>
          <li><a href="/dla-firm/">Serwis dla firm</a></li>
          <li><a href="/transport-rowerow/">Transport rowerów</a></li>
          <li><a href="/cennik/">Pełny cennik</a></li>
        </ul>
      </div>
      <div>
        <h2>Więcej</h2>
        <ul>
          <li><a href="/o-nas/">O nas</a></li>
          <li><a href="/czesci/">Części i akcesoria</a></li>
          <li><a href="/rowery-uzywane/">Rowery używane</a></li>
          <li><a href="/pytania/">Pytania i odpowiedzi</a></li>
          <li><a href="/poradniki/">Poradniki</a></li>
          <li><a href="/obszar-dzialania/">Obszar działania</a></li>
          <li><a href="${firma.facebook}">Facebook</a> · <a href="${firma.instagram}">Instagram</a> · <a href="${firma.allegro}">Allegro</a></li>
        </ul>
      </div>
    </div>
    <div class="stopka-formalna">
      <p>${firma.marka} – ${firma.podpis}. Prowadzi ${firma.spolka.nazwa}, ${firma.spolka.adres}, KRS ${firma.spolka.krs}, NIP ${firma.spolka.nip}, REGON ${firma.spolka.regon}. <a href="/prywatnosc/">Polityka prywatności</a></p>
    </div>
  </div>
</footer>
<div class="pasek-kontakt">
  <a class="btn btn--wa" href="${firma.whatsapp}" data-kontakt="whatsapp" data-miejsce="pasek">${ikony.wa}WhatsApp</a>
  <a class="btn btn--tel" href="tel:${firma.telefonLink}" data-kontakt="telefon" data-miejsce="pasek">${ikony.tel}Zadzwoń</a>
</div>
<script src="/js/promocje.js" defer></script>
<script src="/js/main.js" defer></script>
</body>
</html>
`;
}

// Wspólne kawałki treści
export function naglowekStrony({ okruszki, h1, cena, wstep, miejsce }) {
  return `<section class="naglowek-strony"><div class="wrap">
  <p class="okruszki"><a href="/">Strona główna</a>${okruszki.map(([u, n]) => ` / <a href="${u}">${n}</a>`).join("")}</p>
  <h1>${h1}</h1>
  ${cena ? `<p class="cena-duza">${cena}</p>` : ""}
  ${wstep ? `<p class="wstep">${wstep}</p>` : ""}
  ${przyciski(miejsce)}
</div></section>`;
}

export function ctaPas(miejsce, tytul = "Przywieź rower albo napisz, co się dzieje", tekst = "Przyjmujemy bez umawiania. Kto umówi dzień i godzinę, nie czeka w kolejce.") {
  return `<section class="cta-pas"><div class="wrap">
  <h2>${tytul}</h2>
  <p>${tekst}</p>
  ${przyciski(miejsce)}
</div></section>`;
}

export function faqHtml(faq) {
  return `<div class="faq">${faq.map(([q, a]) => `<details><summary>${q}</summary><div><p>${a}</p></div></details>`).join("")}</div>`;
}
export function faqSchema(faq) {
  const strip = (s) => s.replace(/<[^>]+>/g, "");
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: strip(q), acceptedAnswer: { "@type": "Answer", text: strip(a) } })),
  };
}
export function uslugaSchema({ nazwa, opis, cena, sciezka }) {
  const s = {
    "@context": "https://schema.org", "@type": "Service",
    name: nazwa, description: opis, serviceType: nazwa,
    provider: { "@id": `${firma.domena}/#firma` },
    areaServed: firma.obszar.slice(0, 5).map((m) => ({ "@type": "Place", name: m })),
    url: `${firma.domena}${sciezka}`,
  };
  if (cena) s.offers = { "@type": "Offer", price: cena, priceCurrency: "PLN" };
  return s;
}

export function foto(nazwa, alt, { sizes = "(min-width: 52rem) 50vw, 100vw", lazy = true, klasa = "foto", w = 1280, h = 960 } = {}) {
  return `<img class="${klasa}" src="/img/${nazwa}-1280.webp" srcset="/img/${nazwa}-640.webp 640w, /img/${nazwa}-1280.webp 1280w" sizes="${sizes}" width="${w}" height="${h}" alt="${esc(alt)}"${lazy ? ' loading="lazy" decoding="async"' : ""}>`;
}
