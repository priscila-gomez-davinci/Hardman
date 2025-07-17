import React, { useState, useEffect } from 'react'; // Asegúrate de importar useEffect
import { Container, Row, Col, ListGroup, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom'; // Importa useLocation
import { useAuth } from '../../context/AuthContext';

// Define la URL base para las operaciones del carrito
const API_CART_URL = 'http://localhost:3000/api/cart'; // Para obtener los ítems del carrito

const Checkout = () => { // Ya no recibe cartItems, totalCartValue, onClearCart como props
  const navigate = useNavigate();
  const location = useLocation(); // Hook para acceder al estado de la ruta
  const { user } = useAuth();

  // --- NUEVOS ESTADOS LOCALES para el carrito en Checkout ---
  const [cartItems, setCartItems] = useState([]); // Ahora se gestiona aquí
  const [totalCartValue, setTotalCartValue] = useState(0); // Ahora se gestiona aquí

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', direccion: '', ciudad: '', codigoPostal: '', provincia: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el cartId del estado de la ruta
  const cartIdFromState = location.state?.cartId || null;

  // --- useEffect para cargar los ítems del carrito ---
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!cartIdFromState) {
        setError('ID del carrito no proporcionado. Redirigiendo a productos.');
        setTimeout(() => navigate('/productos'), 2000);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_CART_URL}/${cartIdFromState}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Error HTTP: ${res.status}. Mensaje: ${errorData.message || 'Error al cargar ítems del carrito.'}`);
        }
        const data = await res.json();
        
        // Normalizar los ítems del carrito (snake_case a camelCase)
        const normalizedCartItems = data.cartItems.map(item => ({
            id: item.id_producto, // El ID del producto
            detalleId: item.id_detalle_pedido, // El ID del detalle para PUT/DELETE
            name: item.product_name,
            image: item.product_image,
            quantity: item.cantidad,
            price: parseFloat(item.precio_unitario),
            subTotal: parseFloat(item.sub_total),
            // Asegúrate de mapear otros campos si los necesitas, ej. id_metodo_pago
        }));
        setCartItems(normalizedCartItems);
        // Calcular el total una vez que los ítems están cargados
        setTotalCartValue(normalizedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0));

      } catch (err) {
        setError('Error al cargar ítems del carrito: ' + err.message);
        console.error('Error fetching cart items for checkout:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [cartIdFromState, navigate]); // Depende de cartIdFromState y navigate

  // Rellenar formData automáticamente si el usuario está logueado
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        nombre: user.name || '',
        apellido: user.lastName || '',
        email: user.email || '',
        direccion: user.address || '',
        ciudad: user.city || '',
        provincia: user.province || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Esta función onClearCart ahora debe comunicarse con ProductList
  // para que ProductList también limpie su estado y el backend
  // Alternativa: Checkout hace la llamada al backend para limpiar el carrito
  const onClearCartLocallyAndBackend = async () => {
    // Si tienes un onClearCart pasado desde ProductList, ÚSALO
    // Si no, Checkout hace la llamada DELETE a /api/cart/clear/:cartIdFromState
    if (cartIdFromState) {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_CART_URL}/clear/${cartIdFromState}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al limpiar carrito: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
            }
            setCartItems([]); // Limpia el estado local
            setTotalCartValue(0); // Reinicia el total
            console.log("Carrito limpiado desde Checkout.");
        } catch (err) {
            setError('Error al limpiar el carrito: ' + err.message);
            console.error('Error clearing cart from Checkout:', err);
        } finally {
            setLoading(false);
        }
    }
    // Después de limpiar, quizás redirigir al home o productos
    // navigate('/productos');
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    if (cartItems.length === 0) {
      throw new Error('El carrito está vacío. No se puede realizar el pedido.');
    }

    const orderData = {
      id_usuario: user ? user.id : null,
      nombre_cliente: formData.nombre,
      apellido_cliente: formData.apellido,
      email_cliente: formData.email,
      direccion_envio: formData.direccion,
      ciudad_envio: formData.ciudad,
      provincia_envio: formData.provincia,
      codigo_postal: formData.codigoPostal,
      total_pedido: totalCartValue,
      
      // Asegúrate que 'items' siempre sea un array. Incluso si cartItems está vacío, map devuelve [].
      items: cartItems.map(item => ({ // Este .map siempre devuelve un array
        id_producto: item.id,
        cantidad: item.quantity,
        precio_unitario: item.price,
      })),
      cart_id_from_frontend: cartIdFromState, // Pasar el cartId si el backend lo usa para referencia
    };

    console.log('--- Checkout Frontend: Enviando Pedido ---');
    console.log('orderData COMPLETO que se enviará al backend:', orderData); // <-- VERIFICA ESTO
    console.log('orderData.items (el array de ítems):', orderData.items);     // <-- VERIFICA ESTO
    console.log('¿orderData.items es un Array?', Array.isArray(orderData.items)); // <-- VERIFICA ESTO


    const API_ORDER_URL = 'http://localhost:3000/api/orders';
    const response = await fetch(API_ORDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error detallado de la API (frontend):', errorData); // Imprime el error del backend
      throw new Error(`Error al procesar el pedido: HTTP ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
    }

    const result = await response.json();
    console.log('Pedido realizado con éxito (frontend):', result);

    setOrderPlaced(true);
    await onClearCartLocallyAndBackend();

    setTimeout(() => {
      navigate('/');
    }, 3000);

  } catch (err) {
    setError(err.message || 'Hubo un error al confirmar tu compra. Intenta de nuevo.');
    console.error('Error al confirmar compra (frontend catch):', err);
  } finally {
    setLoading(false);
  }
};

  // Renderizado
  if (loading && !cartItems.length && !error) { // Mostrar spinner solo si carga inicial y no hay error
    return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando carrito...</span></Spinner>;
  }

  if (error && !orderPlaced) { // Mostrar error si existe y no se ha colocado el pedido
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="primary" onClick={() => navigate('/productos')}>
          Volver a la Tienda
        </Button>
      </Container>
    );
  }

  if (cartItems.length === 0 && !orderPlaced) { // Si el carrito está vacío después de cargar
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Tu carrito está vacío. Por favor, agrega productos antes de proceder al pago.
        </Alert>
        <Button variant="primary" onClick={() => navigate('/productos')}>
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
              <ListGroup.Item key={item.detalleId} className="d-flex justify-content-between align-items-center">
                <div>
                  {item.name} x {item.quantity}
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </ListGroup.Item>
            ))}
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