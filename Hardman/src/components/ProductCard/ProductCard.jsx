import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="col-md-4 mb-4"> 
      <div className="card h-100"> 
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{ height: '200px', objectFit: 'contain', padding: '10px' }} 
        />
        <div className="card-body d-flex flex-column"> 
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text">{product.description}</p>
          <div className="mt-auto"> {/* Push price and button to bottom */}
            <p className="card-text"><strong>${product.price.toFixed(2)}</strong></p>
            <p className="card-text text-muted small">Stock: {product.stock}</p>
            <button className="btn btn-primary w-100 mt-2">Agregar al Carrito</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;