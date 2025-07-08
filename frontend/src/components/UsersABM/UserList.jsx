import React from 'react';
import { Table, Button } from 'react-bootstrap';

function UserList({ users, onEdit, onDelete }) {
  if (!users || users.length === 0) {
    return <p className="text-center">No hay usuarios para mostrar.</p>;
  }

  return (
    <Table striped bordered hover responsive className="shadow-sm">
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td className="text-center">
              <Button variant="info" size="sm" className="me-2" onClick={() => onEdit(user)}>
                Editar
              </Button>
              <Button variant="danger" size="sm" onClick={() => onDelete(user.id)}>
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