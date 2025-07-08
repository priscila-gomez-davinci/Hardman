import React from 'react';
import { Card, Button, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext'; 

const ProductCard = ({ product, onAddToCart, onEdit, onDelete }) => {
  const { user } = useAuth(); 
  

  return (
    <Col sm={6} md={6} lg={4} className="mb-4">
      <Card className="h-100">
        <Card.Img
          variant="top"
          src={product.image}
          alt={product.name}
          style={{ height: '180px', objectFit: 'cover' }}
        />
        <Card.Body className="d-flex flex-column">
          <Card.Title>{product.name}</Card.Title>
          <Card.Text>Categoría: {product.category}</Card.Text>
          <Card.Text>Precio: ${product.price.toFixed(2)}</Card.Text>

          {user?.role === 'user' && (
            <Button
              variant="primary"
              className="mt-auto"
              onClick={() => onAddToCart(product)}
            >
              Agregar al Carrito
            </Button>
          )}

          {user?.role === 'admin' && (
            <div className="mt-auto d-flex justify-content-between">
              <Button variant="warning" onClick={() => onEdit(product)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => onDelete(product)}>
                Eliminar
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProductCard;
