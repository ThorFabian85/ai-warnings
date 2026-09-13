/* Optional enhancements: every quotation, source, essay and link works without JS. */
(() => {
  'use strict';
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.mobile-menu');
  const menuSummary = menu?.querySelector('summary');
  const closeMenu = (restoreFocus = false) => {
    if (!menu?.open) return;
    menu.open = false;
    if (restoreFocus) menuSummary.focus();
  };
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    const target = document.getElementById(link.hash.slice(1));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  }));
  document.addEventListener('click', event => {
    if (menu?.open && !menu.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.open) {
      closeMenu(true);
      event.preventDefault();
    }
  });
  const desktop = window.matchMedia('(min-width: 1041px)');
  desktop.addEventListener?.('change', event => { if (event.matches) closeMenu(); });

  // Accessible, manually operated tabs. Nothing changes while the visitor is reading.
  const tabList = document.querySelector('.quote-tabs');
  const tabs = [...document.querySelectorAll('[data-quote]')];
  const panels = tabs.map(tab => document.getElementById(tab.dataset.quote));
  if (tabList && tabs.length && panels.every(Boolean)) {
    const activate = (index, moveFocus = false) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (moveFocus) tabs[index].focus();
    };
    tabList.setAttribute('role', 'tablist');
    tabs.forEach((tab, i) => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panels[i].id);
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', tab.id);
      panels[i].tabIndex = 0;
      tab.addEventListener('click', () => activate(i));
      tab.addEventListener('keydown', event => {
        const keys = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
        if (Object.prototype.hasOwnProperty.call(keys, event.key)) {
          event.preventDefault();
          activate(keys[event.key], true);
        }
      });
    });
    const hashPanel = () => panels.findIndex(panel => `#${panel.id}` === window.location.hash);
    activate(Math.max(0, hashPanel()));
    tabList.hidden = false;
    document.querySelector('.quote-stage').classList.add('quotes-enhanced');
    window.addEventListener('hashchange', () => {
      const index = hashPanel();
      if (index >= 0) {
        activate(index);
        panels[index].scrollIntoView({ block: 'center', behavior: motionPreference.matches ? 'instant' : 'smooth' });
      }
    });
    // Printing includes all quotes and the complete author statement.
    let printDetails = [];
    window.addEventListener('beforeprint', () => {
      printDetails = [...document.querySelectorAll('.research-detail, .author-view')].map(detail => [detail, detail.open]);
      printDetails.forEach(([detail]) => { detail.open = true; });
    });
    window.addEventListener('afterprint', () => printDetails.forEach(([detail, wasOpen]) => { detail.open = wasOpen; }));
  }

  // Ambient light particles. The SVG remains the visual even if canvas is unavailable.
  const art = document.querySelector('.hero-art');
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('threshold-field');
  const motionButton = document.querySelector('.motion-toggle');
  if (!art || !hero || !canvas || !motionButton) return;
  let context;
  try { context = canvas.getContext('2d'); } catch { return; }
  if (!context) return;
  let width = 0, height = 0, scale = 1, offsetX = 0, offsetY = 0;
  let phase = 0, lastTime = 0, frame = 0, visible = true;
  let paused = motionPreference.matches;
  let sceneActive = false;
  let pointerX = 0, pointerY = 0, driftX = 0, driftY = 0;
  let seed = 1937;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const particles = Array.from({ length: 450 }, () => ({
    x: 790 + random() * 780, y: 100 + random() * 750,
    r: .4 + random() * 1.1, speed: .35 + random(),
    opacity: .08 + random() * .36, offset: random() * Math.PI * 2,
    warm: random() > .84
  }));
  function paint() {
    context.clearRect(0, 0, width, height);
    const count = window.innerWidth <= 680 ? 185 : particles.length;
    for (let i = 0; i < count; i++) {
      const point = particles[i];
      const x = point.x + Math.sin(phase * .12 + point.offset) * 21 + driftX * point.speed;
      const y = 90 + ((point.y - 90 - phase * point.speed * 2.8) % 770 + 770) % 770 + driftY * point.speed;
      const alpha = point.opacity * (.65 + .35 * Math.sin(phase * .55 + point.offset));
      const px = x * scale + offsetX, py = y * scale + offsetY;
      const radius = Math.max(.25, point.r * scale);
      if (px < -20 || px > width + 20 || py < -20 || py > height + 20) continue;
      context.beginPath();
      context.fillStyle = point.warm ? `rgba(255,112,62,${alpha})` : `rgba(205,80,61,${alpha})`;
      context.arc(px, py, radius, 0, Math.PI * 2);
      context.fill();
      if (point.r > 1.38) {
        const glow = context.createRadialGradient(px, py, 0, px, py, radius * 7);
        glow.addColorStop(0, `rgba(248,129,77,${alpha * .32})`);
        glow.addColorStop(1, 'rgba(248,129,77,0)');
        context.fillStyle = glow;
        context.fillRect(px - radius * 7, py - radius * 7, radius * 14, radius * 14);
      }
    }
  }
  function resize() {
    const bounds = art.getBoundingClientRect();
    width = Math.max(1, bounds.width); height = Math.max(1, bounds.height);
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    scale = Math.max(width / 1600, height / 1000);
    offsetX = (width - 1600 * scale) * (window.innerWidth <= 680 ? .77 : .5);
    offsetY = (height - 1000 * scale) * .5;
    paint();
  }
  function animate(time) {
    frame = 0;
    if (paused || sceneActive || !visible || document.hidden) { lastTime = 0; return; }
    if (!lastTime) lastTime = time;
    if (time - lastTime >= 30) {
      const delta = Math.min((time - lastTime) / 1000, .08);
      phase += delta;
      driftX += (pointerX - driftX) * .045;
      driftY += (pointerY - driftY) * .045;
      paint(); lastTime = time;
    }
    frame = requestAnimationFrame(animate);
  }
  function syncMotion() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; lastTime = 0;
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Play ambient animation' : 'Pause ambient animation');
    motionButton.querySelector('.motion-label').textContent = paused ? 'Play motion' : 'Pause motion';
    motionButton.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    if (!paused && !sceneActive && visible && !document.hidden) frame = requestAnimationFrame(animate);
  }
  hero.addEventListener('pointermove', event => {
    if (paused || event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    pointerX = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 32;
    pointerY = (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 20;
  });
  hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  motionPreference.addEventListener?.('change', event => { paused = event.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  document.addEventListener('reversent:scene', event => { sceneActive = event.detail.active; syncMotion(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncMotion();
    }, { threshold: 0 }).observe(hero);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(art);
  else window.addEventListener('resize', resize, { passive: true });
  motionButton.hidden = false;
  resize(); syncMotion();
})();
