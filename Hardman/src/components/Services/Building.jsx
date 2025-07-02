import React, { useState, useEffect } from 'react';
import { Container, Row, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import ProductCardService from '../ProductCardService/ProductCardService';

const Building = () => {
  const [selectedProducts, setSelectedProducts] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5001/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSelect = (product) => {
    if (product === null) {
      setSelectedProducts({});
      return;
    }
    setSelectedProducts((prevSelected) => {
      if (prevSelected[product.category]?.id === product.id) {
        const copy = { ...prevSelected };
        delete copy[product.category];
        return copy;
      }
      return {
        ...prevSelected,
        [product.category]: product,
      };
    });
  };

  const total = Object.values(selectedProducts).reduce(
    (sum, product) => sum + product.price,
    0
  );

  if (loading) {
    return (
      <Container className="py-4 d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <section className="text-center mb-4">
        <h1>Arma tu PC en base a tus necesidades</h1>
        <p>Contamos con los mejores profesionales en el área de servicio técnico que pueden ayudarte a crear tu PC deseada.</p>
      </section>

      <Row>
        {products.map((product) => (
          <ProductCardService
            key={product.id}
            product={product}
            onSelect={() => handleSelect(product)}
            selectedProduct={selectedProducts[product.category]}
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

export default Building;
