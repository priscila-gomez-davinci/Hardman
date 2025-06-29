import React from 'react';
import { Card, Button, Col } from 'react-bootstrap';

const ProductCard = ({ product, onAddToCart }) => { 
  return (
    <Col sm={6} md={6} lg={4} className="mb-4"> 
      <Card className="h-100">
        <Card.Img variant="top" src={product.image} alt={product.name} style={{ height: '180px', objectFit: 'cover' }} /> 
        <Card.Body className="d-flex flex-column">
          <Card.Title>{product.name}</Card.Title>
          <Card.Text>Categoría: {product.category}</Card.Text>
          <Card.Text>Precio: ${product.price.toFixed(2)}</Card.Text>
          <Button
            variant="primary"
            className="mt-auto" 
            onClick={() => onAddToCart(product)} 
          >
            Agregar al Carrito
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProductCard;