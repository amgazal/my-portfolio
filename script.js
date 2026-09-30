(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
        if (index < words.length - 1) curtainLine.appendChild(document.createTextNode(" "));
        lineWords.push(span);
      });
    }
  }

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
        window.innerHeight * 0.36,
        1
      );
    }

    function renderCinemaIntro() {
      cinemaFrame = null;
      var progress = clamp(Math.max(window.scrollY, 0) / cinemaRange, 0, 1);
      var assembly = clamp(progress / 0.52, 0, 1);
      var greetingExit = smoothstep(clamp((progress - 0.62) / 0.1, 0, 1));
      var split = smoothstep(clamp((progress - 0.72) / 0.22, 0, 1));
      var travel = 101.5 * split;

      renderGreeting(assembly);

      if (curtainLeft) curtainLeft.style.transform = "translate3d(" + (-travel).toFixed(2) + "%, 0, 0)";
      if (curtainRight) curtainRight.style.transform = "translate3d(" + travel.toFixed(2) + "%, 0, 0)";

      if (curtainContent) {
        var contentOpacity = 1 - greetingExit;
        curtainContent.style.opacity = contentOpacity.toFixed(3);
        curtainContent.style.transform = "translate3d(0, " + (-14 * greetingExit).toFixed(1) + "px, 0)";
      }

      if (curtainTrackFill) curtainTrackFill.style.transform = "scaleX(" + progress.toFixed(4) + ")";
      if (cinemaStageInner) cinemaStageInner.style.transform = "translate3d(0, " + (12 * (1 - split)).toFixed(1) + "px, 0)";

      var cinemaIsOpen = progress > 0.96;
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

    if (curtainSkip) {
      curtainSkip.addEventListener("click", function () {
        window.scrollTo({ top: cinemaRange + 4, behavior: "smooth" });
      });
    }

    updateCinemaRange();
    renderCinemaIntro();
  } else {
    document.documentElement.classList.add("cinema-open");
  }

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

  var backToTop = document.getElementById("backToTop");
  var backTopFrame = null;

  function renderBackToTop() {
    backTopFrame = null;
    if (!backToTop) return;
    var revealAfter = cinemaIntro ? cinemaIntro.offsetTop + cinemaIntro.offsetHeight + 40 : window.innerHeight * 1.25;
    backToTop.classList.toggle("is-visible", window.scrollY > revealAfter);
  }

  function requestBackToTopRender() {
    if (backTopFrame !== null) return;
    backTopFrame = window.requestAnimationFrame(renderBackToTop);
  }

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
    window.addEventListener("scroll", requestBackToTopRender, { passive: true });
    window.addEventListener("resize", requestBackToTopRender);
    renderBackToTop();
  }

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

  var footerYear = document.getElementById("footerYear");
  if (footerYear) footerYear.textContent = "· " + new Date().getFullYear();
})();
