import { useState } from 'react';
import ProfileCard from '../ProfileCard/ProfileCard';
import users from '../../data/users';

const Profile = () => {
  const [user, setUser] = useState({
    name: users[0].nombre,
    surname: users[0].apellido,
    email: users[0].email,
    rol: users[0].id_rol,
  });

  return (
    <div className="container">
      <h2 className="text-center mt-4">Mi Perfil</h2>
      
      <ProfileCard user={user} setUser={setUser} />

      {/* <h3 className="mt-5">Mis productos recientes</h3>
      <div className="row mt-4">
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))} 
      </div> */}
    </div>
  );
};

export default Profile;
