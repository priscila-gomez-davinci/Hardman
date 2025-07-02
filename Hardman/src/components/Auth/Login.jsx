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
    const res = await fetch(
      `http://localhost:5001/users?email=${form.username}&password=${form.password}`
    );
    const users = await res.json();
    const user = users[0];

    if (user) {
      login(user); // Guarda en contexto y localStorage
      navigate(user.role === 'admin' ? '/administrarProductos' : '/productos');
    } else {
      setError('Usuario o contraseña incorrectos');
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
            placeholder="Tu usuario"
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
