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

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await fetch(API_URL); // API_URL = 'http://localhost:3000/api/users' (CORRECTO)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido al cargar usuarios.'}`);
    }
    const data = await response.json(); // data ES: {"users":[{"id_usuario":1, ...}]}

    const normalizedUsers = data.users.map(u => ({ // <-- data.users es CORRECTO
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
    setUsers(normalizedUsers); // <-- Aquí se setea el estado 'users'
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

    console.log('--- INTENTANDO GUARDAR USUARIO ---');
    console.log('userToSave (desde el formulario - camelCase):', userToSave); // Datos tal como vienen del formulario

    // Normalización de datos del frontend (camelCase) a backend (snake_case)
    const dataToSend = {
        nombre: userToSave.name,
        apellido: userToSave.lastName,
        email: userToSave.email,
        password: userToSave.password || null, // Asegúrate de enviar null si está vacío, no undefined
        telefono: userToSave.phone || null,
        direccion: userToSave.address || null,
        ciudad: userToSave.city || null,
        provincia: userToSave.province || null,
        usuario_activo: userToSave.isActive ? 1 : 0, // Booleano a 1/0
        id_rol: userToSave.roleId // ID del rol
    };
    // NOTA: Si userToSave.password es "" (vacío), se convertirá a null.
    // Tu backend ya tiene lógica para ignorar contraseñas null/undefined al actualizar.

    console.log('dataToSend (mapeado para el backend - snake_case):', dataToSend); // ¡Lo que REALMENTE se enviará!

    if (userToSave.id) { // Es una actualización (PUT)
      method = 'PUT';
      url = `${API_URL}/${userToSave.id}`;
      console.log('Es un PUT. URL:', url);
    } else { // Es una creación (POST)
      method = 'POST';
      url = API_URL;
      console.log('Es un POST. URL:', url);
    }

    response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend), // ¡Enviar los datos mapeados!
    });

    console.log('Respuesta de la API - response.ok:', response.ok, 'status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error detallado desde el backend:', errorData); // Imprime el error del backend
      throw new Error(`HTTP error! status: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
    }
    await fetchUsers(); // Recargar usuarios después de guardar
    setShowForm(false);
    setEditingUser(null);
    console.log('--- USUARIO GUARDADO EXITOSAMENTE (confirmado por frontend) ---');
  } catch (err) {
    setError('Error al guardar usuario: ' + err.message);
    console.error('Error al guardar usuario (frontend catch):', err); // Mensaje del catch
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