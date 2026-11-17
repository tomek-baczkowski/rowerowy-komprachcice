// Zamiana nagrania głosowego na tekst przez Gemini API (darmowy poziom).
// Model można zmienić zmienną GEMINI_MODEL (Settings → Secrets and variables → Variables).
import { ukryj, ponawiaj } from "./wspolne.mjs";

const baza = () => process.env.GEMINI_API_BASE || "https://generativelanguage.googleapis.com";
const model = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

const POLECENIE = `Przepisz to nagranie po polsku słowo w słowo. To mechanik rowerowy opisuje naprawę roweru.
Zachowaj jego słowa i kolejność, popraw tylko oczywiste przejęzyczenia. Nie dodawaj niczego od siebie,
bez wstępów i komentarzy. Jeśli nagranie jest puste albo niezrozumiałe, odpowiedz dokładnie: [NIEZROZUMIAŁE]`;

export async function przepisz(bufor, mime = "audio/ogg") {
  if (!process.env.GEMINI_API_KEY) throw new Error("brak klucza GEMINI_API_KEY");
  return ponawiaj(async () => {
    const odp = await fetch(`${baza()}/v1beta/models/${model()}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: POLECENIE }, { inline_data: { mime_type: mime.split(";")[0], data: bufor.toString("base64") } }] }],
        generationConfig: { temperature: 0 },
      }),
    });
    const dane = await odp.json().catch(() => ({}));
    if (!odp.ok) throw new Error(ukryj(`Gemini ${odp.status}: ${dane.error?.message || ""}`));
    const tekst = (dane.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
    if (!tekst || tekst.includes("[NIEZROZUMIAŁE]")) throw new Error("Gemini nie zrozumiał nagrania");
    return tekst;
  }, { proby: 3, przerwaMs: 3000, opis: "przepisywanie nagrania" });
}
