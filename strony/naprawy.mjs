// Wpisy „z warsztatu” pisane przez agenta Janek (opis: agent/SPECYFIKACJA.md).
// Każdy wpis to plik dane/naprawy/<adres>.json, a ten szablon robi z niego stronę /poradniki/<adres>/.
// Janek zmienia tylko pliki JSON i zdjęcia w src/img/naprawy/ – wygląd i budowa są tutaj.
// Ceny: tylko nazwy pozycji z dane/cennik.mjs; kwotę szablon bierze z cennika.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { strona, naglowekStrony, ctaPas, faqHtml, faqSchema, esc } from "../lib/layout.mjs";
import { firma } from "../dane/firma.mjs";
import { pozycje } from "../dane/cennik.mjs";

const KATALOG = new URL("../dane/naprawy/", import.meta.url);
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const AUTOR = { imie: "Szymon", rola: "mechanik w Warsztacie Komprachcice" };

export const cenaZCennika = (nazwa) => pozycje.find(([, n]) => n === nazwa)?.[2];

// Lista błędów wpisu (pusta = dobry). `zdjeciaGotowe` = zdjęcia muszą być już plikami na stronie.
export function sprawdzWpis(w, { zdjeciaGotowe = true, plik = null } = {}) {
  const b = [];
  const napis = (k, min = 1, max = 10000) => {
    if (typeof w[k] !== "string" || w[k].trim().length < min) b.push(`pole „${k}” jest puste albo za krótkie`);
    else if (w[k].length > max) b.push(`pole „${k}” jest za długie (${w[k].length} > ${max} znaków)`);
  };
  const lista = (k, min, max, wymagane = false) => {
    if (w[k] === undefined && !wymagane) return;
    if (!Array.isArray(w[k])) return b.push(`pole „${k}” musi być listą`);
    if (w[k].length < min || w[k].length > max) b.push(`pole „${k}” ma ${w[k].length} elementów (dozwolone ${min}–${max})`);
  };
  if (typeof w !== "object" || !w) return ["wpis nie jest obiektem JSON"];
  if (!SLUG.test(w.slug || "") || w.slug.length > 80) b.push("zły adres (slug): tylko małe litery bez polskich znaków, cyfry i myślniki");
  if (plik && `${w.slug}.json` !== plik) b.push(`slug „${w.slug}” nie pasuje do nazwy pliku ${plik}`);
  napis("fraza", 5, 120);
  napis("h1", 10, 120);
  napis("tytul", 10, 70);
  napis("opis", 50, 170);
  napis("odpowiedz", 40, 600);
  lista("objaw", 1, 6);
  lista("przyczyna", 1, 6);
  lista("kroki", 1, 15, true);
  lista("narzedzia", 1, 15);
  lista("czesci", 1, 15);
  lista("uwagi", 1, 6, true);
  lista("ceny", 1, 8);
  lista("faq", 0, 3);
  lista("linki", 2, 4, true);
  lista("zdjecia", 1, 12, true);
  for (const k of ["objaw", "przyczyna", "kroki", "narzedzia", "czesci", "uwagi"]) {
    if (Array.isArray(w[k]) && w[k].some((x) => typeof x !== "string" || !x.trim())) b.push(`pole „${k}” ma pusty element`);
  }
  for (const c of w.ceny || []) if (!cenaZCennika(c)) b.push(`pozycji „${c}” nie ma w dane/cennik.mjs`);
  for (const f of w.faq || []) if (!Array.isArray(f) || f.length !== 2 || !f[0] || !f[1]) b.push("FAQ: każdy element to [pytanie, odpowiedź]");
  for (const l of w.linki || []) {
    if (!Array.isArray(l) || l.length !== 2 || !/^\/[^\s]*$/.test(l[0] || "") || !l[1]) b.push(`zły link wewnętrzny: ${JSON.stringify(l)}`);
    else if (l[0] === `/poradniki/${w.slug}/`) b.push("wpis nie może linkować do samego siebie");
  }
  for (const z of w.zdjecia || []) {
    if (!z || typeof z.alt !== "string" || z.alt.trim().length < 15) b.push("każde zdjęcie potrzebuje opisowego tekstu alternatywnego (alt)");
    if (zdjeciaGotowe) {
      if (!z.plik || !Number.isInteger(z.szer) || !Number.isInteger(z.wys) || !Number.isInteger(z.szerMala)) b.push(`zdjęcie bez pliku na stronie: ${JSON.stringify(z)}`);
    } else if (!z.plik && !z.id) b.push(`zdjęcie bez „id” ani „plik”: ${JSON.stringify(z)}`);
  }
  if (w.naglowki !== undefined && (typeof w.naglowki !== "object" || Object.values(w.naglowki).some((x) => typeof x !== "string"))) b.push("pole „naglowki” musi mieć same napisy");
  if (zdjeciaGotowe && !DATA.test(w.dataPublikacji || "")) b.push("brak daty publikacji");
  if (w.dataZmiany !== undefined && !DATA.test(w.dataZmiany)) b.push("zła data zmiany");
  return b;
}

export function wczytajWpisy() {
  if (!existsSync(KATALOG)) return [];
  return readdirSync(KATALOG).filter((f) => f.endsWith(".json")).map((f) => {
    const w = JSON.parse(readFileSync(new URL(f, KATALOG), "utf8"));
    const bledy = sprawdzWpis(w, { plik: f });
    if (bledy.length) throw new Error(`dane/naprawy/${f}: ${bledy.join("; ")}`);
    return w;
  }).sort((a, b) => (b.dataPublikacji.localeCompare(a.dataPublikacji)) || a.slug.localeCompare(b.slug));
}

const dataPL = (d) => new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T12:00:00Z`));

function zdjecieHtml(z, { lazy = true, sizes = "(min-width: 52rem) 55vw, 100vw" } = {}) {
  const src = `/img/${z.plik}`;
  return `<img class="foto" src="${src}-1280.webp" srcset="${src}-640.webp ${z.szerMala}w, ${src}-1280.webp ${z.szer}w" sizes="${sizes}" width="${z.szer}" height="${z.wys}" alt="${esc(z.alt)}"${lazy ? ' loading="lazy" decoding="async"' : ""}>`;
}

const akapity = (xs) => xs.map((x) => `<p>${esc(x)}</p>`).join("");
const punkty = (xs, cls = "") => `<${cls ? `ol class="${cls}"` : "ul"}>${xs.map((x) => `<li>${esc(x)}</li>`).join("")}</${cls ? "ol" : "ul"}>`;

function wpisHtml(w) {
  const sciezka = `/poradniki/${w.slug}/`;
  const okruszki = [["/poradniki/", "Poradniki"], [sciezka, w.h1]];
  const n = w.naglowki || {};
  const [glowne, ...reszta] = w.zdjecia;
  const sekcja = (klucz, domyslny, html) => (html ? `<h2>${esc(n[klucz] || domyslny)}</h2>${html}` : "");
  const tresc = `
${naglowekStrony({ okruszki, h1: esc(w.h1), wstep: esc(w.odpowiedz), miejsce: sciezka })}
<section class="sekcja"><div class="wrap dwie dwie--szeroka">
  <article class="tresc">
    <p class="drobny">Napisał ${AUTOR.imie}, ${AUTOR.rola} · <time datetime="${w.dataPublikacji}">${dataPL(w.dataPublikacji)}</time>${w.dataZmiany && w.dataZmiany !== w.dataPublikacji ? ` · zaktualizowano <time datetime="${w.dataZmiany}">${dataPL(w.dataZmiany)}</time>` : ""}</p>
    ${zdjecieHtml(glowne, { lazy: false })}
    ${sekcja("objaw", "Jak to wyglądało", w.objaw?.length ? akapity(w.objaw) : "")}
    ${sekcja("przyczyna", "Przyczyna", w.przyczyna?.length ? akapity(w.przyczyna) : "")}
    ${sekcja("kroki", "Co zrobiliśmy", punkty(w.kroki, "kroki"))}
    ${w.narzedzia?.length || w.czesci?.length ? `<h2>${esc(n.narzedzia || "Narzędzia i części")}</h2>
    ${w.narzedzia?.length ? `<p><strong>Narzędzia:</strong></p>${punkty(w.narzedzia)}` : ""}
    ${w.czesci?.length ? `<p><strong>Części:</strong></p>${punkty(w.czesci)}` : ""}` : ""}
    <div class="ramka"><h2 style="margin-top:0">${esc(n.uwagi || "Uwagi warsztatu")}</h2>${akapity(w.uwagi)}</div>
  </article>
  <div>
    ${w.ceny?.length ? `<h2 style="margin-top:0">${esc(n.ceny || "Ile to kosztuje u nas")}</h2>
    <table class="tabela"><tbody>${w.ceny.map((c) => `<tr><td>${esc(c)}</td><td><strong>${cenaZCennika(c)} zł</strong></td></tr>`).join("")}</tbody></table>
    <p class="drobny">Ceny brutto za robociznę według <a href="/cennik/">cennika</a>. Części liczymy osobno – zanim cokolwiek wymienimy, dzwonimy z ceną.</p>` : ""}
    <h2${w.ceny?.length ? "" : ' style="margin-top:0"'}>Zobacz też</h2>
    <ul class="linki-uslug">${w.linki.map(([u, t]) => `<li><a href="${esc(u)}">${esc(t)}</a></li>`).join("")}</ul>
  </div>
</div></section>
${reszta.length ? `<section class="sekcja sekcja--jasna"><div class="wrap"><h2>Zdjęcia z naprawy</h2><div class="galeria">${reszta.map((z) => `<figure>${zdjecieHtml(z, { sizes: "(min-width: 52rem) 33vw, 100vw" })}</figure>`).join("")}</div></div></section>` : ""}
${w.faq?.length ? `<section class="sekcja"><div class="wrap"><h2>Pytania</h2>${faqHtml(w.faq.map(([q, a]) => [esc(q), esc(a)]))}</div></section>` : ""}
${ctaPas(sciezka, "Masz podobny problem z rowerem?", `Przywieź rower do Komprachcic – ${firma.ulica}, pon.–pt. 9–16, sob. 9–13. Przyjmujemy bez umawiania.`)}`;

  const schema = [{
    "@context": "https://schema.org", "@type": "Article", headline: w.h1, description: w.opis, inLanguage: "pl",
    image: w.zdjecia.map((z) => `${firma.domena}/img/${z.plik}-1280.webp`),
    datePublished: w.dataPublikacji, dateModified: w.dataZmiany || w.dataPublikacji,
    author: { "@type": "Person", name: AUTOR.imie, jobTitle: "Mechanik rowerowy", worksFor: { "@id": `${firma.domena}/#firma` }, url: `${firma.domena}/o-nas/` },
    publisher: { "@id": `${firma.domena}/#firma` }, mainEntityOfPage: `${firma.domena}${sciezka}`,
  }];
  if (w.faq?.length) schema.push(faqSchema(w.faq));
  return {
    sciezka, tytulKrotki: w.h1,
    html: strona({ sciezka, tytul: `${w.tytul} | Warsztat Komprachcice`, opis: w.opis, tresc, schema, okruszki, foto: w.zdjecia[0].plik }),
  };
}

export function wszystkie() {
  return wczytajWpisy().map(wpisHtml);
}

// Blok „Z warsztatu” na liście poradników.
export function blokZWarsztatu() {
  const wpisy = wczytajWpisy();
  if (!wpisy.length) return "";
  return `<section class="sekcja"><div class="wrap">
  <h2>Z warsztatu</h2>
  <p class="wstep">Naprawy, które zrobiliśmy ostatnio: co się działo z rowerem, co zrobiliśmy i ile to kosztowało.</p>
  <ul class="metki">
    ${wpisy.map((w) => `<li class="metka"><h3><a href="/poradniki/${w.slug}/">${esc(w.h1)}</a></h3><p>${esc(w.odpowiedz.split(". ")[0].replace(/\.$/, ""))}.</p><p class="drobny"><time datetime="${w.dataPublikacji}">${dataPL(w.dataPublikacji)}</time></p></li>`).join("\n    ")}
  </ul>
</div></section>`;
}
