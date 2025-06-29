import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import UserList from './UserList';
import UserForm from './UserForm';

const API_URL = 'http://localhost:5001/users'; // En el de productos agregar /products

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // Estado del user
  const [showForm, setShowForm] = useState(false); 

  // Carga usuarios al levantar el componente
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

  // ABM user
  const handleSaveUser = async (user) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (user.id) {
        // Update con PUT
        response = await fetch(`${API_URL}/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
      } else {
        // Add con POST
        response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchUsers(); // Recarga despues de agregar un nuevo user para que se vea el nuevo usuario
      setShowForm(false); // Ocultar formulario
      setEditingUser(null); // Limpiar usuario en edición
    } catch (err) {
      setError('Error al guardar usuario: ' + err.message);
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Remove con DELETE
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
      await fetchUsers(); // Recargar la lista después de eliminar
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