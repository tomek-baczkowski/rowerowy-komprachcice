// Test Janka na sztucznych wiadomościach – bez prawdziwego Telegrama, Gemini, Notion i Claude.
// - fałszywe serwery Telegram Bot API, Gemini i Notion na localhost,
// - lokalne repozytorium „origin” (gałęzie main i bot-skrzynka) w katalogu tymczasowym,
// - „Claude” zastąpiony funkcją, która pisze pliki tak, jak opisuje agent/FORMAT-WPISU.md,
// - skrypty agenta uruchamiane jak w workflow (te same pliki, te same zmienne).
// Użycie: npm test --prefix agent   (albo node agent/test/scenariusze.mjs)
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, cpSync, readdirSync, rmSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import sharp from "sharp";
import { czyGotowe, czyJanek, brakiPaczki } from "../lib/klasyfikacja.mjs";

const ZRODLO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TOKEN = "123456:TEST-token-abcdefghijklmnopqrstuvwxyz";
const T = mkdtempSync(join(tmpdir(), "janek-test-"));
let ok = 0;
const sprawdz = (opis, fn) => { fn(); ok++; console.log(`  ✓ ${opis}`); };
const krok = (t) => console.log(`\n▶ ${t}`);

// ---------- 0. Rozpoznawanie sygnałów ----------
krok("Rozpoznawanie „gotowe” i „Janek”");
sprawdz("„gotowe” z interpunkcją, emoji i wielkimi literami", () => {
  for (const t of ["gotowe", "Gotowe!", "gotowe 👍", "GOTOWE.", "  gotowe!!! 🙂🚲 ", "Gotowe…"]) assert.equal(czyGotowe(t), true, t);
  for (const t of ["gotowe, wysyłam jeszcze jedno", "nie gotowe", "gotowy", "gotowe gotowe", "", "prawie gotowe"]) assert.equal(czyGotowe(t), false, t);
});
sprawdz("„Janek” na początku wiadomości", () => {
  for (const t of ["Janek, zmień tytuł", "janek usuń zdjęcie", "@Janek popraw", "JANEK: popraw cenę"]) assert.equal(czyJanek(t), true, t);
  for (const t of ["Janku, zmień", "Janekowi to wyślij", "pytałem Janka", "a Janek, zmień"]) assert.equal(czyJanek(t), false, t);
});
sprawdz("braki w paczce: zdjęcia, opis, nieprzepisane nagranie", () => {
  assert.deepEqual(brakiPaczki([]), ["zdjęć roweru", "opisu naprawy (tekstem albo nagraniem)"]);
  assert.deepEqual(brakiPaczki([{ typ: "tekst", tekst: "opis" }]), ["zdjęć roweru"]);
  assert.deepEqual(brakiPaczki([{ typ: "zdjecie" }]), ["opisu naprawy (tekstem albo nagraniem)"]);
  assert.equal(brakiPaczki([{ typ: "zdjecie" }, { typ: "tekst", tekst: "a" }, { typ: "glos", blad: true }]).length, 1);
  assert.deepEqual(brakiPaczki([{ typ: "zdjecie" }, { typ: "glos", blad: true }, { typ: "tekst", tekst: "a" }]), []);
});

// ---------- 1. Fałszywe serwery ----------
const gem = { przeciazone: false, zapytania: [] };
const tg = { aktualizacje: [], pliki: new Map(), wyslane: [], nastepnyUpdate: 1, nastepnaWiad: 100, nastepnaJanka: 9000 };
const notionBloki = [
  { type: "heading_2", id: "h", has_children: false, heading_2: { rich_text: [{ plain_text: "1. Zasady dla agenta" }] } },
  { type: "numbered_list_item", id: "n1", has_children: false, numbered_list_item: { rich_text: [{ plain_text: "Jedna fraza główna = jedna strona. ".repeat(10), annotations: { bold: true } }] } },
  { type: "table", id: "tab", has_children: true, table: {} },
  { type: "heading_2", id: "h7", has_children: false, heading_2: { rich_text: [{ plain_text: "7. Czego nie piszemy" }] } },
  { type: "bulleted_list_item", id: "b1", has_children: false, bulleted_list_item: { rich_text: [{ plain_text: "„najlepszy”, „nr 1” ".repeat(15) }] } },
];
const serwer = http.createServer(async (req, res) => {
  const cialo = await new Promise((r) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => r(d)); });
  const json = (o, kod = 200) => { res.writeHead(kod, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
  const url = new URL(req.url, "http://x");
  // Telegram
  let m = url.pathname.match(/^\/bot([^/]+)\/(\w+)$/);
  if (m) {
    if (m[1] !== TOKEN) return json({ ok: false, description: "Unauthorized" }, 401);
    const p = cialo ? JSON.parse(cialo) : {};
    if (m[2] === "getUpdates") return json({ ok: true, result: tg.aktualizacje.filter((u) => u.update_id >= (p.offset || 0)) });
    if (m[2] === "getFile") return json({ ok: true, result: { file_id: p.file_id, file_path: `pliki/${p.file_id}` } });
    if (m[2] === "sendMessage") {
      const id = tg.nastepnaJanka++;
      tg.wyslane.push({ ...p, message_id: id });
      return json({ ok: true, result: { message_id: id } });
    }
  }
  m = url.pathname.match(/^\/file\/bot[^/]+\/pliki\/(.+)$/);
  if (m) { res.writeHead(200); return res.end(tg.pliki.get(m[1])); }
  // Gemini
  if (url.pathname.includes(":generateContent")) {
    if (req.headers["x-goog-api-key"] !== "test-gemini") return json({ error: { message: "bad key" } }, 403);
    const dane = Buffer.from(JSON.parse(cialo).contents[0].parts[1].inline_data.data, "base64").toString();
    const model = url.pathname.match(/models\/([^:]+):/)[1];
    gem.zapytania.push(model);
    if (model.startsWith("wycofany")) return json({ error: { message: `models/${model} is no longer available` } }, 404);
    if (dane.startsWith("GLOS-OK:")) return json({ candidates: [{ content: { parts: [{ text: dane.slice(8) }] } }] });
    if (dane.startsWith("GLOS-WOLNY:")) {
      if (gem.przeciazone) return json({ error: { message: "This model is currently experiencing high demand." } }, 503);
      return json({ candidates: [{ content: { parts: [{ text: dane.slice(11) }] } }] });
    }
    return json({ candidates: [{ content: { parts: [{ text: "[NIEZROZUMIAŁE]" }] } }] });
  }
  // Notion
  if (url.pathname.startsWith("/v1/pages/")) return json({ last_edited_time: "2026-11-17T21:32:00Z", properties: { title: { type: "title", title: [{ plain_text: "Słownik fraz SEO i AI" }] } } });
  if (url.pathname.startsWith("/v1/blocks/tab/children")) return json({ has_more: false, results: [
    { type: "table_row", table_row: { cells: [[{ plain_text: "Fraza" }], [{ plain_text: "Strona" }]] } },
    { type: "table_row", table_row: { cells: [[{ plain_text: "rower skrzypi" }], [{ plain_text: "/poradniki/rower-skrzypi/" }]] } },
  ] });
  if (url.pathname.startsWith("/v1/blocks/")) return json({ has_more: false, results: notionBloki });
  json({ ok: false, description: "nie ma" }, 404);
});
await new Promise((r) => serwer.listen(0, "127.0.0.1", r));
const PORT = serwer.address().port;

// Sztuczne wiadomości
const CHAT = -1001234, SZYMON = 22, TOMEK = 11, OBCY = 99;
const ktos = { [SZYMON]: "Szymon", [TOMEK]: "Tomek", [OBCY]: "Obcy" };
function wiadomosc(od, pola = {}, chat = CHAT) {
  const message_id = tg.nastepnaWiad++;
  tg.aktualizacje.push({ update_id: tg.nastepnyUpdate++, message: { message_id, date: 1795000000 + message_id, chat: { id: chat, type: "supergroup" }, from: { id: od, first_name: ktos[od] }, ...pola } });
  return message_id;
}
let nrPliku = 0;
async function zdjecie(od, pola = {}) {
  const id = `foto${++nrPliku}`;
  // JPEG z EXIF i GPS – sprawdzimy, że nie przeżyje obróbki.
  const bufor = await sharp({ create: { width: 2400, height: 1800, channels: 3, background: { r: 40 + nrPliku * 20, g: 120, b: 60 } } })
    .composite([{ input: Buffer.from(`<svg width="2400" height="1800"><circle cx="${600 + nrPliku * 100}" cy="900" r="500" fill="#ddd"/></svg>`) }])
    .jpeg({ quality: 95 }).withExif({ IFD0: { Make: "TestPhone", Copyright: "Szymon" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "50/1 38/1 0/1" } }).toBuffer();
  assert.ok((await sharp(bufor).metadata()).exif, "zdjęcie testowe ma EXIF");
  tg.pliki.set(id, bufor);
  return wiadomosc(od, { photo: [{ file_id: `${id}-maly`, file_unique_id: `${id}m`, width: 90, height: 67 }, { file_id: id, file_unique_id: `u${id}`, width: 2400, height: 1800 }], ...pola });
}
function glos(od, tresc) {
  const id = `glos${++nrPliku}`;
  tg.pliki.set(id, Buffer.from(tresc));
  return wiadomosc(od, { voice: { file_id: id, file_unique_id: `u${id}`, mime_type: "audio/ogg", duration: 12 } });
}
const tekst = (od, t, pola = {}, chat = CHAT) => wiadomosc(od, { text: t, ...pola }, chat);

// ---------- 2. Repozytorium „origin” i kopia robocza jak w GitHub Actions ----------
const ORIGIN = join(T, "origin.git"), PRACA = join(T, "repo"), SKRZ = join(T, "skrzynka"), TOMKA = join(T, "tomek");
const g = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
{
  const zrodlo = join(T, "zrodlo");
  const pliki = g(["ls-files", "--cached", "--others", "--exclude-standard"], ZRODLO).split("\n").filter((f) => f && existsSync(join(ZRODLO, f)));
  for (const f of pliki) { mkdirSync(dirname(join(zrodlo, f)), { recursive: true }); cpSync(join(ZRODLO, f), join(zrodlo, f)); }
  g(["init", "-q", "-b", "main"], zrodlo);
  g(["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "start"], (g(["add", "-A"], zrodlo), zrodlo));
  g(["clone", "-q", "--bare", zrodlo, ORIGIN], T);
  g(["clone", "-q", ORIGIN, PRACA], T);
  g(["clone", "-q", ORIGIN, TOMKA], T);
  cpSync(join(ZRODLO, "agent/node_modules"), join(PRACA, "agent/node_modules"), { recursive: true });
  for (const d of [PRACA, TOMKA]) { g(["config", "user.name", "Test"], d); g(["config", "user.email", "t@t"], d); }
}

const ENV = {
  ...process.env,
  TELEGRAM_API_BASE: `http://127.0.0.1:${PORT}`, TELEGRAM_BOT_TOKEN: TOKEN,
  TELEGRAM_CHAT_ID: String(CHAT), TELEGRAM_ALLOWED_USERS: `${TOMEK},${SZYMON}`,
  GEMINI_API_BASE: `http://127.0.0.1:${PORT}`, GEMINI_API_KEY: "test-gemini", GEMINI_PRZERWA_MS: "0",
  NOTION_API_BASE: `http://127.0.0.1:${PORT}`, NOTION_TOKEN: "test-notion",
  SKRZYNKA_DIR: SKRZ, JANEK_DZIS: "2026-11-17", JANEK_TERAZ: "2026-11-17T12:00:00Z",
};
async function uruchom(skrypt, args = [], env = {}) {
  const wyj = join(T, `out-${Date.now()}-${Math.random()}`);
  writeFileSync(wyj, "");
  const kod = await new Promise((r) => {
    const p = spawn("node", [`agent/${skrypt}`, ...args], { cwd: PRACA, env: { ...ENV, GITHUB_OUTPUT: wyj, ...env }, stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    p.stdout.on("data", (d) => (log += d)); p.stderr.on("data", (d) => (log += d));
    p.on("close", (k) => { if (process.env.GLOSNO || k) console.log(log.replace(/^/gm, "    │ ")); r(k); });
  });
  assert.equal(kod, 0, `${skrypt} zakończył się kodem ${kod}`);
  return Object.fromEntries(readFileSync(wyj, "utf8").split("\n").filter(Boolean).map((l) => l.split("=")));
}
const stan = () => JSON.parse(readFileSync(join(SKRZ, "stan.json"), "utf8"));
const zadania = () => JSON.parse(readFileSync(join(PRACA, "agent/praca/zadania.json"), "utf8"));
const nowe = () => tg.wyslane.splice(0);

// „Claude”: pisze wpis według FORMAT-WPISU.md
function wpisClaude(zad, slug, fraza, zmiany = {}) {
  return {
    slug, fraza, h1: `${fraza[0].toUpperCase()}${fraza.slice(1)} – naprawa w warsztacie`, tytul: `${fraza} – naprawa`.slice(0, 70),
    opis: `${fraza}: co było przyczyną i co zrobiliśmy. Kasowanie luzu suportu 69 zł, Komprachcice koło Opola.`,
    odpowiedz: `Gdy ${fraza}, najczęściej winny jest suchy suport. Rozebraliśmy go, wyczyściliśmy i nasmarowaliśmy.`,
    objaw: ["Przy każdym obrocie korby było słychać skrzypienie."],
    kroki: ["Zdjęliśmy korbę.", "Wyczyściliśmy i nasmarowaliśmy suport.", "Złożyliśmy i sprawdziliśmy luz."],
    uwagi: [zad.wiadomosci.map((w) => w.tekst).join(" ")],
    ceny: ["Kasowanie luzu suportu ze smarowaniem łożysk"],
    faq: [["Czy skrzypienie wróci?", "Jeśli suport nie jest zużyty, zwykle nie."]],
    linki: [["/przeglad-roweru/", "przegląd roweru"], ["/cennik/", "cennik serwisu rowerowego"], ["/poradniki/rower-skrzypi/", "rower skrzypi"]],
    zdjecia: zad.zdjecia.map((z, i) => ({ id: z.id, alt: `Rower na stojaku serwisowym, zdjęcie ${i + 1}: suport i korba` })),
    ...zmiany,
  };
}
const zapiszWpis = (w) => writeFileSync(join(PRACA, "dane/naprawy", `${w.slug}.json`), JSON.stringify(w, null, 2));
const zapiszWynik = (zadania) => writeFileSync(join(PRACA, "agent/praca/wynik.json"), JSON.stringify({ zadania }, null, 2));
const glowa = (galaz = "main") => g(["rev-parse", `refs/heads/${galaz}`], ORIGIN);
const plikWOrigin = (sciezka) => { try { return g(["show", `main:${sciezka}`], ORIGIN); } catch { return null; } };
const bazaSha = () => g(["rev-parse", "HEAD"], PRACA);
async function przebieg({ claude = null, bladClaude = null, tomekZmienia = false, env = {} } = {}) {
  // Kolejność kroków jak w .github/workflows/naprawy.yml
  g(["fetch", "-q", "origin"], PRACA); g(["reset", "-q", "--hard", "origin/main"], PRACA);
  await uruchom("skrzynka.mjs");
  const { praca } = await uruchom("telegram.mjs", [], env);
  let opublikowano = "false";
  if (praca === "true") {
    await uruchom("notion.mjs");
    const baza = bazaSha();
    if (tomekZmienia) { // Tomek w tym czasie zmienia stronę
      g(["pull", "-q"], TOMKA); writeFileSync(join(TOMKA, "README.md"), readFileSync(join(TOMKA, "README.md"), "utf8") + "\nZmiana Tomka.\n");
      g(["commit", "-qam", "Zmiana Tomka"], TOMKA); g(["push", "-q", "origin", "main"], TOMKA);
    }
    if (bladClaude) {
      writeFileSync(join(T, "wykonanie.json"), JSON.stringify(bladClaude));
      await uruchom("blad.mjs", ["claude"], { EXECUTION_FILE: join(T, "wykonanie.json") });
    } else {
      claude(zadania());
      ({ opublikowano } = await uruchom("publikuj.mjs", [], { BAZA_SHA: baza }));
    }
  }
  await uruchom("powiadom.mjs", [], { STRONA: opublikowano === "true" ? "success" : "" });
  return { praca, opublikowano };
}

try {
  // ---------- 3. Scenariusze ----------
  krok("Pierwsze uruchomienie: brak wiadomości");
  {
    const r = await przebieg();
    sprawdz("Claude się nie uruchamia (praca=false), nikt nie dostaje wiadomości", () => { assert.equal(r.praca, "false"); assert.equal(nowe().length, 0); });
    sprawdz("powstała gałąź bot-skrzynka, main bez zmian", () => { assert.ok(glowa("bot-skrzynka")); assert.equal(plikWOrigin("dane/naprawy/.gitkeep"), ""); });
  }

  krok("Paczka: album 2 zdjęć, opis, nagranie, wiadomości obce, „Gotowe!”");
  let link1, gotowe1, slug1 = "skrzypi-suport-kross-hexagon";
  {
    tekst(OBCY, "Hej, kup tanio rowery!");
    tekst(SZYMON, "to z innej rozmowy", {}, -555);
    await zdjecie(SZYMON, { media_group_id: "alb1" });
    await zdjecie(SZYMON, { media_group_id: "alb1" });
    tekst(SZYMON, "Kross Hexagon, skrzypiał suport przy każdym obrocie.");
    glos(SZYMON, "GLOS-OK:Suport był suchy, po smarowaniu cisza. Ludzie myślą, że to pedały.");
    tekst(TOMEK, "Ładne zdjęcia");
    gotowe1 = tekst(SZYMON, "Gotowe!");
    const r = await przebieg({
      tomekZmienia: true,
      claude: (z) => {
        assert.equal(z.nowe.length, 1);
        zapiszWpis(wpisClaude(z.nowe[0], slug1, "skrzypi suport w rowerze Kross Hexagon"));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: slug1, braki: ["rocznik roweru", "cena smaru"] }]);
      },
    });
    const z = zadania();
    sprawdz("obce wiadomości pominięte, w paczce 2 zdjęcia i 3 opisy (tekst, przepisane nagranie, Tomek)", () => {
      assert.equal(z.nowe[0].zdjecia.length, 2);
      assert.deepEqual(z.nowe[0].wiadomosci.map((w) => w.od), ["Szymon", "Szymon", "Tomek"]);
      assert.match(z.nowe[0].wiadomosci[1].zrodlo, /nagranie/);
      assert.ok(!JSON.stringify(z).includes("kup tanio") && !JSON.stringify(z).includes("innej rozmowy"));
    });
    sprawdz("słownik z Notion zapisany jako agent/praca/slownik.md (z tabelą)", () => {
      const s = readFileSync(join(PRACA, "agent/praca/slownik.md"), "utf8");
      assert.match(s, /## 1\. Zasady dla agenta/); assert.match(s, /\| rower skrzypi \| \/poradniki\/rower-skrzypi\/ \|/);
    });
    sprawdz("wpis w main: commit „Janek: …” na wierzchu zmiany Tomka (README Tomka zachowany)", () => {
      assert.equal(r.opublikowano, "true");
      assert.match(g(["log", "-1", "--format=%s", "main"], ORIGIN), /^Janek: nowy wpis „Skrzypi suport/);
      assert.match(g(["log", "-2", "--format=%s", "main"], ORIGIN), /Zmiana Tomka/);
      assert.match(plikWOrigin("README.md"), /Zmiana Tomka/);
    });
    const w = JSON.parse(plikWOrigin(`dane/naprawy/${slug1}.json`));
    sprawdz("data publikacji ustawiona przez skrypt, zdjęcia zamienione na pliki", () => {
      assert.equal(w.dataPublikacji, "2026-11-17");
      assert.deepEqual(w.zdjecia.map((x) => x.plik), [`naprawy/${slug1}-1`, `naprawy/${slug1}-2`]);
    });
    g(["fetch", "-q", "origin"], PRACA); g(["reset", "-q", "--hard", "origin/main"], PRACA);
    for (const r of ["1280", "640"]) {
      const b = readFileSync(join(PRACA, `src/img/naprawy/${slug1}-1-${r}.webp`));
      const m = await sharp(b).metadata();
      sprawdz(`zdjęcie ${r}: WebP, ${m.width}×${m.height}, ${Math.round(b.length / 1024)} KB, bez EXIF i GPS`, () => {
        assert.equal(m.format, "webp"); assert.equal(Math.max(m.width, m.height), Number(r)); assert.ok(b.length <= 200 * 1024);
        assert.ok(!m.exif && !m.xmp && !m.iptc);
      });
    }
    {
      // Po publikacji zdjęcia paczki znikają ze skrzynki, ale zostają w historii gałęzi – sprawdzamy historię.
      const plik = g(["log", "--format=", "--name-only", "--diff-filter=A", "bot-skrzynka", "--", "zdjecia/"], ORIGIN).split("\n").filter(Boolean)[0];
      const commit = g(["log", "-1", "--format=%H", "--diff-filter=A", "bot-skrzynka", "--", plik], ORIGIN);
      const bufor = execFileSync("git", ["show", `${commit}:${plik}`], { cwd: ORIGIN });
      const m = await sharp(bufor).metadata();
      sprawdz("zdjęcia w skrzynce (publiczna gałąź) też bez EXIF i GPS; po publikacji usunięte ze skrzynki", () => {
        assert.ok(!m.exif && !m.xmp); assert.ok(!existsSync(join(SKRZ, plik)));
      });
    }
    execFileSync("node", ["build.mjs"], { cwd: PRACA });
    const html = readFileSync(join(PRACA, `dist/poradniki/${slug1}/index.html`), "utf8");
    sprawdz("strona wpisu: H1, Uwagi warsztatu ze słowami Szymona, cena z cennika, autor Szymon, Article+FAQPage, WhatsApp i Zadzwoń", () => {
      assert.match(html, /<h1>Skrzypi suport w rowerze Kross Hexagon/);
      assert.match(html, /Uwagi warsztatu<\/h2><p>Kross Hexagon, skrzypiał suport/);
      assert.match(html, /Kasowanie luzu suportu ze smarowaniem łożysk<\/td><td><strong>69 zł/);
      assert.match(html, /Napisał Szymon/);
      assert.match(html, /"@type":"Article".*"author":\{"@type":"Person","name":"Szymon"/);
      assert.match(html, /"datePublished":"2026-11-17"/);
      assert.match(html, /"@type":"FAQPage"/);
      assert.match(html, /og:image" content="https:\/\/rowerowy.komprachcice.com\/img\/naprawy\/skrzypi-suport-kross-hexagon-1-1280.webp/);
      assert.match(html, /wa\.me/); assert.match(html, /tel:/);
    });
    sprawdz("wpis na liście poradników w bloku „Z warsztatu” (nad obecną listą), w mapie witryny i w llms.txt", () => {
      const lista = readFileSync(join(PRACA, "dist/poradniki/index.html"), "utf8");
      assert.ok(lista.indexOf("Z warsztatu") > 0 && lista.indexOf("Z warsztatu") < lista.indexOf("przerzutka-przeskakuje"));
      assert.match(lista, new RegExp(`/poradniki/${slug1}/`));
      assert.match(readFileSync(join(PRACA, "dist/sitemap.xml"), "utf8"), new RegExp(`/poradniki/${slug1}/`));
      assert.match(readFileSync(join(PRACA, "dist/llms.txt"), "utf8"), new RegExp(`/poradniki/${slug1}/`));
    });
    const wys = nowe();
    link1 = wys[0]?.message_id;
    sprawdz("do grupy: link, fraza główna, lista braków – w odpowiedzi na „Gotowe!”", () => {
      assert.equal(wys.length, 1);
      assert.match(wys[0].text, new RegExp(`^Nowy wpis: https://rowerowy.komprachcice.com/poradniki/${slug1}/`));
      assert.match(wys[0].text, /Fraza główna: skrzypi suport w rowerze Kross Hexagon/);
      assert.match(wys[0].text, /• rocznik roweru\n• cena smaru/);
      assert.equal(wys[0].reply_parameters.message_id, gotowe1);
    });
    sprawdz("token Telegrama nie pojawia się w skrzynce", () => assert.ok(!readFileSync(join(SKRZ, "stan.json"), "utf8").includes("TEST-token")));
  }

  krok("„gotowe 👍” bez zdjęć – brak publikacji, informacja w grupie");
  {
    const m1 = tekst(SZYMON, "Wymiana klocków w Trek Marlin, tarcza była zatłuszczona.");
    const g2 = tekst(SZYMON, "gotowe 👍");
    const r = await przebieg();
    const wys = nowe();
    sprawdz("Claude się nie uruchamia, nic nie trafia do main", () => assert.equal(r.praca, "false"));
    sprawdz("jedna wiadomość: czego brakuje (zdjęć), w odpowiedzi na „gotowe”; na sam materiał Janek nie odpowiada", () => {
      assert.equal(wys.length, 1); assert.match(wys[0].text, /brakuje: zdjęć roweru/);
      assert.equal(wys[0].reply_parameters.message_id, g2); assert.ok(!wys.some((w) => w.reply_parameters?.message_id === m1));
    });
    sprawdz("materiały czekają w skrzynce", () => assert.equal(stan().materialy.length, 1));
  }

  krok("Nieudane przepisanie nagrania – paczka wstrzymana, prośba o tekst");
  {
    await zdjecie(SZYMON);
    const g1 = glos(SZYMON, "GLOS-ZLY");
    tekst(SZYMON, "GOTOWE.");
    const r = await przebieg();
    const wys = nowe();
    sprawdz("„Nie udało się przepisać nagrania, napisz to tekstem” + brak publikacji", () => {
      assert.equal(r.praca, "false");
      assert.equal(wys[0].text, "Nie udało się przepisać nagrania, napisz to tekstem albo nagraj jeszcze raz."); assert.equal(wys[0].reply_parameters.message_id, g1);
      assert.match(wys[1].text, /brakuje: treści nagrania/);
    });
    sprawdz("dźwięk nie trafia do skrzynki", () => assert.ok(!existsSync(join(SKRZ, "glosy")) && !JSON.stringify(stan()).includes("GLOS-ZLY")));
  }

  krok("Uzupełnienie tekstem + „gotowe” → drugi wpis");
  const slug2 = "zatluszczona-tarcza-trek-marlin";
  {
    tekst(SZYMON, "W nagraniu mówiłem, że tarczę trzeba było odtłuścić alkoholem izopropylowym.");
    tekst(SZYMON, "gotowe");
    await przebieg({
      claude: (z) => {
        zapiszWpis(wpisClaude(z.nowe[0], slug2, "zatłuszczona tarcza hamulca w Trek Marlin", { ceny: ["Regulacja hamulca tarczowego z odtłuszczeniem tarczy"] }));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: slug2, braki: [] }]);
      },
    });
    const wys = nowe();
    sprawdz("opublikowany, „Niczego nie pominąłem.”", () => { assert.match(wys[0].text, /Nowy wpis: .*zatluszczona-tarcza-trek-marlin/); assert.match(wys[0].text, /Niczego nie pominąłem/); });
  }

  krok("Poprawki: odpowiedź na link (bez „Janek”) i „Janek, …” bez odpowiedzi");
  {
    const k1 = tekst(TOMEK, "zmień tytuł na: Skrzypiący suport w Kross Hexagon – co pomogło", { reply_to_message: { message_id: link1 } });
    const k2 = tekst(SZYMON, "Janek, usuń drugie zdjęcie we wpisie o suporcie");
    const przedZmiana = JSON.parse(plikWOrigin(`dane/naprawy/${slug1}.json`));
    await przebieg({
      claude: (z) => {
        sprawdz("cel poprawki: z odpowiedzi = pierwszy wpis (pewny), bez odpowiedzi = ostatni wpis (domysł)", () => {
          assert.deepEqual(z.poprawki.map((p) => [p.cel, p.celPewny]), [[slug1, true], [slug2, false]]);
        });
        const w1 = JSON.parse(readFileSync(join(PRACA, `dane/naprawy/${slug1}.json`), "utf8"));
        w1.h1 = "Skrzypiący suport w Kross Hexagon – co pomogło"; w1.dataPublikacji = "2020-01-01"; // próba zmiany daty zostanie cofnięta
        zapiszWpis(w1);
        // Druga prośba nie jest odpowiedzią, domysł to ostatni wpis (slug2), ale z treści wynika wpis o suporcie.
        w1.zdjecia.splice(1, 1); zapiszWpis(w1);
        zapiszWynik([
          { id: z.poprawki[0].id, status: "ok", slug: slug1, podsumowanie: "Zmieniłem tytuł." },
          { id: z.poprawki[1].id, status: "ok", slug: slug1, podsumowanie: "Usunąłem drugie zdjęcie." },
        ]);
      },
    });
    const po = JSON.parse(plikWOrigin(`dane/naprawy/${slug1}.json`));
    sprawdz("data publikacji bez zmian, data zmiany ustawiona, adres ten sam", () => {
      assert.equal(po.dataPublikacji, przedZmiana.dataPublikacji); assert.equal(po.dataZmiany, "2026-11-17"); assert.equal(po.h1, "Skrzypiący suport w Kross Hexagon – co pomogło");
    });
    sprawdz("Janek sam ustala wpis z treści; zdjęcie znika ze strony, a jego plik zostaje w repozytorium (niczego nie usuwamy)", () => {
      assert.deepEqual(JSON.parse(plikWOrigin(`dane/naprawy/${slug1}.json`)).zdjecia.map((z) => z.plik), [`naprawy/${slug1}-1`]);
      assert.ok(plikWOrigin(`src/img/naprawy/${slug1}-2-1280.webp`) !== null);
    });
    const wys = nowe();
    sprawdz("odpowiedzi „Poprawione: <link>” na obie prośby", () => {
      assert.equal(wys.length, 2);
      assert.equal(wys[0].reply_parameters.message_id, k1); assert.match(wys[0].text, /^Poprawione: .*skrzypi-suport-kross-hexagon\/\nZmieniłem tytuł\./);
      assert.equal(wys[1].reply_parameters.message_id, k2);
    });
  }

  krok("Logowanie do Claude się nie udaje (wygasły token)");
  {
    await zdjecie(SZYMON); tekst(SZYMON, "Centrowanie koła w Romet Orkan, pęknięta szprycha."); tekst(SZYMON, "gotowe");
    const bladAuth = [{ type: "result", is_error: true, result: "Invalid bearer token: OAuth token has expired" }];
    await przebieg({ bladClaude: bladAuth });
    let wys = nowe();
    sprawdz("wiadomość o logowaniu, paczka zostaje w skrzynce", () => {
      assert.equal(wys.length, 1); assert.match(wys[0].text, /Nie mogę zalogować się do Claude/); assert.match(wys[0].text, /czekają w skrzynce/);
      assert.equal(stan().paczki.length, 1);
    });
    await przebieg({ bladClaude: bladAuth });
    wys = nowe();
    sprawdz("przy następnym uruchomieniu ten sam błąd nie jest powtarzany (najwyżej raz na 24 h)", () => { assert.equal(wys.length, 0); assert.equal(stan().paczki.length, 1); });
  }

  krok("Claude łamie zasady – kontrola publikacji odrzuca");
  {
    const przed = glowa();
    await przebieg({
      claude: (z) => {
        writeFileSync(join(PRACA, "strony/glowna.mjs"), "// zepsute\n");
        zapiszWpis(wpisClaude(z.nowe[0], "centrowanie-kola-romet-orkan", "centrowanie koła w Romet Orkan"));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "centrowanie-kola-romet-orkan", braki: [] }]);
      },
    });
    let wys = nowe();
    sprawdz("zmiana innej strony → nic nie trafia do main, w grupie opis błędu, paczka czeka", () => {
      assert.equal(glowa(), przed); assert.match(wys[0].text, /Claude zmienił pliki spoza wpisów: strony\/glowna\.mjs/);
      assert.equal(stan().paczki[0].proby, 1);
    });
    await przebieg({
      claude: (z) => {
        zapiszWpis(wpisClaude(z.nowe[0], "centrowanie-kola-romet-orkan", "centrowanie koła w Romet Orkan", { ceny: ["Centrowanie koła premium"] }));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "centrowanie-kola-romet-orkan", braki: [] }]);
      },
    });
    wys = nowe();
    sprawdz("cena spoza cennika → odrzucone (komunikat o tym samym typie błędu nie jest powtarzany w 24 h)", () => {
      assert.equal(glowa(), przed); assert.equal(wys.length, 0); assert.equal(stan().paczki[0].proby, 2);
    });
    await przebieg({
      claude: (z) => {
        zapiszWpis(wpisClaude(z.nowe[0], "centrowanie-kola-romet-orkan", "skrzypi suport w rowerze Kross Hexagon"));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "centrowanie-kola-romet-orkan", braki: [] }]);
      },
    });
    wys = nowe();
    sprawdz("powtórzona fraza główna, trzecia próba → paczka wstrzymana, informacja w grupie", () => {
      assert.equal(glowa(), przed); assert.match(wys[0].text, /Po 3 próbach/); assert.match(wys[0].text, /fraza główna „skrzypi suport w rowerze Kross Hexagon” powtarza się we wpisach .*skrzypi-suport-kross-hexagon/);
      assert.equal(stan().paczki[0].wstrzymana, true);
    });
    const r = await przebieg();
    sprawdz("wstrzymana paczka nie uruchamia Claude", () => assert.equal(r.praca, "false"));
    tekst(SZYMON, "gotowe");
    await przebieg({
      claude: (z) => {
        zapiszWpis(wpisClaude(z.nowe[0], "centrowanie-kola-romet-orkan", "centrowanie koła w Romet Orkan", { ceny: ["Centrowanie koła", "Dopłata do centrowania za wymianę szprych"] }));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "centrowanie-kola-romet-orkan", braki: ["model szprychy"] }]);
      },
    });
    wys = nowe();
    sprawdz("„gotowe” bez nowych materiałów wznawia wstrzymaną paczkę i ją publikuje", () => {
      assert.match(wys[0].text, /spróbuję jeszcze raz/); assert.match(wys[1].text, /Nowy wpis: .*centrowanie-kola-romet-orkan/);
      assert.equal(stan().paczki.length, 0);
    });
  }

  krok("Najwyżej 3 nowe wpisy na uruchomienie");
  {
    for (let i = 1; i <= 4; i++) { await zdjecie(SZYMON); tekst(SZYMON, `Naprawa numer ${i}: wymiana dętki.`); tekst(SZYMON, "gotowe"); }
    await przebieg({
      claude: (z) => {
        sprawdz("Claude dostaje 3 paczki, czwarta czeka", () => assert.equal(z.nowe.length, 3));
        zapiszWynik(z.nowe.map((n, i) => {
          const slug = `wymiana-detki-numer-${i + 1}`;
          zapiszWpis(wpisClaude(n, slug, `wymiana dętki numer ${i + 1}`, { ceny: ["Wymiana opony lub dętki – przód"] }));
          return { id: n.id, status: "ok", slug, braki: [] };
        }));
      },
    });
    sprawdz("3 wpisy w jednym commicie, czwarta paczka w skrzynce", () => {
      assert.match(g(["log", "-1", "--format=%s", "main"], ORIGIN), /numer 1.*numer 2.*numer 3/);
      assert.equal(stan().paczki.length, 1);
    });
    nowe();
  }

  krok("Gemini przeciążone (503) – nagranie czeka do następnego uruchomienia, „gotowe” odłożone");
  {
    gem.przeciazone = true; gem.zapytania = [];
    await zdjecie(SZYMON);
    const g1 = glos(SZYMON, "GLOS-WOLNY:Hamulec piszczał, bo klocki były zeszklone. Przeszlifowaliśmy je.");
    const g2 = tekst(SZYMON, "gotowe");
    await przebieg({
      claude: (z) => {
        sprawdz("Claude dostaje tylko starszą, czwartą paczkę – nowa czeka na nagranie", () => assert.equal(z.nowe.length, 1));
        zapiszWpis(wpisClaude(z.nowe[0], "wymiana-detki-numer-4", "wymiana dętki numer 4", { ceny: ["Wymiana opony lub dętki – przód"] }));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "wymiana-detki-numer-4", braki: [] }]);
      },
    });
    const wys = nowe();
    sprawdz("oba domyślne modele próbowane po 2 razy", () => assert.deepEqual(gem.zapytania, ["gemini-3.5-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.8-flash"]));
    sprawdz("w grupie: „spróbuję przy następnym uruchomieniu” i „zamknę paczkę”, bez prośby o tekst", () => {
      const doG1 = wys.find((w) => w.reply_parameters?.message_id === g1), doG2 = wys.find((w) => w.reply_parameters?.message_id === g2);
      assert.match(doG1.text, /przy następnym uruchomieniu/); assert.match(doG2.text, /Zamknę tę paczkę/);
      assert.ok(!wys.some((w) => /napisz to tekstem|brakuje/.test(w.text)));
    });
    sprawdz("w skrzynce identyfikator pliku, bez dźwięku; „gotowe” zapamiętane", () => {
      const st = stan(), m = st.materialy.find((x) => x.typ === "glos");
      assert.ok(m.czeka && m.plikGlosu.fileId && !m.blad); assert.equal(st.gotoweOdlozone.mid, g2);
      assert.ok(!JSON.stringify(st).includes("zeszklone"));
    });

    gem.przeciazone = false; gem.zapytania = [];
    let wiad;
    await przebieg({
      env: { GEMINI_MODEL: "wycofany-model, gemini-zapas" },
      claude: (z) => {
        wiad = z.nowe[0]?.wiadomosci;
        zapiszWpis(wpisClaude(z.nowe[0], "zeszklone-klocki", "zeszklone klocki hamulcowe", { ceny: ["Wymiana opony lub dętki – przód"] }));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "zeszklone-klocki", braki: [] }]);
      },
    });
    const wys2 = nowe();
    sprawdz("wycofany model (404) pominięty bez ponawiania, przepisał następny z listy", () => assert.deepEqual(gem.zapytania, ["wycofany-model", "gemini-zapas"]));
    sprawdz("następne uruchomienie: nagranie przepisane, paczka sama się zamyka i trafia do Claude", () => {
      assert.match(wiad[0].tekst, /zeszklone/); assert.equal(stan().gotoweOdlozone, null); assert.equal(stan().materialy.length, 0);
      assert.ok(wys2.some((w) => /zeszklone-klocki/.test(w.text)));
    });
  }

  krok("To samo zdjęcie wysłane drugi raz po „gotowe” (awaria z 19–20.11.2026)");
  {
    await zdjecie(SZYMON);
    const foto = tg.aktualizacje.at(-1).message.photo;
    tekst(SZYMON, "Łańcuch był rozciągnięty, wymieniliśmy go.");
    tekst(SZYMON, "gotowe");
    wiadomosc(SZYMON, { photo: foto }); // to samo zdjęcie jeszcze raz, już do następnej paczki
    await przebieg({
      claude: (z) => {
        zapiszWpis(wpisClaude(z.nowe[0], "rozciagniety-lancuch-test", "rozciągnięty łańcuch test"));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "rozciagniety-lancuch-test", braki: [] }]);
      },
    });
    nowe();
    sprawdz("po publikacji plik powtórzonego zdjęcia nadal jest w skrzynce", () => {
      const m = stan().materialy.filter((x) => x.typ === "zdjecie");
      assert.equal(m.length, 1); assert.ok(existsSync(join(SKRZ, m[0].plik)));
    });
    // Stan po starej wersji: materiał wskazuje na plik, którego nie ma.
    const st = stan();
    st.materialy.push({ mid: 1, od: "Szymon", czas: "2026-11-17T10:00:00Z", typ: "zdjecie", plik: "zdjecia/nie-ma-mnie.webp" });
    writeFileSync(join(SKRZ, "stan.json"), JSON.stringify(st, null, 2));
    tekst(SZYMON, "Druga naprawa łańcucha.");
    tekst(SZYMON, "gotowe");
    let zdjecWZadaniu = -1;
    await przebieg({
      claude: (z) => {
        zdjecWZadaniu = z.nowe[0].zdjecia.length;
        zapiszWpis(wpisClaude(z.nowe[0], "rozciagniety-lancuch-test-2", "rozciągnięty łańcuch test 2"));
        zapiszWynik([{ id: z.nowe[0].id, status: "ok", slug: "rozciagniety-lancuch-test-2", braki: [] }]);
      },
    });
    nowe();
    sprawdz("brakujący plik pominięty, odbiór i wpis idą dalej", () => {
      assert.equal(zdjecWZadaniu, 1);
      assert.ok(plikWOrigin("dane/naprawy/rozciagniety-lancuch-test-2.json"));
    });
  }

  krok("Budowa strony bez wpisów Janka");
  {
    const katalog = join(T, "czysty");
    g(["clone", "-q", ORIGIN, katalog], T);
    g(["checkout", "-q", g(["rev-list", "--max-parents=0", "main"], katalog)], katalog);
    rmSync(join(katalog, "dane/naprawy"), { recursive: true, force: true }); // prawdziwe wpisy z repo
    execFileSync("node", ["build.mjs"], { cwd: katalog });
    const strony = readdirSync(join(katalog, "dist/poradniki"));
    sprawdz("bez wpisów Janka lista poradników nie ma bloku „Z warsztatu”, 10 poradników jak wcześniej", () => {
      assert.ok(!readFileSync(join(katalog, "dist/poradniki/index.html"), "utf8").includes("Z warsztatu"));
      assert.equal(strony.length, 11);
    });
  }
  console.log(`\nWszystko przeszło: ${ok} sprawdzeń. Katalog testu: ${T}`);
} finally {
  serwer.close();
  if (!process.env.ZOSTAW) rmSync(T, { recursive: true, force: true });
}

