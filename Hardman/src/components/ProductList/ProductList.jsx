import React, { useState } from 'react';
import { Container, Row, Col, Button, ListGroup, Alert } from 'react-bootstrap';
import ProductCardService from '../ProductCard/ProductCard';
import products from '../../data/products';

const ProductList = () => {
  const [selectedProducts, setSelectedProducts] = useState({});

  const handleSelect = (product) => {
    setSelectedProducts((prevSelected) => ({
      ...prevSelected,
      [product.category]: product
    }));
  };

  const filteredProducts = products.filter((product) => {
    return !selectedProducts[product.category];
  });

  const total = Object.values(selectedProducts).reduce(
    (sum, product) => sum + product.price,
    0
  );

  return (
    <Container className="py-4">
      <section className="text-center mb-4">
        <h1>Arma tu carrito con nuestros componentes</h1>
      </section>

      <Row>
        {filteredProducts.map((product) => (
          <ProductCardService
            key={product.id}
            product={product}
            onSelect={handleSelect}
          />
        ))}
      </Row>

      <hr />

      <section className="mt-4">
        <h3>Componentes seleccionados:</h3>
        {Object.keys(selectedProducts).length === 0 ? (
          <Alert variant="info">Aún no has seleccionado ningún componente.</Alert>
        ) : (
          <ListGroup className="mb-3">
            {Object.entries(selectedProducts).map(([category, product]) => (
              <ListGroup.Item key={category}>
                <strong>{category}:</strong> {product.name} — ${product.price.toFixed(2)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        <h4>Total: ${total.toFixed(2)}</h4>

        <div className="d-flex gap-3 mt-3">
          <Button
            variant="success"
            disabled={Object.keys(selectedProducts).length === 0}
            onClick={() => alert('¡Compra realizada!')}
          >
            Comprar
          </Button>

          <Button
            variant="outline-danger"
            onClick={() => setSelectedProducts({})}
          >
            Limpiar productos
          </Button>
        </div>
      </section>
    </Container>
  );
};

export default ProductList;
