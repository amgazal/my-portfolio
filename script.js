(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Cinematic intro ------------------------------------------------------- */
  var cinemaIntro = document.querySelector(".cinema-intro");
  var cinemaCurtain = document.getElementById("cinemaCurtain");
  var curtainSkip = document.getElementById("curtainSkip");
  var curtainPrompt = document.getElementById("curtainPrompt");
  var cinemaStageInner = document.querySelector(".cinema-stage-inner");
  var nameRigLetters = document.getElementById("nameRigLetters");
  var nameRigLines = document.getElementById("nameRigLines");
  var nameRigFinal = document.getElementById("nameRigFinal");

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function smoothstep(value) {
    value = clamp(value, 0, 1);
    return value * value * (3 - 2 * value);
  }

  function seededUnit(index, salt) {
    var raw = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
    return raw - Math.floor(raw);
  }

  var rigLetters = [];
  var rigLines = [];

  function buildNameRig() {
    if (!nameRigLetters || !nameRigLines) return;

    nameRigLetters.innerHTML = "";
    nameRigLines.innerHTML = "";
    rigLetters = [];
    rigLines = [];

    var words = ["ABDALLAH", "GAZAL"];
    var index = 0;

    words.forEach(function (word) {
      var wordEl = document.createElement("span");
      wordEl.className = "name-rig-word";

      word.split("").forEach(function (character) {
        var letter = document.createElement("span");
        letter.className = "name-rig-letter";
        letter.textContent = character;
        letter.setAttribute("data-code", "char[" + String(index).padStart(2, "0") + "]");
        letter.dataset.rigIndex = String(index);
        wordEl.appendChild(letter);
        rigLetters.push(letter);

        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "name-rig-line");
        nameRigLines.appendChild(line);
        rigLines.push(line);

        index += 1;
      });

      nameRigLetters.appendChild(wordEl);
    });
  }

  if (cinemaIntro && cinemaCurtain && !reducedMotion) {
    document.documentElement.classList.add("cinema-enabled");
    buildNameRig();

    var cinemaFrame = null;

    function getCinemaRange() {
      return Math.max(
        cinemaIntro.offsetHeight - window.innerHeight,
        window.innerHeight * 0.78
      );
    }

    function renderNameRig(assembly) {
      if (!rigLetters.length || !nameRigLines) return;

      var width = window.innerWidth;
      var height = window.innerHeight;
      var maxScatterX = Math.min(width * 0.34, 430);
      var codeOpacity = clamp(1 - assembly * 1.35, 0, 1);
      var stringOpacity = clamp(1 - Math.max(0, assembly - 0.72) / 0.28, 0, 1);
      var finalOpacity = smoothstep(clamp((assembly - 0.78) / 0.22, 0, 1));

      if (nameRigFinal) nameRigFinal.style.opacity = finalOpacity.toFixed(3);

      nameRigLines.setAttribute("viewBox", "0 0 " + width + " " + height);
      nameRigLines.style.opacity = String(stringOpacity);

      rigLetters.forEach(function (letter, index) {
        var scatterX = (seededUnit(index, 1) * 2 - 1) * maxScatterX;
        var scatterY = height * (0.34 + seededUnit(index, 2) * 0.14);
        var scatterRotation = (seededUnit(index, 3) * 2 - 1) * 24;
        var remaining = 1 - assembly;

        var x = scatterX * remaining;
        var y = scatterY * remaining;
        var rotation = scatterRotation * remaining;
        var scale = 0.72 + assembly * 0.28;

        letter.style.transform =
          "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, 0) " +
          "rotate(" + rotation.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
        letter.style.setProperty("--code-opacity", codeOpacity.toFixed(3));
        letter.style.opacity = (1 - finalOpacity).toFixed(3);

        var rect = letter.getBoundingClientRect();
        var x2 = rect.left + rect.width / 2;
        var y2 = rect.top + Math.max(2, rect.height * 0.08);
        var anchorSpread = rigLetters.length > 1 ? index / (rigLetters.length - 1) : 0.5;
        var x1 = width * (0.14 + anchorSpread * 0.72);
        var line = rigLines[index];

        line.setAttribute("x1", x1.toFixed(1));
        line.setAttribute("y1", "0");
        line.setAttribute("x2", x2.toFixed(1));
        line.setAttribute("y2", y2.toFixed(1));
      });
    }

    function renderCinemaIntro() {
      cinemaFrame = null;
      var progress = clamp(window.scrollY / getCinemaRange(), 0, 1);

      // The first part of the scroll assembles the name. Only then does the
      // curtain lift, so the interaction reads as one deliberate sequence.
      var assembly = smoothstep(clamp(progress / 0.58, 0, 1));
      var curtainProgress = smoothstep(clamp((progress - 0.58) / 0.42, 0, 1));
      var curtainY = -102 * curtainProgress;

      renderNameRig(assembly);

      cinemaCurtain.style.transform =
        "translate3d(0, " + curtainY.toFixed(2) + "%, 0)";

      if (curtainPrompt) {
        curtainPrompt.style.opacity = String(clamp(1 - progress * 5, 0, 1));
      }

      if (cinemaStageInner) {
        var stageOffset = 18 * (1 - curtainProgress);
        cinemaStageInner.style.transform =
          "translate3d(0, " + stageOffset.toFixed(1) + "px, 0)";
      }

      document.documentElement.classList.toggle("cinema-open", progress > 0.965);
    }

    function requestCinemaRender() {
      if (cinemaFrame !== null) return;
      cinemaFrame = window.requestAnimationFrame(renderCinemaIntro);
    }

    window.addEventListener("scroll", requestCinemaRender, { passive: true });
    window.addEventListener("resize", requestCinemaRender);

    if (curtainSkip) {
      curtainSkip.addEventListener("click", function () {
        window.scrollTo({ top: getCinemaRange() + 2, behavior: "smooth" });
      });
    }

    renderCinemaIntro();
  } else {
    document.documentElement.classList.add("cinema-open");
  }

  /* Scroll progress ------------------------------------------------------- */
  var scrollProgress = document.getElementById("scrollProgress");
  var progressFrame = null;

  function renderProgress() {
    progressFrame = null;
    if (!scrollProgress) return;

    var scrollable = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress = Math.min(Math.max(progress, 0), 1);
    scrollProgress.style.width = (progress * 100).toFixed(2) + "%";
  }

  function requestProgressRender() {
    if (progressFrame !== null) return;
    progressFrame = window.requestAnimationFrame(renderProgress);
  }

  window.addEventListener("scroll", requestProgressRender, { passive: true });
  window.addEventListener("resize", requestProgressRender);
  renderProgress();

  /* Section reveal -------------------------------------------------------- */
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

  /* Mobile navigation ----------------------------------------------------- */
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

  /* Missing image fallbacks ---------------------------------------------- */
  document.querySelectorAll(".project-visual img").forEach(function (img) {
    var markMissing = function () {
      var holder = img.closest(".project-visual");
      if (holder) holder.classList.add("is-empty");
    };

    img.addEventListener("error", markMissing);
    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  /* Active section in navigation ----------------------------------------- */
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

  /* Interactive Color Model Converter ------------------------------------ */
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
