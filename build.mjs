// Budowanie strony: node build.mjs  →  gotowe pliki w folderze dist/
// Każda podstrona to plik dist/<adres>/index.html, więc adresy są „ładne”: /cennik/ itd.
import { mkdirSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { dirname, join } from "node:path";
import { firma } from "./dane/firma.mjs";
import glowna from "./strony/glowna.mjs";
import { wszystkie as uslugi } from "./strony/uslugi.mjs";
import { wszystkie as informacje } from "./strony/informacje.mjs";

const DIST = "dist";
rmSync(DIST, { recursive: true, force: true });
cpSync("src", DIST, { recursive: true });

const strony = [{ sciezka: "/", html: glowna() }, ...uslugi(), ...informacje()];

for (const s of strony) {
  const plik = join(DIST, s.sciezka, "index.html");
  mkdirSync(dirname(plik), { recursive: true });
  writeFileSync(plik, s.html);
}

// 404
writeFileSync(join(DIST, "404.html"), strony.find((s) => s.sciezka === "/404/").html);
rmSync(join(DIST, "404"), { recursive: true, force: true });

// Mapa witryny
const dzis = new Date().toISOString().slice(0, 10);
const doMapy = strony.filter((s) => s.sciezka !== "/404/");
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${doMapy.map((s) => `  <url><loc>${firma.domena}${s.sciezka}</loc><lastmod>${dzis}</lastmod></url>`).join("\n")}
</urlset>
`);

// robots.txt – bez blokowania botów (także AI)
writeFileSync(join(DIST, "robots.txt"), `User-agent: *
Allow: /

Sitemap: ${firma.domena}/sitemap.xml
`);

// llms.txt – krótki opis dla asystentów AI
writeFileSync(join(DIST, "llms.txt"), `# ${firma.marka} – ${firma.podpis}

> Stacjonarny serwis rowerowy w Komprachcicach (${firma.ulica}, ${firma.kod} ${firma.miasto}), 10 minut od Opola. Przeglądy, naprawy, centrowanie kół, napęd, montaż akcesoriów, rowery elektryczne wszystkich marek. Przyjmujemy rowery bez umawiania. Telefon i WhatsApp: ${firma.telefon}.

Godziny: ${firma.godziny.map((g) => `${g.dni} ${g.zamkniete ? "zamknięte" : `${g.od}–${g.do}`}`).join("; ")}.
Obszar: Komprachcice, Opole i okolice (Prószków, Dąbrowa, Skorogoszcz). Transport rowerów w pasie Skorogoszcz – Opole – Komprachcice.
Ceny brutto (z VAT): przegląd roweru 279 zł, konserwacja zimowa 249 zł (listopad–grudzień), przegląd roweru dziecięcego do 20″ 199 zł, wymiana dętki lub opony 40 zł, centrowanie koła 60 zł, wymiana łańcucha 39 zł, przegląd zerowy roweru elektrycznego 150 zł.
Gwarancja na usługi 30 dni. Płatność: gotówka, karta, BLIK; faktury.

## Strony
${doMapy.map((s) => `- [${s.tytulKrotki || s.sciezka}](${firma.domena}${s.sciezka})`).join("\n")}
`);

console.log(`Zbudowano ${strony.length} stron w ${DIST}/`);
