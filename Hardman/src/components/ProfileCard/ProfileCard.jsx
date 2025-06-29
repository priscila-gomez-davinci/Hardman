import { useState } from 'react';
import { Badge, Col, Card, Image, Row, Button, Stack, Modal, Form } from 'react-bootstrap';
import usuarioJPG from '../../assets/usuario.jpg';

const ProfileCard = ({ user, setUser, onDelete, actionLabel = "Modificar Perfil", showCart = true }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    surname: user.surname,
    email: user.email,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (setUser) setUser(formData);
    setShowModal(false);
  };

  return (
    <>
      <Card className="p-4 shadow-sm mb-3">
        <Row className="align-items-center">
          <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
            <Image src={usuarioJPG} roundedCircle fluid style={{ maxWidth: '150px' }} />
          </Col>
          <Col xs={12} md={8}>
            <h4 className="mb-2">{user.name} {user.surname}</h4>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <Badge bg="info" text="dark" className="px-3 py-2 mb-3">
              Rol: {user.rol}
            </Badge>
            <Stack direction="horizontal" gap={2} className="flex-wrap">
              {actionLabel === "Gestionar" ? (
                <>
                  <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                    Editar
                  </Button>
                  <Button variant="outline-danger" onClick={onDelete}>
                    Eliminar
                  </Button>
                </>
              ) : (
                <Button variant="outline-primary" onClick={() => setShowModal(true)}>
                  {actionLabel}
                </Button>
              )}
              {showCart && <Button variant="outline-secondary">Mi Carrito</Button>}
            </Stack>
          </Col>
        </Row>
      </Card>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modificar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProfileCard;
