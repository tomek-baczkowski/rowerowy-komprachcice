import { firma } from "../dane/firma.mjs";
import { strona, naglowekStrony, ctaPas, faqHtml, faqSchema, foto, przyciski, btnWa, uslugaSchema } from "../lib/layout.mjs";

function prosta({ sciezka, nazwa, h1, wstep, tytul, opis, tresc, schema = [], fotoOg, bezPrzyciskow = false }) {
  const okruszki = [[sciezka, nazwa]];
  const html = `${naglowekStrony({ okruszki, h1, wstep, miejsce: sciezka })}
${tresc}`;
  return { sciezka, tytulKrotki: nazwa, html: strona({ sciezka, tytul, opis, tresc: html, schema, okruszki, foto: fotoOg }) };
}

export function wszystkie() {
  const s = [];

  // ---------- Bon ----------
  const faqBon = [
    ["Jak długo ważny jest bon?", "12 miesięcy od daty zakupu. Data ważności jest na bonie."],
    ["Czy bon obejmuje części?", "Tak – części zamienne potrzebne do naprawy są w ramach bonu."],
    ["Czy mogę kupić za bon same akcesoria bez naprawy?", "Nie, bon jest na naprawę roweru. Części wchodzą w skład naprawy."],
    ["Czy można wymienić bon na gotówkę?", "Nie. Bon nie wydaje też reszty."],
    ["Czy zdążę przed Mikołajem lub świętami?", "Bony wysyłamy mailem jako PDF zaraz po zaksięgowaniu płatności. Jeśli zamówisz co najmniej 2 dni przed wydarzeniem, zdążysz. Masz wątpliwości? Zadzwoń, załatwimy to najszybciej, jak się da."],
  ];
  s.push(prosta({
    sciezka: "/bon-podarunkowy-rower/", nazwa: "Bon podarunkowy",
    h1: "Prezent, który naprawdę się przyda: bon na naprawę roweru",
    wstep: "Bon podarunkowy Warsztatu Komprachcice to naprawa roweru do wykorzystania przez 12 miesięcy – razem z potrzebnymi częściami zamiennymi. Wybierasz jedną z trzech wartości: 300, 500 albo 800 zł.",
    tytul: "Bon podarunkowy na naprawę roweru – Komprachcice i Opole | Warsztat Komprachcice",
    opis: "Prezent dla rowerzysty: bon na przegląd i naprawę roweru razem z częściami. 300, 500 lub 800 zł, ważny 12 miesięcy. Warsztat Komprachcice, 10 minut od Opola.",
    schema: [faqSchema(faqBon), uslugaSchema({ nazwa: "Bon podarunkowy na naprawę roweru", opis: "Bon na naprawę roweru z częściami, 300, 500 lub 800 zł, ważny 12 miesięcy.", sciezka: "/bon-podarunkowy-rower/" })],
    fotoOg: "sciana-narzedzi",
    tresc: `
<section class="sekcja"><div class="wrap">
  <h2>Trzy bony</h2>
  <ul class="metki">
    <li class="metka"><h3>Bon 300 zł</h3><p>Pełny przegląd roweru razem z drobnymi częściami, np. linkami, klockami, dętką. Dla każdego, kto jeździ rekreacyjnie, do pracy, po zakupy.</p><p class="cena">300 zł</p></li>
    <li class="metka"><h3>Bon 500 zł</h3><p>Przywrócenie sprawności rowerowi, który wymaga więcej pracy: wymiana zużytego napędu, nowe opony i dętki, większe naprawy. Dla roweru, który dużo jeździ albo dawno nie był w serwisie.</p><p class="cena">500 zł</p></li>
    <li class="metka"><h3>Bon 800 zł</h3><p>Dla wymagających: dokładna praca przy rowerze wysokiej klasy, droższe części, precyzyjne regulacje. Dla osób, które bardzo dużo jeżdżą.</p><p class="cena">800 zł</p></li>
  </ul>
</div></section>
<section class="sekcja sekcja--jasna"><div class="wrap dwie">
  <div>
    <h2>Dlaczego to dobry prezent</h2>
    <ul>
      <li>Każdy rower potrzebuje przeglądu raz w roku – bon się nie zmarnuje.</li>
      <li>Nie musisz znać się na rowerach ani zgadywać, jakiej części brakuje – części są w ramach naprawy.</li>
      <li>12 miesięcy ważności: można go wykorzystać wiosną, przed sezonem.</li>
      <li>Komprachcice, 10 minut od Opola, darmowy parking. Przy naprawach powyżej 200 zł możemy odebrać rower w strefie Skorogoszcz – Opole – Komprachcice.</li>
    </ul>
  </div>
  <div>
    <h2>Jak kupić bon</h2>
    <ol class="kroki">
      <li>Napisz na WhatsApp, zadzwoń albo wyślij e-mail: ${firma.telefon}, <a href="mailto:${firma.email}?subject=Zam%C3%B3wienie%20bonu" data-kontakt="email" data-miejsce="bon">${firma.email}</a>.</li>
      <li>Wybierz bon: 300, 500 albo 800 zł.</li>
      <li>Odbierz wydrukowany bon w warsztacie albo dostań PDF mailem po przelewie.</li>
    </ol>
    <div class="przyciski">${btnWa("bon", "Zamów bon na WhatsApp")}</div>
    <h2 style="margin-top:2.5rem">Jak wykorzystać</h2>
    <p>Umów naprawę i przywieź rower razem z bonem albo podaj jego numer. Wartość bonu odliczamy od naprawy roweru razem z częściami.</p>
  </div>
</div></section>
<section class="sekcja"><div class="wrap"><h2>Pytania o bony</h2>${faqHtml(faqBon)}</div></section>
${ctaPas("bon", "Zamów bon na prezent", "Napisz, jaką wartość wybierasz i czy bon ma być wydrukowany, czy w PDF.")}`,
  }));

  // ---------- Kontakt ----------
  s.push(prosta({
    sciezka: "/kontakt/", nazwa: "Kontakt i dojazd",
    h1: "Kontakt i dojazd",
    wstep: `${firma.ulica}, ${firma.kod} ${firma.miasto} – 10 minut samochodem od Opola. Najszybciej odpowiadamy na WhatsApp.`,
    tytul: "Kontakt i dojazd – serwis rowerowy Komprachcice | Warsztat Komprachcice",
    opis: `Warsztat Komprachcice, ${firma.ulica}, ${firma.kod} ${firma.miasto}. Tel. i WhatsApp ${firma.telefon}. Pon.–pt. 9–16, sob. 9–13. Duży darmowy parking.`,
    fotoOg: "warsztat-wnetrze",
    tresc: `
<section class="sekcja"><div class="wrap dwie">
  <div>
    <h2>Dane kontaktowe</h2>
    <dl class="dane">
      <dt>Adres</dt><dd>${firma.ulica}<br>${firma.kod} ${firma.miasto}</dd>
      <dt>WhatsApp</dt><dd><a href="${firma.whatsapp}" data-kontakt="whatsapp" data-miejsce="kontakt">${firma.telefon}</a></dd>
      <dt>Telefon</dt><dd><a href="tel:${firma.telefonLink}" data-kontakt="telefon" data-miejsce="kontakt">${firma.telefon}</a></dd>
      <dt>Stacjonarny</dt><dd><a href="tel:${firma.telefonStacjonarnyLink}" data-kontakt="telefon" data-miejsce="kontakt-stacjonarny">${firma.telefonStacjonarny}</a><br><span class="drobny">wspólny numer budynku – poproś o serwis</span></dd>
      <dt>E-mail</dt><dd><a href="mailto:${firma.email}" data-kontakt="email" data-miejsce="kontakt">${firma.email}</a></dd>
    </dl>
    <h2 style="margin-top:2.5rem">Godziny otwarcia</h2>
    <table class="godziny"><tbody>${firma.godziny.map((g) => `<tr><th scope="row">${g.dni}</th><td>${g.zamkniete ? "zamknięte" : `${g.od}–${g.do}`}</td></tr>`).join("")}</tbody></table>
    <p style="margin-top:1rem">W tych godzinach zawsze ktoś przyjmie lub wyda rower.</p>
    <div class="ramka"><p>Na WhatsApp odpisuje Szymon – zwykle od razu. Jeśli chwilę to trwa, to znaczy, że akurat naprawia rower; odpisze w przerwie.</p></div>
  </div>
  <div>
    <h2>Dojazd i parking</h2>
    <p>Obok warsztatu jest duży darmowy parking. Na miejscu działa też punkt kurierski i sklep z częściami.</p>
    <div class="mapa" data-mapa="https://maps.google.com/maps?q=Ko%C5%9Bcielna%202%2C%2046-070%20Komprachcice&z=15&output=embed">
      <button class="btn btn--ciemny" type="button">Pokaż mapę</button>
      <p class="drobny">Mapa Google wczyta się dopiero po kliknięciu. <a href="${firma.mapa}">Otwórz w Mapach Google</a></p>
    </div>
    <p style="margin-top:1.5rem"><a href="${firma.facebook}">Facebook</a> · <a href="${firma.instagram}">Instagram</a> · <a href="${firma.allegro}">Allegro</a></p>
  </div>
</div></section>`,
  }));

  // ---------- O nas ----------
  s.push(prosta({
    sciezka: "/o-nas/", nazwa: "O nas",
    h1: "Dwóch mechaników i warsztat, w którym części są od 30 lat",
    wstep: `${firma.motto}. Tak pracujemy: najpierw sprawdzamy, co da się naprawić, a dopiero potem mówimy o wymianie.`,
    tytul: "O nas – Tomek i Szymon, serwis rowerowy Komprachcice | Warsztat Komprachcice",
    opis: "Tomek pracuje w serwisach rowerowych od 2000 roku, Szymon serwisował rowery w Niemczech i w Polsce. Części rowerowe w tym miejscu od ok. 30 lat.",
    fotoOg: "warsztat-wnetrze",
    tresc: `
<section class="sekcja"><div class="wrap dwie">
  <div class="tresc">
    <h2>Tomek</h2>
    <p>W serwisach rowerowych od 2000 roku. Zapalony mechanik.</p>
    <h2>Szymon</h2>
    <p>Naprawiał rowery w serwisach w Niemczech i w Polsce, sam bardzo dużo jeździ. Zna się na rowerach elektrycznych. To on odpisuje Ci na WhatsApp.</p>
    <h2>Miejsce</h2>
    <p>Części rowerowe sprzedaje się w tym miejscu od około 30 lat. Obok warsztatu masz sklep z częściami i akcesoriami, duży darmowy parking i punkt kurierski.</p>
  </div>
  <div>${foto("warsztat-wnetrze", "Wnętrze Warsztatu Komprachcice: stojak serwisowy, ściana z narzędziami, stoły warsztatowe")}
    <p class="foto-podpis">Nasz warsztat przy ul. Kościelnej 2.</p>
    ${foto("stol-warsztatowy", "Stół warsztatowy z opisanymi szufladami na części", { w: 1280, h: 850 })}
  </div>
</div></section>
${ctaPas("o-nas")}`,
  }));

  // ---------- Części ----------
  s.push(prosta({
    sciezka: "/czesci/", nazwa: "Części i akcesoria",
    h1: "Części i akcesoria rowerowe od ręki",
    wstep: "Części rowerowe w tym miejscu od około 30 lat. Na miejscu części zamienne i akcesoria w szerokim wyborze.",
    tytul: "Części i akcesoria rowerowe – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Części zamienne i akcesoria rowerowe od ręki w Komprachcicach, 10 minut od Opola. Markowe części w dobrych cenach – także na Allegro.",
    fotoOg: "stol-warsztatowy",
    tresc: `
<section class="sekcja"><div class="wrap dwie">
  <div class="tresc">
    <p>Od tego roku wyszukujemy też markowe części w dobrych cenach w całej Europie – wysoka jakość w atrakcyjnej cenie. Całą naszą ofertę internetową zobaczysz na Allegro.</p>
    <div class="przyciski"><a class="btn btn--ciemny" href="${firma.allegro}">Zobacz nasze aukcje na Allegro</a></div>
    <h2>Zamów część telefonicznie lub mailem</h2>
    <p>Nie wiesz, jakiej części potrzebujesz? Napisz na WhatsApp i wyślij zdjęcie. Części możesz zamówić telefonicznie albo mailem.</p>
    <h2>Montaż</h2>
    <p>Kupioną część od razu zamontujemy – zobacz <a href="/cennik/">cennik</a> i <a href="/montaz-akcesoriow/">montaż akcesoriów</a>. Za dopasowanie odpowiadamy, gdy sami zdiagnozujemy usterkę i sami zamówimy część.</p>
  </div>
  <div>${foto("stol-warsztatowy", "Szuflady z częściami: łańcuchy, hamulce, piasty, siodła, lampki", { w: 1280, h: 850 })}</div>
</div></section>
${ctaPas("czesci", "Szukasz konkretnej części?", "Wyślij zdjęcie na WhatsApp – sprawdzimy, czy mamy ją od ręki.")}`,
  }));

  // ---------- Rowery używane ----------
  s.push(prosta({
    sciezka: "/rowery-uzywane/", nazwa: "Rowery używane",
    h1: "Skupujemy rowery i sprzedajemy odnowione",
    wstep: "Skupujemy wszystkie rowery po indywidualnej wycenie. Sprzedajemy je odnowione, z 30-dniową gwarancją rozruchową na główne podzespoły.",
    tytul: "Skup i sprzedaż rowerów używanych – Komprachcice, Opole | Warsztat Komprachcice",
    opis: "Skup rowerów używanych po indywidualnej wycenie i sprzedaż odnowionych rowerów z 30-dniową gwarancją. Komprachcice, 10 minut od Opola.",
    fotoOg: "rower-na-stojaku",
    tresc: `
<section class="sekcja"><div class="wrap dwie">
  <div class="tresc">
    <h2>Chcesz sprzedać rower?</h2>
    <p>Wyślij zdjęcia roweru na WhatsApp albo mailem – odpowiemy wyceną.</p>
    <div class="przyciski">${btnWa("rowery-uzywane", "Wyślij zdjęcia na WhatsApp")}<a class="btn btn--tel" href="mailto:${firma.email}?subject=Sprzeda%C5%BC%20roweru" data-kontakt="email" data-miejsce="rowery-uzywane">Wyślij e-mail</a></div>
    <h2>Szukasz roweru?</h2>
    <p>Zapytaj, jakie odnowione rowery mamy teraz na miejscu. Każdy przechodzi przez warsztat, zanim trafi do sprzedaży.</p>
  </div>
  <div>${foto("rowerzysci-sciezka", "Dwoje rowerzystów na ścieżce rowerowej wśród trawy", { w: 1280, h: 850 })}</div>
</div></section>`,
  }));

  // ---------- Pytania ----------
  const faqOgolne = [
    ["Czy muszę się umawiać?", "Nie. Przyjmujemy rowery bez umawiania w godzinach otwarcia: pon.–pt. 9–16, sob. 9–13. Jeśli umówisz konkretny dzień i godzinę na WhatsApp, telefonicznie lub mailem, nie czekasz w kolejce."],
    ["Jak długo trwa naprawa?", "W sezonie zwykle około tygodnia, poza sezonem około 2 dni."],
    ["Ile kosztuje przegląd roweru?", "279 zł brutto za robociznę. Części płacisz osobno, po naszym telefonie z ceną. W listopadzie i grudniu konserwacja zimowa kosztuje 249 zł. Zobacz <a href=\"/cennik/\">pełny cennik</a>."],
    ["Czy dajecie gwarancję na naprawę?", "Tak, 30 dni. Jeśli w tym czasie coś nie działa jak trzeba, przyjedź – sprawdzimy rower i znajdziemy rozwiązanie."],
    ["Czy mogę przynieść własne części?", "Tak, montujemy je w tej samej cenie usługi. Za dopasowanie i działanie części odpowiadamy wtedy, gdy sami zdiagnozujemy usterkę i sami zamówimy część. Jeśli kupisz część sam, ryzyko, że nie będzie pasować, jest po Twojej stronie – nie każdy sklep przyjmie zwrot części po próbie montażu."],
    ["Czy naprawiacie rowery elektryczne?", "Tak, wszystkie marki, także mniej znanych producentów. Elektronikę diagnozujemy na miejscu. Zobacz <a href=\"/naprawa-roweru-elektrycznego/\">rowery elektryczne</a>."],
    ["Czy odbieracie rowery z domu?", "Tak, w pasie Skorogoszcz – Opole – Komprachcice. Przy naprawie powyżej 200 zł transport jest gratis, przy tańszej kosztuje 25 zł. Zobacz <a href=\"/transport-rowerow/\">transport rowerów</a>."],
    ["Jak szybko odpisujecie na WhatsApp?", "Zwykle od razu – odpisuje Szymon. Jeśli chwilę to trwa, to znaczy, że akurat naprawia rower; odpisze w przerwie."],
    ["Jak mogę zapłacić?", "Gotówką, kartą albo BLIKIEM. Wystawiamy faktury."],
    ["Gdzie zaparkuję?", "Obok warsztatu jest duży darmowy parking."],
  ];
  s.push(prosta({
    sciezka: "/pytania/", nazwa: "Pytania i odpowiedzi",
    h1: "Pytania i odpowiedzi",
    wstep: "Najczęstsze pytania o naprawy, ceny, terminy i dojazd. Nie ma tu Twojego? Napisz na WhatsApp.",
    tytul: "Pytania o serwis rowerowy – terminy, ceny, gwarancja | Warsztat Komprachcice",
    opis: "Czy trzeba się umawiać, ile trwa naprawa, ile kosztuje przegląd roweru, gwarancja, części klienta, e-rowery, transport. Serwis rowerowy Komprachcice.",
    schema: [faqSchema(faqOgolne)],
    tresc: `<section class="sekcja"><div class="wrap">${faqHtml(faqOgolne)}</div></section>`,
  }));

  // ---------- Prywatność ----------
  s.push(prosta({
    sciezka: "/prywatnosc/", nazwa: "Polityka prywatności",
    h1: "Polityka prywatności i ochrona danych",
    wstep: "Jak chronimy Twoje dane, jak długo je przechowujemy i jak wypisać się z przypomnień.",
    tytul: "Polityka prywatności i RODO | Warsztat Komprachcice",
    opis: "Polityka prywatności Warsztatu Komprachcice (Warsztat Partner sp. z o.o.): jakie dane zbieramy, po co, jak długo je przechowujemy i jak się wypisać.",
    tresc: `
<section class="sekcja"><div class="wrap tresc">
  <h2>1. Kto jest administratorem danych</h2>
  <p>Administratorem Twoich danych jest ${firma.spolka.nazwa}, ${firma.spolka.adres}, KRS ${firma.spolka.krs}, NIP ${firma.spolka.nip} („Warsztat Komprachcice”). Kontakt w sprawie danych: <a href="mailto:${firma.email}">${firma.email}</a>, tel. ${firma.telefon}.</p>
  <h2>2. Jakie dane zbieramy</h2>
  <ul>
    <li>Imię i numer telefonu – przy przyjęciu roweru do serwisu, zamówieniu części lub transportu.</li>
    <li>Opcjonalnie: adres (przy odbiorze roweru), adres e-mail, dane do faktury, opis roweru i naprawy.</li>
    <li>Treść wiadomości, jeśli piszesz do nas przez WhatsApp, SMS lub e-mail.</li>
  </ul>
  <h2>3. Po co i na jakiej podstawie</h2>
  <ul>
    <li>Realizacja zlecenia serwisowego, naprawy, zamówienia części, transportu: kontakt telefoniczny i SMS w sprawie wyceny, terminu, gotowości roweru (art. 6 ust. 1 lit. b RODO – umowa).</li>
    <li>Wystawianie paragonów i faktur, przechowywanie dokumentów księgowych (art. 6 ust. 1 lit. c RODO – obowiązek prawny).</li>
    <li>Obsługa reklamacji i gwarancji, dochodzenie roszczeń (art. 6 ust. 1 lit. f RODO – prawnie uzasadniony interes).</li>
    <li>Przypomnienie SMS raz w roku o przeglądzie roweru – tylko jeśli wyraziłeś na to zgodę (art. 6 ust. 1 lit. a RODO oraz przepisy o komunikacji elektronicznej). Zgodę możesz wycofać w każdej chwili.</li>
  </ul>
  <h2>4. Jak długo przechowujemy dane</h2>
  <ul>
    <li>Dane kontaktowe w naszej bazie klientów: do 2 lat od ostatniego kontaktu z nami, potem je usuwamy.</li>
    <li>Możesz poprosić o usunięcie z bazy w każdej chwili.</li>
    <li>Dokumenty księgowe (paragony, faktury): przez okres wymagany przepisami podatkowymi.</li>
  </ul>
  <h2>5. Komu przekazujemy dane</h2>
  <p>Tylko tym, którzy pomagają nam prowadzić serwis: biuro księgowe oraz dostawcy narzędzi – baza klientów (Notion), system sprzedaży i magazynu (Base), poczta e-mail, WhatsApp, operator SMS, hosting strony. Nie sprzedajemy danych.</p>
  <h2>6. Twoje prawa</h2>
  <p>Masz prawo do dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, sprzeciwu, przeniesienia danych i wycofania zgody. Możesz złożyć skargę do Prezesa UODO (ul. Stawki 2, 00-193 Warszawa).</p>
  <h2 id="wypis">7. Jak wypisać się z przypomnień</h2>
  <p>Odpisz „STOP” na SMS z przypomnieniem albo napisz na <a href="mailto:${firma.email}?subject=Wypis%20z%20przypomnie%C5%84">${firma.email}</a> i podaj numer telefonu. Usuniemy go z listy przypomnień.</p>
  <h2>8. Strona internetowa</h2>
  <p>Strona nie wymaga podawania danych i nie zapisuje ciasteczek. Mapa Google na stronie kontaktu wczytuje się dopiero po kliknięciu – wtedy obowiązuje polityka prywatności Google. Kliknięcie WhatsApp otwiera aplikację firmy Meta – obowiązuje wtedy także polityka prywatności WhatsApp.</p>
</div></section>`,
  }));

  // ---------- 404 ----------
  s.push({
    sciezka: "/404/",
    html: strona({
      sciezka: "/404/", tytul: "Nie ma takiej strony | Warsztat Komprachcice", opis: "Nie ma takiej strony.",
      tresc: `${naglowekStrony({ okruszki: [], h1: "Nie ma takiej strony", wstep: "Adres mógł się zmienić. Zacznij od <a href=\"/\">strony głównej</a> albo <a href=\"/cennik/\">cennika</a> – albo napisz do nas.", miejsce: "404" })}`,
    }),
  });

  return s;
}
