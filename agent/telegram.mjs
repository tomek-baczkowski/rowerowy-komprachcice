// Krok A (+B): odbiór wiadomości z Telegrama, bez AI poza przepisaniem nagrań przez Gemini.
// - przyjmuje tylko naszą grupę i nasze konta,
// - zdjęcia od razu bez EXIF/GPS, nagrania od razu na tekst (do skrzynki nie trafia dźwięk),
// - „gotowe” zamyka paczkę, „Janek…” albo odpowiedź na link Janka to poprawka,
// - przygotowuje agent/praca/zadania.json dla Claude i ustawia wyjście praca=true/false.
// Użycie: node agent/telegram.mjs
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import {
  log, wymagane, ustawWyjscie, wczytajStan, zapiszStan, wypchnijSkrzynke, doGrupy, dzisiaj, urlWpisu,
  SKRZYNKA, PRACA,
} from "./lib/wspolne.mjs";
import { pobierzAktualizacje, pobierzPlik } from "./lib/telegram.mjs";
import { czyGotowe, czyJanek, zdjecieZWiadomosci, glosZWiadomosci, tekstWiadomosci, imie, brakiPaczki } from "./lib/klasyfikacja.mjs";
import { doSkrzynki, podglad } from "./lib/zdjecia.mjs";
import { przepisz } from "./lib/gemini.mjs";

const MAKS_NOWYCH = 3;
const MAKS_POPRAWEK = 5;

wymagane("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID", "TELEGRAM_ALLOWED_USERS");
const CHAT = String(process.env.TELEGRAM_CHAT_ID).trim();
const DOZWOLENI = new Set(process.env.TELEGRAM_ALLOWED_USERS.split(/[\s,;]+/).filter(Boolean));

const stan = wczytajStan();

async function zapiszZdjecie(z) {
  const { bufor } = await pobierzPlik(z.fileId);
  const czyste = await doSkrzynki(bufor);
  const plik = `zdjecia/${z.unikalny}.webp`;
  mkdirSync(join(SKRZYNKA, "zdjecia"), { recursive: true });
  writeFileSync(join(SKRZYNKA, plik), czyste);
  return plik;
}

// ---------- 1. Odbiór ----------
const aktualizacje = await pobierzAktualizacje(stan.offset || undefined);
log(`Nowych aktualizacji: ${aktualizacje.length}`);

const grupyPoprawek = new Map(); // media_group_id → poprawka (album wysłany z „Janek…”)
const grupyPaczek = new Map(); // media_group_id → paczka (album z podpisem „gotowe”)
let przyjete = 0;

for (const u of aktualizacje) {
  stan.offset = u.update_id + 1;
  const msg = u.message;
  if (!msg) continue;
  if (String(msg.chat?.id) !== CHAT) continue; // inna rozmowa
  if (!DOZWOLENI.has(String(msg.from?.id))) continue; // ktoś spoza listy
  przyjete++;

  const tekst = tekstWiadomosci(msg);
  const zdj = zdjecieZWiadomosci(msg);
  const glos = glosZWiadomosci(msg);
  const czas = new Date(msg.date * 1000).toISOString();
  const od = imie(msg);
  const grupa = msg.media_group_id;

  // Dalsze zdjęcia z albumu, który zaczynał się od prośby o poprawkę albo od „gotowe”.
  if (grupa && zdj && !tekst && grupyPoprawek.has(grupa)) {
    grupyPoprawek.get(grupa).zdjecia.push(await zapiszZdjecie(zdj));
    continue;
  }
  if (grupa && zdj && !tekst && grupyPaczek.has(grupa)) {
    grupyPaczek.get(grupa).materialy.push({ mid: msg.message_id, od, czas, typ: "zdjecie", plik: await zapiszZdjecie(zdj) });
    continue;
  }

  // Poprawka: odpowiedź na wiadomość Janka z linkiem albo tekst od „Janek”.
  const celZOdpowiedzi = stan.wiadomosciJanka[String(msg.reply_to_message?.message_id)] || null;
  if (celZOdpowiedzi || czyJanek(tekst)) {
    const p = { id: `k${msg.message_id}`, mid: msg.message_id, od, czas, tekst, cel: celZOdpowiedzi, zdjecia: [], proby: 0 };
    if (zdj) p.zdjecia.push(await zapiszZdjecie(zdj));
    if (glos) {
      try {
        p.tekst = [p.tekst, await przepisz((await pobierzPlik(glos.fileId)).bufor, glos.mime)].filter(Boolean).join("\n");
      } catch (e) {
        log("Nie udało się przepisać nagrania z poprawką:", e.message);
        doGrupy(stan, "Nie udało się przepisać nagrania, napisz to tekstem.", { odpowiedzNa: msg.message_id });
        continue;
      }
    }
    stan.poprawki.push(p);
    if (grupa) grupyPoprawek.set(grupa, p);
    continue;
  }

  // Materiały do następnego wpisu.
  if (zdj) stan.materialy.push({ mid: msg.message_id, od, czas, typ: "zdjecie", plik: await zapiszZdjecie(zdj) });
  if (glos) {
    const m = { mid: msg.message_id, od, czas, typ: "glos" };
    try {
      m.tekst = await przepisz((await pobierzPlik(glos.fileId)).bufor, glos.mime);
    } catch (e) {
      log("Nie udało się przepisać nagrania:", e.message);
      m.blad = true;
      doGrupy(stan, "Nie udało się przepisać nagrania, napisz to tekstem.", { odpowiedzNa: msg.message_id });
    }
    stan.materialy.push(m);
  }
  if (tekst && !czyGotowe(tekst)) stan.materialy.push({ mid: msg.message_id, od, czas, typ: "tekst", tekst });

  // „gotowe” zamyka paczkę.
  if (czyGotowe(tekst)) {
    const wstrzymane = stan.paczki.filter((p) => p.wstrzymana);
    if (!stan.materialy.length && wstrzymane.length) {
      wstrzymane.forEach((p) => { p.wstrzymana = false; p.proby = 0; });
      doGrupy(stan, "Dobrze, spróbuję jeszcze raz z wstrzymaną paczką.", { odpowiedzNa: msg.message_id });
      continue;
    }
    const braki = brakiPaczki(stan.materialy);
    if (braki.length) {
      doGrupy(stan, `Nie publikuję, w tej paczce brakuje: ${braki.join(", ")}.\nDoślij to i napisz „gotowe” jeszcze raz.`, { odpowiedzNa: msg.message_id });
      continue;
    }
    const paczka = { id: `p${msg.message_id}`, mid: msg.message_id, czas, materialy: stan.materialy, proby: 0, wstrzymana: false };
    stan.paczki.push(paczka);
    stan.materialy = [];
    if (grupa) grupyPaczek.set(grupa, paczka);
  }
}
log(`Przyjęte wiadomości od nas: ${przyjete}`);

// ---------- 2. Zadania dla Claude ----------
const wpisy = Object.entries(stan.wpisy).map(([slug, w]) => ({ slug, h1: w.h1, url: urlWpisu(slug), data: w.data }));

for (const p of [...stan.poprawki]) {
  if (!wpisy.length) {
    doGrupy(stan, "Nie ma jeszcze żadnego wpisu, który mógłbym poprawić.", { odpowiedzNa: p.mid });
    stan.poprawki = stan.poprawki.filter((x) => x !== p);
  }
}

const nowe = stan.paczki.filter((p) => !p.wstrzymana).slice(0, MAKS_NOWYCH);
const poprawki = stan.poprawki.slice(0, MAKS_POPRAWEK);
const praca = nowe.length > 0 || poprawki.length > 0;

rmSync(PRACA, { recursive: true, force: true });
if (praca) {
  mkdirSync(PRACA, { recursive: true });
  const zdjecia = async (idZadania, pliki) => {
    const wynik = [];
    for (const [i, plik] of pliki.entries()) {
      const id = `${idZadania}-z${i + 1}`;
      const podgladPlik = `agent/praca/podglad/${id}.jpg`;
      mkdirSync(join(PRACA, "podglad"), { recursive: true });
      writeFileSync(join(PRACA, "podglad", `${id}.jpg`), await podglad(readFileSync(join(SKRZYNKA, plik))));
      wynik.push({ id, podglad: podgladPlik, plik });
    }
    return wynik;
  };
  const zadania = {
    data: dzisiaj(),
    nowe: [],
    poprawki: [],
    wpisy,
    ostatniWpis: stan.ostatniWpis,
  };
  for (const p of nowe) {
    zadania.nowe.push({
      id: p.id,
      wiadomosci: p.materialy.filter((m) => m.typ !== "zdjecie" && m.tekst).map((m) => ({ od: m.od, czas: m.czas, zrodlo: m.typ === "glos" ? "nagranie (przepisane automatycznie)" : "tekst", tekst: m.tekst })),
      zdjecia: await zdjecia(p.id, p.materialy.filter((m) => m.typ === "zdjecie").map((m) => m.plik)),
    });
  }
  for (const p of poprawki) {
    zadania.poprawki.push({
      id: p.id, od: p.od, czas: p.czas, tekst: p.tekst,
      cel: p.cel || stan.ostatniWpis,
      celPewny: Boolean(p.cel), // true = odpowiedź na konkretną wiadomość Janka
      zdjecia: await zdjecia(p.id, p.zdjecia),
    });
  }
  writeFileSync(join(PRACA, "zadania.json"), JSON.stringify(zadania, null, 2) + "\n");
  log(`Zadania: ${zadania.nowe.length} nowe, ${zadania.poprawki.length} poprawki`);
}

zapiszStan(stan);
await wypchnijSkrzynke(`odbiór wiadomości (offset ${stan.offset})`);
ustawWyjscie("praca", praca);
