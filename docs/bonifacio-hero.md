# Entrada de Bonifacio

La entrada afecta únicamente `.hero-copy`: el antetítulo y el título HTML originales. Los botones permanecen fuera de la máscara. No se modificaron el header, el logo ni el fondo de nubes.

## Material e integración

- Fuente: `bonifacio-transicion-alpha.webm`, del ZIP entregado. La versión optimizada está en `public/media/bonifacio-reveal.webm`: VP9 con alfa, CRF 24, resolución y frecuencia originales, sin recortar ni cambiar tiempos.
- Duración original: 4 segundos; dimensiones: 1280 × 720; composición a 60 fps. Se confirmó alfa real al decodificar: primer fotograma completamente transparente y fotogramas posteriores con píxeles transparentes, opacos y semitransparentes.
- El pincel está detrás del personaje, a la izquierda, aproximadamente en `y = 352` del video. El recorrido horizontal procede de `brush_at` del compositor incluido en el paquete y se contrastó con los fotogramas.
- El video incluye pintura rosa permanente detrás del pincel. Un recorte espacial que sigue su punta elimina esa franja, sin aplicar una clave de color que pudiera borrar el rosa de la ropa o las cerdas.
- Se utiliza el tramo de tiempo 0.85–2.85 s, a velocidad 0.4 compartida por el hero y el CTA. Ambas entradas duran 5 s una vez iniciada la reproducción. La posición horizontal se adapta al ancho de la pantalla para que el personaje entre y salga fuera del área visible antes de que el encuadre original lo recorte.
- `requestVideoFrameCallback` proporciona el tiempo del fotograma presentado. Este mismo dato mueve el personaje, recorta la pintura y actualiza el borde irregular de la máscara CSS. No hay un reloj independiente para el revelado.

## Ajustes

En `src/styles/hero-reveal.css`:

- `--bonifacio-height-ratio`: altura del personaje respecto al bloque de texto. Hay valores independientes para escritorio y móvil; la escala mantiene las proporciones del video.
- `--bonifacio-brush-y`: posición vertical del pincel como fracción de la altura del bloque de texto.

En `src/scripts/hero-reveal.ts`, objeto `BONIFACIO`:

- `playbackRate`: velocidad de toda la entrada, sin desincronizar pincel y máscara.
- `brushOffsetX`: ajuste fino del frente de revelado respecto a la punta, en píxeles CSS. El valor cero mantiene el contacto observado.
- `pathStartX` / `pathEndX`: tramo del recorrido original que se proyecta al ancho de la pantalla. Evitar ampliarlo sin revisar los bordes del video, donde el personaje está recortado.
- `startTime` / `endTime`: intervalo de reproducción del archivo fuente.
- `stallTimeoutMs`: plazo para mostrar el texto completo si la reproducción deja de avanzar.

La función `brushAt` depende específicamente de este archivo; si se reemplaza el video, hay que volver a medir el recorrido. La función `render` contiene la curvatura y la irregularidad del borde de pincelada.

## Alternativa sin animación

El HTML es visible por defecto. Un script mínimo anterior al hero activa la máscara antes del primer pintado solo cuando las APIs necesarias están disponibles y no se solicita movimiento reducido. Hay un plazo de arranque de 3.5 s. Al fallar la carga, el alfa, la reproducción o su progreso, se elimina la máscara y se oculta la capa de video. Sin JavaScript o con movimiento reducido ni siquiera se solicita este video.

## Verificación

Comprobado en Chromium con vistas de 1672 px, 390 px y 320 px: revelado progresivo, posición estable de los botones, clics sin interceptación, ausencia de desbordamiento horizontal y reproducción única. Se inspeccionaron capturas intermedias y finales de escritorio y móvil.

También se verificó que la máscara se detiene con el video, y que el texto queda visible con movimiento reducido, JavaScript desactivado, error de red, carga lenta, reproducción bloqueada, alfa no disponible, falta de la API de fotogramas y reproducción detenida. La compilación de producción se valida con `npm run build`.

Los botones conservan los destinos originales `#proyectos` y `#contacto`; sus secciones aún no están implementadas en la landing.
