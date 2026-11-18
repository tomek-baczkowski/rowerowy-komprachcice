// Zgłasza w grupie, że krok się nie udał. Paczki i poprawki zostają w skrzynce bez zmian.
// Ten sam komunikat najwyżej raz na 24 h (nie spamujemy co 2 godziny, gdy np. wygasł token).
// Użycie: node agent/blad.mjs claude   (EXECUTION_FILE = plik wyniku claude-code-action, jeśli jest)
//         node agent/blad.mjs notion
import { existsSync, readFileSync } from "node:fs";
import { log, wczytajStan, zapiszStan, wypchnijSkrzynke, doGrupy } from "./lib/wspolne.mjs";

const rodzaj = process.argv[2];
const stan = wczytajStan();

if (rodzaj === "claude") {
  const plik = process.env.EXECUTION_FILE;
  // Patrzymy tylko na końcowy wynik sesji, nie na całą rozmowę (w treści mogą być przypadkowe słowa).
  let zapis = plik && existsSync(plik) ? readFileSync(plik, "utf8") : "";
  try {
    const wpisy = JSON.parse(zapis);
    const koniec = Array.isArray(wpisy) ? wpisy.filter((x) => x.type === "result" || x.error).slice(-3) : [wpisy];
    zapis = JSON.stringify(koniec);
  } catch {
    zapis = zapis.slice(-4000);
  }
  const logowanie = /authenticat|unauthori[sz]ed|\b401\b|invalid (api key|bearer|x-api-key|token)|oauth token|token (has )?expired|please run \/login|not logged in/i.test(zapis);
  const limit = /usage limit|rate.?limit|limit reached|quota|\b429\b|credit balance/i.test(zapis);
  if (logowanie || (!zapis && !limit)) {
    doGrupy(stan, [
      logowanie
        ? "Nie mogę zalogować się do Claude, pewnie wygasł token CLAUDE_CODE_OAUTH_TOKEN."
        : "Nie udało się uruchomić Claude (możliwe, że to logowanie, np. wygasły token CLAUDE_CODE_OAUTH_TOKEN).",
      "Tomek: wygeneruj nowy token poleceniem `claude setup-token` i podmień sekret w GitHubie.",
      "Materiały czekają w skrzynce, nic nie przepadło.",
    ].join("\n"), { klucz: "claude-logowanie" });
  } else if (limit) {
    doGrupy(stan, "Skończył się limit Claude w abonamencie. Materiały czekają w skrzynce, spróbuję przy następnym uruchomieniu.", { klucz: "claude-limit" });
  } else {
    doGrupy(stan, "Claude przerwał pracę z błędem (szczegóły w logu workflow „Janek” na GitHubie). Materiały czekają w skrzynce, spróbuję przy następnym uruchomieniu.", { klucz: "claude-blad" });
  }
} else if (rodzaj === "notion") {
  doGrupy(stan, "Nie udało się pobrać słownika z Notion (sprawdź NOTION_TOKEN i czy integracja ma dostęp do strony słownika). Materiały czekają w skrzynce.", { klucz: "notion" });
} else {
  doGrupy(stan, `Coś poszło nie tak (${rodzaj || "nieznany krok"}). Szczegóły w logu workflow „Janek” na GitHubie. Materiały czekają w skrzynce.`, { klucz: `inne-${rodzaj}` });
}

log(`Zgłoszono błąd: ${rodzaj}`);
zapiszStan(stan);
await wypchnijSkrzynke(`błąd: ${rodzaj}`);
