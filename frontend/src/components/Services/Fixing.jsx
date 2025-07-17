import React, { useState } from 'react';
import '/src/fixing.css'; // Tu archivo CSS
import { useAuth } from '../../context/AuthContext'; // Para obtener el usuario logueado

function FixingForm() {
  const { user } = useAuth(); // Obtener el usuario logueado
  const [formData, setFormData] = useState({
    nombre: '',
    email: '', // ¡Añadido! Necesario para la DB
    telefono: '',
    tipoEquipo: '', // Este se mapeará a id_categoria_reparacion
    problema: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Estado de carga
  const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito
  const [errorMessage, setErrorMessage] = useState(''); // Mensaje de error de la API

  // Precargar nombre y email si el usuario está logueado
  // No usar useEffect aquí para evitar ciclos, hazlo directamente al inicializar o en handleChange inicial
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.name || '',
        email: user.email || '',
        telefono: user.phone || '' // Si tienes teléfono en tu objeto usuario
      }));
    }
  }, [user]); // Ejecutar solo cuando el objeto user cambia

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar error específico al cambiar el campo
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio'; // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Formato de email inválido'; // Validación básica de email
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!formData.tipoEquipo.trim()) newErrors.tipoEquipo = 'Selecciona un tipo de equipo';
    if (!formData.problema.trim()) newErrors.problema = 'Describí el problema';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validate()) {
      setErrorMessage('Por favor, corrige los errores en el formulario.');
      return;
    }

    setLoading(true);

    try {
      // Asumo que tienes una tabla de categorías de reparación y que formData.tipoEquipo es el ID.
      // Si no, tendrás que ajustar esto para mapear tipoEquipo a un id_categoria_reparacion válido.
      // Por simplicidad, asumimos un mapeo directo o un ID por defecto para la categoría.
      const idCategoriaReparacion = 1; // <<-- ¡AJUSTA ESTE ID! o busca el ID por el nombre (ej. 'PC' -> ID 1)

      const requestData = {
        nombre_cliente: formData.nombre,
        email_cliente: formData.email,
        telefono_cliente: formData.telefono,
        descripcion: formData.problema,
        id_categoria_reparacion: idCategoriaReparacion, // Usar el ID de categoría
        id_usuario_cliente: user ? user.id : null, // ID del usuario logueado o null
      };

      const response = await fetch('http://localhost:3000/api/repair-requests', { // Endpoint del backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || 'Error desconocido al enviar la solicitud.'}`);
      }

      setSuccessMessage('¡Solicitud de reparación enviada exitosamente!');
      setFormData({ nombre: '', email: '', telefono: '', tipoEquipo: '', problema: '' }); // Limpiar formulario
      setErrors({});
    } catch (err) {
      setErrorMessage(err.message || 'Error al enviar la solicitud de reparación. Intenta de nuevo.');
      console.error('Error al enviar solicitud de reparación:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Solicitud de Reparación</h2>
      <div className="contenedor-campos">
        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input type="text" id="nombre" name="nombre" placeholder="Tu Nombre" value={formData.nombre} onChange={handleChange} />
          {errors.nombre && <p className="error">{errors.nombre}</p>}
        </div>

        <div className="campo">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required={!user} /> {/* Requerido si no hay user logueado */}
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div className="campo">
          <label htmlFor="telefono">Teléfono</label>
          <input type="tel" id="telefono" name="telefono" placeholder="Tu Número de Celular" value={formData.telefono} onChange={handleChange} />
          {errors.telefono && <p className="error">{errors.telefono}</p>}
        </div>

        <div className="campo">
          <label htmlFor="tipoEquipo">Tipo de equipo</label>
          <select id="tipoEquipo" name="tipoEquipo" value={formData.tipoEquipo} onChange={handleChange}>
            <option value="">-- Seleccionar --</option>
            <option value="1">PC</option> {/* Puedes usar los IDs reales de tu tabla de categorías */}
            <option value="2">Notebook</option>
            <option value="3">Otro</option>
          </select>
          {errors.tipoEquipo && <p className="error">{errors.tipoEquipo}</p>}
        </div>

        <div className="campo">
          <label htmlFor="problema">Descripción del problema</label>
          <textarea id="problema" name="problema" value={formData.problema} onChange={handleChange} />
          {errors.problema && <p className="error">{errors.problema}</p>}
        </div>
      </div>

      <div className="alinear-derecha">
        <button className="boton" type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Solicitud'}
        </button>
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </form>
  );
}

export default FixingForm;