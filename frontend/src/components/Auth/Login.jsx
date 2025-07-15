
import React, { useState } from 'react';
import '../../login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
const res = await fetch(
    `http://localhost:3000/api/auth/login?email=${encodeURIComponent(form.username)}&password=${encodeURIComponent(form.password)}`
);

      if (!res.ok) {
        const errorData = await res.json(); 
        throw new Error(errorData.message || 'Error en la autenticación');
      }

      const user = await res.json(); 

      if (user) {
        login(user); 
        navigate(user.role === 'admin' ? '/administrarProductos' : '/productos');
      } else {
        setError('Respuesta inesperada del servidor.');
      }

    } catch (err) {
      console.error("Error durante el login:", err);
      setError(err.message || 'Usuario o contraseña incorrectos'); 
    }
  };

  return (
    <main className="main-content">
      <div className="login-container">
        <form className="formulario login-form" onSubmit={handleSubmit}>
          <h2 className="h2contact">Iniciar Sesión</h2>
          <div className="campo">
            <label>Usuario</label>
            <input
              className="input-text"
              type="text"
              name="username" 
              placeholder="Tu email" 
              value={form.username}
              onChange={handleChange}
            />
          </div>
          <div className="campo">
            <label>Contraseña</label>
            <input
              className="input-text"
              type="password"
              name="password"
              placeholder="Tu contraseña"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="alinear-derecha">
            <input className="boton" type="submit" value="Ingresar" />
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;