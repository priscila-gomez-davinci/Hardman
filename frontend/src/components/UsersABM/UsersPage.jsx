
import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import UserList from './UserList'; 
import UserForm from './UserForm'; 

const API_URL = 'http://localhost:3000/api/users'; 

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null); 
  const [showForm, setShowForm] = useState(false); 

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(`HTTP error! status: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido al cargar usuarios.'}`);
      }
      const data = await response.json(); 

      const normalizedUsers = data.users.map(u => ({
          id: u.id_usuario,
          name: u.nombre,
          lastName: u.apellido,
          email: u.email,
          phone: u.telefono,
          address: u.direccion,
          city: u.ciudad,
          province: u.provincia,
          registrationDate: u.fecha_registro,
          isActive: u.usuario_activo === 1, 
          roleId: u.id_rol, 
          roleName: u.role_name 
      }));

      setUsers(normalizedUsers);
    } catch (err) {
      setError('Error al cargar usuarios: ' + err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []); // Se ejecuta solo una vez al montar

  // Función para guardar (crear/actualizar) un usuario
  const handleSaveUser = async (userToSave) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      let method;
      let url;

      const dataToSend = {
          nombre: userToSave.name,
          apellido: userToSave.lastName,
          email: userToSave.email,
          password: userToSave.password, 
          telefono: userToSave.phone || null,
          direccion: userToSave.address || null,
          ciudad: userToSave.city || null,
          provincia: userToSave.province || null,
          usuario_activo: userToSave.isActive ? 1 : 0, 
          id_rol: userToSave.roleId 
      };

      if (userToSave.id) { 
        method = 'PUT';
        url = `${API_URL}/${userToSave.id}`;
      } else { 
        method = 'POST';
        url = API_URL;
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
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
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
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

  if (loading) return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;

  // Renderizado principal
  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">Gestión de Usuarios (ABM)</h1>

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