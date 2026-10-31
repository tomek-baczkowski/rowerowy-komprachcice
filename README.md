# rowerowy.komprachcice.com – strona serwisu rowerowego Warsztat Komprachcice

Strona statyczna: czysty HTML, CSS i JavaScript. Bez WordPressa i bez bazy danych.
Brief i wszystkie ustalenia: Notion → Warsztat Partner → Notatki i analizy → „Nowa strona internetowa serwisu – materiały i plan”.

## Jak to jest zbudowane

| Folder / plik | Co tam jest |
|---|---|
| `dane/firma.mjs` | adres, telefony, godziny, dane spółki – **jedno miejsce**, zmiana tu zmienia całą stronę |
| `dane/cennik.mjs` | cennik (kopia bazy Notion „Cennik Napraw”, ceny brutto) |
| `strony/glowna.mjs` | strona główna |
| `strony/uslugi.mjs` | usługi, landingi pod wizytówkę Google, cennik |
| `strony/informacje.mjs` | bon, kontakt, o nas, części, rowery używane, pytania, prywatność |
| `lib/layout.mjs` | wspólny nagłówek, stopka, menu, dane strukturalne schema.org |
| `src/css/style.css` | wygląd |
| `src/js/promocje.js` | promocje sezonowe – wpisz daty raz, strona sama pokaże właściwą |
| `src/js/main.js` | menu na telefonie, mapa po kliknięciu, liczenie kliknięć WhatsApp/telefon/e-mail |
| `src/img/` | zdjęcia w formacie WebP (640 i 1280 px) |
| `build.mjs` | skleja wszystko w gotowe pliki w `dist/` + mapa witryny, robots.txt, llms.txt |

## Jak zbudować

```
node build.mjs
```

Gotowa strona jest w folderze `dist/` – to ten folder wgrywa się na hosting.
Podgląd na komputerze: `npm run podglad` i otwórz http://localhost:8080.

## Typowe zmiany

- **Cena:** `dane/cennik.mjs` (i baza Notion) + ceny w tekstach landingów w `strony/uslugi.mjs`.
- **Godziny, telefon:** `dane/firma.mjs`. Pamiętaj, żeby to samo było w wizytówce Google i na Facebooku.
- **Promocja:** `src/js/promocje.js`.
