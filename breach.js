/* A fictional, entirely reversible scene. No page content or files are deleted. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const shell = $('#site-shell'), scene = $('#breach-scene'), clockPanel = $('#countdown');
  if (!shell || !scene || !clockPanel) return;
  const digits = [...document.querySelectorAll('.countdown-digits')];
  const sceneTitle = $('#breach-title'), restore = $('#restore-site'), ashActions = $('.ash-actions');
  const actor = $('.scene-robot'), threshold = $('.threshold-image');
  const portal = $('.threshold-opening'), leaf = $('.threshold-leaf');
  const vignette = $('.scene-vignette'), label = $('#scene-label'), announcement = $('#scene-announcement');
  const canvas = $('#breach-canvas'), reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 600000, finaleDuration = 24;
  let ctx = null;
  try { ctx = canvas.getContext('2d'); } catch { /* The static fallback remains restorable. */ }
  let phase = 'countdown', remaining = duration, deadline = performance.now() + duration;
  let timer = 0, frame = 0, lastFrame = 0;
  let sceneStart = 0, hiddenAt = null, saved = null, width = 1, height = 1, door = {};
  let currentPose = { x: 0, y: 0, scale: 1 }, sceneReduced = reduced.matches;
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const noise = n => { const v = Math.sin(n * 127.1 + 31.7) * 43758.5453; return v - Math.floor(v); };
  const shots = [{ at: 6.8, x: .30, y: .35 }, { at: 7.65, x: .69, y: .45 }, { at: 8.5, x: .46, y: .62 }];
  // One door: project the original SVG leaf around its actual left hinge.
  // This homography maps the unit square onto the artwork's four aperture corners.
  const corners = [[1078, 252], [1351, 213], [1329, 718], [1067, 704]];
  function quadMap(points) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = points;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const determinant = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / determinant;
    const h = (dx1 * dy3 - dx3 * dy1) / determinant;
    const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3;
    const d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
    return {
      project(u, v) {
        const w = g * u + h * v + 1;
        return [(a * u + b * v + x0) / w, (d * u + e * v + y0) / w];
      },
      inverse(x, y) {
        const A = a - x * g, B = b - x * h, D = d - y * g, E = e - y * h;
        const X = x - x0, Y = y - y0, det = A * E - B * D;
        return [(X * E - B * Y) / det, (A * Y - X * D) / det];
      }
    };
  }
  const aperture = quadMap(corners);
  const doorPaths = [...leaf.querySelectorAll('[data-door-points]')].map(path => ({
    path, original: path.getAttribute('d'), closed: path.getAttribute('data-door-closed') === 'true',
    points: path.getAttribute('data-door-points').split(' ').map(pair => aperture.inverse(...pair.split(',').map(Number)))
  }));
  let doorProgress = -1;
  function openDoor(progress) {
    if (progress === doorProgress) return;
    doorProgress = progress;
    const angle = progress * 88 * Math.PI / 180;
    doorPaths.forEach(({ path, original, closed, points }) => {
      if (progress === 0) { path.setAttribute('d', original); return; }
      const projected = points.map(([u, v]) => {
        const depth = 1 + .42 * u * Math.sin(angle);
        return aperture.project(u * Math.cos(angle) / depth, (v - .5) / depth + .5);
      });
      path.setAttribute('d', projected.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(4)} ${y.toFixed(4)}`).join(' ') + (closed ? 'Z' : ''));
    });
    portal.style.opacity = String(ease(progress * 2));
  }
  function fitThreshold() {
    const bounds = $('.hero-art').getBoundingClientRect();
    const scale = Math.max(bounds.width / 1600, bounds.height / 1000);
    if (!scale) return null;
    const offsetX = (bounds.width - 1600 * scale) * (window.innerWidth <= 680 ? .77 : .5);
    const offsetY = (bounds.height - 1000 * scale) * .5;
    // Preserve the original cover crop, including the off-center phone composition.
    threshold.setAttribute('viewBox', `${-offsetX / scale} ${-offsetY / scale} ${bounds.width / scale} ${bounds.height / scale}`);
    return threshold.getScreenCTM?.() || { a: scale, b: 0, c: 0, d: scale, e: bounds.left + offsetX, f: bounds.top + offsetY };
  }
  function measureDoor() {
    const matrix = fitThreshold();
    if (!matrix) return;
    const screen = ([x, y]) => ({ x: matrix.a * x + matrix.c * y + matrix.e, y: matrix.b * x + matrix.d * y + matrix.f });
    const points = corners.map(screen), foot = screen(aperture.project(.5, 1));
    const top = Math.min(...points.map(p => p.y)), bottom = Math.max(...points.map(p => p.y));
    door = { x: foot.x, floor: foot.y, top, bottom, h: bottom - top,
      w: Math.min(Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y), Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y)) };
  }
  function frameDoor() {
    // On phones the illustration is below the headline: move the viewport to it.
    // Never relocate or resize a substitute doorway to fit the screen.
    const safeTop = Math.min(120, height * .2), safeBottom = height * .94;
    if (door.bottom > safeBottom || door.top < safeTop) {
      const target = window.scrollY + (door.top + door.bottom) / 2 - (safeTop + safeBottom) / 2;
      window.scrollTo(0, Math.max(0, target));
      measureDoor();
    }
  }
  function status(state, text) {
    if (phase === state) return;
    phase = state; scene.dataset.state = state; announcement.textContent = text;
  }
  function showClock() {
    const total = Math.ceil(clamp(remaining, 0, duration) / 1000);
    const text = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    digits.forEach(el => { el.textContent = text; });
    const header = $('.header-clock');
    header?.setAttribute('aria-label', `Fictional simulation countdown: ${Math.floor(total / 60)} minutes, ${total % 60} seconds`);
    document.body.classList.toggle('countdown-urgent', total <= 60);
  }
  function tick() {
    clearTimeout(timer); timer = 0;
    if (phase !== 'countdown') return;
    remaining = Math.max(0, deadline - performance.now());
    showClock();
    if (remaining <= 0) {
      if (!document.hidden) startScene();
      return;
    }
    timer = setTimeout(tick, Math.min(1000, remaining));
  }
  function resizeScene() {
    width = Math.max(1, window.innerWidth); height = Math.max(1, window.innerHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
    measureDoor();
    if (phase === 'ashes') paintAsh(0);
  }
  function positionRobot(t) {
    const progress = sceneReduced ? 1 : ease((t - 1.85) / 4.3);
    const startScale = Math.min(door.h * .92 / 746, door.w * .9 / 420);
    const finalScale = Math.min(height * .83 / 780, width * .79 / 560, 1.25);
    const scale = startScale + (finalScale - startScale) * progress;
    const centerX = door.x + (width * .47 - door.x) * progress;
    const footY = door.floor + (height * .95 - door.floor) * progress;
    const walking = !sceneReduced && t > 1.85 && t < 6.15;
    const stride = walking ? Math.sin((t - 1.85) * 6) * 8 * Math.sin(Math.PI * progress) : 0;
    const bob = walking ? Math.sin(t * 12) * 2.2 * progress : 0;
    const x = centerX - 250 * scale, y = footY - 746 * scale + bob;
    currentPose = { x, y, scale };
    actor.style.transform = `translate(${x}px,${y}px) scale(${scale})`;
    actor.style.opacity = String(sceneReduced ? 1 : clamp((t - 1.7) / .6) * (1 - ease((t - 9.1) / 2)));
    $('.robot-leg-left').setAttribute('transform', `rotate(${stride} 214 435)`);
    $('.robot-leg-right').setAttribute('transform', `rotate(${-stride} 292 435)`);
    $('.robot-gun-arm').setAttribute('transform', `rotate(${(1 - ease((t - 5.3) / 1.25)) * 24} 332 249)`);
    openDoor(ease(t / 2.1));
  }
  function paintCracks(t) {
    if (!ctx) return;
    shots.forEach((shot, index) => {
      if (t < shot.at) return;
      const x = shot.x * width, y = shot.y * height, age = t - shot.at;
      // Dark impact with an irregular glass rim, followed by branching fractures.
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const angle = i / 12 * Math.PI * 2, radius = 11 + noise(index * 99 + i) * 12;
        const px = x + Math.cos(angle) * radius, py = y + Math.sin(angle) * radius;
        if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.fillStyle = '#090506'; ctx.fill(); ctx.strokeStyle = '#c2b6b075'; ctx.lineWidth = 1.3; ctx.stroke();
      for (let i = 0; i < 14; i++) {
        const angle = i / 14 * Math.PI * 2 + noise(index * 21 + i) * .25;
        const length = (65 + noise(i * 13 + index * 103) * Math.max(width, height) * .55) * ease(age * 8);
        let previousX = x, previousY = y;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let j = 1; j <= 5; j++) {
          const distance = length * j / 5;
          const jitter = (noise(i * 61 + j * 43 + index) - .5) * 25;
          const px = x + Math.cos(angle) * distance + Math.sin(angle) * jitter;
          const py = y + Math.sin(angle) * distance + Math.cos(angle) * jitter;
          ctx.lineTo(px, py);
          if (j === 3) {
            ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(angle + .7) * length * .24, py + Math.sin(angle + .7) * length * .24); ctx.moveTo(px, py);
          }
          previousX = px; previousY = py;
        }
        ctx.strokeStyle = i % 3 ? '#c3c6c674' : '#ede5dd9c'; ctx.lineWidth = i % 3 ? .6 : 1.2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + 2, y + 2); ctx.lineTo(previousX + 3, previousY + 3); ctx.strokeStyle = '#00000085'; ctx.lineWidth = 2; ctx.stroke();
      }
      if (age < .19 && !sceneReduced) {
        const alpha = Math.sin(clamp(age / .19) * Math.PI);
        const mx = currentPose.x + 477 * currentPose.scale, my = currentPose.y + 316 * currentPose.scale;
        const glow = ctx.createRadialGradient(mx, my, 0, mx, my, 74 * currentPose.scale + 8);
        glow.addColorStop(0, `rgba(255,222,153,${alpha * .88})`); glow.addColorStop(.23, `rgba(255,114,29,${alpha * .65})`); glow.addColorStop(1, 'rgba(212,49,8,0)');
        ctx.fillStyle = glow; ctx.fillRect(mx - 115, my - 115, 230, 230);
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(x, y); ctx.strokeStyle = `rgba(255,152,67,${alpha * .6})`; ctx.lineWidth = 2; ctx.stroke();
      }
    });
  }
  function boundary(x, t, progress) {
    return height + 125 - progress * (height + 380) + Math.sin(x * .016 + t * 1.1) * 20 + Math.sin(x * .043 - t * .7) * 10;
  }
  function maskPage(t, progress) {
    const points = ['0px 0px', '100% 0px'];
    for (let x = width; x >= 0; x -= 32) points.push(`${x}px ${Math.max(0, boundary(x, t, progress) + window.scrollY)}px`);
    points.push(`0px ${Math.max(0, boundary(0, t, progress) + window.scrollY)}px`);
    shell.style.clipPath = `polygon(${points.join(',')})`;
    shell.style.filter = `grayscale(${progress * .9}) sepia(${progress * .6}) brightness(${1 - progress * .5})`;
  }
  function paintAsh(heat = 0) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#090808'; ctx.fillRect(0, 0, width, height);
    const haze = ctx.createRadialGradient(width * .5, height * .7, 0, width * .5, height * .7, Math.max(width, height) * .75);
    haze.addColorStop(0, '#3a333229'); haze.addColorStop(1, '#090808'); ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height);
    for (let row = 0; row < 5; row++) {
      ctx.beginPath(); ctx.moveTo(0, height);
      for (let x = 0; x <= width + 24; x += 24) {
        const y = height * (.68 + row * .047) + Math.sin(x * .006 + row * 2.2) * 22 + Math.sin(x * .023 + row) * 6;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height); ctx.closePath(); ctx.fillStyle = ['#171414','#1b1818','#211d1c','#25201e','#2a2421'][row]; ctx.fill();
    }
    const count = width < 680 ? 420 : 920;
    for (let i = 0; i < count; i++) {
      const x = noise(i * 2.5) * width, y = height * .73 + noise(i * 7.3) * height * .3;
      const size = .5 + noise(i * 4.1) * 3;
      const ember = heat > 0 && i % 19 === 0;
      ctx.fillStyle = ember ? `rgba(234,75,27,${heat * .6})` : `rgba(165,153,142,${.06 + noise(i * 9.2) * .15})`;
      ctx.fillRect(x, y, size * 2, size);
    }
  }
  function paintFire(t, progress) {
    if (!ctx) return;
    // Opaque char follows the same edge as the live page's clipping mask.
    ctx.beginPath(); ctx.moveTo(0, height);
    for (let x = 0; x <= width + 24; x += 24) ctx.lineTo(x, boundary(x, t, progress));
    ctx.lineTo(width, height); ctx.closePath(); ctx.fillStyle = '#0a0707'; ctx.fill();
    const tongues = Math.ceil(width / (width < 680 ? 16 : 20));
    for (let i = 0; i <= tongues; i++) {
      const x = i / tongues * width, y = boundary(x, t, progress);
      const heightOfFlame = 38 + noise(i * 9) * 105 + Math.sin(t * 3.7 + i * 1.9) * 20;
      const sway = Math.sin(t * 2.1 + i) * 18, w = 14 + noise(i * 7) * 17;
      const grad = ctx.createLinearGradient(x, y - heightOfFlame, x, y + 25);
      grad.addColorStop(0, 'rgba(119,15,6,0)'); grad.addColorStop(.25, '#b72a0cd9'); grad.addColorStop(.65, '#f56817ef'); grad.addColorStop(.9, '#ffc167'); grad.addColorStop(1, '#28100a');
      ctx.beginPath(); ctx.moveTo(x - w, y + 20);
      ctx.bezierCurveTo(x - w * 1.3, y - heightOfFlame * .35, x + sway, y - heightOfFlame * .55, x + sway, y - heightOfFlame);
      ctx.bezierCurveTo(x + sway + w * .35, y - heightOfFlame * .58, x + w * 1.4, y - heightOfFlame * .25, x + w, y + 20);
      ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    }
    const particles = width < 680 ? 65 : 125;
    for (let i = 0; i < particles; i++) {
      const life = ((t * (.15 + noise(i) * .19) + noise(i * 5)) % 1);
      const x = noise(i * 31) * width + Math.sin(t + i) * life * 50;
      const y = boundary(x, t, progress) - life * (170 + noise(i * 15) * 260);
      ctx.fillStyle = `rgba(255,${100 + Math.round(noise(i * 17) * 90)},40,${(1 - life) * .65})`;
      const size = (1 + noise(i * 37) * 2) * (1 - life * .6);
      ctx.fillRect(x, y, size, size * (2 + noise(i) * 3));
    }
    for (let i = 0; i < 18; i++) {
      const x = noise(i * 47) * width, rise = (t * .14 + noise(i * 11)) % 1;
      const y = boundary(x, t, progress) - 40 - rise * 210;
      const radius = 30 + rise * 85;
      const smoke = ctx.createRadialGradient(x, y, 0, x, y, radius);
      smoke.addColorStop(0, `rgba(24,19,19,${(1 - rise) * .27})`); smoke.addColorStop(1, 'rgba(24,19,19,0)');
      ctx.fillStyle = smoke; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
  }
  function finishScene() {
    if (frame) cancelAnimationFrame(frame); frame = 0;
    shell.style.clipPath = 'inset(100%)'; shell.style.transform = ''; actor.style.opacity = '0'; portal.style.opacity = '0';
    vignette.style.opacity = '0';
    status('ashes', 'The fictional sequence has ended. Only ashes remain. Activate Restore to return to the unchanged website.');
    label.textContent = ''; ashActions.hidden = false;
    paintAsh(0); restore.focus({ preventScroll: true });
  }
  function drawScene(t) {
    if (sceneReduced) {
      if (t >= 3) { finishScene(); return; }
      if (t < 1.5) { ctx?.clearRect(0, 0, width, height); positionRobot(6.5); vignette.style.opacity = '.85'; }
      else { actor.style.opacity = '0'; portal.style.opacity = '0'; shell.style.clipPath = 'inset(100%)'; paintAsh(0); }
      return;
    }
    if (t >= finaleDuration) { finishScene(); return; }
    ctx?.clearRect(0, 0, width, height);
    positionRobot(t); vignette.style.opacity = String(ease(t / 1.8) * .94);
    if (t >= 6.8 && t < 9.2) {
      status('impact', 'The robot fires. Cracks spread across the screen.'); label.textContent = 'CONTROL LOST';
      const kick = shots.reduce((sum, shot) => sum + (t >= shot.at && t < shot.at + .2 ? Math.sin((t - shot.at) * 48) * (1 - (t - shot.at) / .2) : 0), 0);
      shell.style.transform = `translate(${kick * 2}px,${kick}px)`;
    }
    paintCracks(t);
    if (t >= 9.2 && t < 20.5) {
      status('burning', 'The page is burning away as a visual effect.'); label.textContent = 'IRREVERSIBLE';
      const progress = clamp((t - 9.2) / 10.6);
      maskPage(t, progress); shell.style.transform = '';
      paintFire(t, progress);
      if (!ctx) vignette.style.background = `linear-gradient(0deg,#0b0707 ${progress * 100}%,#cb421c88 ${progress * 100 + 5}%,transparent ${progress * 100 + 20}%)`;
    }
    if (t >= 20.5) {
      status('cooling', 'The flames fade. Ash settles.'); label.textContent = '';
      shell.style.clipPath = 'inset(100%)'; actor.style.opacity = '0'; portal.style.opacity = '0';
      paintAsh(clamp((23.1 - t) / 2.6));
    }
  }
  function animate(now) {
    frame = 0;
    if (phase === 'countdown' || phase === 'ashes' || document.hidden) return;
    if (now - lastFrame >= 30) {
      lastFrame = now;
      try { drawScene((now - sceneStart) / 1000); }
      catch (error) { console.warn('The visual sequence used its static fallback.', error); finishScene(); }
    }
    if (phase !== 'ashes' && phase !== 'countdown') frame = requestAnimationFrame(animate);
  }
  function startScene() {
    if (phase !== 'countdown' || document.hidden) return;
    clearTimeout(timer); timer = 0; remaining = 0; showClock();
    saved = { scrollX: window.scrollX, scrollY: window.scrollY, focus: document.activeElement, shellStyle: shell.style.cssText, inert: shell.inert, overflow: document.body.style.overflow, behavior: document.documentElement.style.scrollBehavior };
    document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden'; shell.inert = true;
    ashActions.hidden = true; sceneReduced = reduced.matches;
    label.textContent = 'CONTAINMENT LOST'; vignette.style.background = '';
    status('breach', 'A fictional visual sequence is starting. A robot steps out of the door. Press Escape to restore the page at any time.');
    try {
      if (typeof scene.showModal === 'function') scene.showModal();
      else { scene.setAttribute('open', ''); scene.setAttribute('role', 'dialog'); scene.setAttribute('aria-modal', 'true'); }
      document.dispatchEvent(new CustomEvent('reversent:scene', { detail: { active: true } }));
      openDoor(0); resizeScene(); frameDoor(); sceneStart = performance.now(); lastFrame = 0; hiddenAt = null;
      drawScene(0); sceneTitle.focus({ preventScroll: true }); frame = requestAnimationFrame(animate);
    } catch (error) { console.warn('The visual sequence could not start.', error); restorePage(); }
  }
  function restorePage() {
    if (phase === 'countdown' || !saved) return;
    if (frame) cancelAnimationFrame(frame); frame = 0; clearTimeout(timer); timer = 0;
    const previous = saved;
    saved = null; phase = 'countdown'; hiddenAt = null;
    shell.style.cssText = previous.shellStyle; shell.inert = previous.inert;
    openDoor(0); portal.style.opacity = '0';
    document.body.style.overflow = previous.overflow;
    try { if (typeof scene.close === 'function') scene.close(); } catch { /* Already closed. */ }
    scene.removeAttribute('open');
    window.scrollTo(previous.scrollX, previous.scrollY);
    document.documentElement.style.scrollBehavior = previous.behavior;
    const previousFocus = previous.focus;
    scene.dataset.state = 'idle';
    ashActions.hidden = true; announcement.textContent = '';
    remaining = duration; deadline = performance.now() + duration;
    document.dispatchEvent(new CustomEvent('reversent:scene', { detail: { active: false } }));
    if (previousFocus?.isConnected && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
    else { clockPanel.setAttribute('tabindex', '-1'); clockPanel.focus({ preventScroll: true }); }
    tick();
  }
  restore.addEventListener('click', restorePage);
  scene.addEventListener('cancel', event => { event.preventDefault(); restorePage(); });
  scene.addEventListener('close', () => { if (phase !== 'countdown' && saved) restorePage(); });
  scene.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); restorePage(); }
    else if (event.key === 'Tab') { event.preventDefault(); (phase === 'ashes' ? restore : sceneTitle).focus({ preventScroll: true }); }
  });
  document.addEventListener('visibilitychange', () => {
    if (phase === 'countdown') { tick(); return; }
    if (phase === 'ashes') return;
    if (document.hidden) { hiddenAt = performance.now(); if (frame) cancelAnimationFrame(frame); frame = 0; }
    else { if (hiddenAt !== null) sceneStart += performance.now() - hiddenAt; hiddenAt = null; lastFrame = 0; frame = requestAnimationFrame(animate); }
  });
  function updateLayout() {
    if (phase === 'countdown') fitThreshold();
    else resizeScene();
  }
  window.addEventListener('resize', updateLayout, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updateLayout).observe($('.hero-art'));
  fitThreshold();
  reduced.addEventListener?.('change', event => { if (event.matches && phase !== 'countdown' && phase !== 'ashes') finishScene(); });
  clockPanel.hidden = false; $('.header-clock').hidden = false; tick();
})();
