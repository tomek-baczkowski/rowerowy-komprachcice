(function () {
  // Menu na telefonie
  var btn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu-mobilne");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var otwarte = menu.classList.toggle("otwarte");
      btn.setAttribute("aria-expanded", otwarte ? "true" : "false");
      btn.textContent = otwarte ? "Zamknij" : "Menu";
    });
  }

  // Pasek WhatsApp/Zadzwoń na telefonie: chowa się, gdy widać przyciski w pierwszym ekranie
  var pasek = document.querySelector(".pasek-kontakt");
  var pierwsze = document.querySelector(".hero .przyciski, .naglowek-strony .przyciski");
  if (pasek && pierwsze && "IntersectionObserver" in window) {
    new IntersectionObserver(function (w) {
      pasek.classList.toggle("ukryty", w[0].isIntersecting);
    }).observe(pierwsze);
  }

  // Liczenie kliknięć WhatsApp, telefonu i e-maila.
  // Gdy podłączymy analitykę (zadanie „Analityka strony…”), zdarzenia trafią do dataLayer / gtag.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-kontakt]");
    if (!a) return;
    var rodzaj = a.getAttribute("data-kontakt");
    var miejsce = a.getAttribute("data-miejsce") || "";
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "kontakt", rodzaj: rodzaj, miejsce: miejsce, strona: location.pathname });
    if (typeof window.gtag === "function") window.gtag("event", "kontakt_" + rodzaj, { miejsce: miejsce });
  });

  // Mapa Google wczytywana dopiero po kliknięciu (szybkość strony i prywatność)
  var mapa = document.querySelector("[data-mapa]");
  if (mapa) {
    mapa.querySelector("button").addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = mapa.getAttribute("data-mapa");
      f.title = "Mapa dojazdu do Warsztatu Komprachcice";
      f.width = "100%"; f.height = "360"; f.style.border = "0"; f.style.borderRadius = "6px";
      f.setAttribute("loading", "lazy");
      mapa.innerHTML = ""; mapa.appendChild(f);
    });
  }

  // Promocja sezonowa na stronie głównej
  var box = document.getElementById("promocja");
  if (box && window.PROMOCJE) {
    var d = new Date();
    var dzis = ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    var p = null;
    for (var i = 0; i < window.PROMOCJE.length; i++) {
      var x = window.PROMOCJE[i];
      if (dzis >= x.od && dzis <= x.do) { p = x; break; }
    }
    if (p) {
      var esc = function (s) { var t = document.createElement("span"); t.textContent = s; return t.innerHTML; };
      box.querySelector("[data-p=termin]").textContent = p.termin;
      box.querySelector("[data-p=tytul]").textContent = p.tytul;
      box.querySelector("[data-p=tekst]").textContent = p.tekst;
      var l = box.querySelector("[data-p=link]");
      l.href = p.link; l.textContent = p.przycisk;
      var drugi = box.querySelector("[data-p=drugi]");
      if (p.drugi) { drugi.innerHTML = '<a href="' + p.drugi.link + '">' + esc(p.drugi.tekst) + "</a>"; drugi.hidden = false; }
      var img = box.querySelector("img");
      var src = box.querySelector("source");
      if (p.foto && img) {
        img.src = "/img/" + p.foto + "-640.webp";
        img.srcset = "/img/" + p.foto + "-640.webp 640w, /img/" + p.foto + "-1280.webp 1280w";
        if (src) src.remove();
      }
    }
  }
})();
