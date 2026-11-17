# Format wpisu Janka (część techniczna)

Ten plik opisuje, jak zapisać wpis, żeby szablon `strony/naprawy.mjs` zrobił z niego stronę.
Zasady treści są w `agent/PROMPT.md` i w słowniku z Notion. Zmiana tego formatu wymaga zmiany szablonu.

## Pliki

- Wpis: `dane/naprawy/<adres>.json` → strona `/poradniki/<adres>/`.
- Na liście poradników, w mapie witryny i w `llms.txt` wpis pojawia się sam. Tych plików nie zmieniasz.
- Zdjęcia dokłada skrypt publikacji: Ty wpisujesz tylko `id` zdjęcia z `agent/praca/zadania.json` i tekst alternatywny.

## Pola

```json
{
  "slug": "skrzypi-suport-kross-hexagon",
  "fraza": "skrzypi suport w rowerze Kross Hexagon",
  "h1": "Skrzypi suport w rowerze Kross Hexagon – co było przyczyną",
  "tytul": "Skrzypi suport w Kross Hexagon – naprawa",
  "opis": "Opis meta, 50–170 znaków, z frazą główną i ceną z cennika.",
  "odpowiedz": "Krótka odpowiedź, 2–3 zdania, z frazą główną w pierwszych dwóch zdaniach.",
  "objaw": ["Akapit: jak to wyglądało."],
  "przyczyna": ["Akapit: co było przyczyną."],
  "kroki": ["Co zrobiliśmy – krok 1.", "Krok 2."],
  "narzedzia": ["klucz do suportu"],
  "czesci": ["suport BSA 68 mm"],
  "uwagi": ["Uwagi warsztatu – słowa Szymona, jak najbliżej oryginału."],
  "ceny": ["Kasowanie luzu suportu ze smarowaniem łożysk"],
  "faq": [["Pytanie?", "Odpowiedź."]],
  "linki": [["/przeglad-roweru/", "przegląd roweru"], ["/cennik/", "cennik serwisu rowerowego"]],
  "naglowki": { "przyczyna": "Dlaczego skrzypi suport w Kross Hexagon" },
  "zdjecia": [{ "id": "p123-z1", "alt": "Kross Hexagon na stojaku serwisowym, widok na suport i korbę" }]
}
```

| Pole | Wymagane | Zasady |
|---|---|---|
| `slug` | tak | = nazwa pliku bez `.json`; małe litery bez polskich znaków, cyfry, myślniki; do 80 znaków; zawiera frazę główną |
| `fraza` | tak | fraza główna, 5–120 znaków; nie może powtarzać frazy innego wpisu |
| `h1` | tak | 10–120 znaków, z frazą główną |
| `tytul` | tak | tytuł w Google, 10–70 znaków (szablon dopisuje „ \| Warsztat Komprachcice”) |
| `opis` | tak | opis meta, 50–170 znaków |
| `odpowiedz` | tak | 40–600 znaków |
| `objaw`, `przyczyna` | nie | listy akapitów (1–6); pomiń pole, jeśli nie wiesz |
| `kroki` | tak | 1–15 kroków |
| `narzedzia`, `czesci` | nie | 1–15 pozycji; pomiń, jeśli nie wiesz |
| `uwagi` | tak | 1–6 akapitów; bez „Uwag warsztatu” wpis nie idzie |
| `ceny` | nie | **dokładne nazwy pozycji z `dane/cennik.mjs`** (drugi element każdej pozycji); kwotę wstawia szablon |
| `faq` | nie | 0–3 pary [pytanie, odpowiedź] |
| `linki` | tak | 2–4 pary [adres zaczynający się od `/`, tekst linku]; adres musi istnieć na stronie |
| `naglowki` | nie | własne śródtytuły sekcji: `objaw`, `przyczyna`, `kroki`, `narzedzia`, `uwagi`, `ceny` |
| `zdjecia` | tak | 1–12; pierwsze to zdjęcie główne strony; `alt` co najmniej 15 znaków |

Nie wpisuj `dataPublikacji`, `dataZmiany` ani pól `plik`, `szer`, `wys`, `szerMala`: ustawia je skrypt publikacji.
W poprawce zdjęcia już opublikowane mają pole `plik` – zostaw je, możesz zmienić ich kolejność, `alt` albo usunąć z listy.
Nowe zdjęcie z poprawki dodajesz jako `{ "id": "...", "alt": "..." }`.

Tekst w polach to zwykły tekst (bez HTML i Markdown).

## Wynik: `agent/praca/wynik.json`

```json
{
  "zadania": [
    { "id": "p123", "status": "ok", "slug": "skrzypi-suport-kross-hexagon",
      "braki": ["rocznik roweru", "cena nowego suportu"] },
    { "id": "k130", "status": "ok", "slug": "skrzypi-suport-kross-hexagon",
      "podsumowanie": "Zmieniłem tytuł na …" },
    { "id": "k131", "status": "pominiete", "powod": "Nie wiem, które zdjęcie jest trzecie – we wpisie są dwa." }
  ]
}
```

- Każde zadanie z `zadania.json` musi mieć tu wpis.
- `braki` (nowe wpisy): czego nie było w materiałach i co pominąłeś. Krótko, po polsku.
- `podsumowanie` (poprawki): jedno zdanie, co zmieniłeś.
- `pominiete` tylko z konkretnym `powod`, który trafi do grupy.
