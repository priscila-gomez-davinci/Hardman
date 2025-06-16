import image1 from '../assets/galeria-monitor.jpg'
import image2 from '../assets/galeria-motherboard.jpg';
import image3 from '../assets/galeria-placavideo.jpg';

const carouselItems = [
  {
    id: 1,
    image: image1, // La imagen importada
    alt: 'Primera imagen del carrusel',
    title: 'Nuestra Visión Innovadora',
    description: 'Explorando nuevas fronteras en tecnología y creatividad.',
  },
  {
    id: 2,
    image: image2,
    alt: 'Segunda imagen del carrusel',
    title: 'Soluciones a Medida',
    description: 'Adaptamos nuestros servicios a tus necesidades específicas.',
  },
  {
    id: 3,
    image: image3,
    alt: 'Tercera imagen del carrusel',
    title: 'Impacto y Compromiso',
    description: 'Creando valor con responsabilidad social y ambiental.',
  },
  // Puedes añadir más objetos para más imágenes
];

export default carouselItems;