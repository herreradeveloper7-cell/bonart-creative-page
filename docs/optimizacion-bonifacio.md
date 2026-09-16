# Compresión de Bonifacio

Se sustituyó únicamente `public/media/bonifacio-reveal.webm`. Los scripts y las máscaras conservan sus coordenadas y tiempos.

| Variante              |     Bytes | SSIM de color frente al original |
| --------------------- | --------: | -------------------------------: |
| Original              | 5 595 620 |                                — |
| CRF 24 (seleccionada) | 1 672 001 |                         0.999070 |
| CRF 32                | 1 202 216 |                         0.998397 |

Reducción seleccionada: 70.1 %. Se priorizó conservar detalle sobre el menor tamaño posible. SSIM compara fotogramas completos, incluidos fondos; no equivale a un porcentaje de calidad percibida. Comparación del canal alfa: SSIM 0.997207.

Ambas versiones conservan 1280 × 720, 60 fps, 240 fotogramas y 4 segundos de archivo. La web reproduce el tramo 0.85–2.85 a velocidad 0.4: recorrido de 5 segundos en hero y CTA.

## Reproducir la exportación

Usar siempre el original del ZIP, evitando recomprimir la versión optimizada. Es esencial forzar el decodificador libvpx-vp9 para conservar el alfa:

```sh
ffmpeg -c:v libvpx-vp9 -i original.webm -an -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 24 -deadline good -cpu-used 3 -row-mt 1 -auto-alt-ref 0 bonifacio-reveal.webm
```

Se compararon las dos exportaciones y el canal alfa con FFmpeg. El original y las pruebas se guardaron fuera del repositorio en `D:/bonart-design/video-optimization/`; no se incluyen en el despliegue.
