(() => {
  'use strict';

  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let manualTheme = false;
  try { manualTheme = ['light', 'dark'].includes(localStorage.getItem('portfolio-theme')); } catch (_) {}

  function applyTheme(theme) {
    root.dataset.theme = theme;
    const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111214' : '#f4f1ea';
  }
  applyTheme(root.dataset.theme);
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    manualTheme = true;
    applyTheme(theme);
    try { localStorage.setItem('portfolio-theme', theme); } catch (_) {}
  });
  systemTheme.addEventListener('change', event => {
    if (!manualTheme) applyTheme(event.matches ? 'dark' : 'light');
  });

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
