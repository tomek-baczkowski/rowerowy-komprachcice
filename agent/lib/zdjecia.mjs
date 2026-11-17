// Obróbka zdjęć: obrót według EXIF, zmniejszenie, WebP, bez metadanych (EXIF, GPS).
// sharp domyślnie nie przepisuje metadanych do pliku wynikowego.
import sharp from "sharp";

// Przy odbiorze z Telegrama: kopia robocza do skrzynki, już bez EXIF i GPS.
export async function doSkrzynki(bufor) {
  return sharp(bufor, { failOn: "none" })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer();
}

// Podgląd dla Claude (JPEG, mały).
export async function podglad(bufor) {
  return sharp(bufor).resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
}

// Wersja na stronę: dłuższy bok najwyżej `bok` px, plik ok. `limitKB`.
export async function naStrone(bufor, bok, limitKB = 200) {
  let wynik;
  for (const jakosc of [80, 72, 64, 56, 48]) {
    wynik = await sharp(bufor).resize({ width: bok, height: bok, fit: "inside", withoutEnlargement: true }).webp({ quality: jakosc }).toBuffer({ resolveWithObject: true });
    if (wynik.data.length <= limitKB * 1024) break;
  }
  return { bufor: wynik.data, szer: wynik.info.width, wys: wynik.info.height };
}

export async function maMetadane(bufor) {
  const m = await sharp(bufor).metadata();
  return Boolean(m.exif || m.xmp || m.iptc);
}
