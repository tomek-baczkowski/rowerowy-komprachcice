// Otwiera skrzynkę Janka: gałąź bot-skrzynka jako osobny katalog (git worktree).
// Gałąź nie uruchamia publikacji strony (pages.yml reaguje tylko na main).
// Użycie: node agent/skrzynka.mjs
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { git, log, REPO, SKRZYNKA, GALAZ_SKRZYNKI, wczytajStan, zapiszStan, wypchnijSkrzynke } from "./lib/wspolne.mjs";

if (existsSync(join(SKRZYNKA, ".git"))) {
  log("Skrzynka już otwarta:", SKRZYNKA);
} else {
  let jest = true;
  try {
    git(["fetch", "-q", "origin", `+refs/heads/${GALAZ_SKRZYNKI}:refs/remotes/origin/${GALAZ_SKRZYNKI}`], { cicho: true });
  } catch {
    jest = false;
  }
  if (jest) {
    git(["worktree", "add", "-q", "--force", "-B", GALAZ_SKRZYNKI, SKRZYNKA, `origin/${GALAZ_SKRZYNKI}`], { cwd: REPO });
    log("Otworzono skrzynkę z gałęzi", GALAZ_SKRZYNKI);
  } else {
    git(["worktree", "add", "-q", "--orphan", "-b", GALAZ_SKRZYNKI, SKRZYNKA], { cwd: REPO });
    writeFileSync(join(SKRZYNKA, "README.md"), `# Skrzynka Janka

Gałąź robocza agenta Janek. Tu czekają materiały z Telegrama do czasu „gotowe”:
\`stan.json\` (wiadomości, paczki, poprawki, kolejka odpowiedzi) i \`zdjecia/\` (już bez EXIF i GPS).
Nagrania głosowe nie są tu zapisywane, tylko ich tekst.

Nie scalaj tej gałęzi z main. Nie uruchamia publikacji strony.
`);
    zapiszStan(wczytajStan());
    await wypchnijSkrzynke("utworzenie skrzynki");
    log("Utworzono nową gałąź", GALAZ_SKRZYNKI);
  }
}
