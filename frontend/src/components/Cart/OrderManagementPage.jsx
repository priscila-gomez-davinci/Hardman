import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Alert, Table, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const API_ORDERS_URL = 'http://localhost:3000/api/orders'; 

const OrderManagementPage = () => {
    const { user } = useAuth(); 
    const [editingStatus, setEditingStatus] = useState(null); 
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para el modal de detalles y edición de estado
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const [opLoading, setOpLoading] = useState(false);
    const [opError, setOpError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_ORDERS_URL); 
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error HTTP: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido al cargar pedidos.'}`);
            }
            const data = await res.json();
            setOrders(data.orders); 
        } catch (err) {
            setError('Error al cargar pedidos: ' + err.message);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    }, []); 

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
            setShowDetailsModal(false); 
            setSelectedOrder(null); 
            setEditingStatus(null); 
            setNewStatus(''); 
            await fetchOrders(); 
        } catch (err) {
            setOpError('Error al actualizar estado: ' + err.message);
            console.error('Error updating order status:', err);
        } finally {
            setOpLoading(false);
        }
    };

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
            await fetchOrders(); 
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
    }, [user, fetchOrders]); 

    if (loading) return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando pedidos...</span></Spinner>;
    if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;
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
                            <tr key={order.id}> 
                                <td>{order.id}</td>
                                <td>{new Date(order.date).toLocaleDateString()}</td>
                                <td>{order.status}</td>
                                <td>${order.total.toFixed(2)}</td>
                                <td>
                                    {order.userId || 'Invitado'}
                                    {order.userName && ` (${order.userName} ${order.userLastName || ''})`} 
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