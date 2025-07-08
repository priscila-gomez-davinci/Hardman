import React, { useState } from 'react';
import '/src/contact.css';

function ContactForm() {
const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
    mensaje: ''
  });

  //validation errors state
  const [errors, setErrors] = useState({});
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

const handleSubmit = (e) => {
  e.preventDefault();

  if (!validateForm()) {
    console.log('Errores en el formulario:', errors);
    return;
  }

  console.log('Formulario enviado correctamente:', formData);

  // Resetear formulario
  setFormData({ nombre: '', telefono: '', correo: '', mensaje: '' });
  setErrors({});
};


   const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
              value="Enviar"
            />
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default ContactForm;