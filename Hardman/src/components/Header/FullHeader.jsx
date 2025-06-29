import React from 'react';
import logo from '../../assets/hardman-logo.png';
import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Importa Link de react-router-dom
import { FaShoppingCart } from 'react-icons/fa';

function FullHeader({ totalItemsInCart }) {
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
            {/* Reemplaza LinkContainer por Link y usa Nav.Link como hijo */}
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/productos">Productos</Nav.Link>

            <NavDropdown title="Servicios" id="basic-nav-dropdown">

              <NavDropdown.Item href="/building">Armado</NavDropdown.Item>
              <NavDropdown.Item href="/fixing">Reparación</NavDropdown.Item>

            </NavDropdown>

            <Nav.Link as={Link} to="/contacto">Contacto</Nav.Link>
            <Nav.Link as={Link} to="/noticias">Noticias</Nav.Link>
            <Nav.Link as={Link} to="/perfil">Perfil</Nav.Link>
            <Nav.Link as={Link} to="/administrar">Administrar</Nav.Link>
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