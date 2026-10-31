import { firma } from "../dane/firma.mjs";
import { strona, przyciski, btnWa, btnTel, foto } from "../lib/layout.mjs";
import { opinieHtml } from "../dane/opinie.mjs";

const metki = [
  ["/przeglad-roweru/", "Przegląd roweru", "Hamulce, przerzutki, koła, łożyska – sprawdzone i wyregulowane.", "279 zł"],
  ["/wymiana-detki/", "Wymiana dętki lub opony", "Złapałeś gumę? Wymienimy na miejscu, dętki i opony mamy od ręki.", "40 zł"],
  ["/montaz-akcesoriow/", "Akcesoria z montażem", "Koszyk, lampki, błotniki, podpórka, fotelik – dobierzemy i zamontujemy.", "od 20 zł"],
  ["/naprawa-napedu/", "Napęd: łańcuch, kaseta, korba", "Łańcuch spada albo przeskakuje? Wymiana łańcucha z oliwieniem.", "39 zł"],
  ["/centrowanie-kol/", "Centrowanie kół", "Koło bije na boki albo ociera o klocki – wyprostujemy je.", "60 zł"],
  ["/naprawa-roweru-elektrycznego/", "Rowery elektryczne", "Wszystkie marki, także mniej znane. Przegląd zerowy e-roweru.", "150 zł"],
];

export default function glowna() {
  const tresc = `
<section class="hero">
  <picture>
    <source media="(max-width: 40rem)" srcset="/img/sciana-narzedzi-640.webp">
    <img src="/img/sciana-narzedzi-1280.webp" width="1280" height="960" alt="Ściana z narzędziami rowerowymi w Warsztacie Komprachcice" fetchpriority="high">
  </picture>
  <div class="wrap">
    <h1>Serwis rowerowy w&nbsp;Komprachcicach&nbsp;– 10&nbsp;minut od&nbsp;Opola</h1>
    <p class="motto">${firma.motto}</p>
    ${przyciski("hero")}
  </div>
</section>
<div class="atuty"><div class="wrap"><ul>
  <li>Przegląd 279 zł</li><li>Przyjmujemy bez umawiania</li><li>Darmowy parking</li>
</ul></div></div>

<section class="sekcja">
  <div class="wrap">
    <h2>Z czym najczęściej do nas przyjeżdżacie</h2>
    <p class="wstep">Ceny brutto za robociznę. Części liczymy osobno – zanim cokolwiek wymienimy, dzwonimy z ceną.</p>
    <ul class="metki">
      ${metki.map(([u, t, o, c]) => `<li class="metka"><h3><a href="${u}">${t}</a></h3><p>${o}</p><p class="cena">${c}</p></li>`).join("\n      ")}
    </ul>
    <p style="margin-top:2rem"><a href="/cennik/"><strong>Pełny cennik napraw</strong></a> · <a href="/uslugi/">Wszystkie usługi</a></p>
  </div>
</section>

<section class="sekcja sekcja--jasna" id="promocja">
  <div class="wrap promo">
    <div>
      <span class="termin" data-p="termin">Cały rok</span>
      <h2 data-p="tytul">Przegląd roweru 279 zł</h2>
      <p class="wstep" data-p="tekst">Myjemy rower i napęd, regulujemy hamulce i przerzutki, centrujemy koła, sprawdzamy łożyska i wszystkie połączenia. Rower wraca do Ciebie sprawdzony od kierownicy po opony.</p>
      <div class="przyciski"><a class="btn btn--ciemny" data-p="link" href="/przeglad-roweru/">Co obejmuje przegląd</a></div>
      <p data-p="drugi" hidden style="margin-top:1.2rem"></p>
    </div>
    ${foto("rower-na-stojaku", "Rower na stojaku serwisowym w warsztacie", { w: 1280, h: 960 })}
  </div>
</section>

<section class="sekcja">
  <div class="wrap dwie">
    <div>
      <h2>Jak oddać rower do naprawy</h2>
      <ol class="kroki">
        <li><strong>Przywieź rower w godzinach otwarcia.</strong> Nie musisz się umawiać – zawsze ktoś go przyjmie. Jeśli umówisz dzień i godzinę na WhatsApp lub telefonicznie, nie czekasz w kolejce.</li>
        <li><strong>Dzwonimy z wyceną.</strong> Zanim wymienimy jakąkolwiek część, mówimy, ile to będzie kosztować. Decyzja należy do Ciebie.</li>
        <li><strong>Odbierasz sprawny rower.</strong> W sezonie naprawa trwa zwykle około tygodnia, poza sezonem około 2 dni. Na każdą naprawę dajemy 30 dni gwarancji.</li>
      </ol>
      <p class="drobny">Płacisz gotówką, kartą lub BLIKIEM. Wystawiamy faktury.</p>
    </div>
    <div>
      ${foto("naped-przed-po", "Kaseta i łańcuch przed czyszczeniem i po regeneracji napędu", { w: 1024, h: 1280, sizes: "(min-width: 52rem) 40vw, 100vw" })}
      <p class="foto-podpis">Regeneracja napędu: czyszczenie, regulacja i wymiana zużytych części.</p>
    </div>
  </div>
</section>

<section class="sekcja sekcja--jasna">
  <div class="wrap">
    <div class="ocena-naglowek">
      <h2>Co mówią klienci</h2>
      <p class="ocena"><b>${firma.ocenaGoogle.srednia}</b><span>średnia z ${firma.ocenaGoogle.liczba} opinii w Google · <a href="${firma.mapa}">przeczytaj wszystkie</a></span></p>
    </div>
    ${opinieHtml(["jacek", "semper", "agnieszka"])}
  </div>
</section>

<section class="sekcja">
  <div class="wrap dwie">
    <div>
      <h2>Kto naprawia Twój rower</h2>
      <p><strong>Tomek</strong> pracuje w serwisach rowerowych od 2000 roku. <strong>Szymon</strong> naprawiał rowery w serwisach w Niemczech i w Polsce, a sam bardzo dużo jeździ. Obaj jesteśmy zapalonymi mechanikami.</p>
      <p>Części rowerowe są w tym miejscu od około 30 lat.</p>
      <p><a href="/o-nas/">Więcej o nas</a></p>
    </div>
    <div>
      ${foto("warsztat-wnetrze", "Wnętrze Warsztatu Komprachcice ze stojakiem serwisowym i ścianą narzędzi", { w: 1280, h: 960 })}
    </div>
  </div>
</section>

<section class="sekcja sekcja--ciemna">
  <div class="wrap dwie dwie--szeroka">
    <div>
      <h2>Dojazd i godziny</h2>
      <p class="wstep">${firma.ulica}, ${firma.kod} ${firma.miasto} – 10 minut samochodem od Opola. Obok jest duży darmowy parking i punkt kurierski.</p>
      <table class="godziny"><tbody>
        ${firma.godziny.map((g) => `<tr><th scope="row">${g.dni}</th><td>${g.zamkniete ? "zamknięte" : `${g.od}–${g.do}`}</td></tr>`).join("")}
      </tbody></table>
      <div class="przyciski">${btnWa("dojazd")}<a class="btn btn--tel" href="${firma.mapa}">Pokaż na mapie</a></div>
    </div>
    <div>
      <h3>Nie masz jak przywieźć roweru?</h3>
      <p>Jeździmy trasami między Skorogoszczą, Opolem i Komprachcicami. Przy naprawie powyżej 200 zł odbiór i dowóz są w cenie, przy tańszej dopłacasz 25 zł.</p>
      <p><a href="/transport-rowerow/">Jak działa transport</a></p>
    </div>
  </div>
</section>

<section class="sekcja">
  <div class="wrap dwie">
    <div>
      <h2>Części i akcesoria od ręki</h2>
      <p>W sklepie obok warsztatu masz części zamienne i akcesoria w szerokim wyborze. Wyszukujemy też markowe części w dobrych cenach w całej Europie – całą ofertę internetową zobaczysz na Allegro.</p>
      <p><a href="/czesci/">Części</a> · <a href="${firma.allegro}">Nasze aukcje na Allegro</a></p>
    </div>
    <div>
      <h2>Bon na naprawę roweru</h2>
      <p>Prezent dla rowerzysty: bon na 300, 500 lub 800 zł, ważny 12 miesięcy. Obejmuje naprawę razem z potrzebnymi częściami.</p>
      <p><a href="/bon-podarunkowy-rower/">Zobacz bony</a></p>
    </div>
  </div>
</section>`;

  return strona({
    sciezka: "/",
    tytul: "Serwis rowerowy Komprachcice, 10 min od Opola | Warsztat Komprachcice",
    opis: "Serwis rowerowy w Komprachcicach, 10 minut od Opola. Przegląd roweru 279 zł, wymiana dętki, centrowanie kół, napęd, rowery elektryczne. Przyjmujemy bez umawiania.",
    tresc,
    foto: "sciana-narzedzi",
  });
}
