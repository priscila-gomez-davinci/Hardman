import React from 'react';
import { Container, Row, Col, Form, FormControl, Button } from 'react-bootstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Para iconos de redes sociales

function Footer() {
  const currentYear = new Date().getFullYear(); // Obtiene el año actual automáticamente

  return (
    <footer className="bg-dark text-white pt-4 pb-2 mt-5">
      <Container>
        <Row className="justify-content-center text-center text-md-start"> 
          <Col md={4} className="mb-3"> 
            <h5>Hardman</h5>
            <p className="text-secondary"> 
              Lucas Habilita el Shawarma
              <br />
              Calle Falsa 123, Buenos Aires, Argentina.
            </p>
            <p className="text-secondary mb-0">
              © {currentYear} Hardman.
            </p>
          </Col>

          <Col md={2} className="mb-3">
            <h5>Enlaces Rápidos</h5>
            <ul className="list-unstyled"> 
              <li><a href="/acerca" className="text-white text-decoration-none">Acerca de</a></li>
              <li><a href="/servicios" className="text-white text-decoration-none">Servicios</a></li>
              <li><a href="/contacto" className="text-white text-decoration-none">Contacto</a></li>
              <li><a href="/privacidad" className="text-white text-decoration-none">Política de Privacidad</a></li>
            </ul>
          </Col>

          <Col md={3} className="mb-3">
            <h5>Síguenos</h5>
            <div className="d-flex justify-content-center justify-content-md-start gap-3"> 
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white fs-4"><FaLinkedin /></a>
            </div>
          </Col>

          <Col md={3} className="mb-3">
            <h5>Newsletter</h5>
            <p className="text-secondary">Mantente al día con nuestras últimas noticias.</p>
            <Form>
              <FormControl type="email" placeholder="Tu email" className="mb-2" />
              <Button variant="primary" type="submit" className="w-100">Suscribirse</Button>
            </Form>
          </Col>
        </Row>

        <hr className="bg-secondary my-4" /> {/* Línea horizontal con margen */}
        <Row>
          <Col className="text-center text-secondary">
            <small>Diseñado por alguien que no sabe de diseño</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;