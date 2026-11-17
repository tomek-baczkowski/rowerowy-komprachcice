// Rozpoznawanie sygnałów w wiadomościach z grupy. Bez zależności, łatwe do testowania.

// „gotowe” – sama wiadomość z tym słowem; dowolna wielkość liter, interpunkcja i emoji
// („Gotowe!”, „gotowe 👍”, „GOTOWE.”). „gotowe, wysyłam jeszcze jedno” to zwykły materiał.
export function czyGotowe(tekst) {
  if (!tekst) return false;
  const litery = tekst.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return litery === "gotowe";
}

// Prośba o poprawkę: wiadomość zaczyna się od „Janek” (np. „Janek, zmień tytuł…”, „@Janek …”).
export function czyJanek(tekst) {
  if (!tekst) return false;
  return /^[\s\p{P}\p{S}]*janek(?![\p{L}\p{N}])/iu.test(tekst.normalize("NFC"));
}

// Największy wariant zdjęcia albo zdjęcie wysłane jako plik.
export function zdjecieZWiadomosci(msg) {
  if (msg.photo?.length) {
    const naj = [...msg.photo].sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
    return { fileId: naj.file_id, unikalny: naj.file_unique_id };
  }
  if (msg.document?.mime_type?.startsWith("image/")) {
    return { fileId: msg.document.file_id, unikalny: msg.document.file_unique_id };
  }
  return null;
}

export function glosZWiadomosci(msg) {
  const g = msg.voice || msg.audio || (msg.document?.mime_type?.startsWith("audio/") ? msg.document : null);
  if (!g) return null;
  return { fileId: g.file_id, mime: g.mime_type || "audio/ogg", sekundy: g.duration || null };
}

export const tekstWiadomosci = (msg) => (msg.text ?? msg.caption ?? "").trim();

export const imie = (msg) => [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") || "ktoś";

// Co jest w paczce i czego brakuje. Zwraca listę braków (pusta = można publikować).
export function brakiPaczki(materialy) {
  const braki = [];
  const zdjecia = materialy.filter((m) => m.typ === "zdjecie");
  const opisy = materialy.filter((m) => (m.typ === "tekst" || m.typ === "glos") && m.tekst && m.tekst.trim());
  if (!zdjecia.length) braki.push("zdjęć roweru");
  if (!opisy.length) braki.push("opisu naprawy (tekstem albo nagraniem)");
  // Nagranie, którego nie udało się przepisać, blokuje paczkę, dopóki po nim nie przyjdzie tekst.
  const ostatnieNieudane = materialy.map((m, i) => (m.typ === "glos" && m.blad ? i : -1)).filter((i) => i >= 0).pop();
  if (ostatnieNieudane !== undefined && !materialy.slice(ostatnieNieudane + 1).some((m) => m.typ === "tekst")) {
    braki.push("treści nagrania, którego nie udało się przepisać (napisz ją tekstem)");
  }
  return braki;
}
