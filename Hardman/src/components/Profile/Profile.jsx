import React from 'react';
import ProfileCard from '../ProfileCard/ProfileCard';
import ProductCard from '../ProductCard/ProductCard';
import products from '../../data/products';


const Profile = () => {
  return (
    <div className="container">
      <h2 className="text-center mt-4">Mi Perfil</h2>
    <ProfileCard />
      <div className="row mt-4">
        {products.slice(0, 3).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Profile;
