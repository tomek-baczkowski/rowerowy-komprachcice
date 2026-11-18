#!/usr/bin/env bash
# Uruchamia publikację strony (pages.yml) i czeka na jej wynik.
# Potrzebne, bo push zrobiony tokenem workflow nie uruchamia innych workflow,
# a ręczne uruchomienie (workflow_dispatch) – tak.
set -euo pipefail
start=$(date -u +%Y-%m-%dT%H:%M:%SZ)
gh workflow run pages.yml --ref main
id=""
for _ in $(seq 1 40); do
  sleep 6
  id=$(gh run list --workflow pages.yml --event workflow_dispatch --limit 5 --json databaseId,createdAt \
    --jq "[.[] | select(.createdAt >= \"$start\")] | last | .databaseId // empty")
  [ -n "$id" ] && break
done
if [ -z "$id" ]; then echo "Nie znalazłem uruchomienia pages.yml"; exit 1; fi
echo "Publikacja strony: uruchomienie $id"
gh run watch "$id" --exit-status --interval 15 > /dev/null
echo "Strona opublikowana"
