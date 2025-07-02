import { useState, useEffect } from 'react';
import ProfileCard from '../ProfileCard/ProfileCard';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user: authUser } = useAuth();

  const [user, setUser] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    if (authUser) {
      setUser({
        name: authUser.name || '',
        email: authUser.email || '',
        role: authUser.role || ''
      });
    }
  }, [authUser]);

  if (!authUser) {
    return <p>No hay usuario autenticado</p>;
  }

  return (
    <div className="container">
      <h2 className="text-center mt-4">Mi Perfil</h2>
      
      <ProfileCard user={user} setUser={setUser} />

      {/* Resto del componente */}
    </div>
  );
};

export default Profile;
