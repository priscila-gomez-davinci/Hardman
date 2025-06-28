import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/home/Home';
import ContactForm from './components/ContactForm/ContactForm'
import Building from './components/Services/Building';
import Fixing from './components/Services/Fixing'; 
import ProductList from './components/ProductList/ProductList'; 
import Header from './components/Header/FullHeader'; 
import Footer from './components/Footer/Footer'; 
import Profile from './components/Profile/Profile';
import Manage from './components/Manage/Manage';
import News from './components/News/News';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const ProductsPage = () => {
  return (
    <div className="container mt-4">
      <h2>Nuestros Productos</h2>
      <p>Aquí encontrarás una lista de todos nuestros productos.</p>
    </div>
  );
};

const ContactPage = () => {
  return (
    <div className="container mt-4">
      <h2>Contáctanos</h2>
      <p>Envíanos un mensaje o encuentra nuestra información de contacto aquí.</p>
    </div>
  );
};

function App() {
  return (
    <Router> 
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<ContactForm />} /> 
          <Route path="/building" element={<Building />} /> 
          <Route path="/fixing" element={<Fixing />} /> 
          <Route path="/productos" element={<ProductList />} />   
          <Route path="/perfil" element={<Profile />} /> 
          <Route path="/administrar" element={<Manage />} /> 
          <Route path="/noticias" element={<News/>}/>       
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;