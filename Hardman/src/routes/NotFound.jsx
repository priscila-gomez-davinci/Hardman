import React from 'react';
import '/src/NotFound.css'; 
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-text">Página no encontrada</p>
      <Link to="/" className="boton">Volver al inicio</Link>
    </div>
  );
};

export default NotFound;
