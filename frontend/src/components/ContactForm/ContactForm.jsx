import React, { useState } from 'react';
import '/src/contact.css'; // Asegúrate de que la ruta a tu CSS sea correcta

function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    mensaje: ''
    // Puedes añadir 'asunto' aquí si lo vas a usar en el frontend,
    // aunque en tu DER no es una columna directa en formulario_contacto,
    // sí lo usamos para el email.
    // asunto: ''
  });

  // validation errors state
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState(null); // Para mensajes de éxito o error del envío
  const [isLoading, setIsLoading] = useState(false); // Para mostrar estado de carga

  // URL base de tu API (ajusta según donde esté corriendo tu backend)
  const API_BASE_URL = 'http://localhost:3000'; // O la URL de tu dominio si ya está desplegado

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
    setSubmitMessage(null); // Limpiar mensajes anteriores
    setIsLoading(true); // Indicar que la petición está en curso

    if (!validateForm()) {
      console.log('Errores en el formulario:', errors);
      setIsLoading(false); // Detener carga si hay errores de validación
      return;
    }

    // Mapear los nombres de los campos del frontend a los nombres esperados por el backend (DER)
    const dataToSend = {
      nombre_cliente: formData.nombre,
      email_cliente: formData.correo,
      telefono: formData.telefono,
      descripcion: formData.mensaje,
      // Si tuvieras un campo de asunto en el frontend, lo pasarías aquí:
      // subject: formData.asunto,
      // Si el usuario estuviera logueado, podrías pasar su ID aquí (ej. id_usuario_rel: userId)
      // id_usuario_rel: localStorage.getItem('userId') || null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Si tu API requiriera un token de autenticación (JWT), lo agregarías aquí:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (response.ok) { // Si la respuesta es exitosa (status 2xx)
        setSubmitMessage({ type: 'success', text: data.message || '¡Mensaje enviado exitosamente! Te hemos enviado un email de confirmación.' });
        // Resetear formulario solo en caso de éxito
        setFormData({ nombre: '', telefono: '', correo: '', mensaje: '' });
        setErrors({});
      } else { // Si la respuesta indica un error (status 4xx, 5xx)
        setSubmitMessage({ type: 'error', text: data.message || 'Hubo un error al enviar tu mensaje. Inténtalo de nuevo más tarde.' });
        console.error('Error al enviar el formulario:', data.error || data.message);
      }
    } catch (error) {
      // Este catch maneja errores de red o errores antes de recibir una respuesta del servidor
      setSubmitMessage({ type: 'error', text: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet o intenta más tarde.' });
      console.error('Error de conexión o inesperado:', error);
    } finally {
      setIsLoading(false); // Siempre detener el estado de carga al finalizar
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar el error específico del campo al que se le está escribiendo
    if (errors[e.target.name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [e.target.name]: undefined // Eliminar el mensaje de error para este campo
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
                placeholder="Lucas queremos shawarma"
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

            {/* Si decides añadir un campo de Asunto en el frontend: */}
            {/*
            <div className="campo">
              <label htmlFor="asunto">Asunto</label>
              <input
                className="input-text"
                type="text"
                id="asunto"
                name="asunto"
                placeholder="Asunto de tu mensaje"
                value={formData.asunto}
                onChange={handleChange}
              />
            </div>
            */}

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
              disabled={isLoading} // Deshabilitar el botón mientras se envía
            />
          </div>
        </fieldset>

        {/* Mensajes de feedback al usuario */}
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