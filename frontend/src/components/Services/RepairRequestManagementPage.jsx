// src/components/RepairABM/RepairRequestManagementPage.jsx (CORRECCIÓN FINAL)

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Spinner, Alert, Table, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const API_REPAIR_REQUESTS_URL = 'http://localhost:3000/api/repair-requests';
const API_USERS_URL = 'http://localhost:3000/api/users';

function RepairRequestManagementPage() {
    const { user } = useAuth();
    const [repairRequests, setRepairRequests] = useState([]);
    const [technicians, setTechnicians] = useState([]); 
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(''); 

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false); 
    const [newStatus, setNewStatus] = useState('');

    const [opLoading, setOpLoading] = useState(false);
    const [opError, setOpError] = useState(null);

    const fetchRepairRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_REPAIR_REQUESTS_URL);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error HTTP: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido al cargar solicitudes.'}`);
            }
            const data = await res.json();

            setRepairRequests(data.repairRequests);
            // const normalizedRequests = data.repairRequests.map(req => ({
            //     id: req.id_pedido_reparacion,
            //     clientName: req.nombre_cliente,
            //     // ... mapear todos los campos a camelCase ...
            //     categoryName: req.categoria_nombre,
            //     // ... y añadir lastName si viene del backend:
            //     // clientUserLastName: req.apellido_usuario_cliente,
            // });
            // setRepairRequests(normalizedRequests);

        } catch (err) {
            setError('Error al cargar solicitudes de reparación: ' + err.message);
            console.error('Error fetching repair requests:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTechnicians = useCallback(async () => {
        try {
            const res = await fetch(`${API_USERS_URL}/technicians`); 
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error HTTP: ${res.status}. Mensaje: ${errorData.message || 'Error al cargar técnicos.'}`);
            }
            const data = await res.json();
            setTechnicians(data.technicians); 
        } catch (err) {
            console.error('Error fetching technicians:', err);
        }
    }, []);


    useEffect(() => {
        if (user?.role === 'admin') {
            const promises = [fetchRepairRequests()];
            Promise.all(promises)
                .then(() => setLoading(false))
                .catch(err => {
                    setError('Error al cargar datos iniciales de gestión de reparación: ' + err.message);
                    console.error("Error al cargar datos iniciales de gestión de reparación:", err);
                    setLoading(false);
                });
        } else if (user) {
            setError('No autorizado. Debes ser administrador para ver esta página.');
            setLoading(false);
        } else {
            setError('Inicia sesión como administrador para ver esta página.');
            setLoading(false);
        }
    }, [user, fetchRepairRequests]); 


    const handleEditRequest = (request) => {
        setSelectedRequest(request);
        setNewStatus(request.status);
        setShowEditModal(true); 
    };

    const handleSaveChanges = async () => {
        if (!selectedRequest) return;
        setOpLoading(true);
        setOpError(null);

        try {
            const updateData = {
                estado_reparacion: newStatus || selectedRequest.status,
                id_usuario_tecnico: selectedTechnicianId === '' ? null : selectedTechnicianId 
            };

            const res = await fetch(`${API_REPAIR_REQUESTS_URL}/${selectedRequest.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Error al actualizar: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
            }
            alert('Solicitud de reparación actualizada.');
            setShowEditModal(false);
            await fetchRepairRequests();
        } catch (err) {
            setOpError('Error al guardar cambios: ' + err.message);
            console.error('Error saving repair request changes:', err);
        } finally {
            setOpLoading(false);
        }
    };

    const handleDeleteRepairRequest = async (requestId) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar la solicitud #${requestId}?`)) return;
        setOpLoading(true);
        setOpError(null);
        try {
            const res = await fetch(`${API_REPAIR_REQUESTS_URL}/${requestId}`, { method: 'DELETE', });
            if (!res.ok) { const errorData = await res.json(); throw new Error(`Error al eliminar: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`); }
            alert('Solicitud eliminada.');
            await fetchRepairRequests();
        } catch (err) { setOpError('Error al eliminar: ' + err.message); console.error('Error deleting repair request:', err); }
        finally { setOpLoading(false); }
    };


    // Renderizado condicional
    if (loading) return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando solicitudes...</span></Spinner>;
    if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;
    if (!user || user.role !== 'admin') return <Alert variant="danger" className="m-5">Acceso denegado. Solo administradores pueden ver esta página.</Alert>;


    return (
        <Container className="my-5">
            <h1 className="mb-4 text-center">Gestión de Solicitudes de Reparación</h1>

            {opLoading && <div className="text-center"><Spinner animation="border" size="sm" /><span className="visually-hidden">Procesando operación...</span></div>}
            {opError && <Alert variant="danger" className="mt-3">{opError}</Alert>}

            {repairRequests.length === 0 ? (
                <Alert variant="info" className="text-center">No hay solicitudes de reparación para mostrar.</Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID Solicitud</th><th>Cliente</th><th>Email Cliente</th><th>Teléfono Cliente</th>
                            <th>Fecha Solicitud</th><th>Estado</th><th>Categoría</th><th>Técnico Asignado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {repairRequests.map(req => (
                            <tr key={req.id}> 
                                <td>{req.id}</td>
                                <td>{req.clientName} {req.clientUserLastName && ` ${req.clientUserLastName}`}</td>
                                <td>{req.clientEmail}</td>
                                <td>{req.clientPhone}</td>
                                <td>{req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'N/A'}</td> {/* Muestra la fecha o 'N/A' */}
                                <td>{req.status}</td>
                                <td>{req.categoryName}</td>
                                <td>{req.technicianUserName || 'Sin Asignar'}</td>
                                <td>
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditRequest(req)}>Ver/Editar</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDeleteRepairRequest(req.id)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {selectedRequest && ( 
                <Modal show={showEditModal} onHide={() => setShowEditModal(false)}> 
                    <Modal.Header closeButton>
                        <Modal.Title>Detalles Solicitud #{selectedRequest?.id}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {selectedRequest && (
                            <Form>
                                <p><strong>Cliente:</strong> {selectedRequest.clientName} {selectedRequest.clientUserLastName || ''} ({selectedRequest.clientEmail})</p>
                                <p><strong>Teléfono:</strong> {selectedRequest.clientPhone}</p>
                                <p><strong>Fecha Solicitud:</strong> {new Date(selectedRequest.requestDate).toLocaleString()}</p>
                                <p><strong>Tipo Equipo:</strong> {selectedRequest.categoryName}</p>
                                <p><strong>Descripción Problema:</strong> {selectedRequest.description}</p>
                                <p><strong>Estado Actual:</strong> {selectedRequest.status}</p>
                                <p><strong>Técnico Asignado Actual:</strong> {selectedRequest.technicianUserName || 'Sin Asignar'}</p>

                                <h5 className="mt-4">Actualizar Solicitud:</h5>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nuevo Estado:</Form.Label>
                                    <Form.Control as="select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                        <option value="">Seleccione un estado</option>
                                        <option value="pendiente">Pendiente</option><option value="en_revision">En Revisión</option>
                                        <option value="en_reparacion">En Reparación</option><option value="lista_para_entrega">Lista para Entrega</option>
                                        <option value="entregada">Entregada</option><option value="cancelada">Cancelada</option>
                                    </Form.Control>
                                </Form.Group>

                                <Button variant="primary" onClick={handleSaveChanges} disabled={opLoading || !newStatus}>
                                    {opLoading ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                                </Button>
                            </Form>
                        )}
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
}

export default RepairRequestManagementPage;