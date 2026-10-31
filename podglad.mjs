// Wersja podglądowa (linki względne) – do pokazania strony przed uruchomieniem na domenie.
// node build.mjs && node podglad.mjs  →  folder podglad/
import { cpSync, rmSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const OUT = "podglad";
rmSync(OUT, { recursive: true, force: true });
cpSync("dist", OUT, { recursive: true });

const pliki = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? pliki(p) : [p]; });

const naWzgledny = (s) => s
  .replace(/(href|src)="\/(?!\/)([^"]*)"/g, (m, a, u) => `${a}="${u === "" ? "index.html" : u.endsWith("/") ? u + "index.html" : u.replace("/#", "/index.html#")}"`)
  .replace(/srcset="([^"]+)"/g, (m, v) => `srcset="${v.replace(/(^|, )\//g, "$1")}"`);

for (const f of pliki(OUT)) {
  if (f.endsWith(".html")) {
    const glebokosc = relative(OUT, dirname(f)).split("/").filter(Boolean).length;
    const base = glebokosc ? "../".repeat(glebokosc) : "./";
    const wlasna = relative(OUT, f);
    let s = naWzgledny(readFileSync(f, "utf8")).replace(/href="#/g, `href="${wlasna}#`);
    s = s.replace("<head>", `<head>\n<base href="${base}">`);
    s = s.replace(/<link rel="canonical"[^>]*>\n/, "").replace("<head>", '<head>\n<meta name="robots" content="noindex">');
    writeFileSync(f, s);
  } else if (f.endsWith(".css")) {
    writeFileSync(f, readFileSync(f, "utf8").replace(/url\(\/(fonts|img)\//g, "url(../$1/"));
  } else if (f.endsWith(".js")) {
    writeFileSync(f, readFileSync(f, "utf8")
      .replace(/"\/img\//g, '"img/')
      .replace(/link: "\/([^"]*)\/"/g, 'link: "$1/index.html"'));
  }
}
console.log("Podgląd w folderze", OUT);
