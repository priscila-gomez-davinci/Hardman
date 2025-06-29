import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/notfound" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/notfound" />;
  }

  return children;
}

export default PrivateRoute;