(() => {
  const query = matchMedia('(max-width: 720px), (max-width: 1180px) and (pointer: coarse)');
  const root = document.documentElement;
  const app = document.getElementById('app');
  const gallery = document.getElementById('vfx-gallery');
  const width = 1280;
  const height = 900;
  const records = [];
  let enabled = false;
  let activeRecord;
  let resizeFrame = 0;
  let mapFrame = 0;
  const toolbar = document.createElement('nav');
  toolbar.className = 'scene-explorer';
  toolbar.setAttribute('aria-label', '场景浏览');
  toolbar.hidden = true;
  toolbar.innerHTML = `
    <div class="explorer-heading"><span>PERSONAL REALITY</span><small>拖动探索 · 点击交互</small></div>
    <div class="explorer-row">
      <button class="explorer-map" type="button" aria-label="查看整个场景" title="总览">
        <i class="map-header"></i><i class="map-nav"></i><i class="map-main"></i><i class="map-profile"></i><b class="map-viewport"></b>
      </button>
      <div class="explorer-actions">
        <div class="explorer-zoom"><button type="button" data-explore="out" aria-label="缩小场景">−</button><output aria-label="场景缩放比例">65%</output><button type="button" data-explore="in" aria-label="放大场景">+</button></div>
        <div class="explorer-jumps"><button type="button" data-explore="overview">总览</button><button type="button" data-explore="main">主体</button><button type="button" data-explore="side">资料</button></div>
      </div>
    </div>`;
  app.append(toolbar);
  const zoomLabel = toolbar.querySelector('output');
  const viewportIndicator = toolbar.querySelector('.map-viewport');
  const sideButton = toolbar.querySelector('[data-explore="side"]');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function mainTarget(record) {
    if (record.scene.id === 'home-scene') return record.scene.querySelector('.content-window');
    return record.scene.querySelector('#identity-composition.is-welcome .welcome-window') || record.scene.querySelector('.identity-window');
  }
  function updateMap() {
    mapFrame = 0;
    if (!enabled || !activeRecord || toolbar.hidden) return;
    const { viewport, scale } = activeRecord;
    zoomLabel.value = `${Math.round(scale * 100)}%`;
    const mapWidth = 92;
    const mapHeight = 65;
    viewportIndicator.style.width = `${Math.min(1, viewport.clientWidth / (width * scale)) * mapWidth}px`;
    viewportIndicator.style.height = `${Math.min(1, viewport.clientHeight / (height * scale)) * mapHeight}px`;
    viewportIndicator.style.transform = `translate(${viewport.scrollLeft / (width * scale) * mapWidth}px, ${viewport.scrollTop / (height * scale) * mapHeight}px)`;
    toolbar.querySelector('[data-explore="out"]').disabled = scale <= 0.2501;
    toolbar.querySelector('[data-explore="in"]').disabled = scale >= 1.1999;
  }
  function queueMap() {
    if (!mapFrame) mapFrame = requestAnimationFrame(updateMap);
  }
  function notifyGeometry() {
    window.dispatchEvent(new Event('site-sceneviewportchange'));
  }
  function setScale(record, scale, preserveCenter = true) {
    const { viewport, spacer, stage } = record;
    const oldRect = stage.getBoundingClientRect();
    const viewRect = viewport.getBoundingClientRect();
    const cx = (viewRect.left + viewport.clientWidth / 2 - oldRect.left) / record.scale;
    const cy = (viewRect.top + viewport.clientHeight / 2 - oldRect.top) / record.scale;
    record.scale = clamp(scale, 0.25, 1.2);
    spacer.style.width = `${width * record.scale}px`;
    spacer.style.height = `${height * record.scale}px`;
    spacer.style.marginTop = `${Math.max(0, (viewport.clientHeight - height * record.scale) / 2)}px`;
    stage.style.transform = `scale(${record.scale})`;
    if (preserveCenter) {
      viewport.scrollLeft = cx * record.scale - viewport.clientWidth / 2;
      viewport.scrollTop = cy * record.scale - viewport.clientHeight / 2;
    }
    queueMap();
    notifyGeometry();
  }
  function focusTarget(record, target, readable = false) {
    if (!target) return;
    if (readable) setScale(record, clamp(Math.min((record.viewport.clientWidth - 24) / 480, (record.viewport.clientHeight - 16) / 540), 0.45, 0.95), false);
    const targetRect = target.getBoundingClientRect();
    const viewRect = record.viewport.getBoundingClientRect();
    record.viewport.scrollLeft += targetRect.left + targetRect.width / 2 - viewRect.left - record.viewport.clientWidth / 2;
    record.viewport.scrollTop += targetRect.top + targetRect.height / 2 - viewRect.top - record.viewport.clientHeight / 2;
    queueMap();
  }
  function overview(record) {
    setScale(record, Math.min((record.viewport.clientWidth - 20) / width, (record.viewport.clientHeight - 20) / height), false);
    record.viewport.scrollTo(0, 0);
    queueMap();
  }
  function syncScene() {
    if (!enabled) return;
    activeRecord = records.find(record => record.scene.id === `${document.body.dataset.scene}-scene`);
    const modalOpen = !gallery.hidden;
    root.dataset.mobileDialog = String(modalOpen);
    toolbar.hidden = !activeRecord || modalOpen;
    records.forEach(record => { record.viewport.inert = record.scene.id === 'home-scene' && modalOpen; });
    if (!activeRecord) return;
    sideButton.textContent = activeRecord.scene.id === 'home-scene' ? '资料' : '状态';
    if (!activeRecord.initialized) {
      activeRecord.initialized = true;
      focusTarget(activeRecord, mainTarget(activeRecord), true);
    }
    queueMap();
  }
  function setup() {
    if (enabled === query.matches) return;
    enabled = query.matches;
    root.dataset.mobileScene = String(enabled);
    if (enabled) {
      ['world-scene', 'home-scene'].forEach(id => {
        const scene = document.getElementById(id);
        const viewport = document.createElement('div');
        viewport.className = 'mobile-scene-viewport';
        viewport.tabIndex = 0;
        viewport.setAttribute('role', 'region');
        viewport.setAttribute('aria-label', '可拖动场景，使用底部按钮缩放或回到主体');
        const spacer = document.createElement('div');
        spacer.className = 'mobile-scene-spacer';
        const stage = document.createElement('div');
        stage.className = 'mobile-scene-stage';
        const children = [...scene.children].filter(element => element !== gallery && element.id !== 'view-toast');
        const markers = children.map(element => {
          const marker = document.createComment('scene-position');
          element.before(marker);
          stage.append(element);
          return { element, marker };
        });
        spacer.append(stage);
        viewport.append(spacer);
        scene.prepend(viewport);
        const record = { scene, viewport, spacer, stage, markers, scale: 1, initialized: false };
        records.push(record);
        viewport.addEventListener('scroll', queueMap, { passive: true });
        // Native touch scrolling cancels clicks after a drag and retains pinch zoom.
        // Mouse dragging is only for an emulated mobile viewport or a tablet mouse.
        let drag;
        let suppressClick = false;
        viewport.addEventListener('pointerdown', event => {
          if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('input, select, textarea')) return;
          suppressClick = false;
          drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, moved: false };
        });
        viewport.addEventListener('pointermove', event => {
          if (!drag || !event.buttons) return;
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          if (!drag.moved && Math.hypot(dx, dy) < 8) return;
          if (!drag.moved) { drag.moved = true; viewport.setPointerCapture(event.pointerId); }
          event.preventDefault();
          viewport.scrollLeft = drag.left - dx;
          viewport.scrollTop = drag.top - dy;
        });
        viewport.addEventListener('pointerup', () => { suppressClick = Boolean(drag?.moved); drag = null; });
        viewport.addEventListener('pointercancel', () => { drag = null; });
        viewport.addEventListener('click', event => {
          if (!suppressClick) return;
          suppressClick = false;
          event.preventDefault();
          event.stopPropagation();
        }, true);
        viewport.addEventListener('focusin', event => {
          if (!event.target.matches('input, textarea, button, a')) return;
          const element = event.target.getBoundingClientRect();
          const visible = viewport.getBoundingClientRect();
          if (element.left < visible.left || element.right > visible.right || element.top < visible.top || element.bottom > visible.bottom) {
            focusTarget(record, event.target);
          }
        });
      });
      syncScene();
    } else {
      toolbar.hidden = true;
      records.forEach(({ viewport, markers }) => {
        markers.forEach(({ element, marker }) => { marker.replaceWith(element); });
        viewport.remove();
      });
      records.length = 0;
      activeRecord = undefined;
    }
    notifyGeometry();
  }
  toolbar.addEventListener('click', event => {
    if (!activeRecord) return;
    const action = event.target.closest('[data-explore]')?.dataset.explore;
    if (action === 'in' || action === 'out') setScale(activeRecord, activeRecord.scale + (action === 'in' ? 0.1 : -0.1));
    if (action === 'overview' || event.target.closest('.explorer-map')) overview(activeRecord);
    if (action === 'main') focusTarget(activeRecord, mainTarget(activeRecord), true);
    if (action === 'side') {
      setScale(activeRecord, Math.max(activeRecord.scale, 0.85), false);
      focusTarget(activeRecord, activeRecord.scene.querySelector('.profile-window, .world-note'));
    }
  });
  app.addEventListener('click', event => {
    if (enabled && activeRecord && event.target.closest('[data-view-button]')) focusTarget(activeRecord, mainTarget(activeRecord), true);
  });
  new MutationObserver(syncScene).observe(document.body, { attributes: true, attributeFilter: ['data-scene'] });
  new MutationObserver(syncScene).observe(gallery, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(() => {
    if (enabled && activeRecord?.scene.id === 'world-scene') {
      const target = document.querySelector('#identity-composition.is-welcome .welcome-window');
      if (target) focusTarget(activeRecord, target);
    }
  }).observe(document.getElementById('identity-composition'), { attributes: true, attributeFilter: ['class'] });
  query.addEventListener('change', setup);
  window.addEventListener('resize', () => {
    if (!enabled || resizeFrame) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      // Preserve the user's scale and location during rotation and keyboard resize.
      if (activeRecord) setScale(activeRecord, activeRecord.scale);
    });
  }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) queueMap(); });
  setup();
})();
