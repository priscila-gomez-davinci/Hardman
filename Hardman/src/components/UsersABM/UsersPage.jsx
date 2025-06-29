import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserList from './UserList';

function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('http://localhost:5001/users')
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <p>No autorizado</p>;
  }


  return <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />;
}

export default UsersPage;