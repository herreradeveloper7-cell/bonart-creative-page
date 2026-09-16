# Optimización de las nubes

- Escritorio: se conserva el video original de 1280 × 720 (2 316 092 bytes).
- Móvil (hasta 767 px al iniciar la reproducción): versión de 640 × 360, 24 fps, 93 600 bytes; reducción del 96 % frente al original. Se conserva la duración del video y se elimina la pista de audio, ya que el fondo siempre está silenciado.
- La fuente se asigna únicamente cuando el hero está visible, la pestaña activa y no se solicita movimiento reducido. Sin JavaScript o con movimiento reducido inicial solo se carga el póster.
- Ambos reproductores se pausan fuera del hero, al ocultar la pestaña y en pagehide. Al volver se reanuda el estado de la transición. La fuente elegida se conserva durante la visita para evitar una segunda descarga al redimensionar.

Exportación desde el original:

```sh
ffmpeg -i bonart-clouds.mp4 -an -vf scale=640:360 -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart bonart-clouds-mobile.mp4
```

Validación: Astro check y build sin errores; Chromium a 390 y 1440 px, pausa por scroll, reanudación durante transición, evento de visibilidad simulado y cero solicitudes MP4 de nubes con movimiento reducido inicial.
