import React from 'react';
import logo from '../../assets/hardman-logo.png';
import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';


function FullHeader({ totalItemsInCart }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="Hardman Logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/productos">Productos</Nav.Link>

            <NavDropdown title="Servicios" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/fixing">Reparación</NavDropdown.Item>
            </NavDropdown>

            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>

            {/* Solo mostrar "Registrarse" si NO hay usuario logueado */}
            {!user && <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>}

            {/* Solo mostrar "Perfil" si hay usuario logueado */}
            {user && <Nav.Link as={Link} to="/perfil">Perfil</Nav.Link>}

            {/* Dropdown solo para admin */}
            {user && user.role === 'admin' && (
              <NavDropdown title="Administrador" id="admin-nav-dropdown">
                <NavDropdown.Item as={Link} to="/users">Gestión de usuarios</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/administrarProductos">Gestión de productos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/administrarPedidos">Gestión de carritos</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/administrarReparaciones">Gestión de reparaciones</NavDropdown.Item>
              </NavDropdown>
            )}

            {user ? ( 
              <Nav.Link as="button" onClick={handleLogout} style={{ border: 'none', background: 'none' }}>
                Cerrar sesión
              </Nav.Link>
            ) : ( 
              <Nav.Link as={Link} to="/login">
                Iniciar sesión
              </Nav.Link>
            )}
          </Nav>

          <Form className="d-flex">
            <FormControl
              type="search"
              placeholder="Buscar..."
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-success">Buscar</Button>
          </Form>

          {/* Cart Icon and Count */}
          <Nav>
            <Nav.Link as={Link} to="/checkout" className="d-flex align-items-center ms-3">
              <FaShoppingCart size={20} className="me-1" />
              Carrito <Badge pill bg="primary" className="ms-1">{totalItemsInCart}</Badge>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default FullHeader;