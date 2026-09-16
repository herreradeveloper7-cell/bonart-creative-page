# Revisión previa a Git

## Organización

- Secciones en `src/components/`, composición en `src/pages/index.astro`.
- Datos tipados de proyectos y testimonios en `src/data/`.
- CSS global y estilos del revelado separados; estilos propios dentro de cada componente.
- Prettier, EditorConfig y finales de línea LF para mantener formato consistente.
- pnpm 11.21.0 y un único lockfile. TypeScript 5.9 compatible con el comprobador de Astro instalado.
- Retirados recursos de plantilla y Tailwind sin uso. Favicon conectado al logo oficial.
- Corregidos cuatro atributos `stroke-width` de Lucide detectados por Astro Check.

## Validación realizada

- `pnpm install --frozen-lockfile`: instalación reproducible, sin cambios del lockfile.
- `pnpm validate`: tipos sin errores ni advertencias, formato correcto y compilación estática completada.
- `git diff --check`: sin errores de whitespace.
- Chromium sobre `astro preview`, anchos de 1440, 390 y 320 px, con movimiento reducido: sin errores de JavaScript, respuestas locales HTTP de error, anclas rotas ni desbordamiento horizontal.
- Carrusel: navegación siguiente/anterior y una sola opinión visible en los tres tamaños.

Esta revisión de producción no sustituye pruebas en Safari, Firefox o dispositivos físicos. No se publicaron cambios ni se crearon commits.

## Datos pendientes de publicación

Los testimonios son propuestas de redacción; falta confirmar la aprobación de las personas nombradas. Definir el dominio y el proveedor de alojamiento antes de configurar URLs canónicas o un sitemap.

El remoto configurado es `https://github.com/herreradeveloper7-cell/bonart-design.git`, rama local `main`. Revisar tanto los archivos modificados como los nuevos que aparecen en `git status` al preparar el commit.
