import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner,Modal,Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; 
import ProductCardService from '../ProductCard/ProductCard';
import { useAuth } from '../../context/AuthContext';
import Cart from '../Cart/Cart';

const API_URL = 'http://localhost:5001/products';

const ProductList = ({
  cartItems = [],
  handleAddToCart,
  handleRemoveFromCart,
  handleIncreaseQuantity,
  handleDecreaseQuantity,
  setCartItems
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  
  
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError('Error cargando productos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  const totalCartValue = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/${product.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Error al eliminar');
      
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (error) {
      alert('Error al eliminar el producto');
      console.error(error);
    }
  };
  
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };
  
  const saveEditedProduct = async () => {
    try {
      const res = await fetch(`${API_URL}/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      
      if (!res.ok) throw new Error('Error al editar');
      
      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setShowEditModal(false);
  } catch (error) {
    alert('Error al guardar los cambios');
    console.error(error);
  }
};


const handleGoToCheckout = () => {
  navigate('/checkout');
};

if (loading) return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando...</span></Spinner>;
if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;

return (
    <Container className="py-4">

      {user?.role === 'user' && (
        <section className="text-center mb-4">
        <h1>Arma tu carrito con nuestros componentes</h1>
      </section>
      )}
      <Row>
        <Col md={8}>
          <h2>Productos Disponibles</h2>
          <Row>
            {products.map((product) => (
              <ProductCardService
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </Row>
        </Col>
      {user?.role === 'user' && (
        <Col md={4}>
          <h2>Tu Carrito de Compras</h2>
          <Cart
            cartItems={cartItems}
            onRemoveFromCart={handleRemoveFromCart}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            totalCartValue={totalCartValue}
          />
          <div className="d-flex gap-3 mt-3">
            <Button
              variant="success"
              disabled={cartItems.length === 0}
              onClick={handleGoToCheckout}
            >
              Comprar Ahora
            </Button>
            <Button
              variant="outline-danger"
              onClick={() => setCartItems([])}
              disabled={cartItems.length === 0}
            >
              Vaciar Carrito
            </Button>
          </div>
        </Col>
      )}
      </Row>
      {showEditModal && editingProduct && (
  <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Editar Producto</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group>
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            value={editingProduct.name}
            onChange={(e) =>
              setEditingProduct({ ...editingProduct, name: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group className="mt-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            value={editingProduct.description}
            onChange={(e) =>
              setEditingProduct({
                ...editingProduct,
                description: e.target.value,
              })
            }
          />
        </Form.Group>
                <Form.Group className="mt-3">
          <Form.Label>Categoría</Form.Label>
          <Form.Control
            type="text"
            value={editingProduct.categoria}
            onChange={(e) =>
              setEditingProduct({
                ...editingProduct,
                categoria: e.target.value,
              })
            }
          />
        </Form.Group>
                <Form.Group className="mt-3">
          <Form.Label>URL</Form.Label>
          <Form.Control
            type="text"
            value={editingProduct.image}
            onChange={(e) =>
              setEditingProduct({
                ...editingProduct,
                image: e.target.value,
              })
            }
          />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            type="number"
            value={editingProduct.price}
            onChange={(e) =>
              setEditingProduct({
                ...editingProduct,
                price: parseFloat(e.target.value),
              })
            }
          />
        </Form.Group>
                <Form.Group className="mt-3">
          <Form.Label>Stock</Form.Label>
          <Form.Control
            type="number"
            value={editingProduct.stock}
            onChange={(e) =>
              setEditingProduct({
                ...editingProduct,
                stock: parseFloat(e.target.value),
              })
            }
          />
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowEditModal(false)}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={saveEditedProduct}>
        Guardar Cambios
      </Button>
    </Modal.Footer>
  </Modal>
)}

    </Container>
  );
};

export default ProductList;
