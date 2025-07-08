import React, { useState } from 'react';
import { Container, Row, Col, ListGroup, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ cartItems, totalCartValue, onClearCart }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí es donde normalmente enviarías los datos del pedido a un backend
    console.log('Datos del pedido:', { items: cartItems, total: totalCartValue, customerInfo: formData });

    // Simulación de una compra exitosa
    setOrderPlaced(true);
    onClearCart(); // Vacía el carrito después de la "compra"

    // Podrías redirigir a una página de confirmación después de unos segundos
    setTimeout(() => {
      navigate('/'); // Volver a la página principal
    }, 3000);
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Tu carrito está vacío. Por favor, agrega productos antes de proceder al pago.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Volver a la Tienda
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Finalizar Compra</h2>
      <Row>
        <Col md={7}>
          <h4>Detalle de tu Pedido</h4>
          <ListGroup className="mb-4">
            {cartItems.map((item) => (
              <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
                <div>
                  {item.name} x {item.quantity}
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </ListGroup.Item>
            ))}
            <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
              <strong>Total a Pagar</strong>
              <strong>${totalCartValue.toFixed(2)}</strong>
            </ListGroup.Item>
          </ListGroup>

          {orderPlaced ? (
            <Alert variant="success">
              ¡Tu pedido ha sido realizado con éxito! Serás redirigido en breve.
            </Alert>
          ) : (
            <>
              <h4>Información de Envío</h4>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridNombre">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                  </Form.Group>
                  <Form.Group as={Col} controlId="formGridApellido">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} required />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formGridAddress">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="1234 Calle Falsa" required />
                </Form.Group>

                <Row className="mb-3">
                  <Form.Group as={Col} controlId="formGridCity">
                    <Form.Label>Ciudad</Form.Label>
                    <Form.Control type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} required />
                  </Form.Group>

                  <Form.Group as={Col} controlId="formGridZip">
                    <Form.Label>Código Postal</Form.Label>
                    <Form.Control type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} required />
                  </Form.Group>
                </Row>

                <Button variant="primary" type="submit" disabled={cartItems.length === 0}>
                  Confirmar Compra
                </Button>
              </Form>
            </>
          )}
        </Col>
        <Col md={5} className="d-none d-md-block"> {/* Puedes agregar una imagen o banner aquí */}
          <img
            src="https://via.placeholder.com/400x300/F0F0F0/000000?text=Procesando+Pago"
            alt="Procesando pago"
            className="img-fluid rounded"
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Checkout;