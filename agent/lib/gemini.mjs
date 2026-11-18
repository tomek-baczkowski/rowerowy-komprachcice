// Zamiana nagrania głosowego na tekst przez Gemini API (darmowy poziom).
// GEMINI_MODEL (Settings → Secrets and variables → Variables) to lista modeli po przecinku,
// próbowanych po kolei: gdy pierwszy jest przeciążony, wycofany albo nie odpowiada, bierzemy następny.
import { ukryj, ponawiaj, log } from "./wspolne.mjs";

// gemini-3.5-flash-lite: następca gemini-2.5-flash wskazany przez Google; gemini-3.8-flash jako zapas.
export const DOMYSLNE_MODELE = "gemini-3.5-flash-lite,gemini-3.8-flash";

const baza = () => process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
const modele = () => (process.env.GEMINI_MODEL || DOMYSLNE_MODELE).split(/[\s,;]+/).filter(Boolean);
const limitMs = () => Number(process.env.GEMINI_TIMEOUT_MS) || 90_000;
const przerwaMs = () => Number(process.env.GEMINI_PRZERWA_MS ?? 3000);

const POLECENIE = `Przepisz to nagranie po polsku słowo w słowo. To mechanik rowerowy opisuje naprawę roweru.
Zachowaj jego słowa i kolejność, popraw tylko oczywiste przejęzyczenia. Nie dodawaj niczego od siebie,
bez wstępów i komentarzy. Jeśli nagranie jest puste albo niezrozumiałe, odpowiedz dokładnie: [NIEZROZUMIAŁE]`;

// Rodzaje błędów (pola na obiekcie Error):
// - bezPonawiania: nie ma sensu próbować ponownie (zły klucz, złe zapytanie, niezrozumiałe nagranie),
// - innyModel: ten model nie działa (wycofany, przeciążony, brak odpowiedzi), można spróbować następnego,
// - bez żadnego z nich: chwilowa awaria; telegram.mjs odkłada nagranie do następnego uruchomienia.
async function zapytaj(model, bufor, mime) {
  let odp;
  try {
    odp = await fetch(`${baza()}/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: POLECENIE }, { inline_data: { mime_type: mime.split(";")[0], data: bufor.toString("base64") } }] }],
        generationConfig: { temperature: 0 },
      }),
      signal: AbortSignal.timeout(limitMs()),
    });
  } catch (e) {
    throw new Error(`Gemini (${model}) nie odpowiedział: ${e.name === "TimeoutError" ? `brak odpowiedzi w ${limitMs() / 1000} s` : e.message}`);
  }
  const dane = await odp.json().catch(() => ({}));
  if (!odp.ok) {
    const e = new Error(ukryj(`Gemini ${odp.status} (${model}): ${dane.error?.message || ""}`));
    if (odp.status === 404) { e.bezPonawiania = true; e.innyModel = true; } // model wycofany
    else if ([400, 401, 403].includes(odp.status)) e.bezPonawiania = true; // klucz albo zapytanie
    throw e;
  }
  const tekst = (dane.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
  if (!tekst || tekst.includes("[NIEZROZUMIAŁE]")) {
    const e = new Error("Gemini nie zrozumiał nagrania");
    e.bezPonawiania = true;
    throw e;
  }
  return tekst;
}

export async function przepisz(bufor, mime = "audio/ogg") {
  if (!process.env.GEMINI_API_KEY) {
    const e = new Error("brak klucza GEMINI_API_KEY");
    e.bezPonawiania = true;
    throw e;
  }
  const lista = modele();
  const bledy = [];
  for (const [i, model] of lista.entries()) {
    try {
      return await ponawiaj(() => zapytaj(model, bufor, mime), { proby: 2, przerwaMs: przerwaMs(), opis: `przepisywanie nagrania (${model})` });
    } catch (e) {
      if (e.bezPonawiania && !e.innyModel) throw e;
      bledy.push(e);
      if (i < lista.length - 1) log(`Model ${model} nie przepisał nagrania (${e.message}), próbuję ${lista[i + 1]}`);
    }
  }
  // Żaden model nie zadziałał. Wszystkie wycofane = błąd konfiguracji; choć jeden chwilowo niedostępny = awaria.
  const chwilowy = bledy.find((e) => !e.bezPonawiania);
  if (!chwilowy) throw bledy.at(-1);
  throw new Error(bledy.map((e) => e.message).join(" | "));
}
