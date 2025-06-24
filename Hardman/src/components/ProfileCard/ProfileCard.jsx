import { Badge, Col, Card, Image, Row, Button, Stack } from 'react-bootstrap';
import usuarioJPG from '../../assets/usuario.jpg';

const ProfileCard = ({ user, actionLabel = "Modificar Perfil", showCart = true }) => {
  return (
    <Card className="p-4 shadow-sm mb-3">
      <Row className="align-items-center">
        <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
          <Image src={usuarioJPG} roundedCircle fluid style={{ maxWidth: '150px' }} />
        </Col>
        <Col xs={12} md={8}>
          <h4 className="mb-2">{user.name}</h4>
          <Badge bg="info" text="dark" className="px-3 py-2 mb-3">
            Rol: {user.rol}
          </Badge>
          <Stack direction="horizontal" gap={2} className="flex-wrap">
            <Button variant="outline-primary">{actionLabel}</Button>
            {showCart && (
              <Button variant="outline-secondary">Mi Carrito</Button>
            )}
          </Stack>
        </Col>
      </Row>
    </Card>
  );
};


export default ProfileCard;