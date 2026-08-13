(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Reveal sections only when JS and IntersectionObserver are available.
     The page remains fully visible if scripting is disabled. */
  var revealTargets = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -70px 0px", threshold: 0.04 }
    );

    revealTargets.forEach(function (section) {
      revealObserver.observe(section);
    });
  }

  /* Mobile navigation */
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");

  function setMenu(open) {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.toggle("show", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {
      setMenu(!navLinks.classList.contains("show"));
    });

    navLinks.addEventListener("click", function (event) {
      if (event.target.tagName === "A") setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && navLinks.classList.contains("show")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

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

  /* Headshot placeholder */
  var headshot = document.getElementById("headshot");
  if (headshot) {
    var hideMissingHeadshot = function () {
      headshot.classList.add("is-missing");
    };

    headshot.addEventListener("error", hideMissingHeadshot);
    if (headshot.complete && headshot.naturalWidth === 0) hideMissingHeadshot();
  }

  /* Keep missing project assets looking intentional while placeholders are
     still being filled in. */
  document.querySelectorAll(".project-visual img").forEach(function (img) {
    var markMissing = function () {
      var holder = img.closest(".project-visual");
      if (holder) holder.classList.add("is-empty");
    };

    img.addEventListener("error", markMissing);
    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  /* Highlight the current section in the desktop navigation. */
  var navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navAnchors
    .map(function (anchor) {
      return document.querySelector(anchor.getAttribute("href"));
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var activeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var activeId = "#" + entry.target.id;
          navAnchors.forEach(function (anchor) {
            anchor.classList.toggle("is-active", anchor.getAttribute("href") === activeId);
          });
        });
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      activeObserver.observe(section);
    });
  }

  /* Interactive version of the Color Model Converter math. */
  function rgbToHsv(r, g, b) {
    var rn = r / 255;
    var gn = g / 255;
    var bn = b / 255;
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
    return { h: h, s: max === 0 ? 0 : delta / max, v: max };
  }

  function rgbToCmyk(r, g, b) {
    var rn = r / 255;
    var gn = g / 255;
    var bn = b / 255;
    var k = 1 - Math.max(rn, gn, bn);

    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

    return {
      c: ((1 - rn - k) / (1 - k)) * 100,
      m: ((1 - gn - k) / (1 - k)) * 100,
      y: ((1 - bn - k) / (1 - k)) * 100,
      k: k * 100
    };
  }

  function toHex(r, g, b) {
    function pair(value) {
      return value.toString(16).padStart(2, "0").toUpperCase();
    }
    return "#" + pair(r) + pair(g) + pair(b);
  }

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

    function renderColorDemo() {
      var r = Number(inputs.r.value);
      var g = Number(inputs.g.value);
      var b = Number(inputs.b.value);
      var hsv = rgbToHsv(r, g, b);
      var cmyk = rgbToCmyk(r, g, b);

      values.r.textContent = r;
      values.g.textContent = g;
      values.b.textContent = b;
      swatch.style.background = "rgb(" + r + ", " + g + ", " + b + ")";
      outHEX.textContent = toHex(r, g, b);
      outHSV.textContent = hsv.h.toFixed(1) + ", " + hsv.s.toFixed(3) + ", " + hsv.v.toFixed(3);
      outCMYK.textContent =
        cmyk.c.toFixed(1) + ", " +
        cmyk.m.toFixed(1) + ", " +
        cmyk.y.toFixed(1) + ", " +
        cmyk.k.toFixed(1);
    }

    Object.keys(inputs).forEach(function (key) {
      inputs[key].addEventListener("input", renderColorDemo);
    });

    renderColorDemo();
  }

  var footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = "· " + new Date().getFullYear();
})();
