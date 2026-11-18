// Wysyła do grupy wiadomości z kolejki (stan.doWyslania). Uruchamiane na końcu każdego przebiegu.
// Wiadomości z linkiem do wpisu zapamiętujemy (message_id → wpis), żeby odpowiedź na nie była poprawką tego wpisu.
// STRONA = wynik publikacji GitHub Pages (success / failure / cancelled / pusto, gdy nic nie publikowano).
// Użycie: node agent/powiadom.mjs
import { log, wymagane, wczytajStan, zapiszStan, wypchnijSkrzynke } from "./lib/wspolne.mjs";
import { wyslij } from "./lib/telegram.mjs";

wymagane("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID");
const stan = wczytajStan();
const strona = process.env.STRONA || "";
const zostaje = [];

for (const w of stan.doWyslania) {
  let tekst = w.tekst;
  if (w.slug && (strona === "failure" || strona === "cancelled")) {
    tekst += "\n\nUwaga: publikacja na GitHub Pages się nie udała, więc link może jeszcze nie działać. Wpis jest zapisany w main i pojawi się przy następnej udanej publikacji.";
  }
  try {
    const odp = await wyslij(process.env.TELEGRAM_CHAT_ID, tekst, w.odpowiedzNa);
    if (w.slug) stan.wiadomosciJanka[String(odp.message_id)] = w.slug;
  } catch (e) {
    log("Nie wysłano wiadomości, spróbuję następnym razem:", e.message);
    zostaje.push(w);
  }
}
log(`Wysłano ${stan.doWyslania.length - zostaje.length} z ${stan.doWyslania.length} wiadomości`);
stan.doWyslania = zostaje;
zapiszStan(stan);
await wypchnijSkrzynke("wysłane wiadomości");
