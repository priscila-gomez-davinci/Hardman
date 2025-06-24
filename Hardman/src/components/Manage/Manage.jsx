import users from '../../data/users';
import ProfileCard from '../ProfileCard/ProfileCard';

const Manage = () => {
  return (
    <div className="container">
      <h2 className="text-center mt-4">Administrar</h2>
      <div className="row">
        {users.map((user) => (
        <ProfileCard key={user.id} user={user} actionLabel="Gestionar" showCart={false} />
        ))}
      </div>
    </div>
  );
};

export default Manage;
