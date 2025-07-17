import React from 'react';
import { ListGroup, Button, Alert } from 'react-bootstrap';

const Cart = ({
  cartItems = [],
  onRemoveFromCart, // Recibe el ítem completo del carrito
  onIncreaseQuantity, // Recibe el ítem completo del carrito
  onDecreaseQuantity, // Recibe el ítem completo del carrito
  totalCartValue,
  onClearCart // Recibe la función para vaciar
}) => {
  // console.log("Items en Cart.jsx:", cartItems); // Para depuración

  if (!cartItems || cartItems.length === 0) {
    return <Alert variant="info">Tu carrito está vacío.</Alert>;
  }

  return (
    <div>
      <ListGroup className="mb-3">
        {cartItems.map((item) => (
          // Asegúrate que item.detalleId exista y sea único como key
          <ListGroup.Item key={item.detalleId} className="d-flex justify-content-between align-items-center">
            <div>
              {item.name} <br />
              <small>Cantidad: {item.quantity}</small>
            </div>
            <div>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
              {/* Pasa el ítem completo a las funciones de manejo */}
              <Button
                variant="outline-secondary"
                size="sm"
                className="ms-2"
                onClick={() => onDecreaseQuantity(item)}
              >
                -
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                className="ms-1"
                onClick={() => onIncreaseQuantity(item)}
              >
                +
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="ms-2"
                onClick={() => onRemoveFromCart(item)}
              >
                X
              </Button>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
        <strong>Total del Carrito</strong>
        <strong>${totalCartValue.toFixed(2)}</strong>
      </ListGroup.Item>
    </div>
  );
};

export default Cart;