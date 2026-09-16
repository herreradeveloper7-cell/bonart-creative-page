export interface Project {
  title: string;
  image: string;
  imageAlt: string;
  description: string;
  href: string;
}

export const projects: Project[] = [
  {
    title: 'Jaes Cargo',
    image: '/media/projects/jaes-cargo.webp',
    imageAlt: 'Página principal de Jaes Cargo Internacional',
    description:
      'Una landing clara y confiable para conectar envíos, logística internacional y casillero virtual en un solo lugar.',
    href: 'https://jaescargo.com/',
  },
  {
    title: 'WolfBox',
    image: '/media/projects/wolfbox.webp',
    imageAlt: 'Centro de acceso de WolfBox',
    description:
      'Una plataforma web que simplifica la operación logística y el transporte internacional con una experiencia ágil.',
    href: 'https://wolfbox.app/',
  },
  {
    title: 'Ezenti',
    image: '/media/projects/ezenti.webp',
    imageAlt: 'Página principal de Ezenti',
    description:
      'Un e-commerce de moda en Estados Unidos creado para presentar colecciones con estilo y convertir visitas en compras.',
    href: 'https://byezenti.com/',
  },
];
