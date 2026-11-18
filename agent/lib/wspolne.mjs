// Wspólne narzędzia Janka: ścieżki, stan skrzynki, git, logi bez sekretów.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const KATALOG_AGENTA = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const REPO = resolve(KATALOG_AGENTA, "..");
export const PRACA = join(KATALOG_AGENTA, "praca");
export const SKRZYNKA = process.env.SKRZYNKA_DIR || join(REPO, ".skrzynka");
export const GALAZ_SKRZYNKI = "bot-skrzynka";
export const ADRES_STRONY = process.env.ADRES_STRONY || "https://rowerowy.komprachcice.com";

// ---------- Logi: nigdy nie wypisujemy wartości sekretów ----------
const SEKRETY = ["TELEGRAM_BOT_TOKEN", "GEMINI_API_KEY", "NOTION_TOKEN", "CLAUDE_CODE_OAUTH_TOKEN", "GH_TOKEN", "GITHUB_TOKEN"];
export function ukryj(tekst) {
  let t = String(tekst);
  for (const n of SEKRETY) {
    const v = process.env[n];
    if (v && v.length > 3) t = t.split(v).join(`***${n}***`);
  }
  return t.replace(/bot\d+:[A-Za-z0-9_-]{20,}/g, "bot***");
}
export const log = (...xs) => console.log(ukryj(xs.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ")));

export function wymagane(...nazwy) {
  const brak = nazwy.filter((n) => !process.env[n]);
  if (brak.length) throw new Error(`Brak zmiennych środowiskowych: ${brak.join(", ")}`);
}

// ---------- Wyjście kroku GitHub Actions ----------
export function ustawWyjscie(nazwa, wartosc) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${nazwa}=${wartosc}\n`);
  log(`wyjście: ${nazwa}=${wartosc}`);
}

// ---------- Data w strefie Polski ----------
export function dzisiaj() {
  if (process.env.JANEK_DZIS) return process.env.JANEK_DZIS; // do testów
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(new Date());
}
export const teraz = () => (process.env.JANEK_TERAZ ? new Date(process.env.JANEK_TERAZ) : new Date());

// ---------- git ----------
export function git(args, { cwd = REPO, cicho = false } = {}) {
  try {
    return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (e) {
    const opis = ukryj(`git ${args.join(" ")}: ${(e.stderr || e.message || "").toString().trim()}`);
    if (!cicho) log(opis);
    const blad = new Error(opis);
    blad.git = true;
    throw blad;
  }
}

export async function ponawiaj(fn, { proby = 4, przerwaMs = 2000, opis = "operacja" } = {}) {
  let ostatni;
  for (let i = 1; i <= proby; i++) {
    try {
      return await fn(i);
    } catch (e) {
      ostatni = e;
      if (e.bezPonawiania) break;
      if (i < proby) {
        log(`${opis}: próba ${i} nieudana (${e.message}), ponawiam`);
        await new Promise((r) => setTimeout(r, przerwaMs * 2 ** (i - 1)));
      }
    }
  }
  throw ostatni;
}

// ---------- Stan skrzynki (gałąź bot-skrzynka) ----------
const PLIK_STANU = () => join(SKRZYNKA, "stan.json");

export function nowyStan() {
  return {
    wersja: 1,
    offset: 0,
    materialy: [], // materiały od ostatniego „gotowe”
    paczki: [], // zamknięte paczki czekające na wpis
    poprawki: [], // prośby „Janek, …”
    wpisy: {}, // slug → { h1, url, data }
    ostatniWpis: null,
    wiadomosciJanka: {}, // message_id wiadomości Janka z linkiem → slug
    doWyslania: [], // kolejka wiadomości do grupy
    bledy: {}, // klucz błędu → kiedy ostatnio zgłoszony
  };
}

export function wczytajStan() {
  if (!existsSync(PLIK_STANU())) return nowyStan();
  return { ...nowyStan(), ...JSON.parse(readFileSync(PLIK_STANU(), "utf8")) };
}

export function zapiszStan(stan) {
  mkdirSync(SKRZYNKA, { recursive: true });
  writeFileSync(PLIK_STANU(), JSON.stringify(stan, null, 2) + "\n");
}

// Commit i push skrzynki. Wywoływane po każdym kroku, który zmienia stan.
export async function wypchnijSkrzynke(opis) {
  git(["add", "-A"], { cwd: SKRZYNKA });
  const zmiany = git(["status", "--porcelain"], { cwd: SKRZYNKA });
  if (!zmiany) return false;
  git(["commit", "-q", "-m", `Skrzynka: ${opis}`], { cwd: SKRZYNKA });
  if (process.env.JANEK_BEZ_PUSH === "1") return true;
  await ponawiaj(() => git(["push", "-q", "origin", `HEAD:${GALAZ_SKRZYNKI}`], { cwd: SKRZYNKA }), { opis: "push skrzynki" });
  return true;
}

// ---------- Kolejka wiadomości do grupy ----------
// klucz: wiadomości o tym samym błędzie nie powtarzamy częściej niż co 24 h.
export function doGrupy(stan, tekst, { slug = null, odpowiedzNa = null, klucz = null } = {}) {
  if (klucz) {
    const ostatnio = stan.bledy[klucz];
    if (ostatnio && teraz() - new Date(ostatnio) < 24 * 3600 * 1000) {
      log(`pomijam powtórzony komunikat (${klucz})`);
      return;
    }
    stan.bledy[klucz] = teraz().toISOString();
  }
  stan.doWyslania.push({ tekst, slug, odpowiedzNa });
}

export const urlWpisu = (slug) => `${ADRES_STRONY}/poradniki/${slug}/`;

export function czytajJson(plik, domyslnie = undefined) {
  if (!existsSync(plik)) {
    if (domyslnie !== undefined) return domyslnie;
    throw new Error(`Brak pliku ${plik}`);
  }
  return JSON.parse(readFileSync(plik, "utf8"));
}
