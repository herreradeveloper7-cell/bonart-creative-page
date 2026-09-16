// Copywriting proposals; confirm customer approval before publication.
export interface Testimonial {
  text: string;
  name: string;
  label: string;
}
export const reviews: Testimonial[] = [
  {
    text: 'Queríamos una página que transmitiera la confianza con la que manejamos cada envío. BonArt entendió lo que buscábamos y lo convirtió en una web clara, moderna y muy nuestra. Nos encantó la atención a los detalles y la disposición para escuchar nuestras ideas.',
    name: 'Dora Pacheco',
    label: 'CEO · Jaes Cargo',
  },
  {
    text: 'Con WolfBox buscábamos reunir nuestra operación logística en un sistema práctico y fácil de entender. BonArt nos acompañó de cerca para dar forma a esa idea, pensando en el trabajo diario del equipo. Se nota el cuidado que pusieron en cada parte del proyecto.',
    name: 'Javier Herrera',
    label: 'Gerente · Jaes Cargo / WolfBox',
  },
  {
    text: 'Para Ezenti era importante que la tienda se sintiera tan especial como nuestra ropa. BonArt supo interpretar ese estilo y darle una presencia digital con personalidad. Nos gustó mucho cómo conectaron el diseño con una experiencia de compra sencilla.',
    name: 'Camilo Gonzales',
    label: 'CEO · Ezenti',
  },
];
