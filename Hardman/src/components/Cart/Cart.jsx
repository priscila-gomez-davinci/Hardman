import React from 'react';
import { ListGroup, Button, Image, Alert } from 'react-bootstrap';

const Cart = ({ cartItems, onRemoveFromCart, onIncreaseQuantity, onDecreaseQuantity, totalCartValue }) => {
  return (
    <div>
      {cartItems.length === 0 ? (
        <Alert variant="info">Tu carrito está vacío.</Alert>
      ) : (
        <>
          <ListGroup>
            {cartItems.map((item) => (
              <ListGroup.Item key={item.id} className="d-flex align-items-center justify-content-between mb-2">
                <Image src={item.image} rounded style={{ width: '50px', height: '50px', marginRight: '10px', objectFit: 'cover' }} />
                <div className="flex-grow-1">
                  <h5>{item.name}</h5>
                  <p className="mb-0">${item.price.toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="d-flex align-items-center">
                  <Button variant="outline-secondary" size="sm" onClick={() => onDecreaseQuantity(item.id)}>-</Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button variant="outline-secondary" size="sm" onClick={() => onIncreaseQuantity(item.id)}>+</Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="ms-3"
                    onClick={() => onRemoveFromCart(item.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <h4 className="mt-4 text-end">Total del Carrito: ${totalCartValue.toFixed(2)}</h4>
        </>
      )}
    </div>
  );
};

export default Cart;