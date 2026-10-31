import { firma } from "../dane/firma.mjs";
import { kategorie, pozycje, wKategorii } from "../dane/cennik.mjs";
import { strona, naglowekStrony, ctaPas, faqHtml, faqSchema, uslugaSchema, foto, przyciski } from "../lib/layout.mjs";

// Wspólne odpowiedzi używane na wielu stronach
const FAQ = {
  umawianie: ["Czy muszę się umawiać?", "Nie. Przyjmujemy rowery bez umawiania w godzinach otwarcia. Jeśli umówisz konkretny dzień i godzinę na WhatsApp, telefonicznie lub mailem, nie czekasz w kolejce."],
  czas: ["Jak długo trwa naprawa?", "W sezonie zwykle około tygodnia, poza sezonem około 2 dni. Drobne naprawy, jak wymiana dętki, często robimy od ręki, kiedy nie ma kolejki."],
  czesci: ["Czy mogę przynieść własne części?", "Tak, montujemy je w tej samej cenie usługi. Za dopasowanie i działanie części odpowiadamy wtedy, gdy sami zdiagnozujemy usterkę i sami zamówimy część."],
  gwarancja: ["Czy dajecie gwarancję?", "Tak, 30 dni na każdą naprawę. Jeśli w tym czasie coś nie działa jak trzeba, przyjedź – sprawdzimy rower i znajdziemy rozwiązanie."],
  platnosc: ["Jak mogę zapłacić?", "Gotówką, kartą albo BLIKIEM. Wystawiamy faktury."],
};

function landing({ sciezka, nazwa, h1, cena, cenaSchema, wstep, tresc, faq = [], fotoNazwa, fotoAlt, fotoWH = [1280, 960], tytul, opis, powiazane = [] }) {
  const okruszki = [["/uslugi/", "Usługi"], [sciezka, nazwa]];
  const html = `
${naglowekStrony({ okruszki, h1, cena, wstep, miejsce: sciezka })}
<section class="sekcja"><div class="wrap dwie dwie--szeroka">
  <div class="tresc">${tresc}</div>
  <div>${fotoNazwa ? foto(fotoNazwa, fotoAlt, { w: fotoWH[0], h: fotoWH[1], sizes: "(min-width: 52rem) 35vw, 100vw" }) : ""}
    <div class="ramka" style="margin-top:1.5rem"><p><strong>Przyjmujemy bez umawiania.</strong> ${firma.ulica}, ${firma.miasto}, pon.–pt. 9–16, sob. 9–13. Duży darmowy parking.</p></div>
  </div>
</div></section>
${faq.length ? `<section class="sekcja sekcja--jasna"><div class="wrap"><h2>Pytania</h2>${faqHtml(faq)}</div></section>` : ""}
${powiazane.length ? `<section class="sekcja"><div class="wrap"><h2>Zobacz też</h2><ul class="linki-uslug">${powiazane.map(([u, n]) => `<li><a href="${u}">${n}</a></li>`).join("")}</ul></div></section>` : ""}
${ctaPas(sciezka)}`;
  const schema = [uslugaSchema({ nazwa, opis, cena: cenaSchema, sciezka })];
  if (faq.length) schema.push(faqSchema(faq));
  return { sciezka, tytulKrotki: nazwa, html: strona({ sciezka, tytul, opis, tresc: html, schema, okruszki, foto: fotoNazwa || "warsztat-wnetrze" }) };
}

const tabelaCen = (wiersze) => `<table class="tabela"><tbody>${wiersze.map(([n, c]) => `<tr><td>${n}</td><td><strong>${c}</strong></td></tr>`).join("")}</tbody></table>`;
const zCennika = (kat, filtr = () => true) => tabelaCen(wKategorii(kat).filter(filtr).map((p) => [p[1], `${p[2]} zł`]));

export function wszystkie() {
  const s = [];

  // ---------- Przegląd roweru ----------
  s.push(landing({
    sciezka: "/przeglad-roweru/", nazwa: "Przegląd roweru", cenaSchema: "279",
    h1: "Przegląd roweru w Komprachcicach", cena: "279 zł",
    wstep: "Pełny przegląd: rower wraca do Ciebie sprawdzony od kierownicy po opony.",
    tytul: "Przegląd roweru 279 zł – Komprachcice i Opole | Warsztat Komprachcice",
    opis: "Pełny przegląd roweru za 279 zł: mycie, regulacja hamulców i przerzutek, centrowanie kół, łożyska. Komprachcice, 10 minut od Opola. Bez umawiania.",
    fotoNazwa: "rower-na-stojaku", fotoAlt: "Rower na stojaku serwisowym podczas przeglądu",
    tresc: `
<h2>Co robimy przy przeglądzie</h2>
<ul>
  <li>myjemy rower i napęd,</li>
  <li>regulujemy hamulce i przerzutki; zużyte linki i klocki wymieniamy po Twojej akceptacji (części płatne osobno),</li>
  <li>centrujemy koła,</li>
  <li>sprawdzamy i regulujemy łożyska: stery, piasty, suport,</li>
  <li>smarujemy, dokręcamy wszystkie połączenia, sprawdzamy oświetlenie.</li>
</ul>
<p>Zanim wymienimy jakąkolwiek część, dzwonimy z ceną.</p>
<h2>Dla kogo</h2>
<p>Dla każdego roweru, który jeździ regularnie – raz w roku, najlepiej przed sezonem albo na zimę. Rower dziecięcy do 20″ sprawdzimy za <a href="/przeglad-roweru-dzieciecego/">199 zł</a>, rower elektryczny ma osobny <a href="/naprawa-roweru-elektrycznego/">przegląd zerowy</a>.</p>`,
    faq: [FAQ.umawianie, FAQ.czas, ["Czy części są w cenie przeglądu?", "Nie. 279 zł to robocizna. Części, np. linki, klocki czy łańcuch, płacisz osobno – i tylko wtedy, gdy zgodzisz się na wymianę po naszym telefonie."], FAQ.gwarancja],
    powiazane: [["/konserwacja-zimowa/", "Konserwacja zimowa 249 zł"], ["/cennik/", "Pełny cennik"], ["/transport-rowerow/", "Transport roweru"]],
  }));

  // ---------- Konserwacja zimowa ----------
  s.push(landing({
    sciezka: "/konserwacja-zimowa/", nazwa: "Konserwacja zimowa roweru", cenaSchema: "249",
    h1: "Konserwacja zimowa roweru", cena: "249 zł",
    wstep: "Listopad i grudzień. Przygotowanie roweru na zimę i okres przechowywania: pełne sprawdzenie roweru z naciskiem na ochronę przed wilgocią i korozją.",
    tytul: "Konserwacja zimowa roweru 249 zł – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Konserwacja zimowa roweru za 249 zł w listopadzie i grudniu: czyszczenie z błota i soli, zabezpieczenie przed wilgocią, regulacje. Komprachcice, 10 min od Opola.",
    fotoNazwa: "odpowietrzanie-hamulca", fotoAlt: "Odpowietrzanie hamulca w rowerze trekkingowym", fotoWH: [1280, 960],
    tresc: `
<h2>Co robimy</h2>
<ul>
  <li>czyścimy rower i napęd z błota i soli,</li>
  <li>zabezpieczamy śruby, połączenia i elementy metalowe przed wilgocią na czas przechowywania,</li>
  <li>smarujemy łańcuch, linki i ruchome części,</li>
  <li>sprawdzamy i regulujemy łożyska sterów, piast i suportu,</li>
  <li>centrujemy koła, regulujemy hamulce i przerzutki,</li>
  <li>dokręcamy wszystkie połączenia i sprawdzamy oświetlenie.</li>
</ul>
<p>Cena jest niższa niż w sezonie, bo w listopadzie i grudniu mamy więcej czasu. Wiosną wyjeżdżasz od razu, bez kolejki.</p>`,
    faq: [["Do kiedy obowiązuje cena 249 zł?", "Konserwację zimową robimy w listopadzie i grudniu. W pozostałe miesiące zapraszamy na <a href=\"/przeglad-roweru/\">przegląd roweru</a> za 279 zł."], FAQ.czas, ["Czym różni się od zwykłego przeglądu?", "Zakres sprawdzenia jest podobny, ale kładziemy nacisk na zabezpieczenie roweru przed wilgocią i korozją na czas przechowywania."]],
    powiazane: [["/przeglad-roweru/", "Przegląd roweru"], ["/bon-podarunkowy-rower/", "Bon na naprawę roweru – prezent"], ["/cennik/", "Pełny cennik"]],
  }));

  // ---------- Wymiana dętki ----------
  s.push(landing({
    sciezka: "/wymiana-detki/", nazwa: "Wymiana dętki i opony", cenaSchema: "40",
    h1: "Wymiana dętki i opony", cena: "40 zł",
    wstep: "Złapałeś gumę albo opona jest już łysa? Wymienimy dętkę lub oponę – części masz od ręki w sklepie obok warsztatu.",
    tytul: "Wymiana dętki i opony rowerowej 40 zł – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Wymiana dętki lub opony rowerowej za 40 zł, koło bez roweru 30 zł. Dętki i opony na miejscu. Komprachcice, 10 minut od Opola.",
    fotoNazwa: "kolo-w-centrownicy", fotoAlt: "Mechanik zakłada koło rowerowe", fotoWH: [1280, 767],
    tresc: `
<h2>Ile kosztuje</h2>
${zCennika("kola-i-opony", (p) => /opony|mleczka|bezdętk/.test(p[1]))}
<p>Cena dotyczy robocizny. Dętkę lub oponę dobierzemy na miejscu i podamy cenę przed montażem.</p>
<h2>Przywieź samo koło</h2>
<p>Jeśli łatwo Ci wykręcić koło, przywieź je bez roweru – wymiana kosztuje wtedy 30 zł.</p>
<h2>Ciągle łapiesz gumę?</h2>
<p>Najczęściej winna jest zbyt niska wartość ciśnienia, zużyta opona albo coś wbitego w oponę, czego nie widać na pierwszy rzut oka. Przy wymianie sprawdzimy oponę od środka i taśmę na obręczy.</p>`,
    faq: [FAQ.umawianie, ["Czy wymienicie dętkę od ręki?", "Często tak, jeśli nie ma kolejki. Najpewniej będzie, gdy napiszesz wcześniej na WhatsApp i umówisz godzinę."], FAQ.czesci],
    powiazane: [["/centrowanie-kol/", "Centrowanie kół"], ["/cennik/#kola-i-opony", "Cennik: koła i opony"]],
  }));

  // ---------- Centrowanie kół ----------
  s.push(landing({
    sciezka: "/centrowanie-kol/", nazwa: "Centrowanie kół", cenaSchema: "60",
    h1: "Centrowanie kół rowerowych", cena: "60 zł",
    wstep: "Koło bije na boki, „ósemka” ociera o klocki albo słychać luźne szprychy? Wycentrujemy koło na centrownicy.",
    tytul: "Centrowanie koła rowerowego 60 zł – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Centrowanie koła rowerowego 60 zł, koło bez roweru 50 zł. Wymiana szprych, zaplatanie kół. Komprachcice, 10 minut od Opola.",
    fotoNazwa: "centrownica", fotoAlt: "Centrownica do kół w Warsztacie Komprachcice",
    tresc: `
<h2>Ile kosztuje</h2>
${zCennika("kola-i-opony", (p) => /entrow|plat|plec/.test(p[1]))}
<h2>Kiedy centrować koło</h2>
<ul>
  <li>koło widocznie „pływa” na boki przy kręceniu,</li>
  <li>obręcz ociera o klocki hamulcowe,</li>
  <li>szprycha pękła albo jest luźna,</li>
  <li>po uderzeniu w krawężnik lub dziurę.</li>
</ul>
<p>Mocno wygiętej obręczy nie da się czasem wycentrować. Wtedy powiemy wprost i wycenimy nową obręcz albo całe koło.</p>`,
    faq: [["Czy mogę przywieźć samo koło?", "Tak. Centrowanie koła dostarczonego bez roweru kosztuje 50 zł."], FAQ.czas, FAQ.gwarancja],
    powiazane: [["/wymiana-detki/", "Wymiana dętki i opony"], ["/przeglad-roweru/", "Przegląd roweru"]],
  }));

  // ---------- Napęd ----------
  s.push(landing({
    sciezka: "/naprawa-napedu/", nazwa: "Naprawa napędu", cenaSchema: "39",
    h1: "Naprawa napędu: łańcuch, kaseta, korba", cena: "od 39 zł",
    wstep: "Łańcuch spada, zgrzyta albo przeskakuje pod obciążeniem? Sprawdzimy zużycie łańcucha, kasety i zębatek i powiemy, co trzeba wymienić.",
    tytul: "Wymiana łańcucha i kasety, naprawa napędu – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Wymiana łańcucha 39 zł, kasety 49 zł, całego napędu 150 zł. Regulacja przerzutek od 29 zł. Serwis rowerowy Komprachcice, 10 minut od Opola.",
    fotoNazwa: "naped-przed-po", fotoAlt: "Kaseta i łańcuch przed i po regeneracji napędu", fotoWH: [1024, 1280],
    tresc: `
<h2>Ile kosztuje</h2>
${zCennika("naped-i-przerzutki")}
<p>Ceny za robociznę. Części dobierzemy do Twojego roweru i podamy cenę przed wymianą.</p>
<h2>Dlaczego warto wymienić łańcuch na czas</h2>
<p>Rozciągnięty łańcuch szybciej zjada kasetę i zębatki z przodu. Wymiana samego łańcucha jest tania; jeśli poczekasz zbyt długo, trzeba wymienić cały napęd.</p>`,
    faq: [["Skąd wiem, że łańcuch jest zużyty?", "Sprawdzamy go miarką w kilka sekund – podjedź, zmierzymy na miejscu."], FAQ.czesci, FAQ.gwarancja],
    powiazane: [["/przeglad-roweru/", "Przegląd roweru"], ["/cennik/#naped-i-przerzutki", "Cennik: napęd i przerzutki"]],
  }));

  // ---------- Akcesoria ----------
  s.push(landing({
    sciezka: "/montaz-akcesoriow/", nazwa: "Akcesoria z montażem", cenaSchema: "20",
    h1: "Akcesoria rowerowe z montażem", cena: "od 20 zł",
    wstep: "Koszyk, lampki, błotniki, podpórka, licznik albo fotelik dla dziecka. Dobierzesz akcesoria w sklepie obok, a my od razu je zamontujemy.",
    tytul: "Montaż akcesoriów rowerowych: koszyk, lampki, błotniki – Komprachcice | Warsztat Komprachcice",
    opis: "Montaż koszyka, oświetlenia, błotników, podpórki, licznika i fotelika dziecięcego od 20 zł. Akcesoria na miejscu. Komprachcice, 10 minut od Opola.",
    fotoNazwa: "stol-warsztatowy", fotoAlt: "Stół warsztatowy z szufladami na części: lampki, siodła, błotniki", fotoWH: [1280, 850],
    tresc: `
<h2>Ile kosztuje montaż</h2>
${zCennika("montaz-akcesoriow")}
<p>Akcesoria kupisz w sklepie obok warsztatu albo przyniesiesz swoje – montaż kosztuje tyle samo.</p>`,
    faq: [FAQ.czesci, ["Czy zamontujecie fotelik do każdego roweru?", "Do większości tak. Jeśli rama albo bagażnik nie pasują do danego fotelika, powiemy to przed montażem i doradzimy inny."], FAQ.umawianie],
    powiazane: [["/czesci/", "Części i akcesoria"], ["/cennik/#montaz-akcesoriow", "Cennik: montaż akcesoriów"]],
  }));

  // ---------- Rower dziecięcy ----------
  s.push(landing({
    sciezka: "/przeglad-roweru-dzieciecego/", nazwa: "Przegląd roweru dziecięcego", cenaSchema: "199",
    h1: "Przegląd roweru dziecięcego", cena: "199 zł",
    wstep: "Dla rowerów z kołami do 20″. Rower po starszym rodzeństwie albo przed sezonem – sprawdzimy, żeby dziecko jeździło bezpiecznie.",
    tytul: "Przegląd roweru dziecięcego 199 zł – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Przegląd roweru dziecięcego do 20 cali za 199 zł: hamulce, koła, łańcuch, kierownica. Komprachcice, 10 minut od Opola. Bez umawiania.",
    fotoNazwa: "rower-na-stojaku", fotoAlt: "Rower na stojaku serwisowym",
    tresc: `
<h2>Co sprawdzamy</h2>
<p>Zakres jak przy <a href="/przeglad-roweru/">przeglądzie roweru</a>, dopasowany do małego roweru: hamulce, koła, łańcuch, łożyska, dokręcenie kierownicy, siodełka i wszystkich połączeń. Zużyte części wymieniamy po Twojej akceptacji.</p>
<h2>Rower 24″ i większy</h2>
<p>Rowery z kołami 24″ i większymi mają cenę zwykłego przeglądu – 279 zł.</p>`,
    faq: [FAQ.umawianie, FAQ.czas],
    powiazane: [["/przeglad-roweru/", "Przegląd roweru"], ["/montaz-akcesoriow/", "Akcesoria z montażem"]],
  }));

  // ---------- Rower z kartonu ----------
  s.push(landing({
    sciezka: "/montaz-roweru-z-kartonu/", nazwa: "Montaż roweru z kartonu", cenaSchema: "279",
    h1: "Montaż nowego roweru z kartonu", cena: "279 zł",
    wstep: "Kupiłeś rower w internecie? Złożymy go z kartonu producenta i od razu zrobimy pełny przegląd, żeby wszystko działało od pierwszej jazdy.",
    tytul: "Montaż roweru z kartonu z przeglądem 279 zł – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Składanie nowego roweru kupionego w internecie, z pełnym przeglądem, za 279 zł. Komprachcice, 10 minut od Opola. Punkt kurierski na miejscu.",
    fotoNazwa: "warsztat-wnetrze", fotoAlt: "Wnętrze Warsztatu Komprachcice ze stojakiem serwisowym",
    tresc: `
<h2>Co robimy</h2>
<p>Montujemy kierownicę, pedały, koła i siodło, a potem robimy wszystko to, co przy <a href="/przeglad-roweru/">przeglądzie roweru</a>: regulujemy hamulce i przerzutki, sprawdzamy łożyska i dokręcamy połączenia. Rowery z fabryki rzadko są dobrze wyregulowane.</p>
<h2>Punkt kurierski na miejscu</h2>
<p>Na miejscu jest punkt kurierski – rower możesz zamówić tak, żeby trafił prosto do nas. Zadzwoń przed zamówieniem, ustalimy szczegóły.</p>`,
    faq: [FAQ.czas, FAQ.gwarancja],
    powiazane: [["/przeglad-roweru/", "Przegląd roweru"], ["/naprawa-roweru-elektrycznego/", "Przegląd zerowy e-roweru"]],
  }));

  // ---------- E-rowery ----------
  s.push(landing({
    sciezka: "/naprawa-roweru-elektrycznego/", nazwa: "Naprawa rowerów elektrycznych", cenaSchema: "150",
    h1: "Serwis i naprawa rowerów elektrycznych", cena: "przegląd zerowy 150 zł",
    wstep: "Naprawiamy wszystkie marki, także mniej znanych producentów, do których trudno o dokumentację i części.",
    tytul: "Serwis rowerów elektrycznych – wszystkie marki, Komprachcice i Opole | Warsztat Komprachcice",
    opis: "Naprawa i serwis rowerów elektrycznych wszystkich marek. Przegląd zerowy 150 zł, diagnostyka usterki elektrycznej 200–250 zł. Komprachcice, 10 min od Opola.",
    fotoNazwa: "transport-e-rowery", fotoAlt: "Dwa rowery elektryczne przed samochodem serwisu", fotoWH: [1280, 720],
    tresc: `
<h2>Jak pracujemy</h2>
<p>Najpierw sprawdzamy rower. Potem mówimy wprost, co da się naprawić, co trzeba wymienić i ile to kosztuje. Decyzja należy do Ciebie. Gdy nie ma oryginalnej części, szukamy zamiennika.</p>
<p>Elektronikę diagnozujemy na miejscu, w warsztacie.</p>
<h2>Ile kosztuje</h2>
${zCennika("rowery-elektryczne")}
<p>Mechanika e-roweru – hamulce, napęd, koła – według <a href="/cennik/">zwykłego cennika</a>.</p>
<h2>Przegląd zerowy</h2>
<p>Nowy rower elektryczny warto sprawdzić po pierwszych kilkuset kilometrach: linki się wyciągają, szprychy siadają, śruby się luzują.</p>`,
    faq: [["Czy naprawiacie e-rowery z marketu i mniej znanych marek?", "Tak. Naprawiamy wszystkie marki, także te bez dokumentacji serwisowej. Gdy nie ma oryginalnej części, szukamy zamiennika."], ["Ile kosztuje diagnoza usterki elektrycznej?", "200–250 zł. Dokładną wycenę naprawy podajemy po obejrzeniu roweru."], ["Czy odbierzecie ciężki e-rower z domu?", "Tak, w strefie Skorogoszcz – Opole – Komprachcice. Zobacz <a href=\"/transport-rowerow/\">transport rowerów</a>."]],
    powiazane: [["/transport-rowerow/", "Transport rowerów"], ["/cennik/", "Pełny cennik"]],
  }));

  // ---------- Transport ----------
  s.push(landing({
    sciezka: "/transport-rowerow/", nazwa: "Transport rowerów",
    h1: "Odbiór i dowóz roweru do serwisu",
    wstep: "Jesteśmy serwisem stacjonarnym, ale w razie potrzeby odbierzemy rower i odwieziemy go sprawny pod Twoje drzwi.",
    tytul: "Odbiór roweru do serwisu – Opole, Komprachcice, Skorogoszcz | Warsztat Komprachcice",
    opis: "Odbieramy rowery do naprawy w pasie Skorogoszcz – Opole – Komprachcice. Przy naprawie powyżej 200 zł transport gratis, przy tańszej 25 zł.",
    fotoNazwa: "transport-e-rowery", fotoAlt: "Rowery elektryczne przy samochodzie serwisu", fotoWH: [1280, 720],
    tresc: `
<img class="foto" src="/img/transport-schemat.webp" width="1400" height="267" alt="Schemat: rower z domu jedzie samochodem do warsztatu i wraca sprawny pod drzwi" loading="lazy">
<h2>Ile kosztuje</h2>
<table class="tabela"><tbody>
  <tr><td>Naprawa powyżej 200 zł</td><td><strong>transport gratis</strong></td></tr>
  <tr><td>Naprawa do 200 zł</td><td><strong>+25 zł</strong></td></tr>
</tbody></table>
<h2>Gdzie jeździmy</h2>
<p>Strefa transportu to pas Skorogoszcz – Opole – Komprachcice. Jeździmy trasami, nigdy po jeden rower – <strong>zadzwoń, a powiemy, w jaki dzień jedziemy przez Twoją miejscowość.</strong></p>
<p>Spoza strefy rowery odbieramy tylko wyjątkowo, gdy i tak jedziemy w pobliże. Zadzwoń i zapytaj.</p>`,
    faq: [["Czy mogę po prostu przywieźć rower?", "Oczywiście – to najszybsza droga. Przyjmujemy bez umawiania, a obok warsztatu jest duży darmowy parking."]],
    powiazane: [["/naprawa-roweru-elektrycznego/", "Rowery elektryczne"], ["/kontakt/", "Kontakt i dojazd"]],
  }));

  // ---------- Dla firm ----------
  s.push(landing({
    sciezka: "/dla-firm/", nazwa: "Serwis rowerów dla firm",
    h1: "Serwis rowerów pracowników u Ciebie w firmie",
    wstep: "Tydzień serwisowy na terenie Twojej firmy: przyjeżdżamy z narzędziami i serwisujemy rowery pracowników na miejscu. Firma udostępnia tylko miejsce.",
    tytul: "Serwis rowerowy dla firm – benefit dla pracowników, Opole | Warsztat Komprachcice",
    opis: "Tydzień serwisowy rowerów pracowników w Twojej firmie: 5 dni do 50 rowerów 6 390 zł netto albo 3 dni do 30 rowerów 4 100 zł netto. Opole i okolice.",
    fotoNazwa: "serwis-amortyzatora", fotoAlt: "Rozebrany amortyzator rowerowy na stole warsztatowym", fotoWH: [960, 1280],
    tresc: `
<h2>Pakiety (ceny netto)</h2>
<table class="tabela"><thead><tr><th>Pakiet</th><th>Ile rowerów</th><th>Cena netto</th></tr></thead><tbody>
  <tr><td>5 dni</td><td>do 50 rowerów</td><td><strong>6 390 zł</strong></td></tr>
  <tr><td>3 dni</td><td>do 30 rowerów</td><td><strong>4 100 zł</strong></td></tr>
</tbody></table>
<h2>Co obejmuje</h2>
<ul>
  <li>regulację przerzutek i hamulców,</li>
  <li>kontrolę połączeń śrubowych,</li>
  <li>smarowanie łańcucha,</li>
  <li>ocenę stanu roweru i kartę stanu roweru dla pracownika.</li>
</ul>
<p>Części, jeśli są potrzebne, pracownik płaci osobno.</p>
<p>Napisz albo zadzwoń – dopasujemy termin i liczbę dni do Twojej firmy.</p>`,
    powiazane: [["/bon-podarunkowy-rower/", "Bony na naprawę roweru"], ["/kontakt/", "Kontakt"]],
  }));

  // ---------- Usługi (hub) ----------
  const listaUslug = [
    ["/przeglad-roweru/", "Przegląd roweru", "279 zł"],
    ["/konserwacja-zimowa/", "Konserwacja zimowa (listopad–grudzień)", "249 zł"],
    ["/wymiana-detki/", "Wymiana dętki i opony", "40 zł"],
    ["/centrowanie-kol/", "Centrowanie kół", "60 zł"],
    ["/naprawa-napedu/", "Łańcuch, kaseta, korba", "od 39 zł"],
    ["/montaz-akcesoriow/", "Akcesoria z montażem", "od 20 zł"],
    ["/przeglad-roweru-dzieciecego/", "Przegląd roweru dziecięcego", "199 zł"],
    ["/montaz-roweru-z-kartonu/", "Montaż roweru z kartonu", "279 zł"],
    ["/naprawa-roweru-elektrycznego/", "Rowery elektryczne", "od 150 zł"],
    ["/transport-rowerow/", "Odbiór i dowóz roweru", "gratis od 200 zł"],
    ["/dla-firm/", "Serwis dla firm", "od 4 100 zł netto"],
    ["/bon-podarunkowy-rower/", "Bon na naprawę roweru", "300–800 zł"],
  ];
  s.push({
    sciezka: "/uslugi/", tytulKrotki: "Usługi",
    html: strona({
      sciezka: "/uslugi/", okruszki: [["/uslugi/", "Usługi"]],
      tytul: "Usługi serwisu rowerowego – Komprachcice i Opole | Warsztat Komprachcice",
      opis: "Przeglądy, naprawy, centrowanie kół, napęd, akcesoria z montażem, rowery elektryczne, transport rowerów i serwis dla firm. Komprachcice, 10 minut od Opola.",
      tresc: `
${naglowekStrony({ okruszki: [["/uslugi/", "Usługi"]], h1: "Usługi serwisu rowerowego", wstep: "Wszystko, z czym możesz do nas przyjechać. Przy każdej usłudze cena brutto za robociznę.", miejsce: "uslugi" })}
<section class="sekcja"><div class="wrap">
  <ul class="metki">
    ${listaUslug.map(([u, n, c]) => `<li class="metka"><h3><a href="${u}">${n}</a></h3><p class="cena">${c}</p></li>`).join("\n    ")}
  </ul>
  <p style="margin-top:2rem">Szukasz konkretnej naprawy? Zobacz <a href="/cennik/"><strong>pełny cennik</strong></a>.</p>
</div></section>
${ctaPas("uslugi")}`,
    }),
  });

  // ---------- Cennik ----------
  const cennikSchema = {
    "@context": "https://schema.org", "@type": "OfferCatalog", name: "Cennik napraw rowerowych – Warsztat Komprachcice",
    itemListElement: kategorie.map((k) => ({
      "@type": "OfferCatalog", name: k.nazwa,
      itemListElement: wKategorii(k.id).map((p) => {
        const o = { "@type": "Offer", itemOffered: { "@type": "Service", name: p[1] }, priceCurrency: "PLN" };
        if (/^\d+$/.test(p[2])) o.price = p[2];
        else { const [a, b] = p[2].split(/\s*[–-]\s*/); o.priceSpecification = { "@type": "PriceSpecification", minPrice: a, maxPrice: b, priceCurrency: "PLN" }; }
        return o;
      }),
    })),
  };
  s.push({
    sciezka: "/cennik/", tytulKrotki: "Cennik",
    html: strona({
      sciezka: "/cennik/", okruszki: [["/cennik/", "Cennik"]], schema: [cennikSchema],
      tytul: "Cennik napraw rowerowych 2026 – Komprachcice, Opole | Warsztat Komprachcice",
      opis: "Pełny cennik serwisu rowerowego: przegląd 279 zł, wymiana dętki 40 zł, centrowanie koła 60 zł, łańcuch 39 zł, hamulce, napęd, e-rowery. Ceny brutto.",
      tresc: `
${naglowekStrony({ okruszki: [["/cennik/", "Cennik"]], h1: "Cennik napraw rowerowych", wstep: "Ceny brutto (z VAT) za robociznę. Części liczymy osobno – zanim cokolwiek wymienimy, dzwonimy z ceną. Przy przedziale cen ostateczną kwotę podajemy po obejrzeniu roweru.", miejsce: "cennik" })}
<section class="sekcja"><div class="wrap">
  <ul class="cennik-nav">${kategorie.map((k) => `<li><a href="#${k.id}">${k.nazwa}</a></li>`).join("")}</ul>
  ${kategorie.map((k) => `<div class="cennik-grupa" id="${k.id}">
    <h2>${k.nazwa}</h2>
    <table class="cennik"><tbody>${wKategorii(k.id).map((p) => `<tr${p[3] ? ' class="wyrozniona"' : ""}><td>${p[1]}</td><td>${p[2]} zł</td></tr>`).join("")}</tbody></table>
  </div>`).join("\n  ")}
  <div class="ramka" style="margin-top:3rem"><p>Ceny dla firm podajemy netto – zobacz <a href="/dla-firm/">serwis dla firm</a>. Montujemy też części, które przyniesiesz – w tej samej cenie usługi.</p></div>
</div></section>
${ctaPas("cennik")}`,
    }),
  });

  return s;
}
