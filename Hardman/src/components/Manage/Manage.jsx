import { useState } from 'react';
import usersMock from '../../data/users';
import ProfileCard from '../ProfileCard/ProfileCard';
import { Button } from 'react-bootstrap';

const Manage = () => {
  const [users, setUsers] = useState(
    usersMock.map((u, index) => ({
      id: u.id_usuario ?? index + 1,
      name: u.nombre,
      surname: u.apellido,
      email: u.email,
      rol: u.id_rol,
    }))
  );

  const handleUpdateUser = (id, updatedData) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updatedData } : user));
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleAddUser = () => {
    const maxId = Math.max(0, ...users.map(u => u.id));
    const newUser = {
      id: maxId + 1,
      name: 'Nuevo',
      surname: 'Usuario',
      email: 'nuevo@correo.com',
      rol: 1,
    };
    setUsers([...users, newUser]);
  };

  return (
    <div className="container">
      <h2 className="text-center mt-4">Administrar Usuarios</h2>
      <div className="text-end mb-3">
        <Button variant="success" onClick={handleAddUser}>
          + Agregar Usuario
        </Button>
      </div>
      <div className="row">
        {users.map((user) => (
          <ProfileCard
            key={user.id}
            user={user}
            setUser={(newData) => handleUpdateUser(user.id, newData)}
            onDelete={() => handleDeleteUser(user.id)}
            actionLabel="Gestionar"
            showCart={false}
          />
        ))}
      </div>
    </div>
  );
};

export default Manage;
