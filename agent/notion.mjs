// Krok C: pobiera z Notion stronę „Słownik fraz SEO i AI – serwis, części, rowery”
// i zapisuje ją jako agent/praca/slownik.md dla Claude. Tylko odczyt, bez AI.
// Ceny NIE są pobierane z Notion: Janek bierze je z dane/cennik.mjs (ta sama kopia co cennik na stronie).
// Użycie: node agent/notion.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { log, wymagane, PRACA, ponawiaj, ukryj } from "./lib/wspolne.mjs";

wymagane("NOTION_TOKEN");
const STRONA = process.env.NOTION_SLOWNIK_ID || "41b56ac4e24781449cc1eeac81883b99";
const BAZA = process.env.NOTION_API_BASE || "https://api.notion.com";

async function api(sciezka) {
  return ponawiaj(async () => {
    const odp = await fetch(`${BAZA}/v1/${sciezka}`, {
      headers: { authorization: `Bearer ${process.env.NOTION_TOKEN}`, "notion-version": "2022-06-28" },
    });
    const dane = await odp.json().catch(() => ({}));
    if (!odp.ok) throw new Error(ukryj(`Notion ${odp.status}: ${dane.message || ""}`));
    return dane;
  }, { proby: 3, opis: "Notion" });
}

async function dzieci(id) {
  const wynik = [];
  let kursor;
  do {
    const d = await api(`blocks/${id}/children?page_size=100${kursor ? `&start_cursor=${kursor}` : ""}`);
    wynik.push(...d.results);
    kursor = d.has_more ? d.next_cursor : null;
  } while (kursor);
  return wynik;
}

const tekst = (rt = []) => rt.map((r) => {
  let t = r.plain_text || "";
  if (r.annotations?.bold && t.trim()) t = `**${t}**`;
  return t;
}).join("");

async function blokiNaMd(bloki, wciecie = "") {
  const linie = [];
  let numer = 0;
  for (const b of bloki) {
    const d = b[b.type] || {};
    numer = b.type === "numbered_list_item" ? numer + 1 : 0;
    switch (b.type) {
      case "heading_1": linie.push(`\n# ${tekst(d.rich_text)}\n`); break;
      case "heading_2": linie.push(`\n## ${tekst(d.rich_text)}\n`); break;
      case "heading_3": linie.push(`\n### ${tekst(d.rich_text)}\n`); break;
      case "paragraph": linie.push(`${wciecie}${tekst(d.rich_text)}`); break;
      case "bulleted_list_item": linie.push(`${wciecie}- ${tekst(d.rich_text)}`); break;
      case "numbered_list_item": linie.push(`${wciecie}${numer}. ${tekst(d.rich_text)}`); break;
      case "to_do": linie.push(`${wciecie}- [${d.checked ? "x" : " "}] ${tekst(d.rich_text)}`); break;
      case "quote": case "callout": linie.push(`${wciecie}> ${tekst(d.rich_text)}`); break;
      case "toggle": linie.push(`${wciecie}${tekst(d.rich_text)}`); break;
      case "divider": linie.push("---"); break;
      case "table": {
        const wiersze = await dzieci(b.id);
        wiersze.forEach((w, i) => {
          linie.push(`| ${w.table_row.cells.map((c) => tekst(c).replace(/\|/g, "\\|")).join(" | ")} |`);
          if (i === 0) linie.push(`|${w.table_row.cells.map(() => " --- ").join("|")}|`);
        });
        linie.push("");
        continue;
      }
      default: break;
    }
    if (b.has_children && b.type !== "child_page" && b.type !== "child_database") {
      linie.push(...await blokiNaMd(await dzieci(b.id), wciecie + "  "));
    }
  }
  return linie;
}

const strona = await api(`pages/${STRONA}`);
const tytul = tekst(Object.values(strona.properties || {}).find((p) => p.type === "title")?.title);
const md = [`# ${tytul}`, `(pobrane z Notion ${new Date().toISOString().slice(0, 16)}, ostatnia zmiana strony ${strona.last_edited_time})`, "", ...await blokiNaMd(await dzieci(STRONA))].join("\n");
if (md.length < 500) throw new Error("Słownik z Notion jest podejrzanie krótki – czy integracja ma dostęp do strony?");
mkdirSync(PRACA, { recursive: true });
writeFileSync(join(PRACA, "slownik.md"), md + "\n");
log(`Zapisano słownik z Notion (${md.length} znaków)`);
