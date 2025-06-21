import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import products from '../../data/products';

const ProductList = () => {
  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Nuestro Catálogo de Hardware</h1>
      <div className="row">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;