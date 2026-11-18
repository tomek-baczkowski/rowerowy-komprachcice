# Agent „Janek” – wpisy o naprawach – specyfikacja

Repozytorium: `rowerowy-komprachcice` (strona statyczna, GitHub Pages, budowa `node build.mjs`, publikacja automatyczna po zmianie w `main`).
Agent nazywa się **Janek** (tak przedstawia się w grupie i tak go wołamy). Kod agenta w folderze `agent/` tego samego repozytorium.
Stan: 17.11.2026, wersja 2 – po przeglądzie repozytorium i akceptacji planu (zmiany względem wersji 1 na końcu).

## 1. Co ma się dziać

1. Szymon w grupie na Telegramie (Tomek, Szymon, bot) wrzuca zdjęcia roweru na stojaku i opis: tekstem albo nagraniem głosowym, w jednej lub kilku wiadomościach.
2. Pisze `gotowe`. Rozpoznawane także z interpunkcją, emoji i dowolną wielkością liter („Gotowe!”, „gotowe 👍”, „GOTOWE.”), ale tylko jako cała wiadomość („gotowe, wysyłam jeszcze jedno” to zwykły materiał).
3. Jeśli paczka nie ma zdjęć albo nie ma żadnego opisu (tekstu ani przepisanego nagrania), Janek nie publikuje, tylko odpisuje w grupie, czego brakuje. Materiały czekają; po uzupełnieniu wystarczy znowu `gotowe`.
4. Przy najbliższym uruchomieniu agent:
   - zbiera wszystkie materiały od poprzedniego `gotowe` do tego `gotowe`,
   - zamienia nagrania na tekst (już przy odbiorze),
   - pisze nowy poradnik według zasad ze słownika w Notion (punkt 4),
   - dodaje zdjęcia, publikuje stronę bezpośrednio w `main` (bez akceptacji, bez gałęzi pośrednich),
   - wysyła do grupy link do strony, frazę główną i listę rzeczy, których nie wiedział i pominął.
5. Poprawki: Tomek lub Szymon odpowiada (reply) na wiadomość Janka z linkiem albo pisze wiadomość zaczynającą się od „Janek”, np. „Janek, zmień tytuł na …”, „Janek, usuń trzecie zdjęcie we wpisie o suporcie”. Bez odpowiedzi na konkretną wiadomość Janek sam ustala, o który wpis chodzi (domyślnie ostatni). Przy najbliższym uruchomieniu poprawia stronę, publikuje i odpisuje linkiem.
6. Wiadomości bez „gotowe” i bez „Janek” to materiały do następnego wpisu; Janek na nie nie odpowiada.

Czas reakcji nie jest ważny (może być kilka godzin).

## 2. Architektura

- **GitHub Actions**, workflow `.github/workflows/naprawy.yml`: harmonogram co 2 godziny + ręczne uruchomienie (`workflow_dispatch`). Jedno uruchomienie naraz (`concurrency`).
- **Skrzynka** – gałąź `bot-skrzynka` (`agent/skrzynka.mjs`). Tu czekają materiały między uruchomieniami (Telegram trzyma nieodebrane wiadomości tylko 24 h): `stan.json` i `zdjecia/`. Gałąź nie uruchamia publikacji strony (`pages.yml` reaguje tylko na `main`). Repozytorium jest publiczne, dlatego:
  - zdjęcia trafiają do skrzynki już bez EXIF i GPS,
  - nagrania nie są zapisywane, tylko ich tekst.
- **Krok A – skrypt bez AI** (`agent/telegram.mjs`):
  - pobiera nowe wiadomości z Telegram Bot API (`getUpdates` z offsetem zapisanym w skrzynce; offset rośnie dopiero po zapisaniu skrzynki, więc nic nie ginie),
  - przyjmuje tylko wiadomości z naszej grupy i od naszych dwóch kont (`TELEGRAM_CHAT_ID`, `TELEGRAM_ALLOWED_USERS`), resztę ignoruje,
  - pobiera zdjęcia (także albumy i zdjęcia wysłane jako plik) i nagrania,
  - przygotowuje `agent/praca/zadania.json`: najwyżej 3 nowe paczki i 5 poprawek na uruchomienie,
  - jeśli nie ma ani kompletnej paczki, ani prośby o poprawkę – kończy pracę. **Claude uruchamiamy tylko wtedy, gdy jest co robić.**
- **Krok B – zamiana głosu na tekst** (`agent/lib/gemini.mjs`): Gemini API, darmowy poziom (`GEMINI_API_KEY`, model w zmiennej `GEMINI_MODEL`, domyślnie `gemini-2.5-flash`). Działa przy odbiorze nagrania, 3 próby. Jeśli się nie uda, bot pisze w grupie „Nie udało się przepisać nagrania, napisz to tekstem” i paczka nie jest publikowana, dopóki po tym nagraniu nie przyjdzie wiadomość tekstowa. Uwaga: na darmowym poziomie Google może używać przesłanych danych do ulepszania usług.
- **Krok C – słownik z Notion** (`agent/notion.mjs`, `NOTION_TOKEN`, integracja tylko do odczytu): pobiera stronę „Słownik fraz SEO i AI – serwis, części, rowery” do `agent/praca/slownik.md`. **Cen nie pobiera** – ceny są w `dane/cennik.mjs` (punkt 4). Słownika nie kopiujemy do repozytorium.
- **Krok D – agent**: `anthropics/claude-code-action@v1` z `claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}` (abonament Tomka). Polecenie w `agent/PROMPT.md` (Tomek poprawia je sam), format wpisu w `agent/FORMAT-WPISU.md`. Claude ma tylko narzędzia do czytania i edycji plików (bez powłoki, bez gita) i nie widzi sekretów Telegrama, Gemini ani Notion.
- **Krok E – publikacja** (`agent/publikuj.mjs`, bez AI) – kontroluje pracę Claude niezależnie od polecenia:
  - zmienione mogą być tylko pliki `dane/naprawy/*.json`; nic nie może zniknąć; najwyżej 3 nowe wpisy,
  - każdy wpis przechodzi walidację szablonu (pola, długości, ceny z cennika, linki do istniejących stron, alt zdjęć); fraza główna nie może się powtarzać,
  - skrypt zamienia zdjęcia na pliki strony, ustawia datę publikacji (nowy wpis) albo datę zmiany (poprawka),
  - `node build.mjs` musi przejść bez błędów,
  - przed pushem pobiera najnowszy `main` (Tomek równolegle zmienia stronę), buduje jeszcze raz, commit „Janek: …” do `main`,
  - push zrobiony tokenem workflow nie uruchamia innych workflow, więc `agent/strona.sh` uruchamia `pages.yml` ręcznie (`workflow_dispatch`) i czeka na wynik; link idzie do grupy dopiero po publikacji (gdy publikacja strony się nie uda, wiadomość ma o tym dopisek),
  - gdy cokolwiek się nie zgadza: nic nie trafia do `main`, w grupie opis błędu, paczka zostaje w skrzynce; po 3 nieudanych próbach paczka jest wstrzymana, a `gotowe` bez nowych materiałów wznawia ją.
- **Błędy Claude** (`agent/blad.mjs`): gdy logowanie się nie uda (np. wygasł token), Janek pisze o tym w grupie, a paczka zostaje w skrzynce. Osobne komunikaty dla wyczerpanego limitu i innych błędów. Ten sam komunikat najwyżej raz na 24 h.
- **Wiadomości** (`agent/powiadom.mjs`): na końcu każdego uruchomienia; niewysłane czekają do następnego.

Później, gdy zadziała płatność w Claude Console, przełączymy krok D na `anthropic_api_key` (zmiana jednej linii w workflow).

## 3. Sekrety i zmienne w GitHubie (dodaje Tomek, nigdy w kodzie ani w czacie)

Sekrety: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_ALLOWED_USERS` (identyfikatory kont oddzielone przecinkiem), `GEMINI_API_KEY`, `NOTION_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`.
Zmienna (nieobowiązkowa): `GEMINI_MODEL`.

## 4. Treść wpisu

Najważniejsze są zasady ze słownika w Notion (punkt 1 „Zasady dla agenta” i punkt 7 „Czego nie piszemy”). Do tego:

- **Miejsce:** wpis to plik danych `dane/naprawy/<adres>.json`; szablon `strony/naprawy.mjs` robi z niego stronę `/poradniki/<adres>/` w wyglądzie istniejących poradników. Janek nie edytuje kodu ani HTML.
- **Lista poradników, mapa witryny, `llms.txt`:** wpis pojawia się w nich sam przy budowie. Na `/poradniki/` wpisy Janka są w bloku „Z warsztatu” nad dotychczasową listą, od najnowszego.
- **Fraza główna:** długi ogon dopasowany do opisanej usterki, np. „skrzypi suport w rowerze Kross Hexagon”. Przed wyborem Claude sprawdza w repozytorium, czy inna strona już na nią nie celuje. Fraz landingów usług nie przejmuje, tylko do nich linkuje.
- **Budowa wpisu:**
  - krótka odpowiedź (2–3 zdania),
  - objaw („jak to wyglądało”),
  - przyczyna,
  - co zrobiliśmy (kroki),
  - narzędzia i części,
  - **Uwagi warsztatu** – własne obserwacje Szymona, jak najbliżej jego słów (wymagane),
  - ile to kosztuje – **tylko pozycje z `dane/cennik.mjs`** (ta sama kopia co cennik na stronie); we wpisie zapisana jest nazwa pozycji, kwotę wstawia szablon,
  - FAQ 2–3,
  - WhatsApp i Zadzwoń (dodaje szablon),
  - 2–4 linki wewnętrzne.
- **Autor:** Szymon, z datą publikacji (i datą zmiany po poprawce). Dane strukturalne: Article (autor jako osoba, daty, zdjęcia) i FAQPage.
- **Zdjęcia:**
  - WebP w dwóch rozmiarach jak reszta strony: dłuższy bok 1280 px (ok. 200 KB) i 640 px, bez danych EXIF i GPS (`src/img/naprawy/<adres>-<n>-1280.webp` i `-640.webp`),
  - opisowy tekst alternatywny z modelem roweru i nazwą części,
  - pierwsze zdjęcie jako zdjęcie główne strony (`og:image`), pozostałe w galerii pod tekstem.
- **Niczego nie wymyślaj.** Czego brakuje w materiałach (model, cena części, przyczyna), to pomiń w tekście i wypisz w wiadomości do grupy.
- **Nie zmieniaj** innych stron. Niczego nie usuwaj (zdjęcie usunięte z wpisu znika ze strony, ale jego plik zostaje w repozytorium).

## 5. Bezpieczeństwo i porządek

- Najwyżej 3 nowe wpisy na jedno uruchomienie (pilnuje tego krok A i krok E).
- Logi bez treści sekretów (wartości sekretów są maskowane także w komunikatach błędów).
- Każdy krok dostaje tylko te sekrety, których potrzebuje.
- Opis działania agenta w README (jak uruchomić ręcznie, gdzie zmienić polecenie, jak przełączyć na klucz API, jak testować).
- Test na sztucznych wiadomościach: `npm test --prefix agent` (fałszywy Telegram, Gemini i Notion, lokalne repozytorium).

## Zmiany względem wersji 1 (17.11.2026)

- Wpis to plik JSON + wspólny szablon zamiast osobnej strony pisanej przez Claude; lista poradników, mapa witryny i `llms.txt` aktualizują się same, a zakaz zmieniania innych stron jest sprawdzany automatycznie.
- Ceny z `dane/cennik.mjs`, nie z bazy Notion „Cennik Napraw”; z Notion pobieramy tylko słownik. Synchronizacja kopii cennika z Notion – osobno, później.
- Zdjęcia 640/1280 px (jak cała strona) zamiast maks. 1600 px.
- Publikację strony uruchamia workflow Janka (`pages.yml` przez `workflow_dispatch`), bo push tokenem workflow nie uruchamia innych workflow.
- „gotowe” rozpoznawane z interpunkcją i emoji; paczka bez zdjęć albo bez opisu nie jest publikowana; nieudane logowanie do Claude zgłaszane w grupie.
- Zdjęcia w skrzynce bez EXIF/GPS, nagrania tylko jako tekst (repozytorium publiczne).
- Blok „Z warsztatu” nad obecną listą poradników.
