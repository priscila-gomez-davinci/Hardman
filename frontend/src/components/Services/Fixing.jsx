import React, { useState } from 'react';
import '/src/fixing.css';

function FixingForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    tipoEquipo: '',
    problema: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!formData.tipoEquipo.trim()) newErrors.tipoEquipo = 'Selecciona un tipo de equipo';
    if (!formData.problema.trim()) newErrors.problema = 'Describí el problema';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    console.log('Solicitud de reparación enviada:', formData);
    setFormData({ nombre: '', telefono: '', tipoEquipo: '', problema: '' });
    setErrors({});
  };

  return (
    <form className="formulario" onSubmit={handleSubmit}>
      <h2>Solicitud de Reparación</h2>
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
    <label htmlFor="tipoEquipo">Tipo de equipo</label>
    <select
      id="tipoEquipo"
      name="tipoEquipo"
      value={formData.tipoEquipo}
      onChange={handleChange}
    >
      <option value="">-- Seleccionar --</option>
      <option value="PC">PC</option>
      <option value="Notebook">Notebook</option>
      <option value="Otro">Otro</option>
    </select>
  {errors.tipoEquipo && <p className="error">{errors.tipoEquipo}</p>}
</div>

  <div className="campo">
    <label htmlFor="problema">Descripción del problema</label>
    <textarea
      id="problema"
      name="problema"
      value={formData.problema}
      onChange={handleChange}
  />
  {errors.problema && <p className="error">{errors.problema}</p>}
  </div>
</div>

      <div className="alinear-derecha">
        <button className="boton" type="submit">Enviar</button>
      </div>
    </form>
  );
}

export default FixingForm;