import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth(); 

  if (user) {
    return <Navigate to="/productos" replace />;
  }
  return children;
};

export default PublicOnlyRoute;