/** Measured against the supplied 1280×720 / 60 fps composition and its source path. */
export const BONIFACIO = {
  sourceBrushY: 352,
  characterHeight: 505,
  characterWidth: 420,
  // In this source interval the full character is inside the encoded frame.
  pathStartX: 0,
  pathEndX: 830,
  startTime: 0.85,
  endTime: 2.85,
  playbackRate: 0.4,
  brushOffsetX: 0,
  stallTimeoutMs: 2500,
};

// Analytical brush track from the supplied compositor, in source-video pixels.
// A media-frame timestamp, not a wall-clock timer, drives every visual change.
export function brushAt(time: number) {
  const start = 0.12,
    finish = 3.6,
    ramp = 0.31;
  const total = finish - start;
  const distance = (q: number) => {
    if (q < ramp)
      return q / 2 - (ramp * Math.sin((Math.PI * q) / ramp)) / (2 * Math.PI);
    if (q <= total - ramp) return q - ramp / 2;
    const v = q - (total - ramp);
    return (
      total -
      1.5 * ramp +
      0.86 * v +
      ((0.14 * ramp) / Math.PI) * Math.sin((Math.PI * v) / ramp)
    );
  };
  if (time <= start) return -455;
  if (time >= finish) return 1358;
  return -455 + (1813 * distance(time - start)) / distance(total);
}

export function initHeroReveal() {
  const heroPlaybackRate = BONIFACIO.playbackRate;
  const root = document.documentElement;
  const stage = document.querySelector<HTMLElement>('.hero-copy-stage');
  const copy = document.querySelector<HTMLElement>('.hero-copy');
  const video = document.querySelector<HTMLVideoElement>('.bonifacio-video');
  const source = video?.querySelector('source');
  if (
    !stage ||
    !copy ||
    !video ||
    !source ||
    root.dataset.bonifacio !== 'pending'
  )
    return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let done = false;
  let frame = 0;
  let watchdog = 0;
  let lastFrameAt = performance.now();
  let lastMediaTime = -1;
  let bounds = stage.getBoundingClientRect();
  let viewportWidth = document.documentElement.clientWidth;
  let scale = 1;
  let brushY = 0;

  const measure = () => {
    bounds = stage.getBoundingClientRect();
    viewportWidth = document.documentElement.clientWidth;
    const styles = getComputedStyle(stage);
    scale =
      (bounds.height *
        Number(styles.getPropertyValue('--bonifacio-height-ratio'))) /
      BONIFACIO.characterHeight;
    brushY =
      bounds.height * Number(styles.getPropertyValue('--bonifacio-brush-y'));
  };

  const finish = () => {
    if (done) return;
    done = true;
    root.dataset.bonifacio = 'complete';
    copy.style.removeProperty('clip-path');
    video.cancelVideoFrameCallback(frame);
    video.pause();
    clearInterval(watchdog);
    observer.disconnect();
    window.removeEventListener('resize', measure);
    document.removeEventListener('visibilitychange', visibility);
    preference.removeEventListener('change', finish);
    video.removeEventListener('error', finish);
    video.removeEventListener('ended', finish);
  };

  const visibility = () => {
    if (document.hidden) finish();
  };
  const observer = new ResizeObserver(measure);

  const render = (time: number) => {
    const sourceX = brushAt(time);
    const runway = BONIFACIO.characterWidth * scale + 32;
    const progress =
      (sourceX - BONIFACIO.pathStartX) /
      (BONIFACIO.pathEndX - BONIFACIO.pathStartX);
    const screenX = -runway + progress * (viewportWidth + runway + 32);
    const localX = screenX - bounds.left;

    video.style.transform = `translate(${localX - sourceX * scale}px, ${brushY - BONIFACIO.sourceBrushY * scale}px) scale(${scale})`;
    // The paint is behind the tip, the entire character is ahead of it.
    // Spatially trim only that baked-in paint, retaining pink clothing and bristles.
    video.style.clipPath = `inset(0 0 0 ${Math.max(0, sourceX - 1)}px)`;

    // One HTML mask spans every line. The brush touches its most advanced point;
    // the curved, slightly irregular edge trails it above and below the tip.
    const points = ['-40px -40px'];
    for (let i = 0; i <= 48; i++) {
      const y = -40 + ((bounds.height + 80) * i) / 48;
      const relativeY = (y - brushY) / Math.max(bounds.height / 2, 1);
      const lag =
        12 * Math.abs(relativeY) ** 1.8 +
        2 * (1 - Math.cos((y - brushY) * 0.19));
      points.push(`${localX + BONIFACIO.brushOffsetX - lag}px ${y}px`);
    }
    points.push(`-40px ${bounds.height + 40}px`);
    copy.style.clipPath = `polygon(${points.join(',')})`;
  };

  const onFrame: VideoFrameRequestCallback = (_, metadata) => {
    if (done) return;
    if (metadata.mediaTime !== lastMediaTime) {
      lastFrameAt = performance.now();
      lastMediaTime = metadata.mediaTime;
    }
    if (metadata.mediaTime >= BONIFACIO.endTime) {
      finish();
      return;
    }
    render(metadata.mediaTime);
    root.dataset.bonifacio = 'playing';
    frame = video.requestVideoFrameCallback(onFrame);
  };

  const start = async () => {
    try {
      video.muted = true;
      video.defaultPlaybackRate = heroPlaybackRate;
      video.playbackRate = heroPlaybackRate;
      source.src = source.dataset.src!;
      const loaded = new Promise<void>((resolve, reject) => {
        video.addEventListener('loadeddata', () => resolve(), { once: true });
        video.addEventListener('error', reject, { once: true });
      });
      video.load();
      await Promise.all([loaded, document.fonts.ready]);
      if (done || root.dataset.bonifacio !== 'pending') {
        finish();
        return;
      }
      // Loading can reset playbackRate; apply the hero speed after loading too.
      video.playbackRate = heroPlaybackRate;
      const sought = new Promise<void>((resolve) =>
        video.addEventListener('seeked', () => resolve(), { once: true }),
      );
      video.currentTime = BONIFACIO.startTime;
      await sought;
      if (done || root.dataset.bonifacio !== 'pending') {
        finish();
        return;
      }

      // Verify actual decoded alpha support, not just a .webm filename/codec claim.
      const probe = document.createElement('canvas');
      probe.width = probe.height = 1;
      const context = probe.getContext('2d', { willReadFrequently: true });
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
      observer.observe(stage);
      window.addEventListener('resize', measure);
      render(BONIFACIO.startTime);
      frame = video.requestVideoFrameCallback(onFrame);
      await video.play();
    } catch {
      finish();
    }
  };

  preference.addEventListener('change', finish);
  document.addEventListener('visibilitychange', visibility);
  video.addEventListener('error', finish);
  video.addEventListener('ended', finish);
  watchdog = window.setInterval(() => {
    if (
      root.dataset.bonifacio === 'skipped' ||
      (root.dataset.bonifacio === 'playing' &&
        performance.now() - lastFrameAt > BONIFACIO.stallTimeoutMs)
    )
      finish();
  }, 250);
  void start();
}
