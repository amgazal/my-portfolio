(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Cinematic intro -------------------------------------------------------
     The welcome screen resolves first, then the two curtain panels part to
     reveal the hero underneath. The motion is tied to scroll so visitors can
     move through it at their own pace. */
  var cinemaIntro = document.querySelector(".cinema-intro");
  var cinemaCurtain = document.getElementById("cinemaCurtain");
  var curtainLeft = document.getElementById("curtainLeft");
  var curtainRight = document.getElementById("curtainRight");
  var curtainContent = document.getElementById("curtainContent");
  var curtainSkip = document.getElementById("curtainSkip");
  var curtainTrackFill = document.getElementById("curtainTrackFill");
  var curtainWord = document.getElementById("curtainWord");
  var curtainLine = document.getElementById("curtainLine");
  var cinemaStageInner = document.querySelector(".cinema-stage-inner");
  var introTitle = document.getElementById("introTitle");

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function smoothstep(value) {
    value = clamp(value, 0, 1);
    return value * value * (3 - 2 * value);
  }

  function easeOutCubic(t) {
    var inv = 1 - t;
    return 1 - inv * inv * inv;
  }

  /* Split the greeting into pieces the scroll can bring in one at a time:
     the headline letter by letter, the line beneath it word by word. */
  var wordLetters = [];
  var lineWords = [];

  function buildGreeting() {
    if (curtainWord) {
      var text = curtainWord.textContent.trim();
      curtainWord.setAttribute("aria-label", text);
      curtainWord.textContent = "";
      text.split("").forEach(function (character) {
        var span = document.createElement("span");
        span.textContent = character;
        span.setAttribute("aria-hidden", "true");
        curtainWord.appendChild(span);
        wordLetters.push(span);
      });
    }

    if (curtainLine) {
      var originalLine = curtainLine.textContent.trim();
      var words = originalLine.split(/\s+/);
      curtainLine.setAttribute("aria-label", originalLine);
      curtainLine.textContent = "";
      words.forEach(function (word, index) {
        var span = document.createElement("span");
        span.textContent = word;
        span.setAttribute("aria-hidden", "true");
        curtainLine.appendChild(span);
        if (index < words.length - 1) {
          curtainLine.appendChild(document.createTextNode(" "));
        }
        lineWords.push(span);
      });
    }
  }

  /* assembly runs 0 -> 1 while the greeting spells itself out. */
  function renderGreeting(assembly) {
    var total = wordLetters.length;

    wordLetters.forEach(function (letter, index) {
      var startAt = total > 1 ? (index / (total - 1)) * 0.45 : 0;
      var eased = easeOutCubic(clamp((assembly - startAt) / 0.55, 0, 1));
      letter.style.opacity = eased.toFixed(3);
      letter.style.transform =
        "translate3d(0, " + ((1 - eased) * 0.42).toFixed(3) + "em, 0) " +
        "scale(" + (0.88 + eased * 0.12).toFixed(3) + ")";
    });

    // The line resolves only once the headline is nearly whole.
    lineWords.forEach(function (word, index) {
      var startAt = 0.55 + index * 0.05;
      var eased = easeOutCubic(clamp((assembly - startAt) / 0.2, 0, 1));
      word.style.opacity = eased.toFixed(3);
      word.style.transform = "translate3d(0, " + ((1 - eased) * 0.6).toFixed(2) + "em, 0)";
    });
  }

  if (cinemaIntro && cinemaCurtain && !reducedMotion) {
    document.documentElement.classList.add("cinema-enabled");
    buildGreeting();

    var cinemaFrame = null;
    var cinemaRange = 1;
    var cinemaWasOpen = false;

    function updateCinemaRange() {
      cinemaRange = Math.max(
        cinemaIntro.offsetHeight - window.innerHeight,
        window.innerHeight * 0.48,
        1
      );
    }

    function renderCinemaIntro() {
      cinemaFrame = null;
      var progress = clamp(Math.max(window.scrollY, 0) / cinemaRange, 0, 1);

      // Three beats. The greeting spells itself out, it holds complete and
      // readable for a moment, and only then do the panels part sideways.
      var assembly = clamp(progress / 0.55, 0, 1);
      // The greeting clears first, then the panels move. If they overlap, the
      // words are still sitting on top of the hero as the gap opens.
      var greetingExit = smoothstep(clamp((progress - 0.64) / 0.1, 0, 1));
      var split = smoothstep(clamp((progress - 0.72) / 0.28, 0, 1));
      var travel = 101.5 * split;

      renderGreeting(assembly);

      if (curtainLeft) {
        curtainLeft.style.transform =
          "translate3d(" + (-travel).toFixed(2) + "%, 0, 0)";
      }

      if (curtainRight) {
        curtainRight.style.transform =
          "translate3d(" + travel.toFixed(2) + "%, 0, 0)";
      }

      if (curtainContent) {
        var contentOpacity = 1 - greetingExit;
        curtainContent.style.opacity = contentOpacity.toFixed(3);
        curtainContent.style.transform =
          "translate3d(0, " + (-14 * greetingExit).toFixed(1) + "px, 0)";
      }

      if (curtainTrackFill) {
        curtainTrackFill.style.transform = "scaleX(" + progress.toFixed(4) + ")";
      }

      if (cinemaStageInner) {
        cinemaStageInner.style.transform =
          "translate3d(0, " + (16 * (1 - split)).toFixed(1) + "px, 0)";
      }

      var cinemaIsOpen = progress > 0.965;
      document.documentElement.classList.toggle("cinema-open", cinemaIsOpen);

      if (cinemaCurtain) {
        cinemaCurtain.setAttribute("aria-hidden", String(cinemaIsOpen));
        if (cinemaIsOpen) cinemaCurtain.setAttribute("inert", "");
        else cinemaCurtain.removeAttribute("inert");
      }

      if (cinemaIsOpen && !cinemaWasOpen && document.activeElement === curtainSkip && introTitle) {
        introTitle.focus({ preventScroll: true });
      }
      cinemaWasOpen = cinemaIsOpen;
    }

    function requestCinemaRender() {
      if (cinemaFrame !== null) return;
      cinemaFrame = window.requestAnimationFrame(renderCinemaIntro);
    }

    window.addEventListener("scroll", requestCinemaRender, { passive: true });
    window.addEventListener("resize", function () {
      updateCinemaRange();
      requestCinemaRender();
    });
    window.addEventListener("pageshow", function () {
      updateCinemaRange();
      requestCinemaRender();
    });

    if (curtainSkip) {
      curtainSkip.addEventListener("click", function () {
        window.scrollTo({ top: cinemaRange + 2, behavior: "smooth" });
      });
    }

    updateCinemaRange();
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

    var desktopNav = window.matchMedia("(min-width: 821px)");
    var resetMenuForDesktop = function (event) {
      if (event.matches) setMenu(false);
    };
    if (desktopNav.addEventListener) desktopNav.addEventListener("change", resetMenuForDesktop);
    else if (desktopNav.addListener) desktopNav.addListener(resetMenuForDesktop);
  }

  /* Missing image fallbacks ----------------------------------------------
     A failed secondary image should not hide a working primary image. */
  function refreshImageHolder(holder) {
    if (!holder) return;
    var images = Array.from(holder.querySelectorAll("img"));
    var hasAvailableImage = images.some(function (image) {
      return image.dataset.failed !== "true";
    });
    holder.classList.toggle("is-empty", !hasAvailableImage);
  }

  document.querySelectorAll(".project-visual img").forEach(function (img) {
    var holder = img.closest(".project-visual");

    var markMissing = function () {
      img.dataset.failed = "true";
      img.hidden = true;
      refreshImageHolder(holder);
    };

    var markLoaded = function () {
      img.dataset.failed = "false";
      img.hidden = false;
      refreshImageHolder(holder);
    };

    img.addEventListener("error", markMissing);
    img.addEventListener("load", markLoaded);
    if (img.complete) {
      if (img.naturalWidth === 0) markMissing();
      else markLoaded();
    }
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
            var isActive = anchor.getAttribute("href") === activeId;
            anchor.classList.toggle("is-active", isActive);
            if (isActive) anchor.setAttribute("aria-current", "location");
            else anchor.removeAttribute("aria-current");
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
    var demoReady = inputs.r && inputs.g && inputs.b && values.r && values.g && values.b && swatch && outHSV && outCMYK && outHEX;

    function renderColorDemo() {
      if (!demoReady) return;
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

    if (demoReady) {
      Object.keys(inputs).forEach(function (key) {
        inputs[key].addEventListener("input", renderColorDemo);
      });
      renderColorDemo();
    }
  }

  var footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = "· " + new Date().getFullYear();
})();
