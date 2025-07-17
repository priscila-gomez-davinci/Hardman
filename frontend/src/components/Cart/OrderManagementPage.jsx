import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Alert, Table, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const API_ORDERS_URL = 'http://localhost:3000/api/orders'; // Tu endpoint de pedidos

const OrderManagementPage = () => {
    const { user } = useAuth(); // Para verificar el rol admin
    const [editingStatus, setEditingStatus] = useState(null); // <-- ¡VERIFICA QUE ESTA LÍNEA EXISTA!
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para el modal de detalles y edición de estado
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    // Estados para la carga/error de operaciones individuales (ej. actualizar/eliminar)
    const [opLoading, setOpLoading] = useState(false);
    const [opError, setOpError] = useState(null);

    // Función para obtener todos los pedidos (memoizada con useCallback)
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_ORDERS_URL); // GET a todos los pedidos
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error HTTP: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido al cargar pedidos.'}`);
            }
            const data = await res.json();
            setOrders(data.orders); // El backend devuelve { orders: [...] }
        } catch (err) {
            setError('Error al cargar pedidos: ' + err.message);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []); // Dependencias vacías, solo se vuelve a crear si sus dependencias cambian (que no hay)

    // Función para actualizar el estado de un pedido
    const handleUpdateOrderStatus = async (orderId) => {
        if (!newStatus) {
            alert('Por favor, selecciona un nuevo estado.');
            return;
        }
        setOpLoading(true);
        setOpError(null);
        try {
            const res = await fetch(`${API_ORDERS_URL}/${orderId}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado_pedido: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error al actualizar estado: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
            }
            alert('Estado del pedido actualizado.');
            setShowDetailsModal(false); // Cierra el modal
            setSelectedOrder(null); // Limpia la orden seleccionada
            setEditingStatus(null); // Limpia el estado de edición (si lo usaras para un input directo)
            setNewStatus(''); // Reinicia el nuevo estado
            await fetchOrders(); // Recarga los pedidos para ver el cambio
        } catch (err) {
            setOpError('Error al actualizar estado: ' + err.message);
            console.error('Error updating order status:', err);
        } finally {
            setOpLoading(false);
        }
    };

    // Función para eliminar un pedido (con transacción en backend)
    const handleDeleteOrder = async (orderId) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el pedido #${orderId} y sus detalles?`)) {
            return;
        }
        setOpLoading(true);
        setOpError(null);
        try {
            const res = await fetch(`${API_ORDERS_URL}/${orderId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error al eliminar pedido: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
            }
            alert('Pedido eliminado exitosamente.');
            await fetchOrders(); // Recarga los pedidos para ver el cambio
        } catch (err) {
            setOpError('Error al eliminar pedido: ' + err.message);
            console.error('Error deleting order:', err);
        } finally {
            setOpLoading(false);
        }
    };

    // Abre el modal de detalles
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailsModal(true);
    };


    // Efecto para cargar los pedidos al montar el componente o si el usuario cambia
    useEffect(() => {
        if (user?.role === 'admin') { // Solo si el usuario es admin, intenta cargar
            fetchOrders();
        } else if (user) { // Si hay usuario pero no es admin
            setError('No autorizado. Debes ser administrador para ver esta página.');
            setLoading(false); // Deja de cargar si no está autorizado
        } else { // Si no hay usuario (no logueado)
            setError('Inicia sesión como administrador para ver esta página.');
            setLoading(false); // Deja de cargar
        }
    }, [user, fetchOrders]); // Depende del objeto user y de la función fetchOrders (memoizada)


    // Renderizado condicional de carga y errores
    if (loading) return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando pedidos...</span></Spinner>;
    if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;
    // Si no es admin y no hay un error específico, mostrar mensaje de acceso denegado
    if (!user || user.role !== 'admin') return <Alert variant="danger" className="m-5">Acceso denegado. Solo administradores pueden ver esta página.</Alert>;

    return (
        <Container className="my-5">
            <h1 className="mb-4 text-center">Gestión de Pedidos</h1>

            {opLoading && <div className="text-center"><Spinner animation="border" size="sm" /><span className="visually-hidden">Procesando operación...</span></div>}
            {opError && <Alert variant="danger" className="mt-3">{opError}</Alert>}

            {orders.length === 0 ? (
                <Alert variant="info" className="text-center">No hay pedidos para mostrar.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Total</th>
                            <th>Usuario (ID / Nombre / Email)</th>
                            <th>Dirección Envío</th>
                            <th>Nº Seguimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}> {/* 'id' es el id_pedido normalizado */}
                                <td>{order.id}</td>
                                <td>{new Date(order.date).toLocaleDateString()}</td>
                                <td>{order.status}</td>
                                <td>${order.total.toFixed(2)}</td>
                                <td>
                                    {order.userId || 'Invitado'}
                                    {order.userName && ` (${order.userName} ${order.userLastName || ''})`} {/* Manejar apellido opcional */}
                                    {order.userEmail && ` - ${order.userEmail}`}
                                </td>
                                <td>{order.shippingAddress}</td>
                                <td>{order.trackingNumber}</td>
                                <td>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => handleViewDetails(order)}>
                                        Ver Detalles
                                    </Button>
                                    {/* Botón para abrir edición de estado directamente o eliminar */}
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteOrder(order.id)}>
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Modal de Detalles del Pedido */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Pedido #{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedOrder && (
                        <>
                            <p><strong>Fecha:</strong> {new Date(selectedOrder.date).toLocaleString()}</p>
                            <p><strong>Estado:</strong> {selectedOrder.status}</p>
                            <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
                            <p><strong>Usuario:</strong> {selectedOrder.userName || 'Invitado'} {selectedOrder.userLastName || ''} ({selectedOrder.userEmail || 'N/A'})</p>
                            <p><strong>Dirección Envío:</strong> {selectedOrder.shippingAddress}</p>
                            <p><strong>Nº Seguimiento:</strong> {selectedOrder.trackingNumber}</p>

                            <h5 className="mt-4">Productos del Pedido:</h5>
                            <Table striped bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>SKU</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unitario</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.details.map(detail => (
                                        <tr key={detail.id}>
                                            <td>
                                                {detail.productImage && <img src={`http://localhost:3000/${detail.productImage}`} alt={detail.productName} style={{ width: '50px', height: '50px', marginRight: '10px', objectFit: 'cover' }} />}
                                                {detail.productName}
                                            </td>
                                            <td>{detail.productSku}</td>
                                            <td>{detail.quantity}</td>
                                            <td>${detail.unitPrice.toFixed(2)}</td>
                                            <td>${detail.subTotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            <h5 className="mt-4">Actualizar Estado:</h5>
                            <Form.Group className="mb-3">
                                <Form.Label>Nuevo Estado:</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="">Seleccione un estado</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="procesando">Procesando</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="cancelado">Cancelado</option>
                                </Form.Control>
                            </Form.Group>
                            <Button variant="primary" onClick={() => handleUpdateOrderStatus(selectedOrder.id)} disabled={opLoading || !newStatus}>
                                {opLoading ? <Spinner animation="border" size="sm" /> : 'Actualizar Estado'}
                            </Button>
                        </>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default OrderManagementPage;