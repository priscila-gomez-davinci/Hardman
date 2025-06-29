import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '', 
    role: 'user',
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({ id: '', name: '', email: '', password: '', role: 'user' }); 
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formName">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Introduce el nombre"
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Introduce el email"
            required
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Contraseña</Form.Label>
        <Form.Control
          type="password" 
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Introduce la contraseña"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formRole">
        <Form.Label>Rol</Form.Label>
        <Form.Select name="role" value={formData.role} onChange={handleChange} required>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="editor">Editor</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="primary" type="submit">
          {user ? 'Guardar Cambios' : 'Agregar Usuario'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
}

export default UserForm;