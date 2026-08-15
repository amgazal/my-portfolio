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
  var rigTargets = [];
  var rigScatterRanks = [];

  function buildNameRig() {
    if (!nameRigLetters || !nameRigLines) return;

    nameRigLetters.innerHTML = "";
    nameRigLines.innerHTML = "";
    rigLetters = [];
    rigLines = [];

    ["ABDALLAH", "GAZAL"].forEach(function (word, wordIndex) {
      var wordEl = document.createElement("span");
      wordEl.className = "name-rig-word";

      word.split("").forEach(function (character, positionInWord) {
        var index = rigLetters.length;
        var letter = document.createElement("span");
        letter.className = "name-rig-letter";
        letter.textContent = character;
        letter.dataset.rigWord = String(wordIndex);
        letter.dataset.rigPos = String(positionInWord);
        wordEl.appendChild(letter);
        rigLetters.push(letter);

        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("class", "name-rig-line");
        nameRigLines.appendChild(line);
        rigLines.push(line);
      });

      nameRigLetters.appendChild(wordEl);
    });

    var order = rigLetters.map(function (_, index) { return index; });
    order.sort(function (a, b) { return seededUnit(a, 11) - seededUnit(b, 11); });
    rigScatterRanks = [];
    order.forEach(function (originalIndex, scatteredIndex) {
      rigScatterRanks[originalIndex] = scatteredIndex;
    });
  }

  function measureRigTargets() {
    if (!rigLetters.length) return;
    rigTargets = [];
    rigLetters.forEach(function (letter) {
      letter.style.transform = "none";
      var rect = letter.getBoundingClientRect();
      rigTargets.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        width: rect.width,
        height: rect.height
      });
    });
  }

  function renderNameRig(assembly) {
    if (!rigLetters.length || !nameRigLines || !rigTargets.length) return;

    var width = window.innerWidth;
    var height = window.innerHeight;
    var compact = width < 620;
    var eased = smoothstep(assembly);
    var remaining = 1 - eased;
    var groundY = height - Math.max(72, height * (compact ? 0.085 : 0.075));
    var stringOpacity = clamp(1 - Math.max(0, assembly - 0.82) / 0.18, 0, 1);

    nameRigLines.setAttribute("viewBox", "0 0 " + width + " " + height);
    nameRigLines.style.opacity = String(stringOpacity);

    rigLetters.forEach(function (letter, index) {
      var target = rigTargets[index];
      if (!target) return;

      var scatterRank = rigScatterRanks[index] || 0;
      var spread = rigLetters.length > 1 ? scatterRank / (rigLetters.length - 1) : 0.5;
      var initialX = width * (compact ? (0.04 + spread * 0.92) : (0.03 + spread * 0.94));
      var rowNoise = seededUnit(index, 5);
      var rowLift = 0;
      if (compact) {
        rowLift = rowNoise < 0.25 ? -Math.min(126, height * 0.15) : rowNoise < 0.5 ? -Math.min(72, height * 0.09) : rowNoise < 0.75 ? -Math.min(28, height * 0.035) : Math.min(12, height * 0.02);
      } else {
        rowLift = rowNoise < 0.25 ? -Math.min(116, height * 0.14) : rowNoise < 0.5 ? -Math.min(62, height * 0.075) : rowNoise < 0.75 ? -Math.min(24, height * 0.03) : Math.min(10, height * 0.018);
      }

      var scatterX = initialX - target.x + (seededUnit(index, 1) * 2 - 1) * (compact ? 36 : 64);
      var baselineJitter = (seededUnit(index, 4) * 2 - 1) * (compact ? 16 : 24);
      var scatterY = groundY + rowLift - target.y - target.height * 0.48 + baselineJitter;
      var scatterRotation = (seededUnit(index, 3) * 2 - 1) * (compact ? 26 : 34);

      var x = scatterX * remaining;
      var y = scatterY * remaining;
      var rotation = scatterRotation * remaining;
      var scale = 0.62 + eased * 0.38;
      var opacity = clamp(0.12 + eased * 0.88, 0, 1);

      letter.style.opacity = opacity.toFixed(3);
      letter.style.transform =
        "translate3d(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px, 0) " +
        "rotate(" + rotation.toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";

      var currentX = target.x + x;
      var currentY = target.y + y;
      var anchorSpread = rigLetters.length > 1 ? index / (rigLetters.length - 1) : 0.5;
      var x1 = width * (0.14 + anchorSpread * 0.72);
      var line = rigLines[index];

      line.setAttribute("x1", x1.toFixed(1));
      line.setAttribute("y1", "0");
      line.setAttribute("x2", currentX.toFixed(1));
      line.setAttribute("y2", (currentY - target.height * 0.38).toFixed(1));
    });
  }

  if (cinemaIntro && cinemaCurtain && !reducedMotion) {
    document.documentElement.classList.add("cinema-enabled");
    buildNameRig();
    measureRigTargets();

    var cinemaFrame = null;

    function getCinemaRange() {
      return Math.max(cinemaIntro.offsetHeight - window.innerHeight, window.innerHeight * 0.78);
    }

    function renderCinemaIntro() {
      cinemaFrame = null;
      var progress = clamp(window.scrollY / getCinemaRange(), 0, 1);
      var assembly = clamp(progress / 0.62, 0, 1);
      var curtainProgress = smoothstep(clamp((progress - 0.62) / 0.38, 0, 1));

      renderNameRig(assembly);
      document.documentElement.classList.add("cinema-rig-ready");

      cinemaCurtain.style.transform =
        "translate3d(0, " + (-102 * curtainProgress).toFixed(2) + "%, 0)";

      if (curtainPrompt) {
        curtainPrompt.style.opacity = String(clamp(1 - progress * 5, 0, 1));
      }

      if (cinemaStageInner) {
        cinemaStageInner.style.transform =
          "translate3d(0, " + (16 * (1 - curtainProgress)).toFixed(1) + "px, 0)";
      }

      document.documentElement.classList.toggle("cinema-open", progress > 0.965);
    }

    function requestCinemaRender() {
      if (cinemaFrame !== null) return;
      cinemaFrame = window.requestAnimationFrame(renderCinemaIntro);
    }

    window.addEventListener("scroll", requestCinemaRender, { passive: true });
    window.addEventListener("resize", function () {
      measureRigTargets();
      requestCinemaRender();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        measureRigTargets();
        requestCinemaRender();
      });
    }

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
    scrollProgress.style.transform = "scaleX(" + progress.toFixed(4) + ")";
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

})();
