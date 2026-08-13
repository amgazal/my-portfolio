/* ============================================================================
   Abdallah Gazal — portfolio scripts
   ========================================================================== */

(function () {
  "use strict";

  /* --------------------------------------------------------------------
     Reveal on scroll

     The CSS only hides .reveal elements when <html> carries .js-reveal.
     Adding the class here means that if this script fails to load, or a
     browser blocks it, the page still renders fully rather than blank.

     IntersectionObserver replaces the old scroll listener, which fired on
     every scroll frame and re-measured every element each time.
     ------------------------------------------------------------------ */

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var revealTargets = document.querySelectorAll(".reveal");

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // reveal once, then stop watching
          }
        });
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.05 }
    );

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */

  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.toggle("show", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("show"));
    });

    // Close after picking a destination, otherwise the panel covers the target.
    navLinks.addEventListener("click", function (event) {
      if (event.target.tagName === "A") setMenu(false);
    });

    // Escape closes and returns focus to the button.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navLinks.classList.contains("show")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    // Clicking outside closes it.
    document.addEventListener("click", function (event) {
      if (
        navLinks.classList.contains("show") &&
        !navLinks.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        setMenu(false);
      }
    });
  }

  /* --------------------------------------------------------------------
     Headshot fallback

     If headshot.jpg is not in the repo yet, hide the <img> so the monogram
     underneath shows through instead of a broken-image icon.
     ------------------------------------------------------------------ */

  var headshot = document.getElementById("headshot");
  if (headshot) {
    headshot.addEventListener("error", function () {
      headshot.classList.add("is-missing");
    });
    // Covers the case where the error fired before this script ran.
    if (headshot.complete && headshot.naturalWidth === 0) {
      headshot.classList.add("is-missing");
    }
  }

  /* --------------------------------------------------------------------
     Live color converter

     The same conversions as the Python Color Model Converter, rewritten in
     JavaScript so the project is demonstrable on the page rather than only
     described. No color library — the math is here.
     ------------------------------------------------------------------ */

  var rgbToHsv = function (r, g, b) {
    var rn = r / 255,
      gn = g / 255,
      bn = b / 255;
    var max = Math.max(rn, gn, bn);
    var min = Math.min(rn, gn, bn);
    var delta = max - min;

    var h = 0;
    if (delta !== 0) {
      if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
      else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
      else h = 60 * ((rn - gn) / delta + 4);
    }
    if (h < 0) h += 360;

    var s = max === 0 ? 0 : delta / max;
    return { h: h, s: s, v: max };
  };

  var rgbToCmyk = function (r, g, b) {
    var rn = r / 255,
      gn = g / 255,
      bn = b / 255;
    var k = 1 - Math.max(rn, gn, bn);

    // Pure black is the singular case: dividing by (1 - k) would be a zero divide.
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

    return {
      c: ((1 - rn - k) / (1 - k)) * 100,
      m: ((1 - gn - k) / (1 - k)) * 100,
      y: ((1 - bn - k) / (1 - k)) * 100,
      k: k * 100
    };
  };

  var toHex = function (r, g, b) {
    var pair = function (n) {
      return n.toString(16).padStart(2, "0").toUpperCase();
    };
    return "#" + pair(r) + pair(g) + pair(b);
  };

  var demo = document.querySelector('[data-demo="color"]');

  if (demo) {
    var inputs = {
      r: document.getElementById("demoR"),
      g: document.getElementById("demoG"),
      b: document.getElementById("demoB")
    };
    var values = {
      r: document.getElementById("demoRv"),
      g: document.getElementById("demoGv"),
      b: document.getElementById("demoBv")
    };
    var swatch = document.getElementById("demoSwatch");
    var outHSV = document.getElementById("demoHSV");
    var outCMYK = document.getElementById("demoCMYK");
    var outHEX = document.getElementById("demoHEX");

    var render = function () {
      var r = Number(inputs.r.value);
      var g = Number(inputs.g.value);
      var b = Number(inputs.b.value);

      values.r.textContent = r;
      values.g.textContent = g;
      values.b.textContent = b;

      var hsv = rgbToHsv(r, g, b);
      var cmyk = rgbToCmyk(r, g, b);

      swatch.style.background = "rgb(" + r + "," + g + "," + b + ")";
      outHSV.textContent =
        hsv.h.toFixed(1) + ", " + hsv.s.toFixed(3) + ", " + hsv.v.toFixed(3);
      outCMYK.textContent =
        cmyk.c.toFixed(1) +
        ", " +
        cmyk.m.toFixed(1) +
        ", " +
        cmyk.y.toFixed(1) +
        ", " +
        cmyk.k.toFixed(1);
      outHEX.textContent = toHex(r, g, b);
    };

    Object.keys(inputs).forEach(function (key) {
      inputs[key].addEventListener("input", render);
    });

    render();
  }

  /* --------------------------------------------------------------------
     Missing project images

     Any project image that 404s swaps to a styled placeholder so the card
     never shows a broken-image icon.
     ------------------------------------------------------------------ */

  document.querySelectorAll(".project-visual img").forEach(function (img) {
    var fail = function () {
      var holder = img.closest(".project-visual");
      if (holder && holder.querySelector(".visual-fallback")) {
        holder.classList.add("is-empty");
      } else {
        img.style.display = "none";
      }
    };
    img.addEventListener("error", fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });
})();
