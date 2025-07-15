import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../login.css'; 
const Register = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    provincia: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST', // Es una petición POST para el registro
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form), // Envía los datos del formulario como JSON
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      const data = await res.json();
      setSuccessMessage(data.message || '¡Registro exitoso! Ahora puedes iniciar sesión.');
      setForm({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        provincia: '',
      });
      setTimeout(() => {
        navigate('/login'); // Redirigir al login después de un breve mensaje
      }, 2000);

    } catch (err) {
      console.error("Error durante el registro:", err);
      setError(err.message || 'Hubo un problema al registrarte. Intenta de nuevo.');
    }
  };

  return (
    <main className="main-content">
      <div className="login-container"> {/* Puedes crear un estilo específico para registro si es necesario */}
        <form className="formulario login-form" onSubmit={handleSubmit}>
          <h2 className="h2contact">Registro de Usuario</h2>

          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input
              className="input-text"
              type="text"
              id="nombre"
              name="nombre"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="apellido">Apellido</label>
            <input
              className="input-text"
              type="text"
              id="apellido"
              name="apellido"
              placeholder="Tu apellido"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="email">Email</label>
            <input
              className="input-text"
              type="email"
              id="email"
              name="email"
              placeholder="Tu email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="password">Contraseña</label>
            <input
              className="input-text"
              type="password"
              id="password"
              name="password"
              placeholder="Crea tu contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="campo">
            <label htmlFor="telefono">Teléfono (opcional)</label>
            <input
              className="input-text"
              type="text"
              id="telefono"
              name="telefono"
              placeholder="Tu teléfono"
              value={form.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <label htmlFor="direccion">Dirección (opcional)</label>
            <input
              className="input-text"
              type="text"
              id="direccion"
              name="direccion"
              placeholder="Tu dirección"
              value={form.direccion}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <label htmlFor="ciudad">Ciudad (opcional)</label>
            <input
              className="input-text"
              type="text"
              id="ciudad"
              name="ciudad"
              placeholder="Tu ciudad"
              value={form.ciudad}
              onChange={handleChange}
            />
          </div>

          <div className="campo">
            <label htmlFor="provincia">Provincia (opcional)</label>
            <input
              className="input-text"
              type="text"
              id="provincia"
              name="provincia"
              placeholder="Tu provincia"
              value={form.provincia}
              onChange={handleChange}
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <div className="alinear-derecha">
            <input className="boton" type="submit" value="Registrarse" />
          </div>
        </form>
      </div>
    </main>
  );
};

export default Register;