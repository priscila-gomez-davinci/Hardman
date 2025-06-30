import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 
import ProductCardService from '../ProductCard/ProductCard';
import Cart from '../Cart/Cart';

const API_URL = 'http://localhost:5001/products';

const ProductList = ({
  cartItems = [],
  handleAddToCart,
  handleRemoveFromCart,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
  setCartItems
}) => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError('Error cargando productos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const totalCartValue = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleGoToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;

  return (
    <Container className="py-4">
      <section className="text-center mb-4">
        <h1>Arma tu carrito con nuestros componentes</h1>
      </section>

      <Row>
        <Col md={8}>
          <h2>Productos Disponibles</h2>
          <Row>
            {products.map((product) => (
              <ProductCardService
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </Row>
        </Col>

        <Col md={4}>
          <h2>Tu Carrito de Compras</h2>
          <Cart
            cartItems={cartItems}
            onRemoveFromCart={handleRemoveFromCart}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            totalCartValue={totalCartValue}
          />
          <div className="d-flex gap-3 mt-3">
            <Button
              variant="success"
              disabled={cartItems.length === 0}
              onClick={handleGoToCheckout}
            >
              Comprar Ahora
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setCartItems([])}
              disabled={cartItems.length === 0}
            >
              Vaciar Carrito
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductList;
