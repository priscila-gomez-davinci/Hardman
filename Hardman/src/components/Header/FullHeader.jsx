import React from 'react';
import { Navbar, Container, Nav, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';

function FullHeader() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg"> {/* 'variant="dark"' para texto blanco sobre fondo oscuro */}
      <Container>
        <Navbar.Brand href="#home">
          <img
            src="../../assets/hardman-logo.png" 
            width="30"
            height="30"
            className="d-inline-block align-top"
            alt="React Bootstrap logo"
          />
          Mi App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" /> {/* Botón para el menú colapsable */}
        <Navbar.Collapse id="basic-navbar-nav"> {/* Contenedor de los elementos colapsables */}
          <Nav className="me-auto"> {/* 'me-auto' para empujar los elementos a la derecha */}
            <Nav.Link href="#home">Inicio</Nav.Link>
            <Nav.Link href="#features">Características</Nav.Link>
            <NavDropdown title="Servicios" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Servicio 1</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Servicio 2</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Algo más</NavDropdown.Item>
              <NavDropdown.Divider /> {/* Separador */}
              <NavDropdown.Item href="#action/3.4">Enlace Separado</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#contact" disabled>Contacto (próximamente)</Nav.Link> 
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