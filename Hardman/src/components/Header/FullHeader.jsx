import React from 'react';
import logo from '../../assets/hardman-logo.png';
import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';

function FullHeader() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg"> {/* 'variant="dark"' para texto blanco sobre fondo oscuro */}
      <Container>
        <Navbar.Brand href="/">
          <img
            src={logo} 
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav"> 
          <Nav className="me-auto"> 
            <Nav.Link href="#home">Inicio</Nav.Link>
            <Nav.Link href="/productos">Productos</Nav.Link>
            <NavDropdown title="Servicios" id="basic-nav-dropdown">
              <NavDropdown.Item href="/building">Armado</NavDropdown.Item>
              <NavDropdown.Item href="/fixing">Reparación</NavDropdown.Item>
            </NavDropdown>
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
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default FullHeader;