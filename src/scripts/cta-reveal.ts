import { BONIFACIO, brushAt } from './hero-reveal';

export function initCtaReveal() {
  const section = document.querySelector<HTMLElement>('.cta-section');
  const video = section?.querySelector<HTMLVideoElement>('.cta-runner');
  const source = video?.querySelector('source');
  if (!section || !video || !source || section.dataset.reveal !== 'waiting')
    return;
  const copies = [...section.querySelectorAll<HTMLElement>('[data-cta-copy]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let done = false,
    started = false,
    frame = 0,
    watchdog = 0;
  let progressAt = performance.now(),
    mediaTime = -1;
  let bounds = section.getBoundingClientRect();
  let rects = copies.map((copy) => copy.getBoundingClientRect());
  let scale = 1,
    brushY = 0;
  const measure = () => {
    bounds = section.getBoundingClientRect();
    rects = copies.map((copy) => copy.getBoundingClientRect());
    const top = Math.min(...rects.map((r) => r.top)) - bounds.top;
    const bottom = Math.max(...rects.map((r) => r.bottom)) - bounds.top;
    scale =
      Math.min(280, Math.max(160, (bottom - top) * 1.12)) /
      BONIFACIO.characterHeight;
    brushY = (top + bottom) / 2;
  };
  const finish = () => {
    if (done) return;
    done = true;
    section.dataset.reveal = 'complete';
    copies.forEach((copy) => copy.style.removeProperty('clip-path'));
    video.cancelVideoFrameCallback(frame);
    video.pause();
    clearInterval(watchdog);
    observer.disconnect();
    preloader.disconnect();
    resize.disconnect();
    reduced.removeEventListener('change', finish);
  };
  const resize = new ResizeObserver(measure);
  const render = (time: number) => {
    const sourceX = brushAt(time);
    const startX = brushAt(BONIFACIO.startTime);
    const endX = brushAt(BONIFACIO.endTime);
    const progress = Math.max(
      0,
      Math.min(1, (sourceX - startX) / (endX - startX)),
    );
    const x = bounds.width - progress * (bounds.width + 32);
    video.style.transform = `translate(${x + sourceX * scale}px, ${brushY - BONIFACIO.sourceBrushY * scale}px) scale(${-scale}, ${scale})`;
    video.style.clipPath = `inset(0 0 0 ${Math.max(0, sourceX - 1)}px)`;
    copies.forEach((copy, index) => {
      const r = rects[index];
      const localX = x - (r.left - bounds.left);
      const points = [`${r.width + 40}px -40px`];
      for (let i = 0; i <= 40; i++) {
        const y = -40 + ((r.height + 80) * i) / 40;
        const dy = r.top - bounds.top + y - brushY;
        const lag =
          Math.min(24, 12 * Math.abs(dy / 150) ** 1.8) +
          2 * (1 - Math.cos(dy * 0.19));
        points.push(`${localX + lag}px ${y}px`);
      }
      points.push(`${r.width + 40}px ${r.height + 40}px`);
      copy.style.clipPath = `polygon(${points.join(',')})`;
    });
  };
  const tick: VideoFrameRequestCallback = (_, metadata) => {
    if (done) return;
    if (mediaTime !== metadata.mediaTime) {
      progressAt = performance.now();
      mediaTime = metadata.mediaTime;
    }
    if (mediaTime + BONIFACIO.startTime >= BONIFACIO.endTime) {
      finish();
      return;
    }
    render(mediaTime + BONIFACIO.startTime);
    section.dataset.reveal = 'playing';
    frame = video.requestVideoFrameCallback(tick);
  };
  const start = async () => {
    if (started || done) return;
    started = true;
    observer.disconnect();
    section.dataset.reveal = 'loading';
    progressAt = performance.now();
    watchdog = window.setInterval(() => {
      const limit =
        section.dataset.reveal === 'loading' ? 3500 : BONIFACIO.stallTimeoutMs;
      if (performance.now() - progressAt > limit) finish();
    }, 250);
    try {
      video.muted = true;
      video.playbackRate = BONIFACIO.playbackRate;
      const loaded = new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        video.addEventListener('loadeddata', () => resolve(), { once: true });
        video.addEventListener('error', reject, { once: true });
      });
      prepare();
      await Promise.all([
        loaded,
        document.fonts.load('700 16px Poppins'),
        document.fonts.load('600 16px Poppins'),
      ]);
      if (done) return;
      video.playbackRate = BONIFACIO.playbackRate;
      const probe = document.createElement('canvas');
      probe.width = probe.height = 1;
      const context = probe.getContext('2d');
      if (!context) {
        finish();
        return;
      }
      context.drawImage(video, 0, 0, 1, 1, 0, 0, 1, 1);
      if (context.getImageData(0, 0, 1, 1).data[3] !== 0) {
        finish();
        return;
      }
      measure();
      resize.observe(section);
      render(BONIFACIO.startTime);
      section.dataset.reveal = 'playing';
      progressAt = performance.now();
      frame = video.requestVideoFrameCallback(tick);
      await video.play();
    } catch {
      finish();
    }
  };
  // Warm the shared, cached hero asset before the section enters the viewport.
  const prepare = () => {
    if (done || reduced.matches || source.getAttribute('src')) return;
    video.preload = 'auto';
    source.src = source.dataset.src!;
    video.load();
  };
  const preloader = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        prepare();
        preloader.disconnect();
      }
    },
    { rootMargin: '600px 0px' },
  );
  preloader.observe(section);
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void start();
    },
    { threshold: 0 },
  );
  reduced.addEventListener('change', finish);
  video.addEventListener('error', finish);
  video.addEventListener('ended', finish);
  observer.observe(section);
}
