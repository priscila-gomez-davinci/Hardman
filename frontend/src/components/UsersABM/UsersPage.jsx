// src/components/UsersABM/UserManagementPage.jsx

import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import UserList from './UserList'; // Asumo que este mostrará la lista
import UserForm from './UserForm'; // Asumo que este es el formulario para crear/editar

const API_URL = 'http://localhost:3000/api/users'; // ¡Endpoint CORREGIDO!

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // Usuario a editar
  const [showForm, setShowForm] = useState(false); // Para mostrar/ocultar el formulario

  // Función para obtener todos los usuarios
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorData = await response.json(); // Intentar leer el error del backend
        throw new Error(`HTTP error! status: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido al cargar usuarios.'}`);
      }
      const data = await response.json(); // data = { users: [...] }

      // ¡NORMALIZACIÓN DE DATOS del backend (snake_case) a frontend (camelCase)!
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
          isActive: u.usuario_activo === 1, // Convertir tinyint(4) a booleano
          roleId: u.id_rol, // ID numérico del rol
          roleName: u.role_name // Nombre del rol
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

      // ¡NORMALIZACIÓN DE DATOS del frontend (camelCase) a backend (snake_case)!
      const dataToSend = {
          nombre: userToSave.name,
          apellido: userToSave.lastName,
          email: userToSave.email,
          password: userToSave.password, // Asegúrate de que UserForm siempre envíe la contraseña (hasheada en backend)
          telefono: userToSave.phone || null,
          direccion: userToSave.address || null,
          ciudad: userToSave.city || null,
          provincia: userToSave.province || null,
          usuario_activo: userToSave.isActive ? 1 : 0, // Booleano a 1/0
          id_rol: userToSave.roleId // ID del rol
      };

      if (userToSave.id) { // Es una actualización (PUT)
        method = 'PUT';
        url = `${API_URL}/${userToSave.id}`;
      } else { // Es una creación (POST)
        method = 'POST';
        url = API_URL;
        // ¡IMPORTANTE! ELIMINAR CÁLCULO DE ID si id_usuario es AUTO_INCREMENT en tu DB
        // const maxId = users.reduce((max, u) => Math.max(max, Number(u.id)), 0);
        // dataToSend.id_usuario = String(maxId + 1); // Solo si tu DB NO es AUTO_INCREMENT
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // ¡Enviar los datos mapeados!
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
      }
      await fetchUsers(); // Recargar usuarios después de guardar
      setShowForm(false);
      setEditingUser(null);
    } catch (err) {
      setError('Error al guardar usuario: ' + err.message);
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar un usuario
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
      await fetchUsers(); // Recargar usuarios después de eliminar
    } catch (err) {
      setError('Error al eliminar usuario: ' + err.message);
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir el formulario de edición
  const handleEditUser = (user) => {
    setEditingUser(user); // user ya está en camelCase por fetchUsers
    setShowForm(true);
  };

  // Función para cancelar el formulario
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // Renderizado condicional de carga y error
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
          {/* UserForm recibirá el user en camelCase */}
          <UserForm user={editingUser} onSave={handleSaveUser} onCancel={handleCancelForm} />
        </div>
      )}

      {!loading && !error && (
        // UserList recibirá los usuarios en camelCase
        <UserList users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
      )}
    </Container>
  );
}

export default UserManagementPage;