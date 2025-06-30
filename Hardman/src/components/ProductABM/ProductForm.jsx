import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

function ProductForm({ products, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    image: '', 
    description: '',
    category: '',
    stock: '',
  });

  useEffect(() => {
    if (products) {
      setFormData(products);
    } else {
      setFormData({ id: '', name: '', price: '', image: '', description: '',category: '',stock: '' }); 
    }
  }, [products]);

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
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Introduce el email"
            required
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formPassword">
        <Form.Label>Foto de producto</Form.Label>
        <Form.Control
          type="image" 
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Introduce la contraseña"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formRole">
        <Form.Label>Rol</Form.Label>
        <Form.Select name="role" value={formData.category} onChange={handleChange} required>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
          <option value="editor">Editor</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="primary" type="submit">
          {products ? 'Guardar Cambios' : 'Agregar Usuario'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
}

export default ProductForm;