// Poradniki „problem → rozwiązanie”.
// Źródło: Notion, „Strony »problem → rozwiązanie« (szkice)”, 23.10.2026. Do weryfikacji przez Szymona i Tomka.
// Układ każdej strony: krótka odpowiedź (cytują ją wyszukiwarki i AI), przyczyny, co sprawdzić samemu,
// kiedy do serwisu, ceny, pytania, przycisk kontaktu.
import { strona, naglowekStrony, ctaPas, faqHtml, faqSchema } from "../lib/layout.mjs";
import { firma } from "../dane/firma.mjs";

export const poradniki = [
  {
    slug: "przerzutka-przeskakuje",
    h1: "Przerzutka przeskakuje albo biegi nie wchodzą",
    krotko: "Przerzutka przeskakuje albo biegi nie wchodzą",
    opis: "Dlaczego przerzutka przeskakuje i biegi nie wchodzą: linka, hak, zużyty napęd. Regulacja przerzutki 29 zł w Komprachcicach, 10 minut od Opola.",
    odpowiedz: "Najczęściej winna jest rozciągnięta albo brudna linka, krzywy hak przerzutki lub zużyty napęd. Regulacja przerzutki trwa kilkanaście minut i kosztuje u nas 29 zł; z wymianą linki 39 zł.",
    przyczyny: [
      "linka się rozciągnęła – zwłaszcza w nowym rowerze po pierwszych tygodniach jazdy,",
      "brud i rdza w pancerzu, przez co linka chodzi ciężko,",
      "hak przerzutki wygięty po przewróceniu roweru,",
      "zużyty łańcuch lub kaseta – wtedy sama regulacja nie pomoże,",
      "uszkodzona manetka.",
    ],
    sam: [
      "Czy rower nie był ostatnio przewrócony na prawą stronę – to typowa przyczyna krzywego haka.",
      "Pokrętło regulacyjne na manetce lub przerzutce: pół obrotu w lewo, gdy łańcuch nie chce wejść na większą zębatkę.",
      "Czy łańcuch jest czysty i nasmarowany.",
    ],
    kiedy: "Gdy regulacja pokrętłem nie pomaga, przerzutka uderza w szprychy albo hak jest krzywy. Nie jeźdź wtedy na największej zębatce z tyłu – przerzutka może wkręcić się w koło.",
    ceny: [["Regulacja przerzutki przód lub tył", "29 zł"], ["Regulacja z wymianą linki", "39 zł"], ["Regulacja z wymianą manetki", "49 zł"], ["Wymiana przerzutki z regulacją", "69 zł"]],
    faq: [["Czy regulacja jest na poczekaniu?", "Często tak. Napisz na WhatsApp, umówimy godzinę."], ["Nowy rower, a biegi już przeskakują?", "To normalne – linki się docierają i trochę wyciągają. Zwykle wystarczy regulacja."]],
    usluga: ["/naprawa-napedu/", "Naprawa napędu i przerzutek"],
  },
  {
    slug: "hamulce-piszcza",
    h1: "Hamulce piszczą albo słabo hamują",
    opis: "Dlaczego hamulce rowerowe piszczą i słabo hamują: klocki, tarcza, linka, powietrze w hydraulice. Regulacja hamulca od 35 zł, Komprachcice koło Opola.",
    odpowiedz: "Piszczenie to zwykle zabrudzona lub zatłuszczona tarcza albo zużyte klocki. Słabe hamowanie – zużyte klocki, rozciągnięta linka albo powietrze w hamulcu hydraulicznym. Regulacja hamulca kosztuje u nas 35 zł, z wymianą klocków 35–50 zł.",
    przyczyny: [
      "zużyte klocki – metal trze o metal i słychać zgrzyt,",
      "tłuszcz na tarczy, np. po smarowaniu łańcucha sprayem,",
      "krzywa tarcza – rytmiczne ocieranie przy każdym obrocie koła,",
      "rozciągnięta lub zardzewiała linka w hamulcach mechanicznych,",
      "powietrze lub stary płyn w hamulcu hydraulicznym – klamka jest „miękka” i dochodzi do kierownicy.",
    ],
    sam: [
      "Grubość klocków: w hamulcach V-brake sprawdź, czy widać jeszcze rowki; w tarczowych około 1 mm okładziny oznacza koniec.",
      "Czy klamka nie dochodzi do kierownicy.",
      "Nie czyść tarczy smarami, olejem ani płynem do szyb.",
    ],
    kiedy: "Od razu, gdy klamka dochodzi do kierownicy, hamulec zgrzyta metalem albo rower nie zatrzymuje się pewnie. Hamulce to bezpieczeństwo – tu nie warto zwlekać.",
    ceny: [["Regulacja hamulca", "35 zł"], ["Regulacja z wymianą klocków", "35–50 zł"], ["Hamulec tarczowy z odtłuszczeniem tarczy", "35–50 zł"], ["Prostowanie tarczy", "25 zł"], ["Regulacja z wymianą linki i pancerza", "40–60 zł"], ["Odpowietrzenie hamulca hydraulicznego", "60 zł"], ["Odpowietrzenie z wymianą płynu", "90 zł"]],
    faq: [["Hamulce piszczą tylko na mokro?", "Często to normalne. Jeśli piszczą też na sucho, tarcza zwykle wymaga odtłuszczenia."], ["Jak często wymieniać płyn hamulcowy?", "Zwykle raz na rok lub dwa, zależnie od zaleceń producenta hamulców."]],
    usluga: ["/cennik/#hamulce", "Cennik: hamulce"],
  },
  {
    slug: "kiedy-wymienic-lancuch",
    h1: "Łańcuch spada, zgrzyta albo przeskakuje – kiedy wymienić łańcuch",
    opis: "Kiedy wymienić łańcuch rowerowy i kasetę. Łańcuch przeskakuje, spada, zgrzyta. Wymiana łańcucha 39 zł, kasety 49 zł – Komprachcice, 10 minut od Opola.",
    odpowiedz: "Łańcuch rozciąga się z każdym kilometrem. Wymieniony na czas kosztuje u nas 39 zł robocizny. Zaniedbany zużywa kasetę i zębatki korby – wtedy wymiana całego napędu kosztuje kilka razy więcej.",
    przyczyny: [
      "rozciągnięty łańcuch – przeskakuje pod naciskiem, zwłaszcza pod górę,",
      "brak smaru albo rdza po zimie,",
      "zużyta kaseta lub zębatki korby – zęby mają kształt „płetwy rekina”,",
      "źle wyregulowana przerzutka.",
    ],
    sam: [
      "Czy łańcuch jest czysty i nasmarowany. Smar nakładaj na łańcuch, nie na tarcze hamulców.",
      "Czy przy przedniej zębatce łańcuch da się wyraźnie odciągnąć od zębów – to znak zużycia.",
    ],
    kiedy: "Gdy łańcuch przeskakuje pod naciskiem albo spada. Sprawdzimy miernikiem zużycia, czy wystarczy sam łańcuch.",
    ceny: [["Wymiana łańcucha z oliwieniem", "39 zł"], ["Wymiana kasety lub wolnobiegu", "49 zł"], ["Wymiana mechanizmu korbowego", "59 zł"], ["Wymiana całego napędu", "150 zł"], ["Czyszczenie i smarowanie napędu", "50 zł"]],
    faq: [["Co ile kilometrów wymienić łańcuch?", "To zależy od sposobu jazdy i dbania o napęd, dlatego mierzymy zużycie zamiast zgadywać. Pomiar zrobimy na miejscu w kilka sekund."], ["Czy trzeba od razu wymieniać kasetę?", "Nie zawsze. Jeśli łańcuch wymienisz w porę, kaseta często zostaje."]],
    usluga: ["/naprawa-napedu/", "Naprawa napędu"],
  },
  {
    slug: "kolo-bije",
    h1: "Koło bije na boki („ósemka”) – centrowanie kół",
    opis: "Koło roweru bije na boki, ociera o klocki, pękła szprycha? Centrowanie koła 60 zł, samo koło 50 zł. Serwis rowerowy Komprachcice koło Opola.",
    odpowiedz: "Gdy obrócone koło „faluje” i ociera o klocki lub ramę, trzeba je wycentrować. Centrowanie koła kosztuje u nas 60 zł, a samo koło bez roweru 50 zł.",
    przyczyny: [
      "uderzenie w krawężnik lub dziurę,",
      "poluzowane albo pęknięte szprychy,",
      "ciężki bagaż, fotelik dziecięcy, przewożenie zakupów,",
      "zużyta lub pęknięta obręcz.",
    ],
    sam: [
      "Zakręć kołem i patrz na szczelinę między obręczą a klockami.",
      "Ściśnij szprychy parami – luźną albo pękniętą od razu poczujesz.",
    ],
    kiedy: "Gdy koło ociera, pękła szprycha albo słychać „cykanie”. Jazda na kole z pękniętą szprychą szybko psuje kolejne.",
    ceny: [["Centrowanie koła", "60 zł"], ["Centrowanie koła dostarczonego bez roweru", "50 zł"], ["Dopłata za wymianę szprychy", "5 zł"], ["Przeplecenie koła", "150 zł"], ["Zaplatanie nowego koła", "120 zł"]],
    faq: [["Mogę przywieźć samo koło?", "Tak, wtedy centrowanie kosztuje 50 zł."], ["Koło od roweru elektrycznego też?", "Tak, także koło z silnikiem w piaście."]],
    usluga: ["/centrowanie-kol/", "Centrowanie kół"],
  },
  {
    slug: "czeste-przebicia-detki",
    h1: "Ciągle łapię gumę – co robić?",
    opis: "Dlaczego ciągle łapiesz gumę: ciśnienie, coś w oponie, taśma na obręczy. Wymiana dętki lub opony 40 zł, dętki na miejscu. Komprachcice koło Opola.",
    odpowiedz: "Wymiana dętki lub opony kosztuje u nas 40 zł robocizny (samo koło bez roweru 30 zł); dętki i opony mamy na miejscu. Jeśli guma schodzi co chwilę, przyczyna zwykle siedzi w oponie albo w obręczy – sprawdzamy to przy wymianie.",
    przyczyny: [
      "zbyt niskie ciśnienie – tzw. przebicie „wężowe”, dwie dziurki obok siebie,",
      "szkło lub drut wbite w oponę, które przebija każdą nową dętkę,",
      "zużyta, popękana opona,",
      "przesunięta taśma w obręczy – końcówka szprychy przeciera dętkę od środka.",
    ],
    sam: [
      "Ciśnienie: zalecany zakres jest wypisany na boku opony.",
      "Ostrożnie przejedź palcami po wewnętrznej stronie opony – szukasz ostrego elementu.",
    ],
    kiedy: "Gdy przebicia się powtarzają, opona jest popękana albo masz tylne koło z zamkniętą osłoną łańcucha lub z biegami w piaście.",
    ceny: [["Wymiana opony lub dętki – przód", "40 zł"], ["Wymiana opony lub dętki – tył", "40 zł"], ["Tył w rowerze z pełną osłoną łańcucha", "60–100 zł"], ["Koło dostarczone bez roweru", "30 zł"], ["Montaż systemu bezdętkowego", "79 zł"]],
    faq: [["Zrobicie to od ręki?", "Często tak. Napisz na WhatsApp przed przyjazdem."], ["Czy opony bezdętkowe mają sens?", "W rowerach górskich i gravelowych często tak. W miejskich zwykle wystarczy dobra opona z wkładką antyprzebiciową."]],
    usluga: ["/wymiana-detki/", "Wymiana dętki i opony"],
  },
  {
    slug: "jak-czesto-przeglad-roweru",
    h1: "Jak często robić przegląd roweru?",
    opis: "Jak często robić przegląd roweru i co obejmuje. Przegląd 279 zł, konserwacja zimowa 249 zł w listopadzie i grudniu. Serwis rowerowy Komprachcice koło Opola.",
    odpowiedz: "Przy zwykłej jeździe wystarczy przegląd raz w roku, najlepiej przed sezonem albo jesienią. Przy codziennych dojazdach do pracy lub jeździe w terenie – dwa razy w roku. Pełny przegląd kosztuje u nas 279 zł, a w listopadzie i grudniu konserwacja zimowa 249 zł.",
    przyczynyTytul: "Kiedy przegląd jest potrzebny wcześniej",
    przyczyny: [
      "rower długo stał w piwnicy lub na balkonie,",
      "przeskakują biegi, piszczą hamulce albo coś stuka,",
      "nowy rower po pierwszych tygodniach jazdy – linki się docierają,",
      "przed dłuższym wyjazdem.",
    ],
    samTytul: "Co obejmuje nasz przegląd",
    sam: [
      "mycie roweru i napędu,",
      "regulacja hamulców i przerzutek,",
      "centrowanie kół,",
      "kontrola i regulacja łożysk: stery, piasty, suport,",
      "smarowanie, dokręcenie połączeń, kontrola oświetlenia. Części wymieniamy dopiero po Twojej akceptacji.",
    ],
    kiedyTytul: "Dlaczego zimą się opłaca",
    kiedy: "Wiosną serwisy mają kolejki. W listopadzie i grudniu robimy przegląd taniej (249 zł) i szybciej – poza sezonem rower odbierasz zwykle po 2 dniach.",
    ceny: [["Przegląd roweru", "279 zł"], ["Konserwacja zimowa (listopad–grudzień)", "249 zł"], ["Przegląd roweru dziecięcego do 20″", "199 zł"], ["Przegląd zerowy roweru elektrycznego", "150 zł"]],
    faq: [["Ile trwa przegląd?", "Poza sezonem rower odbierasz zwykle po 2 dniach, w sezonie po około tygodniu. Jeśli umówisz termin, nie czekasz w kolejce."], ["Możecie odebrać rower?", "Tak. W strefie Skorogoszcz – Opole – Komprachcice transport przy przeglądzie jest gratis. Zadzwoń, powiemy, kiedy jedziemy w Twoją stronę."]],
    usluga: ["/przeglad-roweru/", "Przegląd roweru"],
  },
  {
    slug: "rower-na-zime",
    h1: "Jak przygotować i przechować rower na zimę",
    opis: "Jak przechowywać rower zimą: mycie, smarowanie, suche miejsce, akumulator e-roweru. Konserwacja zimowa 249 zł w Komprachcicach, 10 minut od Opola.",
    odpowiedz: "Przed zimą rower trzeba umyć, zabezpieczyć przed wilgocią i postawić w suchym miejscu. W listopadzie i grudniu robimy konserwację zimową za 249 zł – pełne sprawdzenie roweru z naciskiem na ochronę śrub, połączeń i metalu przed korozją.",
    przyczynyTytul: "Co możesz zrobić sam",
    przyczyny: [
      "umyj rower z błota i soli – bez myjki ciśnieniowej przy łożyskach,",
      "nasmaruj łańcuch,",
      "dopompuj opony i co jakiś czas je sprawdzaj,",
      "trzymaj rower w suchym miejscu – wilgotna piwnica i balkon pod chmurką sprzyjają rdzy,",
      "akumulator roweru elektrycznego przechowuj w domu, w temperaturze pokojowej, zgodnie z instrukcją producenta.",
    ],
    samTytul: "Jeździsz zimą?",
    sam: [
      "Sól i błoto niszczą napęd szybciej niż cały sezon letni – myj i smaruj napęd co 1–2 tygodnie.",
      "Sprawdź oświetlenie: zimą szybko robi się ciemno.",
    ],
    kiedyTytul: "Konserwacja zimowa u nas",
    kiedy: "Robimy pełne sprawdzenie roweru jak przy przeglądzie, z dodatkowym naciskiem na zabezpieczenie przed wilgocią na czas przechowywania. Wiosną wyjeżdżasz od razu, bez kolejki.",
    ceny: [["Konserwacja zimowa (listopad–grudzień)", "249 zł"], ["Czyszczenie i smarowanie napędu", "50 zł"]],
    faq: [["Czy konserwacja zimowa to to samo co przegląd?", "Zakres sprawdzenia jest podobny, ale kładziemy nacisk na zabezpieczenie roweru przed wilgocią i korozją na czas przechowywania."]],
    usluga: ["/konserwacja-zimowa/", "Konserwacja zimowa"],
  },
  {
    slug: "rower-skrzypi",
    h1: "Rower skrzypi, stuka albo ciężko chodzi",
    opis: "Rower skrzypi przy pedałowaniu, stuka suport albo ciężko jedzie? Najczęstsze przyczyny i ceny: kasowanie luzu suportu 69 zł. Komprachcice koło Opola.",
    odpowiedz: "Skrzypienie przy pedałowaniu to najczęściej suport, pedały albo luz w korbie. Ciężkie toczenie – zbyt niskie ciśnienie w oponach, ocierający hamulec lub zużyte łożyska piast. Kasowanie luzu suportu ze smarowaniem kosztuje u nas 69 zł.",
    przyczyny: [
      "suport: luz albo brak smaru,",
      "pedały: poluzowane albo zużyte łożyska,",
      "sztyca i siodełko: suche połączenia,",
      "piasty: zużyte lub suche łożyska,",
      "ocierające klocki hamulcowe, za niskie ciśnienie w oponach.",
    ],
    sam: [
      "Ciśnienie w oponach.",
      "Czy koło po zakręceniu kręci się swobodnie, bez ocierania.",
      "Czy korba nie ma luzu na boki – złap ją i pokiwaj.",
    ],
    kiedy: "Gdy korba ma luz, coś stuka przy każdym obrocie albo koło kręci się z oporem. Luz na suporcie szybko niszczy gwint w ramie.",
    ceny: [["Kasowanie luzu suportu ze smarowaniem łożysk", "69 zł"], ["Wymiana suportu", "69 zł"], ["Czyszczenie i smarowanie łożysk w piaście", "30–50 zł"], ["Montaż lub wymiana pedałów", "20 zł"]],
    faq: [["Skrzypi tylko przy mocnym pedałowaniu?", "Typowo to suport albo pedały. Zdiagnozujemy to szybko na miejscu."]],
    usluga: ["/przeglad-roweru/", "Przegląd roweru"],
  },
  {
    slug: "luz-na-kierownicy",
    h1: "Luz na kierownicy, stuki przy hamowaniu",
    opis: "Kierownica stuka przy hamowaniu przednim hamulcem? To zwykle luz na sterach. Regulacja sterów 20–25 zł. Serwis rowerowy Komprachcice koło Opola.",
    odpowiedz: "Jeśli przy hamowaniu przednim hamulcem czujesz stukanie w kierownicy, najczęściej są to poluzowane stery. Regulacja sterów kosztuje u nas 20–25 zł.",
    przyczyny: [
      "poluzowane stery, czyli łożyska w główce ramy,",
      "zużyte łożyska sterów – kierownica „przeskakuje” w jednej pozycji,",
      "luz w amortyzatorze albo poluzowany mostek.",
    ],
    sam: ["Zaciśnij przedni hamulec i pokiwaj rowerem przód–tył. Stukanie przy główce ramy oznacza stery do regulacji."],
    kiedy: "Od razu – luz na sterach i poluzowany mostek wpływają na bezpieczeństwo hamowania.",
    ceny: [["Regulacja sterów A-head", "20 zł"], ["Regulacja sterów skręcanych", "25 zł"], ["Wymiana sterów", "80–120 zł"], ["Wymiana mostka", "49 zł"], ["Wymiana widelca lub amortyzatora", "100–150 zł"]],
    faq: [],
    usluga: ["/cennik/#kierownica-i-stery", "Cennik: kierownica i stery"],
  },
  {
    slug: "e-rower-nie-dziala",
    h1: "Rower elektryczny nie działa jak trzeba",
    opis: "E-rower się nie włącza, wspomaganie się wyłącza, spadł zasięg? Naprawiamy rowery elektryczne wszystkich marek. Przegląd zerowy 150 zł. Komprachcice koło Opola.",
    odpowiedz: "Naprawiamy rowery elektryczne wszystkich marek, także mniej znanych producentów. Mechanikę e-roweru – hamulce, napęd, koła – naprawiamy tak samo jak w zwykłym rowerze. Usterki elektryczne sprawdzamy krok po kroku i mówimy wprost, co da się naprawić, a co trzeba wymienić.",
    przyczynyTytul: "Najczęstsze problemy",
    przyczyny: [
      "rower się nie włącza: rozładowany lub źle wpięty akumulator, brudne styki, uszkodzony przewód lub złącze,",
      "silnik wspomaga z przerwami: czujnik prędkości, przesunięty magnes na szprysze, poluzowane złącze,",
      "krótszy zasięg: starzejący się akumulator, niskie ciśnienie w oponach, zimno,",
      "szybsze zużycie napędu i hamulców – e-rower jest cięższy i szybszy.",
    ],
    sam: [
      "Czy akumulator jest dobrze wpięty i naładowany, a styki czyste i suche.",
      "Czy magnes czujnika na szprysze jest na swoim miejscu.",
      "Nie otwieraj akumulatora sam – to niebezpieczne.",
    ],
    kiedyTytul: "Rowery mniej znanych marek",
    kiedy: "Też je naprawiamy. Do części z nich producent nie udostępnia dokumentacji ani części, więc najpierw sprawdzamy rower, potem mówimy, co możemy zrobić i ile to będzie kosztować – decyzja należy do Ciebie. Gdy oryginalnej części nie da się kupić, szukamy zamiennika.",
    ceny: [["Przegląd zerowy roweru elektrycznego", "150 zł"], ["Diagnostyka usterki elektrycznej (wycena naprawy po obejrzeniu)", "200–250 zł"], ["Naprawy mechaniczne", "według cennika"]],
    faq: [["Naprawiacie rowery kupione w markecie lub przez internet?", "Tak."], ["Możecie odebrać ciężki e-rower?", "Tak, w strefie Skorogoszcz – Opole – Komprachcice. Zadzwoń, powiemy, kiedy jedziemy w Twoją stronę."]],
    usluga: ["/naprawa-roweru-elektrycznego/", "Serwis rowerów elektrycznych"],
  },
];

function poradnikHtml(p) {
  const sciezka = `/poradniki/${p.slug}/`;
  const okruszki = [["/poradniki/", "Poradniki"], [sciezka, p.h1]];
  const lista = (xs) => `<ul>${xs.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  const tresc = `
${naglowekStrony({ okruszki, h1: p.h1, wstep: p.odpowiedz, miejsce: sciezka })}
<section class="sekcja"><div class="wrap dwie dwie--szeroka">
  <div class="tresc">
    <h2>${p.przyczynyTytul || "Najczęstsze przyczyny"}</h2>
    ${lista(p.przyczyny)}
    <h2>${p.samTytul || "Co możesz sprawdzić sam"}</h2>
    ${lista(p.sam)}
    <h2>${p.kiedyTytul || "Kiedy przyjechać do serwisu"}</h2>
    <p>${p.kiedy}</p>
  </div>
  <div>
    <h2 style="margin-top:0">Ile to kosztuje u nas</h2>
    <table class="tabela"><tbody>${p.ceny.map(([n, c]) => `<tr><td>${n}</td><td><strong>${c}</strong></td></tr>`).join("")}</tbody></table>
    <p class="drobny">Ceny brutto za robociznę. Części liczymy osobno – zanim cokolwiek wymienimy, dzwonimy z ceną.</p>
    <p><a href="${p.usluga[0]}"><strong>${p.usluga[1]}</strong></a></p>
  </div>
</div></section>
${p.faq.length ? `<section class="sekcja sekcja--jasna"><div class="wrap"><h2>Pytania</h2>${faqHtml(p.faq)}</div></section>` : ""}
${ctaPas(sciezka, "Nie chcesz kombinować sam?", `Przywieź rower do Komprachcic – ${firma.ulica}, pon.–pt. 9–16, sob. 9–13. Przyjmujemy bez umawiania.`)}`;
  const schema = [{
    "@context": "https://schema.org", "@type": "Article", headline: p.h1, description: p.opis,
    inLanguage: "pl", author: { "@id": `${firma.domena}/#firma` }, publisher: { "@id": `${firma.domena}/#firma` },
    mainEntityOfPage: `${firma.domena}${sciezka}`,
  }];
  if (p.faq.length) schema.push(faqSchema(p.faq));
  return { sciezka, tytulKrotki: p.h1, html: strona({ sciezka, tytul: `${p.h1} | Warsztat Komprachcice`, opis: p.opis, tresc, schema, okruszki }) };
}

export function wszystkie() {
  const s = poradniki.map(poradnikHtml);
  s.push({
    sciezka: "/poradniki/", tytulKrotki: "Poradniki",
    html: strona({
      sciezka: "/poradniki/", okruszki: [["/poradniki/", "Poradniki"]],
      tytul: "Poradniki rowerowe: co się psuje i ile kosztuje naprawa | Warsztat Komprachcice",
      opis: "Przerzutka przeskakuje, hamulce piszczą, koło bije, ciągle łapiesz gumę? Krótkie poradniki z przyczynami, tym, co sprawdzisz sam, i cenami naprawy.",
      tresc: `
${naglowekStrony({ okruszki: [["/poradniki/", "Poradniki"]], h1: "Co się dzieje z Twoim rowerem?", wstep: "Najczęstsze problemy, z którymi do nas przyjeżdżacie: przyczyny, co sprawdzisz sam i ile kosztuje naprawa.", miejsce: "poradniki" })}
<section class="sekcja"><div class="wrap">
  <ul class="metki">
    ${poradniki.map((p) => `<li class="metka"><h3><a href="/poradniki/${p.slug}/">${p.h1}</a></h3><p>${p.odpowiedz.split(". ")[0]}.</p></li>`).join("\n    ")}
  </ul>
</div></section>
${ctaPas("poradniki")}`,
    }),
  });
  return s;
}
