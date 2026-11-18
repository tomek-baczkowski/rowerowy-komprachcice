// Klient Telegram Bot API (tylko to, czego Janek potrzebuje).
// TELEGRAM_API_BASE pozwala podmienić serwer w testach.
import { ukryj } from "./wspolne.mjs";

const baza = () => process.env.TELEGRAM_API_BASE || "https://api.telegram.org";
const token = () => process.env.TELEGRAM_BOT_TOKEN;

async function wywolaj(metoda, parametry = {}) {
  const odp = await fetch(`${baza()}/bot${token()}/${metoda}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parametry),
  });
  const dane = await odp.json().catch(() => ({}));
  if (!dane.ok) throw new Error(ukryj(`Telegram ${metoda}: ${odp.status} ${dane.description || ""}`.trim()));
  return dane.result;
}

export const pobierzAktualizacje = (offset) =>
  wywolaj("getUpdates", { offset, timeout: 0, allowed_updates: ["message"] });

export const kimJestem = () => wywolaj("getMe");

export async function pobierzPlik(fileId) {
  const plik = await wywolaj("getFile", { file_id: fileId });
  const odp = await fetch(`${baza()}/file/bot${token()}/${plik.file_path}`);
  if (!odp.ok) throw new Error(`Telegram: nie udało się pobrać pliku (${odp.status})`);
  return { bufor: Buffer.from(await odp.arrayBuffer()), sciezka: plik.file_path };
}

export function wyslij(chatId, tekst, odpowiedzNa = null) {
  const p = { chat_id: chatId, text: tekst, link_preview_options: { is_disabled: false } };
  if (odpowiedzNa) p.reply_parameters = { message_id: odpowiedzNa, allow_sending_without_reply: true };
  return wywolaj("sendMessage", p);
}
