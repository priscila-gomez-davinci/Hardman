import React from 'react';
import Carousel from '../Carousel/ControlledCarousel';

const Home = () => {
  // Datos para las imágenes del carrusel
  const carouselImages = [
    { src: '../../assets/TP1-Img3.jpg', alt: 'Placa de video con imagen de Halo de fondo' },
    { src: '../../assets/TP1-Img4.jpg', alt: 'Escritorio gamer con luces, monitor, PC de escritorio y noteook' },
  ];

  return (
    <>
    <main>
        <Carousel images={carouselImages} /> 

        <section>
          <h2>Productos Destacados</h2>
          <p>Explora nuestras últimas novedades en hardware gamer.</p>
        </section>

      </main>
    </>
  );
};

export default Home;