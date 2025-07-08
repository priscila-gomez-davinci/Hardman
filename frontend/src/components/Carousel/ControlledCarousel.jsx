import React, { useState } from 'react';
import { Carousel } from 'react-bootstrap';
import carouselItems from '../../data/carouselImages';

function ControlledCarousel() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex, e) => {
    setIndex(selectedIndex);
  };

  return (
    <Carousel activeIndex={index} onSelect={handleSelect}>
      {carouselItems.map((item) => (
        <Carousel.Item key={item.id} interval={3000}> 

          <img
            className="d-block w-100" 
            src={item.image}       
            alt={item.alt}          
            style={{ maxHeight: '500px', objectFit: 'cover' , width: '900px'}} 
          />

          <Carousel.Caption>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

export default ControlledCarousel;