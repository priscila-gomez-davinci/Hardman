import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import ProductList from '../ProductList/ProductList';
import ProductForm from './ProductForm';

const API_URL = 'http://localhost:5001/products'; // Replica esto pero con /products Lucas

function ProductManagementPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError('Error al cargar productos: ' + err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (productToSave) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      let method;
      let url;
      let bodyData = { ...productToSave };

      if (productToSave.id) {
        method = 'PUT';
        url = `${API_URL}/${productToSave.id}`;
      } else {
        method = 'POST';
        url = API_URL;

        // Esto resuelve el error de counting de los ids para que sean consecutivos
        const maxId = products.reduce((max, user) => Math.max(max, Number(user.id)), 0);
        bodyData.id = String(maxId + 1); 
      }

      response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchProducts(); 
      setShowForm(false); 
      setEditingProduct(null); 
    } catch (err) {
      setError('Error al guardar producto: ' + err.message);
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchProducts();
    } catch (err) {
      setError('Error al eliminar producto: ' + err.message);
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <Container className="my-5">
      <h1 className="mb-4 text-center">Gestión de productos (ABM)</h1>

      {loading && <div className="text-center"><Spinner animation="border" role="status"><span className="visually-hidden">Cargando...</span></Spinner></div>}
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex justify-content-end mb-3">
        <Button onClick={() => { setShowForm(true); setEditingProduct(null); }}>
          Agregar Nuevo Producto
        </Button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 border rounded bg-light">
          <h3>{editingProduct ? 'Editar Producto' : 'Agregar Producto'}</h3>
        <ProductForm products={editingProduct} onSave={handleSaveProduct} onCancel={handleCancelForm} />
        </div>
      )}

      {!loading && !error && (
        <ProductList products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
      )}
    </Container>
  );
}

export default ProductManagementPage;