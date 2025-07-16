import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import UserList from './UserList';
import UserForm from './UserForm';

const API_URL = 'http://localhost:3000/users'; // Replica esto pero con /products Lucas

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (userToSave) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      let method;
      let url;
      let bodyData = { ...userToSave };

      if (userToSave.id) {
        method = 'PUT';
        url = `${API_URL}/${userToSave.id}`;
      } else {
        method = 'POST';
        url = API_URL;

        // Esto resuelve el error de counting de los ids para que sean consecutivos
        const maxId = users.reduce((max, user) => Math.max(max, Number(user.id)), 0);
        bodyData.id = String(maxId + 1); 
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchUsers(); 
      setShowForm(false); 
      setEditingUser(null); 
    } catch (err) {
      setError('Error al guardar usuario: ' + err.message);
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchUsers();
    } catch (err) {
      setError('Error al eliminar usuario: ' + err.message);
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">Gestión de Usuarios (ABM)</h1>

      {loading && <div className="text-center"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner></div>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-end mb-3">
        <Button onClick={() => { setShowForm(true); setEditingUser(null); }}>
          Agregar Nuevo Usuario
        </Button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 border rounded bg-light">
          <h3>{editingUser ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
          <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCancelForm} />
        </div>
      )}

      {!loading && !error && (
        <UserList users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
      )}
    </Container>
  );
}

export default UserManagementPage;