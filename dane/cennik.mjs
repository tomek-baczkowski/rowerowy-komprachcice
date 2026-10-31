// Cennik usług – ceny brutto z 8% VAT dla klientów indywidualnych.
// Źródło: baza Notion „Cennik Napraw” (pobrane 31.10.2026). Na stronie bez czasu pracy.
// Gdy zmienia się cena w Notion, popraw ją tutaj i przebuduj stronę (npm run build).

export const kategorie = [
  { id: "przeglady", nazwa: "Przeglądy" },
  { id: "kola-i-opony", nazwa: "Koła i opony" },
  { id: "hamulce", nazwa: "Hamulce" },
  { id: "naped-i-przerzutki", nazwa: "Napęd i przerzutki" },
  { id: "kierownica-i-stery", nazwa: "Kierownica i stery" },
  { id: "montaz-akcesoriow", nazwa: "Montaż akcesoriów" },
  { id: "rowery-elektryczne", nazwa: "Rowery elektryczne" },
];

// [kategoria, czynność, cena, wyróżniona]
export const pozycje = [
  ["przeglady", "Przegląd roweru", "279", true],
  ["przeglady", "Konserwacja zimowa roweru (listopad–grudzień)", "249", true],
  ["przeglady", "Przegląd roweru dziecięcego do 20″ (od 24″ cena jak przegląd roweru)", "199"],
  ["przeglady", "Montaż nowego roweru z kartonu producenta z przeglądem", "279"],

  ["kola-i-opony", "Wymiana opony lub dętki – przód", "40", true],
  ["kola-i-opony", "Wymiana opony lub dętki – tył", "40", true],
  ["kola-i-opony", "Wymiana opony lub dętki – tył, rower z pełną osłoną łańcucha", "60–100"],
  ["kola-i-opony", "Wymiana opony lub dętki – koło dostarczone bez roweru", "30"],
  ["kola-i-opony", "Centrowanie koła", "60", true],
  ["kola-i-opony", "Centrowanie koła – dostarczone bez roweru", "50"],
  ["kola-i-opony", "Dopłata do centrowania za wymianę szprych", "5"],
  ["kola-i-opony", "Zaplatanie nowego koła", "120"],
  ["kola-i-opony", "Przeplecenie koła", "150"],
  ["kola-i-opony", "Czyszczenie i smarowanie łożysk kulkowych w piaście", "50"],
  ["kola-i-opony", "Czyszczenie i smarowanie łożysk maszynowych w piaście", "30"],
  ["kola-i-opony", "Wymiana mleczka w kołach", "30"],
  ["kola-i-opony", "Montaż systemu bezdętkowego (taśma, wentyl, mleczko)", "79"],
  ["kola-i-opony", "Pompowanie koła", "2"],

  ["hamulce", "Regulacja hamulca", "35"],
  ["hamulce", "Regulacja hamulca tarczowego z odtłuszczeniem tarczy", "35–50"],
  ["hamulce", "Regulacja hamulca z wymianą klocków", "35–50"],
  ["hamulce", "Regulacja hamulca z wymianą linki", "35–50"],
  ["hamulce", "Regulacja hamulca z wymianą linki i pancerza", "40–60"],
  ["hamulce", "Prostowanie tarczy hamulcowej", "25"],
  ["hamulce", "Odpowietrzenie hamulca hydraulicznego", "60"],
  ["hamulce", "Odpowietrzenie hamulca z wymianą płynu", "90"],
  ["hamulce", "Wymiana przewodu hamulcowego z zalaniem i regulacją", "120–200"],
  ["hamulce", "Wymiana klamki hamulca v-brake", "40–50"],

  ["naped-i-przerzutki", "Wymiana łańcucha z oliwieniem", "39", true],
  ["naped-i-przerzutki", "Wymiana kasety lub wolnobiegu", "49"],
  ["naped-i-przerzutki", "Wymiana mechanizmu korbowego", "59"],
  ["naped-i-przerzutki", "Wymiana suportu", "69"],
  ["naped-i-przerzutki", "Kasowanie luzu suportu ze smarowaniem łożysk", "69"],
  ["naped-i-przerzutki", "Wymiana całego napędu", "150"],
  ["naped-i-przerzutki", "Czyszczenie i smarowanie napędu", "50"],
  ["naped-i-przerzutki", "Regulacja przerzutki przód lub tył", "29"],
  ["naped-i-przerzutki", "Regulacja przerzutki przód lub tył z wymianą linki", "39"],
  ["naped-i-przerzutki", "Regulacja przerzutki przód lub tył z wymianą manetki", "49"],
  ["naped-i-przerzutki", "Wymiana przerzutki przód lub tył z regulacją", "69"],
  ["naped-i-przerzutki", "Regulacja piasty z biegami wewnętrznymi", "15–150"],
  ["naped-i-przerzutki", "Montaż lub wymiana pedałów", "20"],

  ["kierownica-i-stery", "Wymiana kierownicy", "69"],
  ["kierownica-i-stery", "Wymiana mostka kierownicy", "49"],
  ["kierownica-i-stery", "Wymiana chwytów", "20"],
  ["kierownica-i-stery", "Montaż owijki na kierownicę szosową", "50"],
  ["kierownica-i-stery", "Regulacja sterów A-head", "20"],
  ["kierownica-i-stery", "Regulacja sterów skręcanych", "25"],
  ["kierownica-i-stery", "Wymiana sterów", "80–120"],
  ["kierownica-i-stery", "Wymiana widelca lub amortyzatora", "100–150"],

  ["montaz-akcesoriow", "Montaż koszyka", "20–40"],
  ["montaz-akcesoriow", "Montaż oświetlenia LED", "20–30"],
  ["montaz-akcesoriow", "Montaż błotników", "30–80"],
  ["montaz-akcesoriow", "Montaż podpórki", "20"],
  ["montaz-akcesoriow", "Montaż i ustawienie licznika", "40"],
  ["montaz-akcesoriow", "Montaż fotelika dziecięcego", "49"],

  ["rowery-elektryczne", "Przegląd zerowy roweru elektrycznego", "150", true],
  ["rowery-elektryczne", "Diagnostyka usterki elektrycznej roweru elektrycznego (wycena po obejrzeniu roweru)", "200–250"],
];

export function cenaZl(c) { return `${c} zł`; }
export function wKategorii(id) { return pozycje.filter((p) => p[0] === id); }
