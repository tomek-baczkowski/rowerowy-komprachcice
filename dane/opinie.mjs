// Opinie klientów z profilu Google „Serwis Rowerowy Komprachcice” (wszystkie 5/5).
// Przepisane 31.10.2026 słowo w słowo (poprawione tylko odstępy przy przecinkach); dłuższe opinie skrócone do pełnych zdań. Podpis: imię i inicjał.
// Ocena 4,8 z 25 opinii – stan 31.10.2026 (dane/firma.mjs).
export const opinie = {
  jacek: { tekst: "Szybko i rzeczowo, bez zbędnego przedłużania całej sprawy. Duży plus za organizacje dojazdu, możliwą płatność terminalem a także stały kontakt podczas przeglądu 👍", autor: "Jacek", kiedy: "wrzesień 2026" },
  semper: { tekst: "Fachowa naprawa rowerów małych i dużych, znanych marek i tych „noname”. Szybkość, dobra cena a przede wszystkim rzetelność i profesjonalizm. Bardzo polecam", autor: "Semper Fidelis", kiedy: "kwiecień 2021" },
  agnieszka: { tekst: "Jestem bardzo zadowolona, pan w serwisie zna się na rzeczy. Najlepszy warsztat rowerowy w okolicy. Polecam", autor: "Agnieszka K.", kiedy: "styczeń 2022" },
  dagmara: { tekst: "Świetny serwis, polecam każdemu, właściciel bardzo elastyczny, złota rączka naprawi wszystkie niuanse! Ceny bardzo przystępne ;))", autor: "Dagmara P.", kiedy: "styczeń 2022" },
  krzysztof: { tekst: "Jak zawsze jestem zadowolony z usług. Fachowa obsługa i doradztwo na wysokim poziomie. Rower zabrali, naprawili i oddali pod adres. Lepiej być nie może :)", autor: "Krzysztof S.", kiedy: "styczeń 2022" },
  adam: { tekst: "Super jakość i cena. Szybkie terminy i komfort odbioru roweru z domu i odwiezienia do domu. Już 4 rowery tam robiłem i wszystkie bez żadnych komplikacji.", autor: "Adam O.", kiedy: "listopad 2020" },
  lukasz: { tekst: "Super warsztat. Gorąco polecam. Rower naprawiony od ręki.", autor: "Łukasz M.", kiedy: "sierpień 2021" },
};

export function opinieHtml(klucze) {
  return `<div class="opinie">${klucze.map((k) => {
    const o = opinie[k];
    return `<figure class="opinia"><blockquote><p>${o.tekst}</p></blockquote><figcaption><span class="gwiazdki" aria-label="Ocena 5 na 5">★★★★★</span> ${o.autor} · Google</figcaption></figure>`;
  }).join("")}</div>`;
}
