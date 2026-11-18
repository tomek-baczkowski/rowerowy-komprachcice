// Krok E: sprawdza pracę Claude, dokłada zdjęcia, buduje stronę i publikuje w main. Bez AI.
// Zasady (twarde, niezależne od polecenia dla Claude):
// - zmienione mogą być tylko pliki dane/naprawy/<adres>.json, nic nie może zniknąć,
// - najwyżej 3 nowe wpisy, każdy przechodzi walidację (strony/naprawy.mjs), ceny tylko z cennika,
// - fraza główna nie powtarza się, linki wewnętrzne prowadzą do istniejących stron,
// - node build.mjs przechodzi (także po pobraniu najnowszego main).
// Gdy cokolwiek się nie zgadza: nic nie trafia do main, paczka zostaje w skrzynce, grupa dostaje opis.
// Użycie: BAZA_SHA=<commit sprzed Claude> node agent/publikuj.mjs
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  log, git, ponawiaj, ustawWyjscie, wczytajStan, zapiszStan, wypchnijSkrzynke, doGrupy, dzisiaj, urlWpisu, czytajJson,
  REPO, PRACA, SKRZYNKA,
} from "./lib/wspolne.mjs";
import { naStrone } from "./lib/zdjecia.mjs";
import { sprawdzWpis } from "../strony/naprawy.mjs";

const MAKS_NOWYCH = 3;
const MAKS_PROB = 3;
let wypchnieto = false;
const PLIK_WPISU = /^dane\/naprawy\/([a-z0-9]+(?:-[a-z0-9]+)*)\.json$/;

const stan = wczytajStan();
const zadania = czytajJson(join(PRACA, "zadania.json"));
const BAZA = process.env.BAZA_SHA || git(["rev-parse", "HEAD"]);
const doZadania = new Map([...zadania.nowe.map((z) => [z.id, { ...z, rodzaj: "nowy" }]), ...zadania.poprawki.map((z) => [z.id, { ...z, rodzaj: "poprawka" }])]);

class BladPublikacji extends Error {}
const blad = (opis) => { throw new BladPublikacji(opis); };

function zmienionePliki() {
  // Gdyby Claude coś zacommitował, cofamy commit (zmiany zostają w plikach) i sprawdzamy całość względem bazy.
  if (git(["rev-parse", "HEAD"]) !== BAZA) git(["reset", "-q", "--mixed", BAZA]);
  const sledzone = git(["diff", "--name-status", "--no-renames", BAZA]).split("\n").filter(Boolean).map((l) => {
    const [st, ...p] = l.split("\t");
    return { status: st[0], plik: p.join("\t") };
  });
  const nowe = git(["ls-files", "--others", "--exclude-standard"]).split("\n").filter(Boolean).map((plik) => ({ status: "A", plik }));
  return [...sledzone, ...nowe];
}

function zbuduj() {
  try {
    execFileSync("node", ["build.mjs"], { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    blad(`budowa strony (node build.mjs) się nie udała: ${(e.stderr || e.message).toString().trim().split("\n").slice(0, 4).join(" ")}`);
  }
}

function wolnyNumer(slug) {
  let n = 1;
  while (existsSync(join(REPO, "src/img/naprawy", `${slug}-${n}-1280.webp`))) n++;
  return n;
}

async function przygotujZdjecia(w) {
  const pliki = new Map([...doZadania.values()].flatMap((z) => z.zdjecia.map((x) => [x.id, x.plik])));
  const wynik = [];
  for (const z of w.zdjecia) {
    if (z.plik) { wynik.push(z); continue; }
    const zrodlo = pliki.get(z.id);
    if (!zrodlo) blad(`wpis ${w.slug}: nieznane zdjęcie „${z.id}”`);
    const bufor = readFileSync(join(SKRZYNKA, zrodlo));
    const n = wolnyNumer(w.slug);
    const duze = await naStrone(bufor, 1280, 200);
    const male = await naStrone(bufor, 640, 80);
    mkdirSync(join(REPO, "src/img/naprawy"), { recursive: true });
    writeFileSync(join(REPO, "src/img/naprawy", `${w.slug}-${n}-1280.webp`), duze.bufor);
    writeFileSync(join(REPO, "src/img/naprawy", `${w.slug}-${n}-640.webp`), male.bufor);
    wynik.push({ plik: `naprawy/${w.slug}-${n}`, alt: z.alt.trim(), szer: duze.szer, wys: duze.wys, szerMala: male.szer });
  }
  w.zdjecia = wynik;
}

function sprawdzLinki(wpisy) {
  for (const w of wpisy) {
    for (const [adres] of w.linki) {
      const sciezka = adres.split("#")[0].split("?")[0];
      const plik = join(REPO, "dist", sciezka, sciezka.endsWith("/") ? "index.html" : "");
      if (!existsSync(plik)) blad(`wpis ${w.slug}: link wewnętrzny ${adres} prowadzi do strony, której nie ma`);
    }
  }
}

async function publikuj() {
  const wynik = czytajJson(join(PRACA, "wynik.json"), null);
  if (!wynik || !Array.isArray(wynik.zadania)) blad("Claude nie zostawił pliku agent/praca/wynik.json");
  const wyniki = new Map(wynik.zadania.map((z) => [z.id, z]));
  for (const id of doZadania.keys()) if (!wyniki.has(id)) blad(`Claude nie opisał wyniku zadania ${id}`);

  // 1. Zakres zmian
  const zmiany = zmienionePliki();
  const poza = zmiany.filter((z) => !PLIK_WPISU.test(z.plik));
  if (poza.length) blad(`Claude zmienił pliki spoza wpisów: ${poza.map((z) => z.plik).join(", ")}`);
  const usuniete = zmiany.filter((z) => z.status !== "A" && z.status !== "M");
  if (usuniete.length) blad(`Claude usunął albo przeniósł pliki: ${usuniete.map((z) => z.plik).join(", ")}`);
  const noweWpisy = zmiany.filter((z) => z.status === "A");
  if (noweWpisy.length > MAKS_NOWYCH) blad(`za dużo nowych wpisów naraz (${noweWpisy.length}, najwyżej ${MAKS_NOWYCH})`);

  // 2. Zgodność z zadaniami
  const slugZmiany = new Map(zmiany.map((z) => [z.plik.match(PLIK_WPISU)[1], z.status]));
  const uzyte = new Set();
  for (const [id, z] of doZadania) {
    const w = wyniki.get(id);
    if (w.status === "pominiete") { if (!w.powod) blad(`zadanie ${id} pominięte bez podania powodu`); continue; }
    if (w.status !== "ok") blad(`zadanie ${id}: nieznany status „${w.status}”`);
    const oczekiwany = z.rodzaj === "nowy" ? "A" : "M";
    if (slugZmiany.get(w.slug) !== oczekiwany) blad(`zadanie ${id}: ${z.rodzaj === "nowy" ? "brak nowego pliku" : "brak zmiany w pliku"} dane/naprawy/${w.slug}.json`);
    uzyte.add(w.slug);
  }
  const nadmiarowe = [...slugZmiany.keys()].filter((s) => !uzyte.has(s));
  if (nadmiarowe.length) blad(`zmienione wpisy bez zadania: ${nadmiarowe.join(", ")}`);

  // 3. Walidacja, zdjęcia, daty
  const dzis = dzisiaj();
  const gotowe = [];
  for (const [slug, status] of slugZmiany) {
    const sciezka = join(REPO, "dane/naprawy", `${slug}.json`);
    let w;
    try { w = JSON.parse(readFileSync(sciezka, "utf8")); } catch (e) { blad(`dane/naprawy/${slug}.json nie jest poprawnym JSON-em: ${e.message}`); }
    const bledy = sprawdzWpis(w, { zdjeciaGotowe: false, plik: `${slug}.json` });
    if (bledy.length) blad(`wpis ${slug}: ${bledy.join("; ")}`);
    if (status === "A") {
      w.dataPublikacji = dzis;
      delete w.dataZmiany;
    } else {
      const przed = JSON.parse(git(["show", `${BAZA}:dane/naprawy/${slug}.json`]));
      w.dataPublikacji = przed.dataPublikacji;
      w.dataZmiany = dzis;
    }
    await przygotujZdjecia(w);
    const po = sprawdzWpis(w, { plik: `${slug}.json` });
    if (po.length) blad(`wpis ${slug}: ${po.join("; ")}`);
    writeFileSync(sciezka, JSON.stringify(w, null, 2) + "\n");
    gotowe.push(w);
  }

  // 4. Fraza główna: jedna fraza = jeden wpis
  const frazy = new Map();
  for (const f of git(["ls-files", "--others", "--cached", "--exclude-standard", "dane/naprawy"]).split("\n").filter((f) => f.endsWith(".json"))) {
    const w = JSON.parse(readFileSync(join(REPO, f), "utf8"));
    const klucz = w.fraza.toLowerCase().replace(/\s+/g, " ").trim();
    if (frazy.has(klucz)) blad(`fraza główna „${w.fraza}” powtarza się we wpisach ${frazy.get(klucz)} i ${w.slug}`);
    frazy.set(klucz, w.slug);
  }

  // 5. Budowa i linki
  if (gotowe.length) {
    zbuduj();
    sprawdzLinki(gotowe);
  }

  // 6. Commit i push do main (z pobraniem najnowszego stanu, Tomek może zmieniać stronę równolegle)
  let opublikowano = false;
  if (gotowe.length) {
    git(["add", "dane/naprawy", "src/img/naprawy"]);
    const opis = gotowe.map((w) => `${slugZmiany.get(w.slug) === "A" ? "nowy wpis" : "poprawka"} „${w.h1}”`).join("; ");
    git(["-c", "user.name=Janek", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com", "commit", "-q", "-m", `Janek: ${opis}`]);
    await ponawiaj(() => {
      git(["fetch", "-q", "origin", "main"]);
      try {
        git(["rebase", "-q", "origin/main"]);
      } catch (e) {
        git(["rebase", "--abort"], { cicho: true });
        blad(`konflikt z najnowszą wersją main: ${e.message}`);
      }
      zbuduj();
      git(["push", "-q", "origin", "HEAD:main"]);
    }, { proby: 4, opis: "push do main" });
    opublikowano = wypchnieto = true;
    log("Opublikowano w main:", opis);
  }

  // 7. Stan skrzynki i wiadomości
  for (const [id, z] of doZadania) {
    const w = wyniki.get(id);
    const zrodlo = z.rodzaj === "nowy" ? stan.paczki.find((p) => p.id === id) : stan.poprawki.find((p) => p.id === id);
    if (z.rodzaj === "nowy") {
      stan.paczki = stan.paczki.filter((p) => p.id !== id);
      if (w.status === "ok") {
        const wpis = gotowe.find((g) => g.slug === w.slug);
        stan.wpisy[w.slug] = { h1: wpis.h1, data: wpis.dataPublikacji };
        stan.ostatniWpis = w.slug;
        const braki = (w.braki || []).filter(Boolean);
        doGrupy(stan, [
          `Nowy wpis: ${urlWpisu(w.slug)}`,
          `Fraza główna: ${wpis.fraza}`,
          braki.length ? `Pominąłem, bo nie wiedziałem:\n${braki.map((b) => `• ${b}`).join("\n")}` : "Niczego nie pominąłem.",
        ].join("\n"), { slug: w.slug, odpowiedzNa: zrodlo?.mid });
        usunZdjeciaSkrzynki(zrodlo?.materialy?.filter((m) => m.typ === "zdjecie").map((m) => m.plik));
      } else {
        // Materiały wracają do kolejki: po uzupełnieniu wystarczy znowu „gotowe”.
        stan.materialy = [...(zrodlo?.materialy || []), ...stan.materialy];
        doGrupy(stan, `Nie napisałem wpisu: ${w.powod}\nMateriały czekają. Uzupełnij je i napisz „gotowe”.`, { odpowiedzNa: zrodlo?.mid });
      }
    } else {
      stan.poprawki = stan.poprawki.filter((p) => p.id !== id);
      if (w.status === "ok") {
        const wpis = gotowe.find((g) => g.slug === w.slug);
        stan.wpisy[w.slug] = { ...(stan.wpisy[w.slug] || {}), h1: wpis.h1, data: wpis.dataPublikacji };
        doGrupy(stan, `Poprawione: ${urlWpisu(w.slug)}${w.podsumowanie ? `\n${w.podsumowanie}` : ""}`, { slug: w.slug, odpowiedzNa: zrodlo?.mid });
      } else {
        doGrupy(stan, `Nie poprawiłem: ${w.powod}`, { odpowiedzNa: zrodlo?.mid });
      }
      usunZdjeciaSkrzynki(zrodlo?.zdjecia);
    }
  }
  return opublikowano;
}

function usunZdjeciaSkrzynki(pliki = []) {
  for (const p of pliki || []) rmSync(join(SKRZYNKA, p), { force: true });
}

function wycofaj() {
  try { git(["rebase", "--abort"], { cicho: true }); } catch {}
  git(["reset", "-q", "--hard", BAZA]);
  git(["clean", "-fdq", "dane/naprawy", "src/img/naprawy"]);
}

let opublikowano = false;
try {
  opublikowano = await publikuj();
} catch (e) {
  const opis = e instanceof BladPublikacji ? e.message : `nieoczekiwany błąd: ${e.message}`;
  log("Publikacja przerwana:", opis);
  if (wypchnieto) {
    // Wpis jest już w main, zawiódł tylko zapis stanu – nie udajemy, że nic się nie stało.
    doGrupy(stan, `Wpis jest opublikowany, ale nie zapisałem stanu skrzynki (${opis}). Sprawdź przy następnym uruchomieniu, czy nie powstał drugi raz ten sam wpis.`);
    zapiszStan(stan);
    await wypchnijSkrzynke("po publikacji z błędem stanu");
    ustawWyjscie("opublikowano", true);
    process.exit(0);
  }
  wycofaj();
  const wstrzymane = [];
  for (const [id, z] of doZadania) {
    const p = (z.rodzaj === "nowy" ? stan.paczki : stan.poprawki).find((x) => x.id === id);
    if (!p) continue;
    p.proby = (p.proby || 0) + 1;
    if (p.proby >= MAKS_PROB) wstrzymane.push({ p, z });
  }
  const krotko = opis.length > 600 ? `${opis.slice(0, 600)}…` : opis;
  if (wstrzymane.length) {
    for (const { p, z } of wstrzymane) {
      if (z.rodzaj === "nowy") {
        p.wstrzymana = true;
        doGrupy(stan, `Po ${MAKS_PROB} próbach nie udało mi się opublikować tego wpisu. Ostatni błąd: ${krotko}\nMateriały czekają w skrzynce. Żeby spróbować jeszcze raz, napisz „gotowe”.`, { odpowiedzNa: p.mid });
      } else {
        stan.poprawki = stan.poprawki.filter((x) => x !== p);
        doGrupy(stan, `Po ${MAKS_PROB} próbach nie udało mi się wprowadzić tej poprawki. Ostatni błąd: ${krotko}\nNapisz ją jeszcze raz, najlepiej prościej.`, { odpowiedzNa: p.mid });
      }
    }
  } else {
    doGrupy(stan, `Nic nie opublikowałem, bo: ${krotko}\nMateriały czekają w skrzynce, spróbuję przy następnym uruchomieniu.`, { klucz: "publikacja" });
  }
}

zapiszStan(stan);
await wypchnijSkrzynke(opublikowano ? "po publikacji" : "po nieudanej publikacji");
ustawWyjscie("opublikowano", opublikowano);
