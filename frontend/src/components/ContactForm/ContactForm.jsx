import React, { useState } from 'react';
import '/src/contact.css'; 

function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    mensaje: ''
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState(null); 
  const [isLoading, setIsLoading] = useState(false); 

  const API_BASE_URL = 'http://localhost:3000';

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (formData.telefono.length < 8) {
      newErrors.telefono = 'El teléfono debe tener al menos 8 dígitos';
    }

    if (!formData.correo.trim()) {
      newErrors.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      newErrors.correo = 'El formato de correo no es válido';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje no puede estar vacío';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    setIsLoading(true); 

    if (!validateForm()) {
      console.log('Errores en el formulario:', errors);
      setIsLoading(false); 
      return;
    }

const dataToSend = {
  name: formData.nombre,
  email: formData.correo,
  phone: formData.telefono,
  message: formData.mensaje,
};

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) { 
        setSubmitMessage({ type: 'success', text: data.message || '¡Mensaje enviado exitosamente! Te hemos enviado un email de confirmación.' });
        setFormData({ nombre: '', telefono: '', correo: '', mensaje: '' });
        setErrors({});
      } else { 
        setSubmitMessage({ type: 'error', text: data.message || 'Hubo un error al enviar tu mensaje. Inténtalo de nuevo más tarde.' });
        console.error('Error al enviar el formulario:', data.error || data.message);
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet o intenta más tarde.' });
      console.error('Error de conexión o inesperado:', error);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [e.target.name]: undefined 
      }));
    }
  };

  return (
    <div>
      <form className="formulario" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Contactanos llenando todos los campos</legend>
          <div className="contenedor-campos">
            <div className="campo">
              <label htmlFor="nombre">Nombre</label>
              <input
                className="input-text"
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <p className="error">{errors.nombre}</p>}
            </div>

            <div className="campo">
              <label htmlFor="telefono">Teléfono</label>
              <input
                className="input-text"
                type="tel"
                id="telefono"
                name="telefono"
                placeholder="Tu Número de Celular"
                value={formData.telefono}
                onChange={handleChange}
              />
              {errors.telefono && <p className="error">{errors.telefono}</p>}
            </div>

            <div className="campo">
              <label htmlFor="correo">Tu correo</label>
              <input
                className="input-text"
                type="email"
                id="correo"
                name="correo"
                placeholder="Tu Correo"
                value={formData.correo}
                onChange={handleChange}
              />
              {errors.correo && <p className="error">{errors.correo}</p>}
            </div>

            <div className="campo">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea
                className="input-text"
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
              ></textarea>
              {errors.mensaje && <p className="error">{errors.mensaje}</p>}
            </div>
          </div>

          <div className="alinear-derecha">
            <input
              className="boton"
              type="submit"
              value={isLoading ? 'Enviando...' : 'Enviar'}
              disabled={isLoading}
            />
          </div>
        </fieldset>

        {submitMessage && (
          <p className={submitMessage.type === 'success' ? 'success-message' : 'error-message'}>
            {submitMessage.text}
          </p>
        )}
      </form>
    </div>
  );
}

export default ContactForm;