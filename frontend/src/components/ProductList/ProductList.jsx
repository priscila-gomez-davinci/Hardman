import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import ProductCardService from '../ProductCard/ProductCard';
import { useAuth } from '../../context/AuthContext';
import Cart from '../Cart/Cart';

// --- Constantes de URLs de la API ---
const API_PRODUCTS_URL = 'http://localhost:3000/api/products';
const API_CART_URL = 'http://localhost:3000/api/cart';
const API_ORDERS_URL = 'http://localhost:3000/api/orders';

const ProductList = () => {
  // --- Hooks de React ---
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Estados del Componente ---
  // Un único estado de carga que abarque ambas operaciones iniciales
  const [loading, setLoading] = useState(true); // Se inicia en true para la carga inicial de ambos
  const [error, setError] = useState(null);

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);

  // --- Funciones de Lógica y Manejo de Datos ---

  const fetchProducts = useCallback(async () => {
    // Estas funciones internas manejan su propio estado de carga/error temporalmente si es necesario
    // Pero la carga inicial general la maneja el useEffect principal.
    // setLoading(true); // No es necesario aquí si el useEffect principal lo hace
    // setError(null); // No es necesario aquí
    try {
      const res = await fetch(API_PRODUCTS_URL);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error HTTP: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido al cargar productos.'}`);
      }
      const data = await res.json();
      const normalizedProducts = data.productos.map(p => ({
        id: p.id_producto,
        name: p.nombre_producto,
        description: p.descripcion,
        price: parseFloat(p.precio_minorista),
        wholesalePrice: parseFloat(p.precio_mayorista),
        stock: parseInt(p.stock, 10),
        image: p.imagen_url,
        category: p.id_categoria,
        sku: p.sku,
        active: p.activo === 1,
      }));
      setProducts(normalizedProducts);
    } catch (err) {
      setError('Error cargando productos: ' + err.message);
      console.error('Error fetching products:', err);
      // No setea loading a false aquí para que el finally del useEffect principal lo haga
    }
  }, []);

  const fetchOrCreateCart = useCallback(async () => {
    // if (loading) return; // Esta línea podría haber contribuido al problema de dependencias

    // setLoading(true); // No es necesario aquí si el useEffect principal lo hace
    // setError(null); // No es necesario aquí
    try {
      const userIdParam = user ? user.id : 'guest';

      const res = await fetch(`${API_ORDERS_URL}/my-cart/${userIdParam}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al obtener/crear carrito: ${res.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
      }
      const data = await res.json();

      setCartId(data.pedidoId);
      setCartItems(data.cartItems);
      console.log("Carrito cargado/creado con ID:", data.pedidoId, "Items:", data.cartItems);
    } catch (err) {
      setError('Error al gestionar el carrito: ' + err.message);
      console.error('Error fetching/creating cart:', err);
      // No setea loading a false aquí
    }
  }, [user]); // <-- ¡QUITADO 'loading' de las dependencias! Ahora solo depende de 'user'.


  // --- FUNCIONES DEL CARRITO (sin cambios significativos en dependencias, solo en el cuerpo para no tocar 'loading' global) ---

  const handleAddToCart = useCallback(async (productToAdd) => {
    if (!cartId) { alert("El carrito no está listo. Intenta recargar la página."); return; }
    // setLoading(true); setError(null); // Quitar o envolver en un estado local temporal si es para esta acción específica
    try {
      const response = await fetch(API_CART_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_pedido: cartId, id_producto: productToAdd.id, cantidad: 1, }), });
      if (!response.ok) { const errorData = await response.json(); throw new Error(`Error al añadir al carrito: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`); }
      await fetchOrCreateCart();
      alert(`${productToAdd.name} añadido al carrito.`);
    } catch (err) { setError('Error al añadir producto al carrito: ' + err.message); console.error('Error adding to cart:', err); }
    // finally { setLoading(false); } // Quitar
  }, [cartId, fetchOrCreateCart]);


  const handleRemoveFromCart = useCallback(async (itemToRemove) => {
    if (!cartId || !itemToRemove.detalleId) return;
    // setLoading(true); setError(null); // Quitar
    try {
      const response = await fetch(`${API_CART_URL}/${itemToRemove.detalleId}`, { method: 'DELETE', });
      if (!response.ok) { const errorData = await response.json(); throw new Error(`Error al eliminar del carrito: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`); }
      await fetchOrCreateCart();
    } catch (err) { setError('Error al eliminar producto del carrito: ' + err.message); console.error('Error removing from cart:', err); }
    // finally { setLoading(false); } // Quitar
  }, [cartId, fetchOrCreateCart]);


  const handleIncreaseQuantity = useCallback(async (itemToUpdate) => {
    if (!cartId || !itemToUpdate.detalleId) return;
    // setLoading(true); setError(null); // Quitar
    try {
      const response = await fetch(`${API_CART_URL}/${itemToUpdate.detalleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cantidad: itemToUpdate.quantity + 1 }), });
      if (!response.ok) { const errorData = await response.json(); throw new Error(`Error al aumentar cantidad: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`); }
      await fetchOrCreateCart();
    } catch (err) { setError('Error al aumentar cantidad del carrito: ' + err.message); console.error('Error increasing quantity:', err); }
    // finally { setLoading(false); } // Quitar
  }, [cartId, fetchOrCreateCart]);


  const handleDecreaseQuantity = useCallback(async (itemToUpdate) => {
    if (!cartId || !itemToUpdate.detalleId) return;
    if (itemToUpdate.quantity <= 1) { await handleRemoveFromCart(itemToUpdate); return; }
    // setLoading(true); setError(null); // Quitar
    try {
      const response = await fetch(`${API_CART_URL}/${itemToUpdate.detalleId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cantidad: itemToUpdate.quantity - 1 }), });
      if (!response.ok) { const errorData = await response.json(); throw new Error(`Error al disminuir cantidad: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`); }
      await fetchOrCreateCart();
    } catch (err) { setError('Error al disminuir cantidad del carrito: ' + err.message); console.error('Error decreasing quantity:', err); }
    // finally { setLoading(false); } // Quitar
  }, [cartId, fetchOrCreateCart, handleRemoveFromCart]);


  const onClearCart = useCallback(async () => {
    if (!cartId) return;
    if (!window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) return;
    // setLoading(true); setError(null); // Quitar
    try {
      const response = await fetch(`${API_CART_URL}/clear/${cartId}`, { method: 'DELETE', });
      if (!response.ok) { const errorData = await response.json(); throw new Error(`Error al vaciar carrito: ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`); }
      setCartItems([]);
      alert("Carrito vaciado.");
    } catch (err) { setError('Error al vaciar carrito: ' + err.message); console.error('Error clearing cart:', err); }
    // finally { setLoading(false); } // Quitar
  }, [cartId]);


  const handleDeleteProduct = useCallback(async (productToDelete) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${productToDelete.name}"?`)) return;
    // setLoading(true); // Quitar
    // setError(null); // Quitar
    try {
      const response = await fetch(`${API_PRODUCTS_URL}/${productToDelete.id}`, { method: 'DELETE', });
      if (!response.ok) { const errorData = await response.json(); throw new Error(`Error al eliminar: HTTP ${response.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`); }
      await fetchProducts();
      console.log(`Producto ${productToDelete.name} eliminado exitosamente.`);
    } catch (error) { alert('Error al eliminar el producto: ' + error.message); console.error('Error al eliminar el producto:', error); }
    // finally { // setLoading(false); } // Quitar
  }, [fetchProducts]);

  const handleEditProduct = useCallback((product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  }, []);

  const saveEditedProduct = useCallback(async () => {
    // ... (Tu código existente aquí) ...
    // Asegúrate de que no estás llamando a setLoading/setError de manera que afecte el loop
    try {
      // ...
      const res = await fetch(`${API_PRODUCTS_URL}/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_producto: editingProduct.name,
          descripcion: editingProduct.description,
          precio_minorista: parseFloat(editingProduct.price),
          precio_mayorista: editingProduct.wholesalePrice ? parseFloat(editingProduct.wholesalePrice) : null,
          stock: parseInt(editingProduct.stock, 10),
          imagen_url: editingProduct.image,
          sku: editingProduct.sku || null,
          activo: editingProduct.active !== undefined ? (editingProduct.active ? 1 : 0) : 1,
          id_categoria: parseInt(editingProduct.category, 10),
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error al editar: HTTP ${res.status}. Mensaje: ${errorData.message || 'Error desconocido.'}`);
      }
      await fetchProducts();
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      alert('Error al guardar los cambios: ' + error.message);
      console.error('Error al guardar los cambios (frontend catch):', error);
    }
    // finally { // setLoading(false); } // Quitar
  }, [fetchProducts, editingProduct]);

  const handleGoToCheckout = useCallback(() => {
    if (cartId) { navigate('/checkout', { state: { cartId: cartId } }); }
    else { alert("El carrito no está listo. Por favor, intente de nuevo."); }
  }, [navigate, cartId]);


  const totalCartValue = cartItems.reduce( (sum, item) => sum + item.price * item.quantity, 0 );
  const totalItemsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);


  // --- Efectos (useEffect) ---
  // Cargar productos disponibles Y carrito activo al montar el componente
  // Este es el useEffect principal que controla el estado de carga general
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true); // Inicia la carga para ambas operaciones
      setError(null);
      try {
        await fetchProducts(); // Carga productos
        await fetchOrCreateCart(); // Carga o crea el carrito
      } catch (err) {
        // Los errores específicos ya se manejan dentro de cada fetch
        // Aquí puedes poner un error general si algo falla gravemente
        setError('Error al cargar datos iniciales.');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false); // Una vez que ambos terminan, finaliza la carga general
      }
    };

    loadInitialData();
  }, [fetchProducts, fetchOrCreateCart]); // Depende de las funciones memoizadas


  // --- Renderizado Condicional de Carga y Error ---
  if (loading) return <Spinner animation="border" role="status" className="m-5"><span className="visually-hidden">Cargando...</span></Spinner>;
  if (error) return <Alert variant="danger" className="m-5">{error}</Alert>;


  // --- Renderizado Principal (JSX) ---
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
              <Col md={4} key={product.id}>
                <ProductCardService
                  product={product}
                  onAddToCart={handleAddToCart}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
              </Col>
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
              onClearCart={onClearCart}
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
                onClick={onClearCart}
                disabled={cartItems.length === 0}
              >
                Vaciar Carrito
              </Button>
            </div>
          </Col>
        )}
      </Row>

      {/* --- Modal de Edición de Producto --- */}
      {showEditModal && editingProduct && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Producto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value, })} />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Categoría (ID)</Form.Label>
                <Form.Control type="number" value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: parseInt(e.target.value, 10), })} />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>URL de Imagen</Form.Label>
                <Form.Control type="text" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value, })} />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label>Precio Minorista</Form.Label>
                <Form.Control type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value), })} />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10), })} />
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