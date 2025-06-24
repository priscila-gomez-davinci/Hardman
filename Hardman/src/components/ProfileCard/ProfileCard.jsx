import {Badge,Col,Card,Image,Row,Button,Stack}  from 'react-bootstrap';
import usuarioJPG from '../../assets/usuario.jpg';

const ProfileCard = () => {
  const user = [
    {
      id: 'usuario001',
      name: 'La Abuela',
      rol: ' Alimentar'
    }
  ];
  return (
    <Card className="p-4 shadow-sm">
      <Row className="align-items-center">
        <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
          <Image src={usuarioJPG} roundedCircle fluid style={{ maxWidth: '150px' }} />
        </Col>
        <Col xs={12} md={8}>
          <h2 className="mb-1">Bienvenido</h2>
          <h4 className="mb-2">{user[0].name}</h4>
          <Badge bg="info" text="dark" className="px-3 py-2 mb-3">
            Rol: {user[0].rol}
          </Badge>
          <Stack direction="horizontal" gap={2} className="flex-wrap">
            <Button variant="outline-primary">Modificar Perfil</Button>
            <Button variant="outline-secondary">Mi Carrito</Button>
          </Stack>
        </Col>
      </Row>
    </Card>
  );
}

export default ProfileCard;