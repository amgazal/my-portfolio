(() => {
  'use strict';

  const root = document.documentElement;
  const control = document.querySelector('#appearance');
  const system = matchMedia('(prefers-color-scheme: dark)');
  control.value = root.dataset.theme || 'system';

  function updateBrowserColor() {
    const dark = root.dataset.theme ? root.dataset.theme === 'dark' : system.matches;
    document.querySelector('meta[name="theme-color"]').content = dark ? '#111214' : '#f4f1ea';
  }
  control.addEventListener('change', () => {
    if (control.value === 'system') delete root.dataset.theme;
    else root.dataset.theme = control.value;
    try { localStorage.setItem('portfolio-theme', control.value); } catch (_) {}
    updateBrowserColor();
  });
  control.parentElement.hidden = false;
  system.addEventListener('change', updateBrowserColor);
  updateBrowserColor();

  const links = [...document.querySelectorAll('nav a')];
  const sections = links.map(link => document.querySelector(link.hash));
  function updateNavigation() {
    // Choose the last section above the reading line, including short end sections.
    const readingLine = Math.min(innerHeight * 0.3, 180);
    let current = sections[0];
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= readingLine) current = section;
    });
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) current = sections.at(-1);
    links.forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(updateNavigation, {
      rootMargin: '-89px 0px -65% 0px', threshold: [0, 0.01, 1]
    });
    sections.forEach(section => observer.observe(section));
  }
  // Also handles the bottom of the document and viewport resizing.
  let scheduled = false;
  addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { updateNavigation(); scheduled = false; });
  }, { passive: true });
  addEventListener('resize', updateNavigation);
  updateNavigation();
  document.getElementById('footer-year').textContent = new Date().getFullYear();
})();
