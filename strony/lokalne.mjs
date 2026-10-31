// Strony lokalne i obszar działania.
// Zasada z briefu: nie robimy podstrony dla każdej wsi. Pięć stron, każda z inną treścią.
// Listy miejscowości: Komprachcice – BIP gminy (brief); Prószków – PKW/GUS; Dąbrowa – GUS (stan po zmianie granic Opola w 2017 r.);
// Skorogoszcz i okolice – PKW (obwody gminy Lewin Brzeski); Opole – jednostki urbanistyczne miasta. Sprawdzone 31.10.2026.
import { firma } from "../dane/firma.mjs";
import { strona, naglowekStrony, ctaPas, uslugaSchema, foto } from "../lib/layout.mjs";

const uslugiSkrot = `
<ul class="metki">
  <li class="metka"><h3><a href="/przeglad-roweru/">Przegląd roweru</a></h3><p class="cena">279 zł</p></li>
  <li class="metka"><h3><a href="/wymiana-detki/">Wymiana dętki lub opony</a></h3><p class="cena">40 zł</p></li>
  <li class="metka"><h3><a href="/centrowanie-kol/">Centrowanie koła</a></h3><p class="cena">60 zł</p></li>
  <li class="metka"><h3><a href="/naprawa-roweru-elektrycznego/">Rowery elektryczne</a></h3><p class="cena">od 150 zł</p></li>
</ul>
<p style="margin-top:1.5rem"><a href="/cennik/"><strong>Pełny cennik</strong></a></p>`;

const transportTak = `<p>Twoja okolica jest w naszej strefie transportu (pas Skorogoszcz – Opole – Komprachcice). Przy naprawie powyżej 200 zł odbiór i dowóz roweru są gratis, przy tańszej dopłacasz 25 zł. Jeździmy trasami – <strong>zadzwoń, a powiemy, w jaki dzień jedziemy w Twoją stronę.</strong> <a href="/transport-rowerow/">Jak działa transport</a></p>`;
const transportZapytaj = `<p>Stała strefa transportu to pas Skorogoszcz – Opole – Komprachcice. Jeśli Twoja miejscowość leży obok tej trasy, zadzwoń – sprawdzimy, czy i kiedy jedziemy w pobliże. Najszybciej jest jednak przywieźć rower samemu: przyjmujemy bez umawiania, a obok warsztatu jest duży darmowy parking. <a href="/transport-rowerow/">Jak działa transport</a></p>`;

const miejsca = [
  {
    slug: "serwis-rowerowy-opole", nazwa: "Opole",
    h1: "Serwis rowerowy dla Opola – 10 minut od miasta",
    wstep: "Nie musisz szukać serwisu w centrum i walczyć o parking. Warsztat Komprachcice jest 10 minut samochodem od Opola, a pod drzwiami masz duży darmowy parking.",
    tytul: "Serwis rowerowy Opole – 10 minut od miasta, darmowy parking | Warsztat Komprachcice",
    opis: "Serwis rowerowy dla mieszkańców Opola: przegląd 279 zł, wymiana dętki 40 zł, e-rowery. 10 minut od miasta, darmowy parking, odbiór roweru z Opola.",
    dojazd: `<p>Z Opola jedziesz do Komprachcic – warsztat jest przy ${firma.ulica}. To 10 minut samochodem. Zaparkujesz bez problemu na dużym darmowym parkingu obok.</p>`,
    transport: transportTak,
    obszarTytul: "Przyjeżdżają do nas z całego Opola",
    obszar: "Malina, Grudzice, Kolonia Gosławicka, Groszowice, Wróblin, Malinka, Zaodrze, Śródmieście, Chmielowice, Wrzoski, Sławice i z pozostałych dzielnic.",
    dodatek: `<h2>Dlaczego warto podjechać poza miasto</h2><p>Przyjmujemy rowery bez umawiania, a poza sezonem naprawa trwa zwykle około 2 dni. Części i akcesoria masz od ręki w sklepie obok warsztatu.</p>`,
    foto: ["warsztat-wnetrze", "Wnętrze Warsztatu Komprachcice"],
  },
  {
    slug: "serwis-rowerowy-komprachcice", nazwa: "Komprachcice",
    h1: "Serwis rowerowy w Komprachcicach",
    wstep: `Jesteśmy na miejscu: ${firma.ulica}, w budynku, w którym części rowerowe sprzedaje się od około 30 lat. Obok sklep z częściami, duży darmowy parking i punkt kurierski.`,
    tytul: "Serwis rowerowy Komprachcice – ul. Kościelna 2 | Warsztat Komprachcice",
    opis: "Serwis rowerowy w Komprachcicach, ul. Kościelna 2: przeglądy, naprawy, e-rowery, części od ręki. Pon.–pt. 9–16, sob. 9–13. Przyjmujemy bez umawiania.",
    dojazd: `<p>${firma.ulica}, ${firma.kod} ${firma.miasto}. Otwarte od poniedziałku do piątku 9–16, w soboty 9–13. W tych godzinach zawsze ktoś przyjmie lub wyda rower.</p>`,
    transport: transportTak,
    obszarTytul: "Gmina Komprachcice",
    obszar: "Domecko, Dziekaństwo, Komprachcice, Ochodze, Osiny, Polska Nowa Wieś i Wawelno – z każdej wsi w gminie masz do nas kilka minut.",
    dodatek: `<h2>Części i paczki na miejscu</h2><p>Potrzebną część często mamy od ręki w sklepie obok. Kupujesz rower przez internet? Na miejscu jest punkt kurierski – zadzwoń przed zamówieniem, a <a href="/montaz-roweru-z-kartonu/">złożymy go z przeglądem</a>.</p>`,
    foto: ["sciana-narzedzi", "Ściana z narzędziami w warsztacie w Komprachcicach"],
  },
  {
    slug: "serwis-rowerowy-proszkow", nazwa: "Prószków",
    h1: "Serwis rowerowy blisko Prószkowa",
    wstep: "Z gminy Prószków masz do nas blisko – Komprachcice graniczą z gminą Prószków. Przyjmujemy rowery bez umawiania, a ceny znasz przed przyjazdem.",
    tytul: "Serwis rowerowy Prószków i okolice – Komprachcice | Warsztat Komprachcice",
    opis: "Serwis rowerowy blisko Prószkowa: Komprachcice, ul. Kościelna 2. Przegląd 279 zł, wymiana dętki 40 zł, e-rowery wszystkich marek. Bez umawiania.",
    dojazd: `<p>Jedziesz do Komprachcic, ${firma.ulica}. Obok warsztatu jest duży darmowy parking, więc spokojnie wyjmiesz rower z bagażnika albo zdejmiesz z haka.</p>`,
    transport: transportZapytaj,
    obszarTytul: "Gmina Prószków",
    obszar: "Prószków, Boguszyce, Chrząszczyce, Chrzowice, Folwark, Górki, Jaśkowice, Ligota Prószkowska, Nowa Kuźnia, Przysiecz, Zimnice Małe, Zimnice Wielkie, Złotniki, Źlinice.",
    dodatek: `<h2>Rower po zimie stoi w garażu?</h2><p>W listopadzie i grudniu robimy <a href="/konserwacja-zimowa/">konserwację zimową za 249 zł</a>, a od stycznia do marca przegląd przed sezonem bez kolejki.</p>`,
    foto: ["rower-na-stojaku", "Rower na stojaku serwisowym"],
  },
  {
    slug: "serwis-rowerowy-dabrowa", nazwa: "Dąbrowa",
    h1: "Serwis rowerowy dla gminy Dąbrowa",
    wstep: "Z gminy Dąbrowa do Komprachcic dojedziesz bez wjeżdżania do centrum Opola. Naprawiamy rowery zwykłe i elektryczne wszystkich marek.",
    tytul: "Serwis rowerowy gmina Dąbrowa – Chróścina, Narok, Mechnice | Warsztat Komprachcice",
    opis: "Serwis rowerowy dla gminy Dąbrowa (Chróścina, Mechnice, Narok, Karczów i inne): Komprachcice, ul. Kościelna 2. Przegląd 279 zł, e-rowery, bez umawiania.",
    dojazd: `<p>Warsztat jest w Komprachcicach, ${firma.ulica}. Duży darmowy parking obok. Najlepiej podjechać w godzinach otwarcia: pon.–pt. 9–16, sob. 9–13.</p>`,
    transport: transportZapytaj,
    obszarTytul: "Gmina Dąbrowa",
    obszar: "Chróścina, Ciepielowice, Dąbrowa, Karczów, Lipowa, Mechnice, Narok, Niewodniki, Nowa Jamka, Prądy, Siedliska, Skarbiszów, Żelazna.",
    dodatek: `<h2>Rowery elektryczne</h2><p>Coraz więcej osób dojeżdża e-rowerem do Opola. Robimy <a href="/naprawa-roweru-elektrycznego/">przegląd zerowy e-roweru za 150 zł</a> i naprawiamy także mniej znane marki.</p>`,
    foto: ["transport-e-rowery", "Rowery elektryczne przy samochodzie serwisu"],
  },
  {
    slug: "serwis-rowerowy-skorogoszcz", nazwa: "Skorogoszcz",
    h1: "Serwis rowerowy dla Skorogoszczy i okolic",
    wstep: "Skorogoszcz to początek naszej trasy odbioru rowerów. Nie musisz jechać do Opola ani do Brzegu – odbierzemy rower i odwieziemy go sprawny.",
    tytul: "Serwis rowerowy Skorogoszcz – odbiór roweru z domu | Warsztat Komprachcice",
    opis: "Serwis rowerowy dla Skorogoszczy i okolic: odbiór i dowóz roweru gratis przy naprawie powyżej 200 zł. Przegląd 279 zł, e-rowery. Warsztat Komprachcice.",
    dojazd: `<p>Możesz przywieźć rower do Komprachcic (${firma.ulica}) albo skorzystać z transportu – Skorogoszcz leży na naszej stałej trasie.</p>`,
    transport: transportTak,
    obszarTytul: "Skorogoszcz i sąsiednie wsie",
    obszar: "Skorogoszcz, Wronów, Chróścina, Borkowice, Błażejowice, Golczowice, Mikolin – zadzwoń, sprawdzimy, kiedy jedziemy w Twoją stronę.",
    dodatek: `<h2>Jak wygląda odbiór</h2><p>Dzwonisz, ustalamy dzień, w którym przejeżdżamy przez Twoją miejscowość. Zabieramy rower, dzwonimy z wyceną, a po naprawie odwozimy go pod drzwi.</p><img class="foto" src="/img/transport-schemat.webp" width="1400" height="267" alt="Schemat: rower jedzie z domu do warsztatu i wraca sprawny pod drzwi" loading="lazy">`,
    foto: ["transport-e-rowery", "Rowery przy samochodzie serwisu"],
  },
];

function lokalna(m) {
  const sciezka = `/${m.slug}/`;
  const okruszki = [["/obszar-dzialania/", "Obszar działania"], [sciezka, m.nazwa]];
  const tresc = `
${naglowekStrony({ okruszki, h1: m.h1, wstep: m.wstep, miejsce: sciezka })}
<section class="sekcja"><div class="wrap dwie dwie--szeroka">
  <div class="tresc">
    <h2>Dojazd</h2>${m.dojazd}
    <h2>Odbiór roweru</h2>${m.transport}
    <h2>${m.obszarTytul}</h2><p>${m.obszar}</p>
    ${m.dodatek}
  </div>
  <div>${foto(m.foto[0], m.foto[1], { sizes: "(min-width: 52rem) 35vw, 100vw", h: m.foto[0] === "transport-e-rowery" ? 720 : 960 })}</div>
</div></section>
<section class="sekcja sekcja--jasna"><div class="wrap"><h2>Najczęstsze naprawy</h2>${uslugiSkrot}</div></section>
${ctaPas(sciezka)}`;
  const schema = [uslugaSchema({ nazwa: `Serwis rowerowy – ${m.nazwa}`, opis: m.opis, sciezka })];
  return { sciezka, tytulKrotki: `Serwis rowerowy – ${m.nazwa}`, html: strona({ sciezka, tytul: m.tytul, opis: m.opis, tresc, schema, okruszki, foto: m.foto[0] }) };
}

export function wszystkie() {
  const s = miejsca.map(lokalna);
  s.push({
    sciezka: "/obszar-dzialania/", tytulKrotki: "Obszar działania",
    html: strona({
      sciezka: "/obszar-dzialania/", okruszki: [["/obszar-dzialania/", "Obszar działania"]],
      tytul: "Obszar działania: Komprachcice, Opole i okolice | Warsztat Komprachcice",
      opis: "Serwis rowerowy dla Komprachcic, Opola, Prószkowa, gminy Dąbrowa i Skorogoszczy. Strefa odbioru rowerów: Skorogoszcz – Opole – Komprachcice.",
      tresc: `
${naglowekStrony({ okruszki: [["/obszar-dzialania/", "Obszar działania"]], h1: "Komprachcice, Opole i okolice", wstep: "Warsztat jest w Komprachcicach, 10 minut od Opola. Rowery odbieramy w pasie Skorogoszcz – Opole – Komprachcice; z dalszych miejscowości najprościej przywieźć rower samemu.", miejsce: "obszar" })}
<section class="sekcja"><div class="wrap">
  <ul class="metki">
    ${miejsca.map((m) => `<li class="metka"><h3><a href="/${m.slug}/">${m.nazwa}</a></h3><p>${m.obszar.length > 140 ? m.obszar.slice(0, m.obszar.lastIndexOf(",", 140)) + "…" : m.obszar}</p></li>`).join("\n    ")}
  </ul>
  <div class="ramka" style="margin-top:2.5rem"><p><strong>Strefa transportu:</strong> pas Skorogoszcz – Opole – Komprachcice. Przy naprawie powyżej 200 zł odbiór i dowóz gratis, przy tańszej 25 zł. Jeździmy trasami, więc zadzwoń, a powiemy, kiedy jedziemy w Twoją stronę. <a href="/transport-rowerow/">Szczegóły</a></p></div>
</div></section>
${ctaPas("obszar")}`,
    }),
  });
  return s;
}
