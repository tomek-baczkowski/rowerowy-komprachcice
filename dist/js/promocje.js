// Promocje sezonowe. Wpisz raz – strona sama pokaże właściwą według dzisiejszej daty.
// od / do w formacie MM-DD (oba dni włącznie). Pierwsza pasująca wygrywa.
// Gdy żadna nie pasuje, zostaje domyślna treść wpisana w stronę główną (przegląd 279 zł).
window.PROMOCJE = [
  {
    od: "11-01", do: "12-31",
    termin: "Listopad i grudzień",
    tytul: "Konserwacja zimowa 249 zł",
    tekst: "Przygotuj rower na przechowywanie: pełne sprawdzenie, czyszczenie z błota i soli, zabezpieczenie śrub i metalu przed wilgocią. Wiosną wyjeżdżasz od razu, bez kolejki.",
    link: "/konserwacja-zimowa/", przycisk: "Zobacz, co robimy",
    drugi: { link: "/bon-podarunkowy-rower/", tekst: "Bon na naprawę roweru – prezent na święta" },
    foto: "odpowietrzanie-hamulca",
  },
  {
    od: "01-01", do: "03-31",
    termin: "Styczeń–marzec",
    tytul: "Przegląd przed sezonem bez kolejki",
    tekst: "Zimą naprawiamy szybciej – zwykle w 2 dni. Przywieź rower teraz, a pierwszy ciepły weekend spędzisz na rowerze, nie w kolejce do serwisu.",
    link: "/przeglad-roweru/", przycisk: "Przegląd roweru 279 zł",
    foto: "rower-na-stojaku",
  },
  {
    od: "04-01", do: "05-31",
    termin: "Kwiecień i maj",
    tytul: "Przegląd roweru dziecięcego 199 zł",
    tekst: "Rower po starszym rodzeństwie albo prezent na komunię? Sprawdzimy hamulce, koła i łańcuch, żeby dziecko jeździło bezpiecznie.",
    link: "/przeglad-roweru-dzieciecego/", przycisk: "Przegląd roweru dziecięcego",
    foto: "rower-na-stojaku",
  },
];
