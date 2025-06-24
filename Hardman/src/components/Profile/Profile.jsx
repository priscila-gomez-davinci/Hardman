import ProfileCard from '../ProfileCard/ProfileCard';
import ProductCard from '../ProductCard/ProductCard';
//import products from '../../data/products';
import users from '../../data/users';
const Profile = () => {
  const currentUser = users[0];

  return (
    <div className="container">
      <h2 className="text-center mt-4">Mi Perfil</h2>
      
      <ProfileCard user={currentUser} />

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
