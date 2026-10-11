(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const number = value => Math.round(value).toLocaleString('en-US');
  const percent = value => `${(value * 100).toFixed(1)}%`;
  function announce(id, text) {
    if ($(id).textContent !== text) $(id).textContent = text;
  }
  addEventListener('keydown', event => {
    if (event.key === 'Escape') document.querySelectorAll('.chart-tooltip').forEach(tip => { tip.hidden = true; });
  });
  function element(tag, attrs = {}, text) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function baseChart(container, label, ticks, max, height = 290) {
    const width = Math.max(280, Math.round(container.getBoundingClientRect().width));
    const plot = { left: 42, right: width - 14, top: 25, bottom: height - 32, width, height };
    const svg = element('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': label });
    const y = value => plot.bottom - value / max * (plot.bottom - plot.top);
    ticks.forEach(tick => {
      svg.append(element('line', { x1: plot.left, x2: plot.right, y1: y(tick), y2: y(tick), class: 'chart-grid' }));
      svg.append(element('text', { x: plot.left - 9, y: y(tick) + 4, 'text-anchor': 'end', class: 'chart-label' }, tick));
    });
    container.replaceChildren(svg);
    return { svg, plot, y };
  }
  function tooltip(container) {
    const node = document.createElement('div');
    node.className = 'chart-tooltip'; node.hidden = true; node.setAttribute('aria-hidden', 'true'); container.append(node);
    return (text, x, y, show) => {
      node.textContent = text; node.hidden = !show;
      // Keep the tooltip inside narrow charts, including at the endpoints.
      const half = node.offsetWidth / 2 + 4;
      node.style.left = `${Math.max(half, Math.min(container.clientWidth - half, x))}px`;
      node.style.top = `${Math.max(40, y - 12)}px`;
    };
  }
  function pointerX(event, svg, width) {
    const box = svg.getBoundingClientRect();
    return (event.clientX - box.left) / box.width * width;
  }

  async function init() {
    const response = await fetch('data.v1.json');
    if (!response.ok) throw new Error('Chart data unavailable');
    const data = await response.json();
    let annualIndex = data.annual.length - 1;
    let monthIndex = 6;
    let weighting = 'equal';
    let selectYear;
    function annual() {
      const container = $('annual-chart');
      const { svg, plot, y } = baseChart(container, 'Annual reported recreation visits, 1979 to 2025. Millions of visits; use the year slider or data table for exact values.', [0, 100, 200, 300], 350);
      const x = index => plot.left + index / (data.annual.length - 1) * (plot.right - plot.left);
      svg.append(element('text', { x: plot.left, y: 13, class: 'chart-label' }, 'Millions of visits'));
      const path = data.annual.map((row, i) => `${i ? 'L' : 'M'}${x(i)},${y(row.visits / 1e6)}`).join(' ');
      svg.append(element('path', { d: `${path} L${plot.right},${plot.bottom} L${plot.left},${plot.bottom} Z`, class: 'chart-area' }));
      svg.append(element('path', { d: path, class: 'chart-line' }));
      [1979, 2000, 2025].forEach(year => svg.append(element('text', { x: x(year - 1979), y: plot.height - 6, 'text-anchor': year === 1979 ? 'start' : year === 2025 ? 'end' : 'middle', class: 'chart-label' }, year)));
      const guide = element('line', { y1: plot.top, y2: plot.bottom, class: 'chart-guide' });
      const marker = element('circle', { r: 5, class: 'chart-marker' });
      svg.append(guide, marker);
      const tip = tooltip(container);
      selectYear = (index, showTip = false) => {
        annualIndex = Math.max(0, Math.min(data.annual.length - 1, index));
        const row = data.annual[annualIndex];
        guide.setAttribute('x1', x(annualIndex)); guide.setAttribute('x2', x(annualIndex));
        marker.setAttribute('cx', x(annualIndex)); marker.setAttribute('cy', y(row.visits / 1e6));
        $('year').value = row.year; $('year-label').textContent = row.year;
        announce('annual-readout', `${row.year} · ${number(row.visits)} recreation visits · ${row.units} reporting codes`);
        tip(`${row.year} · ${(row.visits / 1e6).toFixed(1)} million`, x(annualIndex), y(row.visits / 1e6), showTip);
      };
      svg.addEventListener('pointermove', event => selectYear(Math.round((pointerX(event, svg, plot.width) - plot.left) / (plot.right - plot.left) * (data.annual.length - 1)), true));
      svg.addEventListener('click', event => selectYear(Math.round((pointerX(event, svg, plot.width) - plot.left) / (plot.right - plot.left) * (data.annual.length - 1)), true));
      svg.addEventListener('pointerleave', () => selectYear(annualIndex));
      selectYear(annualIndex);
    }
    function seasonal() {
      const container = $('season-chart');
      const { svg, plot, y } = baseChart(container, 'Monthly share of annual visits. Use left and right arrow keys to explore months.', [0, 5, 10, 15], 17, 275);
      svg.setAttribute('tabindex', '0'); svg.setAttribute('role', 'group'); svg.setAttribute('aria-describedby', 'season-readout');
      svg.append(element('text', { x: plot.left, y: 13, class: 'chart-label' }, 'Share of annual visits (%)'));
      const step = (plot.right - plot.left) / 12;
      const bars = [];
      data.seasonal.forEach((row, i) => {
        const x = plot.left + i * step;
        const bar = element('rect', { x: x + 2, y: y(row[weighting] * 100), width: step - 4, height: plot.bottom - y(row[weighting] * 100), class: 'chart-bar' });
        bars.push(bar); svg.append(bar);
        if (plot.width > 460 || i % 2 === 0) svg.append(element('text', { x: x + step / 2, y: plot.height - 7, 'text-anchor': 'middle', class: 'chart-label' }, months[i].slice(0, 3)));
      });
      const tip = tooltip(container);
      function selectMonth(index, showTip = false) {
        monthIndex = (index + 12) % 12;
        bars.forEach((bar, i) => bar.classList.toggle('is-active', i === monthIndex));
        const row = data.seasonal[monthIndex];
        announce('season-readout', `${months[monthIndex]} · ${percent(row[weighting])} · ${weighting === 'equal' ? 'Equal weight per unit' : 'Weight by visit volume'}`);
        tip(`${months[monthIndex]} · ${percent(row[weighting])}`, plot.left + (monthIndex + .5) * step, y(row[weighting] * 100), showTip);
      }
      svg.addEventListener('keydown', event => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          selectMonth(event.key === 'Home' ? 0 : event.key === 'End' ? 11 : monthIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
      });
      function pick(event) { selectMonth(Math.max(0, Math.min(11, Math.floor((pointerX(event, svg, plot.width) - plot.left) / step))), true); }
      svg.addEventListener('pointermove', pick); svg.addEventListener('click', pick);
      svg.addEventListener('pointerleave', () => selectMonth(monthIndex));
      selectMonth(monthIndex);
    }
    function designations() {
      const container = $('designation-chart');
      const position = value => (Math.log10(value) - 4) / 3 * 100;
      data.designations.filter(row => row.units >= 5).forEach(row => {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'designation-row'; button.setAttribute('aria-pressed', 'false');
        const label = document.createElement('span'); label.className = 'designation-label'; label.textContent = row.name;
        const count = document.createElement('small'); count.textContent = `${row.units} units`; label.append(count);
        const plot = document.createElement('span'); plot.className = 'designation-plot'; plot.setAttribute('aria-hidden', 'true');
        const interval = document.createElement('span'); interval.className = 'designation-interval';
        interval.style.left = `${position(row.q1)}%`; interval.style.width = `${position(row.q3) - position(row.q1)}%`;
        const dot = document.createElement('span'); dot.className = 'designation-dot'; dot.style.left = `${position(row.median)}%`;
        plot.append(interval, dot); button.append(label, plot);
        const description = `${row.name} · ${row.units} units · Median ${number(row.median)} visits/year · Middle 50%: ${number(row.q1)}–${number(row.q3)}`;
        button.setAttribute('aria-label', description);
        button.addEventListener('click', () => {
          container.querySelectorAll('button').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
          $('designation-readout').textContent = description;
        });
        container.append(button);
      });
      const axis = document.createElement('div'); axis.className = 'designation-axis'; axis.setAttribute('aria-hidden', 'true');
      ['10k', '100k', '1m', '10m'].forEach(text => { const span = document.createElement('span'); span.textContent = text; axis.append(span); });
      container.append(axis);
    }
    annual(); seasonal(); designations();
    $('annual-controls').hidden = false; $('season-controls').hidden = false;
    $('year').addEventListener('input', event => selectYear(Number(event.target.value) - 1979));
    document.querySelectorAll('input[name="weight"]').forEach(input => input.addEventListener('change', event => { weighting = event.target.value; seasonal(); }));
    // A breakpoint changes the available plot width; don't rerender on height-only changes.
    let width = $('annual-chart').clientWidth;
    let pending;
    const resize = () => {
      if ($('annual-chart').clientWidth === width) return;
      width = $('annual-chart').clientWidth;
      cancelAnimationFrame(pending); pending = requestAnimationFrame(() => { annual(); seasonal(); });
    };
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe($('annual-chart'));
    else addEventListener('resize', resize);
  }
  init().catch(() => { $('load-error').hidden = false; });
})();
