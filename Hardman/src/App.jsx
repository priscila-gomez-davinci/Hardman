import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Home from './components/home/Home';
import ContactForm from './components/ContactForm/ContactForm';
import Building from './components/Services/Building';
import Fixing from './components/Services/Fixing';
import ProductList from './components/ProductList/ProductList';
import Header from './components/Header/FullHeader'; 
import Footer from './components/Footer/Footer';
import Profile from './components/Profile/Profile';
import Manage from './components/Manage/Manage';
import News from './components/News/News';
import Checkout from './components/Checkout/Checkout';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function App() {
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (productToAdd) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...productToAdd, quantity: 1 }];
      }
    });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleIncreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCartValue = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItemsInCart = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <div className="App">
        <Header totalItemsInCart={totalItemsInCart} />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<ContactForm />} />
          <Route path="/building" element={<Building />} />
          <Route path="/fixing" element={<Fixing />} />
          <Route
            path="/productos"
            element={
              <ProductList
                cartItems={cartItems}
                setCartItems={setCartItems}
                handleAddToCart={handleAddToCart}
                handleRemoveFromCart={handleRemoveFromCart}
                handleIncreaseQuantity={handleIncreaseQuantity}
                handleDecreaseQuantity={handleDecreaseQuantity}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                cartItems={cartItems}
                totalCartValue={totalCartValue}
                onClearCart={clearCart}
              />
            }
          />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/administrar" element={<Manage />} />
          <Route path="/noticias" element={<News />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;