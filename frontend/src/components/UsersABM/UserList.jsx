import React from 'react';
import { Table, Button } from 'react-bootstrap';

function UserList({ users, onEdit, onDelete }) {
  if (!Array.isArray(users) || users.length === 0) {
    return <p className="text-center">No hay usuarios para mostrar.</p>;
  }

  return (
    <Table striped bordered hover responsive className="mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Rol</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}> 
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.lastName}</td>
            <td>{user.email}</td>
            <td>{user.phone || 'N/A'}</td> 
            <td>{user.roleName}</td> 
            <td>{user.isActive ? 'Sí' : 'No'}</td> 
            <td>
              <Button
                variant="warning"
                size="sm"
                className="me-2"
                onClick={() => onEdit(user)} 
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(user.id)} // Pasa solo el ID para eliminación
              >
                Eliminar
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default UserList;