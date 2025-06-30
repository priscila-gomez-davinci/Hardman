import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: 0,
    image: '', 
    description: '',
    category: '',
    stock: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        id: '',
        name: '',
        price: 0,
        image: '',
        description: '',
        category: '',
        stock: 0,
      }); 
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
        if (name === 'price') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseFloat(value), // Aseguramos que 'price' sea un número
      });
    } else if (name === 'stock') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseInt(value, 10), // Aseguramos que 'stock' sea un entero
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
            placeholder="Introduce el nombre del producto"
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="formPrice">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Introduce el precio del producto"
            required
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formStock">
          <Form.Label>Stock</Form.Label>
          <Form.Control
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Cantidad en stock"
            required
          />
        </Form.Group>

        <Form.Group as={Col} controlId="formCategory">
          <Form.Label>Categoría</Form.Label>
          <Form.Control
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Introduce la categoría del producto"
            required
          />
        </Form.Group>
      </Row>

      <Form.Group className="mb-3" controlId="formDescription">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          as="textarea"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Introduce la descripción del producto"
          required
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="formImage">
        <Form.Label>Ingresar URL de imagen del producto</Form.Label>
        <Form.Control
          type="text"
          name="image"
          onChange={handleChange}
          required
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="primary" type="submit">
          {product ? 'Guardar Cambios' : 'Agregar Producto'}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Form>
  );
}

export default ProductForm;