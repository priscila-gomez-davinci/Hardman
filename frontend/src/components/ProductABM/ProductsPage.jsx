import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProductList from '../ProductList/ProductList';

function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('http://localhost:3000/products')
        .then(res => res.json())
        .then(data => setProducts(data));
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <p>No autorizado</p>;
  }


  return <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />;
}

export default ProductsPage;