(() => {
  const body = document.body;
  const root = document.documentElement;
  const app = document.getElementById('app');
  const entryScene = document.getElementById('entry-scene');
  const startExperienceButton = document.getElementById('start-experience');
  const introScene = document.getElementById('intro-scene');
  const introVideo = document.getElementById('intro-video');
  const introAudio = document.getElementById('intro-audio');
  const worldScene = document.getElementById('world-scene');
  const identityComposition = document.getElementById('identity-composition');
  const identityForm = document.getElementById('identity-form');
  const identityInput = document.getElementById('visitor-name');
  const identityField = document.getElementById('name-field');
  const identityMessage = document.getElementById('name-message');
  const confirmButton = identityForm.querySelector('.confirm-button');
  const welcomeWindow = document.getElementById('welcome-window');
  const enterWorldButton = document.getElementById('enter-world');
  const homeScene = document.getElementById('home-scene');
  const restartButton = document.getElementById('restart-experience');
  const themeButton = document.getElementById('theme-switch');
  const themeLabel = themeButton.querySelector('[data-theme-label]');
  const themeColor = document.getElementById('theme-color');
  const soundButton = document.getElementById('sound-switch');
  const displayNameTargets = [...document.querySelectorAll('[data-display-name]')];
  const viewButtons = [...document.querySelectorAll('[data-view-button]')];
  const viewPanels = [...document.querySelectorAll('[data-view-panel]')];
  const viewKicker = document.getElementById('view-kicker');
  const viewTab = document.getElementById('view-tab');
  const toast = document.getElementById('view-toast');
  const demoMessageControls = [...document.querySelectorAll('[data-demo-message]')];
  const videoGallery = document.getElementById('vfx-gallery');
  const videoGalleryOpenControls = [...document.querySelectorAll('[data-video-gallery-open]')];
  const videoGalleryCloseControls = [...document.querySelectorAll('[data-video-gallery-close]')];
  const videoGalleryCloseButton = videoGallery.querySelector('.video-gallery-close');
  const videoGalleryPages = [...videoGallery.querySelectorAll('[data-video-gallery-page]')];
  const videoGalleryKicker = document.getElementById('video-gallery-kicker');
  const videoGalleryCount = document.getElementById('video-gallery-count');
  const videoGalleryEyebrow = document.getElementById('video-gallery-eyebrow');
  const videoGalleryTitle = document.getElementById('vfx-gallery-title');
  const videoGalleryDescription = document.getElementById('video-gallery-description');
  const videoCards = [...videoGallery.querySelectorAll('.video-card')];
  const gallerySpatialSurfaces = [videoGallery.querySelector('.video-gallery-window'), ...videoCards];
  const externalArchiveLinks = [...document.querySelectorAll('.bilibili-link')];
  const contactLinks = [...document.querySelectorAll('a.contact-link')];
  const contactCopyControls = [...document.querySelectorAll('[data-contact-copy]')];
  const galleryBackgroundTargets = [...homeScene.querySelectorAll('.home-header, .home-node-rail, .home-workspace, .home-footer')];
  const renderChart = document.getElementById('render-chart');
  const networkChart = document.getElementById('network-chart');
  const metricTargets = [...document.querySelectorAll('[data-metric]')].reduce((targets, element) => {
    const key = element.dataset.metric;
    if (!targets[key]) targets[key] = [];
    targets[key].push(element);
    return targets;
  }, {});
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileSceneQuery = window.matchMedia('(max-width: 720px), (max-width: 1180px) and (pointer: coarse)');
  const balancedPerformanceQuery = window.matchMedia('(max-width: 720px), (hover: none), (pointer: coarse)');
  const balancedPerformanceMode = balancedPerformanceQuery.matches;
  const sceneFadeDuration = balancedPerformanceMode ? 380 : 920;
  const sceneMaterializeDuration = balancedPerformanceMode ? 720 : 2200;
  const sceneFocusDelay = balancedPerformanceMode ? 440 : 1380;

  body.dataset.performance = balancedPerformanceMode ? 'balanced' : 'full';

  const viewLabels = {
    blog: { kicker: 'VISUAL ARCHIVE', tab: 'WORKS' },
    projects: { kicker: 'CONSTRUCTION LOG', tab: 'BUILDS' },
    about: { kicker: 'IDENTITY NODE', tab: 'PROFILE' },
  };

  const videoGalleryLabels = {
    motion: {
      kicker: 'VISUAL ARCHIVE / VFX-PV',
      eyebrow: 'MOTION DESIGN // SELECTED WORKS',
      title: 'AE 特效与视觉 PV',
      description: '选择封面后将在新页面打开对应的 Bilibili 视频。',
    },
    digital: {
      kicker: 'PROJECT ARCHIVE / AI-WEB',
      eyebrow: 'AI & WEB // EXPERIMENTAL BUILD',
      title: 'AI 工具与网站实验',
      description: '收录使用 AI Agent、网页技术与数字工具完成的个人项目。',
    },
    anime: {
      kicker: 'VISUAL ARCHIVE / ANIME-VFX',
      eyebrow: 'ANIME VISUAL // SELECTED WORKS',
      title: '动漫视觉与 VFX 创作',
      description: '以动画作品为素材完成的 VFX、剪辑与视觉练习。',
    },
  };

  const soundSources = {
    click: ['./assets/audio/FeedbackClick.wav', 0.28],
    hover: ['./assets/audio/LinkStart.wav', 0.16],
    linkOpen: ['./assets/audio/LinkStart.wav', 0.22],
    message: ['./assets/audio/NotifyMessage.wav', 0.32],
    system: ['./assets/audio/NotifySystem.wav', 0.26],
    warning: ['./assets/audio/NotifyWarning.wav', 0.38],
    panel: ['./assets/audio/PopupMenu.wav', 0.3],
    panelOpen: ['./sd/PopupPanel.wav', 0.24],
    ready: ['./assets/audio/ProgramReady.wav', 0.36],
    launch: ['./assets/audio/ProgramStart.wav', 0.34],
    dismiss: ['./assets/audio/DismissLauncher.wav', 0.28],
  };

  const sceneArrivalSounds = {
    world: [
      { name: 'linkOpen', delay: 90, volumeScale: 0.78 },
      { name: 'panelOpen', delay: 280, volumeScale: 0.92, primary: true },
      { name: 'panel', delay: 900, volumeScale: 0.58 },
    ],
    home: [
      { name: 'linkOpen', delay: 90, volumeScale: 0.66 },
      { name: 'panelOpen', delay: 390, volumeScale: 0.78, primary: true },
      { name: 'panel', delay: 720, volumeScale: 0.52 },
    ],
  };

  const soundBank = Object.fromEntries(
    Object.entries(soundSources).map(([name, [source, volume]]) => {
      const audio = new Audio();
      audio.preload = 'none';
      audio.src = source;
      audio.volume = volume;
      return [name, audio];
    }),
  );

  let activeScene = 'entry';
  let introFinished = false;
  let experienceStarting = false;
  let toastTimer;
  let themeTransitionTimer;
  let soundEnabled = true;
  let lastHoverSoundAt = 0;
  let introAudioStarted = false;
  let introVideoStarted = false;
  let introAudioRevealPending = false;
  let introSyncTimer;
  let introLoadFallbackTimer;
  let introTransitionStarted = false;
  let introMediaRequested = false;
  let worldMediaRequested = false;
  let enteringHome = false;
  let galleryRestoreFocus = null;
  let galleryCloseTimer;
  let gallerySettleTimer;
  const arrivalSoundTimers = new Set();

  try {
    soundEnabled = localStorage.getItem('nexus-sound-enabled') !== 'false';
  } catch {}

  function readSessionValue(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function writeSessionValue(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {}
  }

  function removeSessionValue(key) {
    try {
      sessionStorage.removeItem(key);
    } catch {}
  }

  introScene.inert = true;
  worldScene.inert = true;
  homeScene.inert = true;
  welcomeWindow.inert = true;

  function updateSoundButton() {
    body.dataset.sound = soundEnabled ? 'on' : 'off';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', soundEnabled ? '关闭界面音效' : '开启界面音效');
  }

  function prepareWorldMedia() {
    if (!worldMediaRequested) {
      worldMediaRequested = true;
      body.classList.add('is-world-media-ready');
    }
    if (root.dataset.theme === 'dark') body.classList.add('is-dark-world-media-ready');
  }

  function prepareIntroMedia() {
    if (introMediaRequested) return;
    introMediaRequested = true;

    if (!introVideo.hasAttribute('src') && introVideo.dataset.src) introVideo.src = introVideo.dataset.src;
    if (!introAudio.hasAttribute('src') && introAudio.dataset.src) introAudio.src = introAudio.dataset.src;
    introVideo.load();
    introAudio.load();
  }

  function playSound(name, { force = false, volumeScale = 1 } = {}) {
    const soundScene = body.dataset.scene || activeScene;
    if ((!soundEnabled && !force) || soundScene === 'entry' || soundScene === 'intro') return;
    const template = soundBank[name];
    if (!template) return;

    const sound = template.cloneNode();
    sound.volume = Math.min(1, template.volume * volumeScale);
    body.dataset.lastSound = name;
    if (name !== 'hover') body.dataset.lastActionSound = name;
    sound.play().catch(() => {
      body.dataset.lastSound = `blocked-${name}`;
      if (name !== 'hover') body.dataset.lastActionSound = `blocked-${name}`;
    });
  }

  function clearArrivalSoundTimers() {
    arrivalSoundTimers.forEach((timer) => window.clearTimeout(timer));
    arrivalSoundTimers.clear();
  }

  function scheduleArrivalSound(name, delay, options = {}, guard = () => true) {
    const wait = reducedMotion.matches ? 0 : delay;
    const timer = window.setTimeout(() => {
      arrivalSoundTimers.delete(timer);
      if (guard()) playSound(name, options);
    }, wait);
    arrivalSoundTimers.add(timer);
  }

  function playSceneArrivalSounds(sceneName) {
    clearArrivalSoundTimers();
    const sequence = sceneArrivalSounds[sceneName] || [];
    const audibleSequence = reducedMotion.matches
      ? sequence.filter((cue) => cue.primary).slice(0, 1)
      : sequence;

    audibleSequence.forEach(({ name, delay, volumeScale }) => {
      scheduleArrivalSound(
        name,
        delay,
        { volumeScale },
        () => body.dataset.scene === sceneName,
      );
    });
  }

  updateSoundButton();

  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    try {
      localStorage.setItem('nexus-sound-enabled', String(soundEnabled));
    } catch {}
    updateSoundButton();
    if (activeScene === 'intro') {
      if (!soundEnabled) {
        introAudio.muted = true;
        stopIntroSync();
        body.dataset.introAudio = 'off';
      } else if (introMediaRequested) {
        introAudio.muted = true;
        introAudio.play().then(() => {
          introAudioStarted = true;
          body.dataset.introAudio = 'starting';
          makeIntroAudioAudible();
        }).catch(() => {
          body.dataset.introAudio = 'unavailable';
        });
      }
      return;
    }
    if (soundEnabled) playSound('system', { force: true });
  });

  function applyTheme(theme, persist = true) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    const isDark = nextTheme === 'dark';
    root.dataset.theme = nextTheme;
    root.classList.add('is-theme-transitioning');
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.setAttribute('aria-label', isDark ? '切换到亮色主题' : '切换到暗色主题');
    themeLabel.textContent = isDark ? 'DARK' : 'LIGHT';
    themeColor.setAttribute('content', isDark ? '#020815' : '#dff6ff');
    if (isDark && worldMediaRequested) body.classList.add('is-dark-world-media-ready');

    if (persist) {
      try {
        localStorage.setItem('nexus-theme', nextTheme);
      } catch {}
    }

    window.clearTimeout(themeTransitionTimer);
    themeTransitionTimer = window.setTimeout(() => {
      root.classList.remove('is-theme-transitioning');
    }, reducedMotion.matches ? 0 : 760);
  }

  applyTheme(root.dataset.theme, false);

  themeButton.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    playSound('system');
  });

  function updateDisplayName(name) {
    displayNameTargets.forEach((target) => {
      target.textContent = name;
    });
  }

  const storedDisplayName = readSessionValue('nexus-display-name');
  const storedScene = readSessionValue('nexus-scene');
  if (storedDisplayName) {
    identityInput.value = storedDisplayName;
    updateDisplayName(storedDisplayName);
  }

  function restoreStoredScene() {
    if (!storedDisplayName || !['welcome', 'home'].includes(storedScene)) return;

    prepareWorldMedia();
    entryScene.classList.remove('is-active', 'is-launching', 'is-dissolving');
    entryScene.setAttribute('aria-hidden', 'true');
    entryScene.inert = true;
    introScene.classList.remove('is-active', 'is-playing', 'is-video-ready', 'is-underlay');
    introScene.setAttribute('aria-hidden', 'true');
    introScene.inert = true;
    introFinished = true;
    experienceStarting = true;

    if (storedScene === 'home') {
      worldScene.classList.remove('is-active', 'is-dissolving', 'is-materializing', 'is-materialized');
      worldScene.setAttribute('aria-hidden', 'true');
      worldScene.inert = true;
      homeScene.classList.add('is-active', 'is-restored');
      homeScene.setAttribute('aria-hidden', 'false');
      homeScene.inert = false;
      activeScene = 'home';
      body.dataset.scene = 'home';
      return;
    }

    worldScene.classList.add('is-active', 'is-restored');
    worldScene.setAttribute('aria-hidden', 'false');
    worldScene.inert = false;
    identityForm.inert = true;
    welcomeWindow.inert = false;
    identityComposition.classList.add('is-welcome');
    welcomeWindow.setAttribute('aria-hidden', 'false');
    activeScene = 'world';
    body.dataset.scene = 'world';
  }

  restoreStoredScene();

  document.getElementById('current-year').textContent = String(new Date().getFullYear());

  function updateClock() {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    const date = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
    }).format(now).toUpperCase();

    ['clock-time', 'home-clock-time', 'hud-clock-time'].forEach((id) => {
      const target = document.getElementById(id);
      if (target) target.textContent = time;
    });
    ['clock-date', 'home-clock-date', 'hud-clock-date'].forEach((id) => {
      const target = document.getElementById(id);
      if (target) target.textContent = date;
    });
  }

  updateClock();
  window.setInterval(updateClock, 30_000);

  function setMetric(name, value) {
    (metricTargets[name] || []).forEach((target) => {
      if (target.textContent !== value) target.textContent = value;
    });
  }

  function setRing(name, value, label, isAvailable = true) {
    const ring = document.querySelector(`[data-ring="${name}"]`);
    if (!ring) return;
    const normalizedValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    ring.style.setProperty('--ring-value', normalizedValue.toFixed(1));
    ring.classList.toggle('is-na', !isAvailable);
    setMetric(`ring-${name}`, label);
  }

  function drawSparkline(canvas, values, { min = null, max = null, dark = false } = {}) {
    if (!canvas || values.length < 2) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    const pixelWidth = Math.max(1, Math.round(bounds.width * ratio));
    const pixelHeight = Math.max(1, Math.round(bounds.height * ratio));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const lower = min ?? Math.min(...values);
    const upper = max ?? Math.max(...values);
    const range = Math.max(1, upper - lower);
    const padding = 4;
    const chartWidth = bounds.width - padding * 2;
    const chartHeight = bounds.height - padding * 2;

    context.beginPath();
    values.forEach((value, index) => {
      const x = padding + (index / (values.length - 1)) * chartWidth;
      const y = padding + (1 - (value - lower) / range) * chartHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });

    const computed = getComputedStyle(root);
    const stroke = computed.getPropertyValue(dark ? '--prism-cyan' : '--sky-deep').trim() || '#59cbea';
    context.lineWidth = 1.25;
    context.strokeStyle = stroke;
    context.shadowColor = stroke;
    context.shadowBlur = 4;
    context.stroke();
    context.shadowBlur = 0;

    const lastValue = values[values.length - 1];
    const lastY = padding + (1 - (lastValue - lower) / range) * chartHeight;
    context.fillStyle = dark ? '#7feaff' : '#ffffff';
    context.fillRect(bounds.width - padding - 2, lastY - 1, 3, 3);
  }

  function detectBrowserName() {
    const brands = navigator.userAgentData?.brands || [];
    const preferredBrand = brands.find((brand) => !/Not.A.Brand|Chromium/i.test(brand.brand))
      || brands.find((brand) => !/Not.A.Brand/i.test(brand.brand));
    if (preferredBrand) return preferredBrand.brand.replace('Google ', '').toUpperCase();

    const userAgent = navigator.userAgent;
    if (/Edg\//.test(userAgent)) return 'EDGE';
    if (/Firefox\//.test(userAgent)) return 'FIREFOX';
    if (/Chrome\//.test(userAgent)) return 'CHROME';
    if (/Safari\//.test(userAgent)) return 'SAFARI';
    return 'UNKNOWN';
  }

  function readWebGLRenderer() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) return null;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
      return typeof renderer === 'string' ? renderer.replace(/^ANGLE \(|\)$/g, '') : null;
    } catch {
      return null;
    }
  }

  async function readWebGPUAdapter() {
    if (!navigator.gpu?.requestAdapter) {
      setMetric('webgpu-status', 'N/A');
      return;
    }

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        setMetric('webgpu-status', 'UNAVAILABLE');
        return;
      }
      setMetric('webgpu-status', 'AVAILABLE');
      const info = adapter.info || await adapter.requestAdapterInfo?.();
      const descriptor = info?.description || info?.device || info?.architecture;
      if (descriptor && (metricTargets['gpu-name']?.[0]?.textContent === 'N/A')) {
        setMetric('gpu-name', String(descriptor));
      }
    } catch {
      setMetric('webgpu-status', 'N/A');
    }
  }

  function updateViewportMetrics() {
    const ratio = window.devicePixelRatio || 1;
    const screenWidth = Math.round(window.screen.width * ratio);
    const screenHeight = Math.round(window.screen.height * ratio);
    setMetric('screen-size', `${screenWidth}×${screenHeight} / ${ratio.toFixed(2)}X`);
    setMetric('viewport-size', `${window.innerWidth}×${window.innerHeight}`);
  }

  function updateSessionTransferRate() {
    const resources = performance.getEntriesByType?.('resource') || [];
    const transferred = resources.filter((entry) => entry.transferSize > 0 && entry.responseEnd > entry.startTime);
    if (!transferred.length) {
      setMetric('session-rx', 'N/A');
      return;
    }

    const bytes = transferred.reduce((total, entry) => total + entry.transferSize, 0);
    const startedAt = Math.min(...transferred.map((entry) => entry.startTime));
    const endedAt = Math.max(...transferred.map((entry) => entry.responseEnd));
    const seconds = Math.max(0.001, (endedAt - startedAt) / 1000);
    const megabitsPerSecond = (bytes * 8) / seconds / 1_000_000;
    setMetric('session-rx', `${megabitsPerSecond.toFixed(megabitsPerSecond >= 10 ? 0 : 1)} MBPS`);
  }

  const networkHistory = [];
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  function updateNetworkMetrics() {
    const online = navigator.onLine;
    setMetric('online-state', online ? 'ONLINE' : 'OFFLINE');
    const networkIndicator = document.querySelector('.widget-network .live-dot');
    if (networkIndicator) networkIndicator.textContent = online ? 'ONLINE' : 'OFFLINE';

    if (!connection) {
      setMetric('net-downlink', 'N/A');
      setMetric('net-uplink', 'N/A');
      setMetric('net-rtt', 'N/A');
      setMetric('net-type', 'N/A');
      setRing('link', 0, 'N/A', false);
      return;
    }

    const downlink = Number(connection.downlink);
    const rtt = Number(connection.rtt);
    const type = connection.effectiveType || connection.type;
    const hasDownlink = Number.isFinite(downlink) && downlink > 0;
    const hasRtt = Number.isFinite(rtt) && rtt >= 0;

    setMetric('net-downlink', hasDownlink ? `${downlink.toFixed(downlink >= 10 ? 0 : 1)} MBPS` : 'N/A');
    setMetric('net-uplink', 'N/A');
    setMetric('net-rtt', hasRtt ? `${Math.round(rtt)} MS` : 'N/A');
    setMetric('net-type', type ? String(type).toUpperCase() : 'N/A');

    if (hasDownlink) {
      networkHistory.push(downlink);
      if (networkHistory.length > 42) networkHistory.shift();
      drawSparkline(networkChart, networkHistory, { min: 0, max: Math.max(10, ...networkHistory) * 1.08, dark: true });
    }

    if (hasDownlink || hasRtt) {
      const bandwidthScore = hasDownlink ? Math.min(100, downlink * 8) : 50;
      const latencyScore = hasRtt ? Math.max(0, 100 - rtt / 5) : 50;
      const linkScore = bandwidthScore * 0.62 + latencyScore * 0.38;
      setRing('link', linkScore, `${Math.round(linkScore)}%`);
    } else {
      setRing('link', 0, 'N/A', false);
    }
  }

  function initializeVisitorTelemetry() {
    const logicalCores = Number(navigator.hardwareConcurrency);
    const deviceMemory = Number(navigator.deviceMemory);
    setMetric('logical-cores', Number.isFinite(logicalCores) && logicalCores > 0 ? `${logicalCores} THREADS` : 'N/A');
    setMetric('device-memory', Number.isFinite(deviceMemory) && deviceMemory > 0 ? `≈${deviceMemory} GB` : 'N/A');
    setMetric('browser-name', detectBrowserName());
    setMetric('platform-name', String(navigator.userAgentData?.platform || navigator.platform || 'N/A').toUpperCase());
    setMetric('gpu-name', readWebGLRenderer() || 'N/A');
    updateViewportMetrics();
    updateNetworkMetrics();
    readWebGPUAdapter();

    window.addEventListener('resize', updateViewportMetrics, { passive: true });
    window.addEventListener('online', updateNetworkMetrics);
    window.addEventListener('offline', updateNetworkMetrics);
    connection?.addEventListener?.('change', updateNetworkMetrics);
    window.addEventListener('load', () => window.setTimeout(updateSessionTransferRate, 250), { once: true });
  }

  const renderHistory = [];
  const renderSampleWindow = balancedPerformanceMode ? 360 : 500;
  const renderSamplePause = balancedPerformanceMode ? 3000 : 2500;
  let renderSampleStartedAt = 0;
  let previousFrameAt = null;
  let sampledFrameDuration = 0;
  let sampledFrameCount = 0;
  let renderTelemetryFrame = 0;
  let renderTelemetryResumeTimer = 0;

  function canSampleRenderTelemetry() {
    return !mobileSceneQuery.matches && document.visibilityState === 'visible'
      && body.dataset.scene === 'world'
      && worldScene.getAttribute('aria-hidden') !== 'true';
  }

  function resetRenderSample() {
    renderSampleStartedAt = 0;
    previousFrameAt = null;
    sampledFrameDuration = 0;
    sampledFrameCount = 0;
  }

  function stopRenderTelemetry() {
    if (renderTelemetryFrame) {
      window.cancelAnimationFrame(renderTelemetryFrame);
      renderTelemetryFrame = 0;
    }
    if (renderTelemetryResumeTimer) {
      window.clearTimeout(renderTelemetryResumeTimer);
      renderTelemetryResumeTimer = 0;
    }
    resetRenderSample();
  }

  function beginRenderSample() {
    if (!canSampleRenderTelemetry() || renderTelemetryFrame) return;
    renderSampleStartedAt = performance.now();
    previousFrameAt = null;
    sampledFrameDuration = 0;
    sampledFrameCount = 0;
    renderTelemetryFrame = window.requestAnimationFrame(updateRenderTelemetry);
  }

  function scheduleNextRenderSample() {
    if (!canSampleRenderTelemetry()) {
      stopRenderTelemetry();
      return;
    }
    renderTelemetryResumeTimer = window.setTimeout(() => {
      renderTelemetryResumeTimer = 0;
      beginRenderSample();
    }, renderSamplePause);
  }

  function syncRenderTelemetry() {
    if (!canSampleRenderTelemetry()) {
      stopRenderTelemetry();
      return;
    }
    if (!renderTelemetryFrame && !renderTelemetryResumeTimer) beginRenderSample();
  }

  function updateRenderTelemetry(now) {
    renderTelemetryFrame = 0;
    if (!canSampleRenderTelemetry()) {
      resetRenderSample();
      return;
    }

    if (previousFrameAt !== null) {
      const frameDuration = now - previousFrameAt;
      if (frameDuration > 0 && frameDuration < 250) {
        sampledFrameDuration += frameDuration;
        sampledFrameCount += 1;
      }
    }
    previousFrameAt = now;

    if (now - renderSampleStartedAt >= renderSampleWindow) {
      if (sampledFrameCount > 0) {
        const averageFrameTime = sampledFrameDuration / sampledFrameCount;
        const fps = 1000 / averageFrameTime;
        const frameBudget = Math.min(999, (averageFrameTime / (1000 / 60)) * 100);
        const displayedFps = Math.round(fps);
        setMetric('fps', String(displayedFps));
        setMetric('frame-time', `${averageFrameTime.toFixed(1)} MS`);
        setMetric('frame-budget', `${Math.round(frameBudget)}%`);
        setRing('fps', Math.min(100, (fps / 60) * 100), String(displayedFps));
        renderHistory.push(fps);
        if (renderHistory.length > 54) renderHistory.shift();
        drawSparkline(renderChart, renderHistory, { min: 0, max: Math.max(60, ...renderHistory) * 1.08 });
      }

      const memory = performance.memory;
      if (memory?.usedJSHeapSize > 0 && memory?.jsHeapSizeLimit > 0) {
        const heapPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        setRing('heap', heapPercent, `${Math.round(heapPercent)}%`);
      } else {
        setRing('heap', 0, 'N/A', false);
      }

      resetRenderSample();
      scheduleNextRenderSample();
      return;
    }

    renderTelemetryFrame = window.requestAnimationFrame(updateRenderTelemetry);
  }

  function updateSessionTelemetry() {
    const elapsedSeconds = Math.max(0, Math.floor(performance.now() / 1000));
    const hours = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    setMetric('session-uptime', `${hours}:${minutes}:${seconds}`);
    setMetric('visibility-state', document.visibilityState === 'visible' ? 'ACTIVE' : 'PAUSED');
  }

  document.addEventListener('visibilitychange', () => {
    syncRenderTelemetry();
    updateSessionTelemetry();
  });

  initializeVisitorTelemetry();
  updateSessionTelemetry();
  window.setInterval(() => { if (canSampleRenderTelemetry()) updateSessionTelemetry(); }, 1000);
  window.setInterval(() => { if (canSampleRenderTelemetry()) updateNetworkMetrics(); }, 5000);
  syncRenderTelemetry();
  mobileSceneQuery.addEventListener('change', syncRenderTelemetry);

  function revealScene(nextScene, nextName, currentScene) {
    nextScene.inert = false;
    nextScene.classList.add('is-active', 'is-underlay', 'is-materializing');
    nextScene.setAttribute('aria-hidden', 'false');
    body.dataset.scene = nextName;
    syncRenderTelemetry();
    playSceneArrivalSounds(nextName);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nextScene.classList.add('is-materialized');
        currentScene.classList.add('is-dissolving');
        nextScene.classList.remove('is-underlay');
      });
    });

    window.setTimeout(() => {
      nextScene.classList.remove('is-materializing', 'is-materialized');
    }, reducedMotion.matches ? 0 : sceneMaterializeDuration);

    const delay = reducedMotion.matches ? 0 : sceneFadeDuration;
    window.setTimeout(() => {
      currentScene.classList.remove('is-active', 'is-dissolving');
      currentScene.setAttribute('aria-hidden', 'true');
      currentScene.inert = true;
      activeScene = nextName;
    }, delay);
  }

  function stopIntroSync() {
    window.clearInterval(introSyncTimer);
    introSyncTimer = undefined;
    introAudio.playbackRate = 1;
    introAudioRevealPending = false;
  }

  function syncIntroAudio(force = false) {
    if (!introAudioStarted || introAudio.paused || introVideo.paused || introAudio.muted) return;
    const drift = introAudio.currentTime - introVideo.currentTime;

    if (force || Math.abs(drift) > 0.085) {
      introAudio.currentTime = Math.max(0, introVideo.currentTime);
      introAudio.playbackRate = 1;
      return;
    }

    introAudio.playbackRate = Math.abs(drift) > 0.025
      ? Math.max(0.985, Math.min(1.015, 1 - drift * 0.18))
      : 1;
  }

  function makeIntroAudioAudible() {
    if (!soundEnabled || !introVideoStarted || !introAudioStarted || introAudioRevealPending) return;
    introAudioRevealPending = true;

    const revealAudio = () => {
      introAudioRevealPending = false;
      if (activeScene !== 'intro' || !soundEnabled || introVideo.paused || introAudio.paused) return;
      introAudio.currentTime = Math.max(0, introVideo.currentTime);
      introAudio.playbackRate = 1;
      introAudio.muted = false;
      body.dataset.introAudio = 'playing';
      window.clearInterval(introSyncTimer);
      introSyncTimer = window.setInterval(() => syncIntroAudio(), 180);
    };

    if (typeof introVideo.requestVideoFrameCallback === 'function') {
      introVideo.requestVideoFrameCallback(revealAudio);
    } else {
      window.setTimeout(revealAudio, 0);
    }
  }

  function startIntroTransition() {
    if (introTransitionStarted) return;
    introTransitionStarted = true;
    window.clearTimeout(introLoadFallbackTimer);

    const launchRevealDelay = balancedPerformanceMode ? 90 : 320;
    const launchFadeDuration = balancedPerformanceMode ? 360 : sceneFadeDuration;
    window.setTimeout(() => {
      entryScene.classList.add('is-dissolving');
      introScene.classList.remove('is-underlay');
    }, launchRevealDelay);

    window.setTimeout(() => {
      entryScene.classList.remove('is-active', 'is-launching', 'is-dissolving');
      entryScene.setAttribute('aria-hidden', 'true');
      entryScene.inert = true;
    }, launchRevealDelay + launchFadeDuration);
  }

  function finishIntro() {
    if (introFinished) return;
    introFinished = true;
    window.clearTimeout(introLoadFallbackTimer);
    stopIntroSync();
    introVideo.pause();
    introAudio.pause();
    introAudio.muted = true;
    body.dataset.introAudio = 'complete';
    revealScene(worldScene, 'world', introScene);
    window.setTimeout(() => {
      identityInput.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : sceneFocusDelay);

    window.setTimeout(() => {
      if (body.dataset.scene === 'intro') return;
      introVideo.removeAttribute('src');
      introAudio.removeAttribute('src');
      introVideo.load();
      introAudio.load();
    }, reducedMotion.matches ? 0 : sceneFadeDuration + 250);
  }

  function beginIntroPlayback() {
    if (experienceStarting) return;
    experienceStarting = true;
    startExperienceButton.disabled = true;
    entryScene.classList.add('is-launching');
    prepareWorldMedia();

    if (reducedMotion.matches || mobileSceneQuery.matches) {
      revealScene(worldScene, 'world', entryScene);
      window.setTimeout(() => identityInput.focus({ preventScroll: true }), 0);
      return;
    }

    prepareIntroMedia();
    introFinished = false;
    introTransitionStarted = false;
    activeScene = 'intro';
    body.dataset.scene = 'intro';
    introScene.inert = false;
    introScene.setAttribute('aria-hidden', 'false');
    introScene.classList.add('is-active', 'is-underlay');

    introVideo.hidden = false;
    introVideo.muted = true;
    introVideo.currentTime = 0;
    introAudio.pause();
    introAudio.currentTime = 0;
    introAudio.volume = 0.78;
    introAudio.muted = true;
    introAudio.playbackRate = 1;
    introAudioStarted = false;
    introVideoStarted = false;
    body.dataset.introAudio = soundEnabled ? 'starting' : 'off';

    const videoPlayback = introVideo.play();
    const audioPlayback = soundEnabled ? introAudio.play() : null;

    videoPlayback.then(() => {
      introVideoStarted = true;
      if (!soundEnabled) body.dataset.introAudio = 'off';
      else if (!introAudioStarted) body.dataset.introAudio = 'starting';
      introScene.classList.add('is-playing');
      if (introVideo.readyState >= 2) introScene.classList.add('is-video-ready');
      startIntroTransition();
      makeIntroAudioAudible();
    }).catch(() => {
      body.dataset.introVideo = 'unavailable';
      finishIntro();
    });

    audioPlayback?.then(() => {
      introAudioStarted = true;
      body.dataset.introAudio = 'starting';
      makeIntroAudioAudible();
    }).catch(() => {
      body.dataset.introAudio = 'unavailable';
    });

    introLoadFallbackTimer = window.setTimeout(() => {
      if (!introVideoStarted && activeScene === 'intro') {
        body.dataset.introVideo = 'timeout';
        finishIntro();
      }
    }, 12_000);
  }

  introVideo.addEventListener('loadeddata', () => introScene.classList.add('is-video-ready'));
  introVideo.addEventListener('canplay', () => introScene.classList.add('is-video-ready'));
  introVideo.addEventListener('playing', () => {
    introVideoStarted = true;
    startIntroTransition();
    makeIntroAudioAudible();
  });
  introVideo.addEventListener('ended', finishIntro);
  introVideo.addEventListener('error', () => {
    body.dataset.introVideo = 'unavailable';
    if (activeScene === 'intro') finishIntro();
  });

  introAudio.addEventListener('error', () => {
    body.dataset.introAudio = 'unavailable';
  });

  introVideo.addEventListener('timeupdate', () => {
    syncIntroAudio();
  });

  startExperienceButton.addEventListener('click', beginIntroPlayback);

  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    if (activeScene === 'entry') {
      prepareWorldMedia();
      revealScene(worldScene, 'world', entryScene);
      window.setTimeout(() => identityInput.focus({ preventScroll: true }), reducedMotion.matches ? 0 : sceneFocusDelay);
    } else if (activeScene === 'intro') {
      finishIntro();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!videoGallery.hidden) {
      event.preventDefault();
      closeVideoGallery();
      return;
    }
    if (activeScene === 'intro') finishIntro();
  });

  identityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const displayName = identityInput.value.trim();

    if (!displayName) {
      playSound('warning');
      identityField.classList.add('has-error');
      identityMessage.textContent = '请输入一个访问者名称。';
      identityInput.focus();
      return;
    }

    identityField.classList.remove('has-error');
    identityMessage.textContent = '';
    playSound('ready');
    writeSessionValue('nexus-display-name', displayName);
    writeSessionValue('nexus-scene', 'welcome');
    updateDisplayName(displayName);
    identityForm.inert = true;
    welcomeWindow.inert = false;
    identityComposition.classList.add('is-welcome');
    welcomeWindow.setAttribute('aria-hidden', 'false');
    scheduleArrivalSound(
      'panelOpen',
      90,
      { volumeScale: 0.82 },
      () => body.dataset.scene === 'world' && identityComposition.classList.contains('is-welcome'),
    );

    const nodes = [...identityComposition.querySelectorAll('.node-button')];
    nodes.forEach((node, index) => {
      node.classList.toggle('is-active', index === 1);
      if (index === 1) node.setAttribute('aria-current', 'step');
      else node.removeAttribute('aria-current');
    });

    window.setTimeout(() => enterWorldButton.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 460);
  });

  identityInput.addEventListener('input', () => {
    if (identityInput.value.trim()) {
      identityField.classList.remove('has-error');
      identityMessage.textContent = '';
    }
  });

  enterWorldButton.addEventListener('click', () => {
    if (enteringHome) return;
    enteringHome = true;
    enterWorldButton.disabled = true;
    writeSessionValue('nexus-scene', 'home');
    playSound('launch');
    const nodes = [...identityComposition.querySelectorAll('.node-button')];
    nodes.forEach((node, index) => node.classList.toggle('is-active', index === 2));
    revealScene(homeScene, 'home', worldScene);
    window.setTimeout(() => {
      viewButtons[0]?.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : sceneFocusDelay);
  });

  restartButton.addEventListener('click', () => {
    playSound('dismiss');
    restartButton.disabled = true;
    removeSessionValue('nexus-display-name');
    removeSessionValue('nexus-scene');
    window.setTimeout(() => window.location.reload(), soundEnabled ? 480 : 0);
  });

  function setView(nextView) {
    const labels = viewLabels[nextView];
    if (!labels) return;

    viewButtons.forEach((button) => {
      const isActive = button.dataset.viewButton === nextView;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    viewPanels.forEach((panel) => {
      const isActive = panel.dataset.viewPanel === nextView;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });

    viewKicker.textContent = labels.kicker;
    viewTab.textContent = labels.tab;
  }

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => {
      playSound('panel');
      setView(button.dataset.viewButton);
    });
  });

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function fallbackCopyText(value) {
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    try {
      field.select();
      return document.execCommand('copy');
    } catch (error) {
      return false;
    } finally {
      field.remove();
    }
  }

  async function copyContactValue(control) {
    const value = control.dataset.contactCopy;
    const label = control.dataset.contactLabel || '联系方式';
    let copied = false;

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        copied = true;
      } else {
        copied = fallbackCopyText(value);
      }
    } catch (error) {
      copied = fallbackCopyText(value);
    }

    playSound(copied ? 'message' : 'warning', { volumeScale: 0.72 });
    showToast(copied ? `${label}已复制：${value}` : `复制失败，请手动记录：${value}`);
  }

  contactCopyControls.forEach((control) => {
    control.addEventListener('click', () => copyContactValue(control));
  });

  demoMessageControls.forEach((button) => {
    button.addEventListener('click', () => {
      playSound('message');
      showToast(button.dataset.demoMessage);
    });
  });

  function setGalleryBackgroundInert(isInert) {
    galleryBackgroundTargets.forEach((element) => {
      element.inert = isInert;
    });
  }

  function setVideoGalleryPage(category) {
    const activePage = videoGalleryPages.find((page) => page.dataset.videoGalleryPage === category)
      || videoGalleryPages[0];
    const activeCategory = activePage.dataset.videoGalleryPage;
    const labels = videoGalleryLabels[activeCategory] || videoGalleryLabels.motion;

    videoGalleryPages.forEach((page) => {
      const isActive = page === activePage;
      page.hidden = !isActive;
      page.classList.toggle('is-active', isActive);
      if (isActive) page.scrollTop = 0;
    });

    const itemCount = activePage.querySelectorAll('.video-card').length;
    videoGalleryKicker.textContent = labels.kicker;
    videoGalleryCount.textContent = `${String(itemCount).padStart(2, '0')} ${itemCount === 1 ? 'ITEM' : 'ITEMS'} / ONLINE`;
    videoGalleryEyebrow.textContent = labels.eyebrow;
    videoGalleryTitle.textContent = labels.title;
    videoGalleryDescription.textContent = labels.description;
  }

  function openVideoGallery(category = 'motion') {
    if (!videoGallery.hidden) return;
    window.clearTimeout(galleryCloseTimer);
    window.clearTimeout(gallerySettleTimer);
    galleryRestoreFocus = document.activeElement;
    setVideoGalleryPage(category);
    videoGallery.hidden = false;
    videoGallery.setAttribute('aria-hidden', 'false');
    videoGallery.classList.remove('is-closing', 'is-settled');
    homeScene.classList.add('is-gallery-open');
    setGalleryBackgroundInert(true);
    void videoGallery.offsetWidth;
    videoGallery.classList.add('is-open');
    playSound('panelOpen', { volumeScale: 0.88 });
    gallerySettleTimer = window.setTimeout(
      () => videoGallery.classList.add('is-settled'),
      reducedMotion.matches ? 0 : 720,
    );
    window.setTimeout(() => videoGalleryCloseButton.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 180);
  }

  function closeVideoGallery() {
    if (videoGallery.hidden || videoGallery.classList.contains('is-closing')) return;
    window.clearTimeout(gallerySettleTimer);
    videoGallery.classList.remove('is-open');
    videoGallery.classList.remove('is-settled');
    videoGallery.classList.add('is-closing');
    playSound('dismiss', { volumeScale: 0.72 });

    const finishClose = () => {
      videoGallery.hidden = true;
      videoGallery.setAttribute('aria-hidden', 'true');
      videoGallery.classList.remove('is-closing');
      homeScene.classList.remove('is-gallery-open');
      setGalleryBackgroundInert(false);
      gallerySpatialSurfaces.forEach((surface) => {
        surface.classList.remove('is-pointer-active');
        surface.style.setProperty('--surface-rx', '0deg');
        surface.style.setProperty('--surface-ry', '0deg');
        surface.style.setProperty('--glow-x', '50%');
        surface.style.setProperty('--glow-y', '50%');
      });
      if (galleryRestoreFocus instanceof HTMLElement) galleryRestoreFocus.focus({ preventScroll: true });
    };

    galleryCloseTimer = window.setTimeout(finishClose, reducedMotion.matches ? 0 : 300);
  }

  videoGalleryOpenControls.forEach((control) => {
    control.addEventListener('click', () => openVideoGallery(control.dataset.videoGalleryOpen));
  });
  videoGalleryCloseControls.forEach((control) => control.addEventListener('click', closeVideoGallery));
  [...videoCards, ...externalArchiveLinks, ...contactLinks].forEach((link) => {
    link.addEventListener('click', () => playSound('linkOpen', { volumeScale: 0.8 }));
  });

  const specializedSoundControls = new Set([
    startExperienceButton,
    themeButton,
    soundButton,
    confirmButton,
    enterWorldButton,
    restartButton,
    ...videoGalleryOpenControls,
    ...videoGalleryCloseControls,
    ...contactCopyControls,
    ...viewButtons,
    ...demoMessageControls,
  ]);

  app.addEventListener('click', (event) => {
    const control = event.target.closest('button');
    if (!control || control.disabled || specializedSoundControls.has(control)) return;
    playSound('click');
  });

  document.querySelectorAll('button, .video-card, .bilibili-link, .contact-link').forEach((control) => {
    control.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'touch' || control.disabled) return;
      const now = performance.now();
      if (now - lastHoverSoundAt < 90) return;
      lastHoverSoundAt = now;
      playSound('hover');
    });
  });

  // Keep moving light separate from the clipped, filtered glass material.
  document.querySelectorAll('.hud-glass, .sao-window').forEach((surface) => {
    if (surface.classList.contains('world-note')) return;
    const scan = document.createElement('span');
    scan.className = 'surface-scan';
    scan.setAttribute('aria-hidden', 'true');
    surface.append(scan);
  });
  document.querySelectorAll('.clock-ring').forEach((clock) => {
    const halo = document.createElement('i');
    halo.className = 'clock-halo';
    halo.setAttribute('aria-hidden', 'true');
    clock.append(halo);
  });

  {
    const spatialSurfaces = [...document.querySelectorAll(
      '.identity-window, .welcome-window, .world-note, .content-window, .profile-window, .video-gallery-window, .video-card, .world-header, .home-header, .player-vitals, .hud-widget',
    )];
    const controlSelector = '.entry-start, .confirm-button, .enter-world-button, .node-button, .home-node, .hud-quick-button, .memory-list button, .project-list article, .video-card, .video-gallery-close, .archive-space-link, .user-chip, .theme-switch, .sound-switch';
    const scenes = [entryScene, introScene, worldScene, homeScene];
    const depthLayers = new Map(scenes.map((scene) => [scene, [...scene.querySelectorAll('[data-depth]')].map((element) => ({ element, depth: Number(element.dataset.depth || 0) }))]));
    const surfaceSet = new Set(spatialSurfaces);
    const floatRecords = spatialSurfaces.map((surface, index) => ({ surface, index, animations: [], frames: null }));
    const pendingSurfaces = new Map();
    const pendingControls = new Map();
    let currentScene = scenes.find((scene) => scene.classList.contains('is-active'));
    let pointerFrame = 0;
    let pointerPosition = null;
    let idleTimer = 0;
    let syncTimer = 0;
    let lastPointerAt = 0;

    const neutralTransform = 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)';
    const floatDuration = 120000;

    function floatTransform(index, progress, quality) {
      const phase = index * 1.37;
      const speed = 0.00056 + (index % 3) * 0.000045;
      // Whole cycles give a seamless loop; sampling retains the slow original path.
      const wave = (rate, offset) => Math.sin(progress * Math.PI * 2 * Math.round(speed * rate * floatDuration / (Math.PI * 2)) + offset);
      const x = wave(1, phase) * (2 + (index % 3) * 0.6);
      const y = wave(0.73, phase * 1.61) * (3.1 + ((index + 1) % 3) * 0.82);
      const z = wave(0.47, phase * 0.82) * (2.8 + (index % 2) * 1.4);
      const rx = wave(0.68, phase * 1.19) * (0.31 + (index % 3) * 0.1);
      const ry = wave(0.57, phase * 0.91 + Math.PI / 2) * (0.46 + ((index + 1) % 3) * 0.13);
      if (quality !== 'full') {
        const strength = quality === 'eco' ? 0.35 : 0.7;
        return `translate3d(${(x * strength).toFixed(3)}px, ${(y * strength).toFixed(3)}px, 0px)`;
      }
      return `translate3d(${x.toFixed(3)}px, ${y.toFixed(3)}px, ${z.toFixed(3)}px) rotateX(${rx.toFixed(4)}deg) rotateY(${ry.toFixed(4)}deg)`;
    }

    function stopFloats(smooth = false) {
      const running = floatRecords.filter((record) => record.animations.length && !record.surface.closest('.effects-occluded, .effects-offscreen'));
      // Read in one batch, cancel, then read the underlying transforms in one batch.
      const visible = smooth ? running.map(({ surface }) => getComputedStyle(surface).transform) : [];
      running.forEach((record) => {
        record.animations.forEach((animation) => animation.cancel());
        record.animations = [];
      });
      if (!smooth) return;
      const bases = running.map(({ surface }) => getComputedStyle(surface).transform);
      running.forEach((record, index) => {
        const matrix = (value) => new DOMMatrix(value === 'none' ? undefined : value);
        const offset = matrix(bases[index]).inverse().multiply(matrix(visible[index]));
        const settle = record.surface.animate(
          [{ transform: offset.toString() }, { transform: neutralTransform }],
          { duration: 340, easing: 'ease-out', composite: 'add' },
        );
        settle.id = 'spatial-settle';
        record.animations = [settle];
        settle.onfinish = () => { if (record.animations[0] === settle) record.animations = []; };
      });
    }

    function startFloats() {
      idleTimer = 0;
      if (document.hidden || reducedMotion.matches || balancedPerformanceQuery.matches || !currentScene || currentScene.classList.contains('is-materializing')) return;
      floatRecords.forEach((record) => {
        const { surface, index } = record;
        if (!currentScene.contains(surface) || surface.closest('[hidden], .effects-occluded, .effects-offscreen')) return;
        if (record.animations.some((animation) => animation.playState === 'running')) return;
        const style = getComputedStyle(surface);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return;
        if (!surface.getClientRects().length) return;
        record.animations.forEach((animation) => animation.cancel());
        const quality = body.dataset.quality || 'full';
        if (!record.frames || record.quality !== quality) {
          record.frames = Array.from({ length: 481 }, (_, step) => ({ transform: floatTransform(index, step / 480, quality), offset: step / 480 }));
          record.quality = quality;
        }
        const base = getComputedStyle(surface).transform;
        const prefix = base === 'none' ? '' : `${base} `;
        const frames = record.frames.map((frame) => ({ ...frame, transform: prefix + frame.transform }));
        // Concrete transforms can run on the compositor. Animating inherited CSS
        // variables or additive transforms still causes per-frame style work.
        const arrive = surface.animate(
          [{ transform: prefix + neutralTransform }, { transform: frames[0].transform }],
          { duration: 340, easing: 'ease-out', fill: 'forwards' },
        );
        arrive.id = 'spatial-arrive';
        record.animations = [arrive];
        arrive.onfinish = () => {
          if (record.animations[0] !== arrive) return;
          const drift = surface.animate(frames, { duration: floatDuration, iterations: Infinity, easing: 'linear' });
          drift.id = 'spatial-drift';
          arrive.cancel();
          record.animations = [drift];
        };
      });
    }

    function scheduleFloat() {
      clearTimeout(idleTimer);
      if (!document.hidden && !reducedMotion.matches && !balancedPerformanceQuery.matches) {
        idleTimer = window.setTimeout(startFloats, Math.max(440 - (performance.now() - lastPointerAt), 0));
      }
    }

    function syncFloatVisibility() {
      floatRecords.forEach((record) => {
        const blocked = document.hidden || Boolean(record.surface.closest('.effects-occluded, .effects-offscreen'));
        if (blocked) {
          record.animations.forEach((animation) => animation.pause());
          record.visibilityPaused = true;
        } else if (record.visibilityPaused) {
          record.visibilityPaused = false;
          if (reducedMotion.matches || balancedPerformanceQuery.matches || record.quality !== (body.dataset.quality || 'full')) {
            record.animations.forEach((animation) => animation.cancel());
            record.animations = [];
          } else record.animations.forEach((animation) => animation.play());
        }
      });
      scheduleFloat();
    }

    function syncEffects() {
      syncTimer = 0;
      currentScene = scenes.find((scene) => scene.classList.contains('is-active') && !scene.classList.contains('is-dissolving'));
      body.classList.toggle('effects-paused', document.hidden);
      syncFloatVisibility();
      stopFloats();
      scheduleFloat();
      if (document.hidden || reducedMotion.matches) {
        cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        pointerPosition = null;
        pendingSurfaces.clear();
        pendingControls.clear();
      }
    }

    // Observe lifecycle changes only, never the style attributes animated below.
    const lifecycleObserver = new MutationObserver(() => {
      if (!syncTimer) syncTimer = window.setTimeout(syncEffects, 0);
    });
    [...scenes, identityComposition, videoGallery, ...videoGalleryPages].forEach((element) => {
      lifecycleObserver.observe(element, { attributes: true, attributeFilter: ['class', 'hidden', 'aria-hidden'] });
    });
    document.addEventListener('visibilitychange', syncEffects);
    window.addEventListener('site-effectsvisibility', syncFloatVisibility);
    window.addEventListener('site-qualitychange', syncEffects);
    reducedMotion.addEventListener('change', syncEffects);
    balancedPerformanceQuery.addEventListener('change', syncEffects);
    window.addEventListener('resize', () => {
      if (!syncTimer) syncTimer = window.setTimeout(syncEffects, 80);
    }, { passive: true });
    const sizeObserver = new ResizeObserver(() => {
      if (!syncTimer) syncTimer = window.setTimeout(syncEffects, 0);
    });
    spatialSurfaces.forEach((surface) => sizeObserver.observe(surface));

    function flushPointer() {
      pointerFrame = 0;
      if (document.hidden || reducedMotion.matches) return;
      // All geometry reads precede writes, including nested cards and their panels.
      const surfaces = [...pendingSurfaces].map(([surface, point]) => ({ surface, point, bounds: surface.getBoundingClientRect() }));
      const controls = [...pendingControls].map(([control, point]) => ({ control, point, bounds: control.getBoundingClientRect() }));
      pendingSurfaces.clear();
      pendingControls.clear();
      if (pointerPosition && currentScene && !(currentScene === homeScene && !videoGallery.hidden)) {
        const x = (pointerPosition.x / window.innerWidth - 0.5) * 2;
        const y = (pointerPosition.y / window.innerHeight - 0.5) * 2;
        currentScene.style.setProperty('--cursor-x', `${((x + 1) * 50).toFixed(2)}%`);
        currentScene.style.setProperty('--cursor-y', `${((y + 1) * 50).toFixed(2)}%`);
        currentScene.style.setProperty('--scene-rx', `${(-y * 1.2).toFixed(2)}deg`);
        currentScene.style.setProperty('--scene-ry', `${(x * 1.6).toFixed(2)}deg`);
        depthLayers.get(currentScene)?.forEach(({ element, depth }) => {
          if (element.closest('.effects-occluded')) return;
          element.style.setProperty('--shift-x', `${(x * depth * 30).toFixed(2)}px`);
          element.style.setProperty('--shift-y', `${(y * depth * 20).toFixed(2)}px`);
          element.style.setProperty('--depth-z', `${(depth * 55).toFixed(2)}px`);
        });
        pointerPosition = null;
      }
      pointerPosition = null;
      surfaces.forEach(({ surface, point, bounds }) => {
        if (!bounds.width || !bounds.height) return;
        const x = (point.x - bounds.left) / bounds.width;
        const y = (point.y - bounds.top) / bounds.height;
        surface.classList.add('is-pointer-active');
        surface.style.setProperty('--surface-rx', `${(-(y - 0.5) * 2 * 3.2).toFixed(2)}deg`);
        surface.style.setProperty('--surface-ry', `${((x - 0.5) * 2 * 4.4).toFixed(2)}deg`);
        surface.style.setProperty('--glow-x', `${(x * 100).toFixed(1)}%`);
        surface.style.setProperty('--glow-y', `${(y * 100).toFixed(1)}%`);
      });
      controls.forEach(({ control, point, bounds }) => {
        if (!bounds.width || !bounds.height) return;
        control.style.setProperty('--control-x', `${((point.x - bounds.left) / bounds.width * 100).toFixed(1)}%`);
        control.style.setProperty('--control-y', `${((point.y - bounds.top) / bounds.height * 100).toFixed(1)}%`);
      });
    }

    app.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch' || reducedMotion.matches || mobileSceneQuery.matches) return;
      const wasIdle = performance.now() - lastPointerAt > 440;
      lastPointerAt = performance.now();
      if (wasIdle) stopFloats(true);
      scheduleFloat();
      const point = { x: event.clientX, y: event.clientY };
      pointerPosition = point;
      for (let element = event.target; element && element !== app; element = element.parentElement) {
        if (element.closest('.effects-occluded, .effects-offscreen')) continue;
        if (surfaceSet.has(element)) pendingSurfaces.set(element, point);
        if (element.matches?.(controlSelector)) pendingControls.set(element, point);
      }
      if (!pointerFrame) pointerFrame = requestAnimationFrame(flushPointer);
    }, { passive: true });

    spatialSurfaces.forEach((surface) => surface.addEventListener('pointerleave', () => {
      pendingSurfaces.delete(surface);
      surface.classList.remove('is-pointer-active');
      surface.style.setProperty('--surface-rx', '0deg');
      surface.style.setProperty('--surface-ry', '0deg');
      surface.style.setProperty('--glow-x', '50%');
      surface.style.setProperty('--glow-y', '50%');
    }));

    app.addEventListener('pointerleave', () => {
      cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      pointerPosition = null;
      pendingSurfaces.clear();
      pendingControls.clear();
      scenes.forEach((scene) => {
        if (scene === homeScene && !videoGallery.hidden) return;
        scene.style.setProperty('--cursor-x', '50%');
        scene.style.setProperty('--cursor-y', '50%');
        scene.style.setProperty('--scene-rx', '0deg');
        scene.style.setProperty('--scene-ry', '0deg');
      });
      depthLayers.forEach((layers) => layers.forEach(({ element }) => {
        if (element.closest('.effects-occluded')) return;
        element.style.setProperty('--shift-x', '0px');
        element.style.setProperty('--shift-y', '0px');
        element.style.setProperty('--depth-z', '0px');
      }));
      lastPointerAt = performance.now();
      scheduleFloat();
    });

    app.addEventListener('pointerdown', (event) => {
      if (reducedMotion.matches || mobileSceneQuery.matches) return;
      const control = event.target.closest(controlSelector);
      if (!control) return;
      control.classList.remove('is-activated');
      requestAnimationFrame(() => control.classList.add('is-activated'));
      window.setTimeout(() => control.classList.remove('is-activated'), 520);
    });
    syncEffects();
  }


  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches && activeScene === 'intro') {
      finishIntro();
    }
  });
})();
