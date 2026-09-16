# BonArt Creative

Landing de BonArt: servicios, proyectos, presentación del estudio, testimonios y contacto por WhatsApp. Construida con Astro, TypeScript y CSS; iconos de Lucide y tipografía Poppins de Google Fonts.

## Desarrollo

Requisitos: Node.js 22.12 o superior y pnpm 11.21.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abre http://localhost:4321. `npm run dev` también funciona después de instalar las dependencias con pnpm. Mantener `pnpm-lock.yaml` como único lockfile.

## Comandos

- `pnpm check`: revisión de Astro y TypeScript.
- `pnpm format`: aplicar formato uniforme.
- `pnpm format:check`: comprobar el formato.
- `pnpm build`: generar el sitio estático en `dist/`.
- `pnpm preview`: revisar la compilación localmente.
- `pnpm validate`: ejecutar tipos, formato y compilación.

## Estructura

- `src/pages/index.astro`: composición y orden de las secciones.
- `src/layouts/Layout.astro`: documento HTML, metadatos y fuentes.
- `src/components/`: secciones y elementos de la interfaz; estilos y comportamiento propios junto a cada componente.
- `src/data/`: contenido editable de proyectos y testimonios.
- `src/scripts/`: reproducción y revelado sincronizado de Bonifacio.
- `src/styles/`: paleta, tipografía, estilos globales y máscara del hero.
- `public/media/`: imágenes y videos utilizados en el sitio.
- `docs/`: notas de mantenimiento y animación.

## Edición de contenido

Proyectos: `src/data/projects.ts`. Testimonios: `src/data/testimonials.ts`.
Contacto: `https://wa.me/573215663191`. Los enlaces están en Header, Hero, CallToAction, Footer y BonifacioContact.
La paleta y las fuentes se configuran en `src/styles/global.css`.
Bonifacio comparte duración de 5 segundos en hero y CTA; consultar `docs/bonifacio-hero.md`.
Las entradas respetan movimiento reducido. El acceso flotante a WhatsApp aparece con el primer scroll hacia abajo.

## Antes de publicar

1. Ejecutar `pnpm validate`.
2. Revisar escritorio y móvil con `pnpm preview`: menú, enlaces de WhatsApp, tarjetas, animaciones y navegación por teclado.
3. Confirmar con los clientes el contenido de los testimonios: los textos actuales se redactaron como propuestas, no se recibieron como reseñas verificadas.
4. Revisar `git diff` y `git status` antes de crear el commit y hacer push.

El proyecto genera archivos estáticos. No requiere variables de entorno ni servicios de backend. `dist/`, `node_modules/` y archivos `.env*` no se incluyen en Git. El dominio público y su configuración de despliegue se definirán al publicar.
