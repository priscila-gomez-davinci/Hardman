// src/components/UsersABM/UserForm.jsx (Ejemplo de estructura)

import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

// Podrías necesitar obtener los roles disponibles de la API
// Si no los obtienes de la API, deberías definirlos aquí estáticamente para el <Form.Select>
const MOCK_ROLES = [ // MOCK, idealmente se obtiene de la API
  { id: 1, name: 'admin' },
  { id: 2, name: 'tecnico' },
  { id: 3, name: 'cliente' },
];

function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    lastName: '',
    email: '',
    password: '', // Campo para la contraseña (solo en el formulario, no la vas a mostrar)
    phone: '',
    address: '',
    city: '',
    province: '',
    isActive: true, // Por defecto activo
    roleId: '', // Debe ser el ID numérico del rol
    // roleName: '', // Si también quieres mostrar el nombre del rol en el formulario, aunque roleId es lo que envías al backend
  });

  useEffect(() => {
    if (user) {
      // Mapear user (camelCase de fetchUsers) a formData
      setFormData({
        id: user.id || '',
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // ¡IMPORTANTE! NUNCA pre-llenar la contraseña al editar
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        province: user.province || '',
        isActive: user.isActive || false, // Asegura que sea booleano
        roleId: user.roleId || '',
      });
    } else {
      // Resetear para nuevo usuario
      setFormData({
        id: '', name: '', lastName: '', email: '', password: '',
        phone: '', address: '', city: '', province: '',
        isActive: true, roleId: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // `formData` será enviado a handleSaveUser
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formName">
          <Form.Label>Nombre</Form.Label>
          <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
        </Form.Group>
        <Form.Group as={Col} controlId="formLastName">
          <Form.Label>Apellido</Form.Label>
          <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group as={Col} controlId="formPassword">
          <Form.Label>Contraseña {formData.id ? '(dejar en blanco para no cambiar)' : ''}</Form.Label>
          <Form.Control type="password" name="password" value={formData.password} onChange={handleChange}
            required={!formData.id} // Requerido solo para nuevo usuario
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formPhone">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </Form.Group>
        <Form.Group as={Col} controlId="formAddress">
          <Form.Label>Dirección</Form.Label>
          <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formCity">
          <Form.Label>Ciudad</Form.Label>
          <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} />
        </Form.Group>
        <Form.Group as={Col} controlId="formProvince">
          <Form.Label>Provincia</Form.Label>
          <Form.Control type="text" name="province" value={formData.province} onChange={handleChange} />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formRole">
          <Form.Label>Rol</Form.Label>
          {/* Idealmente esto sería un select dinámico de roles de la DB */}
          <Form.Control
            as="select" // Usa un select para roles
            name="roleId"
            value={formData.roleId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un rol</option>
            {MOCK_ROLES.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group as={Col} controlId="formIsActive">
          <Form.Check
            type="checkbox"
            label="Usuario Activo"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
        </Form.Group>
      </Row>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="primary" type="submit">
          {formData.id ? 'Guardar Cambios' : 'Agregar Usuario'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
}

export default UserForm;