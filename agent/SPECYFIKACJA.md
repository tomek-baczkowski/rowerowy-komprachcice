# Agent „Janek” – wpisy o naprawach – specyfikacja dla Claude Code

Repozytorium: `rowerowy-komprachcice` (strona statyczna, GitHub Pages, budowa `node build.mjs`, publikacja automatyczna po zmianie w `main`).
Agent nazywa się **Janek** (tak przedstawia się w grupie i tak go wołamy). Stan: 17.11.2026. Kod agenta w folderze `agent/` tego samego repozytorium. Zanim zaczniesz pisać kod, przeczytaj repozytorium (README, build.mjs, istniejące strony w /poradniki/) i pokaż mi plan.

## 1. Co ma się dziać

1. Szymon w grupie na Telegramie (Tomek, Szymon, bot) wrzuca zdjęcia roweru na stojaku i opis: tekstem albo nagraniem głosowym, w jednej lub kilku wiadomościach.
2. Pisze `gotowe`.
3. Przy najbliższym uruchomieniu agent:
   - zbiera wszystkie materiały od poprzedniego `gotowe` do tego `gotowe`,
   - zamienia nagrania na tekst,
   - pisze nowy poradnik według zasad z Notion (punkt 4),
   - dodaje zdjęcia, publikuje stronę bezpośrednio w `main` (bez akceptacji, bez gałęzi pośrednich),
   - wysyła do grupy link do strony, frazę główną i listę rzeczy, których nie wiedział i pominął.
4. Poprawki: Tomek lub Szymon odpowiada (reply) na wiadomość Janka z linkiem albo pisze wiadomość zaczynającą się od „Janek”, np. „Janek, zmień tytuł na …”, „Janek, usuń trzecie zdjęcie we wpisie o suporcie”. Bez odpowiedzi na konkretną wiadomość Janek sam ustala, o który wpis chodzi (domyślnie ostatni). Przy najbliższym uruchomieniu poprawia stronę, publikuje i odpisuje linkiem.
5. Wiadomości bez „gotowe” i bez „Janek” to materiały do następnego wpisu; Janek na nie nie odpowiada.

Czas reakcji nie jest ważny (może być kilka godzin).

## 2. Architektura

- **GitHub Actions**, workflow `.github/workflows/naprawy.yml`: harmonogram co 2 godziny + ręczne uruchomienie (`workflow_dispatch`).
- **Krok A – skrypt bez AI** (Node, `agent/telegram.mjs`):
  - pobiera nowe wiadomości z Telegram Bot API (`getUpdates` z offsetem),
  - przyjmuje tylko wiadomości z naszej grupy i od naszych dwóch kont (sekrety `TELEGRAM_CHAT_ID`, `TELEGRAM_ALLOWED_USERS`), resztę ignoruje,
  - pobiera zdjęcia i nagrania,
  - **przechowuje materiały między uruchomieniami**, dopóki nie przyjdzie `gotowe` (Telegram trzyma nieodebrane wiadomości tylko 24 h). Zaproponuj sposób, który nie uruchamia publikacji strony, np. osobna gałąź `bot-skrzynka`,
  - jeśli nie ma ani kompletnej paczki, ani prośby o poprawkę – kończy pracę. **Claude uruchamiamy tylko wtedy, gdy jest co robić** (oszczędzamy limity abonamentu).
- **Krok B – zamiana głosu na tekst**: Gemini API, darmowy poziom (sekret `GEMINI_API_KEY`). Jeśli się nie uda, bot pisze w grupie: „Nie udało się przepisać nagrania, napisz to tekstem” i nie publikuje tej paczki.
- **Krok C – kontekst z Notion** (skrypt bez AI, `agent/notion.mjs`, sekret `NOTION_TOKEN`, dostęp tylko do odczytu):
  - pobiera stronę „Słownik fraz SEO i AI – serwis, części, rowery” i bazę „Cennik Napraw”,
  - zapisuje je jako pliki tymczasowe do kroku D.
  - Notion jest jedynym źródłem zasad i cen, w repozytorium nie trzymamy ich kopii.
- **Krok D – agent**: `anthropics/claude-code-action@v1` z `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` (abonament Tomka). Polecenie z pliku `agent/PROMPT.md`, który Tomek będzie sam poprawiał.
- **Krok E – publikacja**:
  - `node build.mjs` musi przejść bez błędów,
  - przed commitem pobierz najnowszy stan `main` (Tomek równolegle zmienia stronę), potem commit do `main` z opisem „Janek: …” i wiadomość do grupy z linkiem.
  - Gdy budowa się nie uda: nic nie publikuj, napisz w grupie, co poszło źle.

Później, gdy zadziała płatność w Claude Console, przełączymy krok D na `anthropic_api_key` (zmiana jednej linii).

## 3. Sekrety w GitHubie (dodaje Tomek, nigdy w kodzie ani w czacie)

`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ALLOWED_USERS`, `GEMINI_API_KEY`, `NOTION_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`.

## 4. Treść wpisu (zawartość `agent/PROMPT.md`)

Najważniejsze są zasady ze słownika w Notion (punkt 1 „Zasady dla agenta” i punkt 7 „Czego nie piszemy”). Do tego:

- **Miejsce:** nowa strona w `/poradniki/<adres>/`, w tym samym wyglądzie i budowie co istniejące poradniki. Wpis trafia też na listę poradników, do mapy witryny i do `llms.txt`.
- **Fraza główna:** długi ogon dopasowany do opisanej usterki, np. „skrzypi suport w rowerze Kross Hexagon”. Przed wyborem sprawdź w repozytorium, czy inna strona już na nią nie celuje. Fraz landingów usług nie przejmujesz, tylko do nich linkujesz.
- **Budowa wpisu:**
  - krótka odpowiedź (2–3 zdania),
  - objaw („jak to wyglądało”),
  - przyczyna,
  - co zrobiliśmy (kroki),
  - narzędzia i części,
  - **Uwagi warsztatu** – własne obserwacje Szymona, jak najbliżej jego słów,
  - ile to kosztuje (tylko z cennika),
  - FAQ 2–3,
  - WhatsApp i Zadzwoń,
  - 2–4 linki wewnętrzne.
- **Autor:** Szymon, z datą publikacji. Dane strukturalne: Article (autor, data) i FAQPage.
- **Zdjęcia:**
  - WebP, maks. 1600 px, ok. 200 KB, bez danych EXIF i GPS,
  - opisowy tekst alternatywny z modelem roweru i nazwą części,
  - pierwsze zdjęcie jako zdjęcie główne strony.
- **Niczego nie wymyślaj.** Czego brakuje w materiałach (model, cena części, przyczyna), to pomiń w tekście i wypisz w wiadomości do grupy.
- **Nie zmieniaj** innych stron poza listą poradników, mapą witryny i `llms.txt`. Niczego nie usuwaj.

## 5. Bezpieczeństwo i porządek

- Najwyżej 3 nowe wpisy na jedno uruchomienie.
- Logi bez treści sekretów.
- Krótki opis działania agenta w README (jak uruchomić ręcznie, gdzie zmienić polecenie, jak przełączyć na klucz API).
