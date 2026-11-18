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
| `strony/poradniki.mjs` | poradniki „problem → rozwiązanie” i lista poradników |
| `strony/naprawy.mjs` | szablon wpisów „Z warsztatu” agenta Janek (dane w `dane/naprawy/*.json`) |
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

## Agent Janek – wpisy o naprawach z Telegrama

Szymon wrzuca do grupy na Telegramie zdjęcia i opis naprawy, pisze „gotowe”, a Janek publikuje z tego poradnik
w `/poradniki/<adres>/` i odsyła link. Pełny opis: `agent/SPECYFIKACJA.md`.

| Plik | Co tam jest |
|---|---|
| `.github/workflows/naprawy.yml` | przebieg co 2 godziny: Telegram → Notion → Claude → kontrola → publikacja → wiadomości |
| `agent/PROMPT.md` | **polecenie dla Claude – tu zmieniasz, jak Janek pisze** |
| `agent/FORMAT-WPISU.md` | format pliku wpisu (część techniczna, zmiana wymaga zmiany szablonu) |
| `agent/telegram.mjs`, `notion.mjs`, `publikuj.mjs`, `powiadom.mjs`, `blad.mjs` | kroki przebiegu (bez AI) |
| `dane/naprawy/*.json`, `src/img/naprawy/` | wpisy Janka i ich zdjęcia |
| gałąź `bot-skrzynka` | materiały czekające na „gotowe” (nie scalać z main) |

- **Uruchomienie ręczne:** GitHub → Actions → „Janek – wpisy o naprawach” → Run workflow.
- **Zmiana polecenia:** edytuj `agent/PROMPT.md` w main; działa od następnego uruchomienia.
- **Przełączenie na klucz API:** w `naprawy.yml` zamień linię `claude_code_oauth_token: …` na `anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}` i dodaj ten sekret.
- **Wygasł token Claude** (Janek pisze o tym w grupie): `claude setup-token` na komputerze, nowy token do sekretu `CLAUDE_CODE_OAUTH_TOKEN`.
- **Test bez Telegrama i Claude:** `npm ci --prefix agent && npm test --prefix agent`.
- **Ceny** Janek bierze z `dane/cennik.mjs` – zmiana ceny tam zmienia też wszystkie wpisy Janka.

### Pierwsze uruchomienie (raz)

1. BotFather: `/setprivacy` → wybierz bota → **Disable** (inaczej bot w grupie nie widzi zwykłych wiadomości ani zdjęć). Potem dodaj bota do grupy.
2. Sekrety (Settings → Secrets and variables → Actions): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (identyfikator grupy, zaczyna się od `-100`), `TELEGRAM_ALLOWED_USERS` (identyfikatory kont Tomka i Szymona, po przecinku), `GEMINI_API_KEY`, `NOTION_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`.
3. Notion: integracja z uprawnieniem tylko „Read content”, dodana do strony „Słownik fraz SEO i AI – serwis, części, rowery” (⋯ → Connections).
4. Jeśli `main` ma ochronę gałęzi, dopuść push z GitHub Actions.
