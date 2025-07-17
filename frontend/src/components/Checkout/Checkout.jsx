import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import { Container, Row, Col, ListGroup, Form, Button, Alert, Spinner } from 'react-bootstrap'; // Agregamos Spinner
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Para obtener el usuario logueado

const API_ORDER_URL = 'http://localhost:3000/api/orders'; // Asumiendo que tendrás un endpoint para pedidos
// Si no tienes este endpoint, te ayudaré a crearlo después.

const Checkout = ({ cartItems, totalCartValue, onClearCart }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtener el usuario logueado
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    // Puedes añadir 'provincia' si tu formulario lo tiene, tu DB sí
    provincia: '', 
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false); // Nuevo estado de carga
  const [error, setError] = useState(null); // Nuevo estado de error

  // Rellenar formData automáticamente si el usuario está logueado
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        nombre: user.name || '',
        apellido: user.lastName || '',
        email: user.email || '',
        // Asumo que tienes campos de dirección en tu objeto de usuario
        direccion: user.address || '', 
        ciudad: user.city || '',
        provincia: user.province || '',
        // Si tienes código postal en el usuario, también lo mapearías aquí
        // codigoPostal: user.zipCode || '', 
      }));
    }
  }, [user]); // Se ejecuta cuando el usuario cambia

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Iniciar carga
    setError(null); // Limpiar errores previos

    try {
      if (cartItems.length === 0) {
        throw new Error('El carrito está vacío. No se puede realizar el pedido.');
      }

      // Preparar los datos del pedido para enviar al backend
      const orderData = {
        id_usuario: user ? user.id : null, // Si el usuario está logueado, usar su ID
        nombre_cliente: formData.nombre,
        apellido_cliente: formData.apellido,
        email_cliente: formData.email,
        direccion_envio: formData.direccion,
        ciudad_envio: formData.ciudad,
        provincia_envio: formData.provincia, // Asegúrate de que este campo exista en el formulario
        codigo_postal: formData.codigoPostal,
        total_pedido: totalCartValue,
        // No estamos incluyendo id_metodo_pago aquí, pero lo puedes añadir al formulario
        // y pasarlo si tu tabla 'pedido' lo espera.
        // Asumo que 'detalle_pedido' en la DB tiene id_metodo_pago,
        // pero es más común a nivel de 'pedido'. Tendrás que decidir dónde ponerlo.
        
        // Incluir los ítems del carrito para que el backend cree los detalle_pedido
        items: cartItems.map(item => ({
          id_producto: item.id,
          cantidad: item.quantity,
          precio_unitario: item.price, // Precio unitario al momento de la compra
          // Si id_metodo_pago va por cada detalle_pedido, lo incluirías aquí
          // id_metodo_pago: item.metodoPagoId,
        })),
      };

    console.log('orderData COMPLETO que se enviará al backend:', orderData); // <-- Revisa esto
    console.log('orderData.items (el array de items):', orderData.items); // <-- Revisa esto

    
      const response = await fetch(API_ORDER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al procesar el pedido: HTTP ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
      }

      const result = await response.json();
      console.log('Pedido realizado con éxito:', result);

      setOrderPlaced(true);
      onClearCart(); // Vacía el carrito después de la compra

      setTimeout(() => {
        navigate('/'); // Volver a la página principal
      }, 3000);

    } catch (err) {
      setError(err.message || 'Hubo un error al confirmar tu compra. Intenta de nuevo.');
      console.error('Error al confirmar compra:', err);
    } finally {
      setLoading(false); // Finalizar carga
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Tu carrito está vacío. Por favor, agrega productos antes de proceder al pago.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/productos')}> {/* Enlazar a /productos */}
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

          {loading && <div className="text-center mb-3"><Spinner animation="border" role="status"><span className="visually-hidden">Procesando...</span></Spinner></div>}
          {error && <Alert variant="danger">{error}</Alert>}

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

                  {/* Agregado campo Provincia, si tu base de datos lo tiene en 'pedido' */}
                  <Form.Group as={Col} controlId="formGridProvincia">
                    <Form.Label>Provincia</Form.Label>
                    <Form.Control type="text" name="provincia" value={formData.provincia} onChange={handleInputChange} required />
                  </Form.Group>
                </Row>

                <Form.Group className="mb-3" controlId="formGridZip">
                  <Form.Label>Código Postal</Form.Label>
                  <Form.Control type="text" name="codigoPostal" value={formData.codigoPostal} onChange={handleInputChange} required />
                </Form.Group>

                <Button variant="primary" type="submit" disabled={cartItems.length === 0 || loading}>
                  Confirmar Compra
                </Button>
              </Form>
            </>
          )}
        </Col>
        <Col md={5} className="d-none d-md-block">
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