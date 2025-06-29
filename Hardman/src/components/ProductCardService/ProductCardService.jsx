import React from 'react';
import { Button } from 'react-bootstrap';
import '../../assets/ProductCardService.css';

const ProductCardService = ({ product, onSelect, selectedProduct }) => {
  const isSelected = selectedProduct?.category === product.category;
  const isSameCategory = selectedProduct && selectedProduct.category === product.category;
  const isDisabled = selectedProduct && isSameCategory && !isSelected;

  return (
    <div className={`col-md-4 mb-4`}>
      <div className={`card h-100 ${isSelected ? 'border-primary shadow' : ''} ${isDisabled ? 'disabled-card' : ''}`}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{ height: '200px', objectFit: 'contain', padding: '10px' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text">{product.description}</p>
          <div className="mt-auto">
            <p className="card-text"><strong>${product.price.toFixed(2)}</strong></p>
            <p className="card-text text-muted small">Stock: {product.stock}</p>
            <Button onClick={() => onSelect(product)} disabled={isDisabled}>
              {isSelected ? 'Seleccionado' : 'Seleccionar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCardService;
