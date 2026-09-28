/* A short isolated stall must not change quality. Hidden/transition frames are
   excluded by the caller; this policy uses consecutive, steady sample windows. */
function assessQualityWindow(intervals) {
  if (intervals.length < 6) return { valid: false, slow: false };
  const sorted = [...intervals].sort((a, b) => a - b);
  const p90 = sorted[Math.floor((sorted.length - 1) * 0.9)];
  const slowRatio = intervals.filter((delta) => delta > 25).length / intervals.length;
  return { valid: true, slow: p90 > 28 && slowRatio > 0.25, p90, slowRatio };
}

(() => {
  const body = document.body;
  const root = document.documentElement;
  const app = document.getElementById('app');
  const gallery = document.getElementById('vfx-gallery');
  const home = document.getElementById('home-scene');
  const mobile = matchMedia('(max-width: 720px), (hover: none), (pointer: coarse)');
  const mobileScene = matchMedia('(max-width: 720px), (max-width: 1180px) and (pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const modes = ['full', 'balanced', 'eco'];
  const labels = { full: '完整', balanced: '平衡', eco: '节能' };
  let preference = 'auto';
  let automatic = mobile.matches ? 'balanced' : 'full';
  try {
    const saved = localStorage.getItem('nexus-quality');
    if (['auto', ...modes].includes(saved)) preference = saved;
    const floor = sessionStorage.getItem('nexus-auto-quality');
    if (modes.includes(floor) && modes.indexOf(floor) > modes.indexOf(automatic)) automatic = floor;
  } catch {}

  const control = document.createElement('label');
  control.className = 'quality-control';
  control.innerHTML = '<span>画质</span><select id="quality-select" aria-label="显示效果"><option value="auto">自动</option><option value="full">完整</option><option value="balanced">平衡</option><option value="eco">节能</option></select>';
  app.append(control);
  const select = control.querySelector('select');
  select.value = preference;
  let sampleTimer = 0;
  let sampleFrame = 0;
  let slowWindows = 0;
  let ignoreUntil = performance.now() + 3500;
  let lastDowngrade = -Infinity;

  function effectiveQuality() {
    return mobileScene.matches ? 'eco' : preference === 'auto' ? automatic : preference;
  }
  function applyQuality() {
    const quality = effectiveQuality();
    const changed = body.dataset.quality !== quality;
    body.dataset.quality = quality;
    body.dataset.qualityPreference = preference;
    select.options[0].textContent = `自动 · ${labels[quality]}`;
    if (changed) window.dispatchEvent(new Event('site-qualitychange'));
  }
  function canSample() {
    return !mobileScene.matches && preference === 'auto' && !document.hidden && !reduced.matches
      && ['world', 'home'].includes(body.dataset.scene)
      && performance.now() >= ignoreUntil
      && !root.classList.contains('is-theme-transitioning')
      && !document.querySelector('.scene.is-materializing')
      && (gallery.hidden || gallery.classList.contains('is-settled'));
  }
  function scheduleSample(delay = 12000) {
    clearTimeout(sampleTimer);
    sampleTimer = 0;
    if (mobileScene.matches || preference !== 'auto' || document.hidden || reduced.matches || automatic === 'eco') return;
    sampleTimer = setTimeout(sampleQuality, delay);
  }
  function stopSample() {
    cancelAnimationFrame(sampleFrame);
    clearTimeout(sampleTimer);
    sampleFrame = sampleTimer = 0;
  }
  function sampleQuality() {
    sampleTimer = 0;
    if (!canSample()) { scheduleSample(5000); return; }
    const intervals = [];
    let start = 0;
    let previous = 0;
    function collectQualityFrame(now) {
      sampleFrame = 0;
      if (!canSample()) { scheduleSample(); return; }
      if (!start) start = now;
      if (previous && now > previous) intervals.push(now - previous);
      previous = now;
      if (now - start < 1800) {
        sampleFrame = requestAnimationFrame(collectQualityFrame);
        return;
      }
      const result = assessQualityWindow(intervals);
      if (result.valid) slowWindows = result.slow ? slowWindows + 1 : 0;
      if (slowWindows >= 2 && performance.now() - lastDowngrade > 30000) {
        automatic = modes[Math.min(modes.indexOf(automatic) + 1, modes.length - 1)];
        lastDowngrade = performance.now();
        slowWindows = 0;
        try { sessionStorage.setItem('nexus-auto-quality', automatic); } catch {}
        applyQuality();
      }
      scheduleSample();
    }
    sampleFrame = requestAnimationFrame(collectQualityFrame);
  }
  select.addEventListener('change', () => {
    preference = select.value;
    slowWindows = 0;
    try { localStorage.setItem('nexus-quality', preference); } catch {}
    stopSample();
    applyQuality();
    scheduleSample(5000);
  });
  mobile.addEventListener('change', () => {
    if (mobile.matches && automatic === 'full') automatic = 'balanced';
    applyQuality();
  });
  document.addEventListener('visibilitychange', () => {
    stopSample();
    slowWindows = 0;
    ignoreUntil = performance.now() + 3000;
    scheduleSample(5000);
  });
  mobileScene.addEventListener('change', () => { stopSample(); applyQuality(); scheduleSample(5000); });
  reduced.addEventListener('change', () => { stopSample(); scheduleSample(5000); });

  // Freeze decorative animation behind the modal, while leaving its controls live.
  function syncOcclusion() {
    const covered = !gallery.hidden;
    [...home.children].forEach((element) => {
      if (element !== gallery && !element.classList.contains('view-toast')) {
        element.classList.toggle('effects-occluded', covered);
      }
    });
    window.dispatchEvent(new Event('site-effectsvisibility'));
  }
  new MutationObserver(syncOcclusion).observe(gallery, { attributes: true, attributeFilter: ['hidden'] });
  syncOcclusion();
  document.querySelectorAll('[data-video-gallery-page]').forEach((page) => {
    const observer = new IntersectionObserver((entries) => {
      let changed = false;
      entries.forEach(({ target, isIntersecting }) => {
        const offscreen = !isIntersecting;
        if (target.classList.contains('effects-offscreen') !== offscreen) {
          target.classList.toggle('effects-offscreen', offscreen);
          changed = true;
        }
      });
      if (changed) window.dispatchEvent(new Event('site-effectsvisibility'));
    }, { root: gallery.querySelector('.video-gallery-window'), rootMargin: '24px 0px', threshold: 0 });
    page.querySelectorAll('.video-card').forEach((card) => observer.observe(card));
  });

  // Cached glass is rendered only after geometry/theme settles, never per frame.
  // The texture depicts the known world image. Particles remain independent.
  const textureCache = new Map();
  const images = new Map();
  let glassTimer = 0;
  let glassGeneration = 0;
  const glassRecords = [...document.querySelectorAll('.hud-glass, .sao-window')].map((surface, index) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'glass-cache';
    canvas.setAttribute('aria-hidden', 'true');
    surface.append(canvas);
    const shape = surface.matches('.world-header, .home-header') ? 'sao-hud-clip'
      : surface.matches('.identity-window, .welcome-window') ? 'sao-main-clip' : 'sao-panel-clip';
    canvas.style.clipPath = `url(#${shape})`;
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    outline.setAttribute('viewBox', '0 0 1 1');
    outline.setAttribute('preserveAspectRatio', 'none');
    outline.setAttribute('aria-hidden', 'true');
    outline.classList.add('surface-outline');
    const defs = document.createElementNS(outline.namespaceURI, 'defs');
    const gradient = document.createElementNS(outline.namespaceURI, 'linearGradient');
    gradient.id = `cached-glass-edge-${index}`;
    [['0%', '--prism-cyan'], ['100%', '--prism-magenta']].forEach(([offset, color]) => {
      const stop = document.createElementNS(outline.namespaceURI, 'stop');
      stop.setAttribute('offset', offset);
      stop.style.stopColor = `var(${color})`;
      gradient.append(stop);
    });
    defs.append(gradient);
    outline.append(defs);
    const edge = document.createElementNS(outline.namespaceURI, 'path');
    edge.setAttribute('d', document.querySelector(`#${shape} path`).getAttribute('d'));
    edge.setAttribute('vector-effect', 'non-scaling-stroke');
    edge.setAttribute('stroke', `url(#${gradient.id})`);
    outline.append(edge);
    surface.append(outline);
    return { surface, canvas, context: canvas.getContext('2d'), key: '' };
  });

  function loadWorldImage(theme) {
    if (!images.has(theme)) {
      const image = new Image();
      image.src = theme === 'dark' ? './assets/world-background-dark.webp' : './assets/world-background.jpg';
      images.set(theme, image.decode().then(() => image).catch((error) => { images.delete(theme); throw error; }));
    }
    return images.get(theme);
  }
  function makeTexture(image, bounds, theme, quality) {
    const ratio = Math.min(quality === 'eco' ? 0.3 : 0.5, 1280 / bounds.width);
    const width = Math.ceil(bounds.width * ratio);
    const height = Math.ceil(bounds.height * ratio);
    const key = `${theme}:${quality}:${width}:${height}`;
    if (textureCache.has(key)) return textureCache.get(key);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D unavailable');
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    if ('filter' in context) {
      context.filter = `blur(${16 * ratio}px) saturate(${theme === 'dark' ? 1.2 : 1.08}) contrast(1.03)`;
      context.drawImage(image, (width - image.naturalWidth * scale) / 2, (height - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale);
    } else {
      // Downsample/upsample fallback for browsers without Canvas 2D filters.
      const small = document.createElement('canvas');
      small.width = Math.max(1, Math.ceil(width / 12));
      small.height = Math.max(1, Math.ceil(height / 12));
      const smallContext = small.getContext('2d');
      const smallScale = Math.max(small.width / image.naturalWidth, small.height / image.naturalHeight);
      smallContext.drawImage(image, (small.width - image.naturalWidth * smallScale) / 2, (small.height - image.naturalHeight * smallScale) / 2, image.naturalWidth * smallScale, image.naturalHeight * smallScale);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(small, 0, 0, width, height);
    }
    context.filter = 'none';
    // Reproduce the broad scene shade without sampling live DOM or text.
    const shade = context.createLinearGradient(0, 0, 0, height);
    shade.addColorStop(0, theme === 'dark' ? 'rgba(0,5,18,.18)' : 'rgba(212,246,255,.04)');
    shade.addColorStop(0.42, 'rgba(0,0,0,0)');
    shade.addColorStop(1, theme === 'dark' ? 'rgba(0,3,12,.46)' : 'rgba(49,135,179,.18)');
    context.fillStyle = shade;
    context.fillRect(0, 0, width, height);
    const texture = { canvas, ratio, key };
    textureCache.set(key, texture);
    while (textureCache.size > 4) textureCache.delete(textureCache.keys().next().value);
    return texture;
  }
  async function updateGlass(generation) {
    if (document.hidden || !body.classList.contains('is-world-media-ready')) return;
    const theme = root.dataset.theme;
    const quality = effectiveQuality();
    try {
      const image = await loadWorldImage(theme);
      if (generation !== glassGeneration || theme !== root.dataset.theme || document.hidden) return;
      const items = glassRecords.filter(({ surface }) => {
        const scene = surface.closest('.scene');
        return scene?.getAttribute('aria-hidden') !== 'true' && !surface.closest('[hidden], .effects-occluded');
      }).map((record) => ({ record, bounds: record.surface.getBoundingClientRect(), background: record.surface.closest('.scene').querySelector('.world-background').getBoundingClientRect() }));
      items.forEach(({ record, bounds, background }) => {
        if (!record.context || bounds.width <= 0 || bounds.height <= 0) return;
        const style = getComputedStyle(record.surface);
        if (style.visibility === 'hidden') return;
        const texture = makeTexture(image, background, theme, quality);
        const key = [texture.key, bounds.left - background.left, bounds.top - background.top, bounds.width, bounds.height].map((value) => typeof value === 'number' ? Math.round(value / 2) : value).join(':');
        if (record.key === key) return;
        const ratio = Math.min(quality === 'eco' ? 0.3 : 0.5, 960 / bounds.width);
        record.canvas.width = Math.max(1, Math.ceil(bounds.width * ratio));
        record.canvas.height = Math.max(1, Math.ceil(bounds.height * ratio));
        const context = record.context;
        context.fillStyle = theme === 'dark' ? '#091a30' : '#b3e2f3';
        context.fillRect(0, 0, record.canvas.width, record.canvas.height);
        context.drawImage(texture.canvas,
          (bounds.left - background.left) * texture.ratio, (bounds.top - background.top) * texture.ratio,
          bounds.width * texture.ratio, bounds.height * texture.ratio,
          0, 0, record.canvas.width, record.canvas.height);
        record.key = key;
        record.surface.classList.add('has-glass-cache');
      });
    } catch (error) {
      // Keep the existing glass as a fallback if images/canvas are unavailable.
      if (generation !== glassGeneration || theme !== root.dataset.theme) return;
      glassRecords.forEach((record) => {
        record.surface.classList.remove('has-glass-cache');
        record.key = '';
      });
      console.warn('Cached glass unavailable; using existing material.', error.message);
    }
  }
  function scheduleGlass(delay = 480) {
    clearTimeout(glassTimer);
    const generation = ++glassGeneration;
    if (document.hidden) return;
    glassTimer = setTimeout(() => updateGlass(generation), delay);
  }
  const stateObserver = new MutationObserver(() => {
    ignoreUntil = performance.now() + 1800;
    scheduleGlass();
  });
  stateObserver.observe(root, { attributes: true, attributeFilter: ['data-theme', 'class'] });
  stateObserver.observe(body, { attributes: true, attributeFilter: ['data-scene', 'class'] });
  document.querySelectorAll('.scene, #identity-composition, #vfx-gallery').forEach((scene) => stateObserver.observe(scene, { attributes: true, attributeFilter: ['class', 'hidden', 'aria-hidden'] }));
  new ResizeObserver(() => scheduleGlass()).observe(app);
  const panelSizes = new ResizeObserver(() => scheduleGlass());
  glassRecords.forEach(({ surface }) => panelSizes.observe(surface));
  app.addEventListener('pointermove', (event) => { if (!mobileScene.matches && event.pointerType !== 'touch') scheduleGlass(); }, { passive: true });
  app.addEventListener('pointerleave', () => scheduleGlass(), { passive: true });
  window.addEventListener('site-sceneviewportchange', () => { syncOcclusion(); scheduleGlass(); });
  window.addEventListener('site-qualitychange', () => scheduleGlass(40));
  document.addEventListener('visibilitychange', () => scheduleGlass(350));
  applyQuality();
  scheduleGlass(100);
  scheduleSample(5000);
})();
