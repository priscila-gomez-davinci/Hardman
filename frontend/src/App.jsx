import React from 'react'; // Ya no necesitamos useState aquí
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import ContactForm from './components/ContactForm/ContactForm';
import Building from './components/Services/Building';
import Fixing from './components/Services/Fixing';
import ProductList from './components/ProductList/ProductList'; // ProductList ahora gestiona su propio carrito
import Header from './components/Header/FullHeader'; // Header ya no recibe props de carrito de aquí
import Footer from './components/Footer/Footer';
import Profile from './components/Profile/Profile';
import Checkout from './components/Checkout/Checkout'; // Checkout ahora obtendrá el carrito de useLocation
import UserManagementPage from './components/UsersABM/UserManagementPage';
import ProductManagementPage from './components/ProductABM/ProductManagementPage.jsx';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import PublicOnlyRoute from './routes/PublicOnlyRoute';
import NotFound from './routes/NotFound.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function App() {

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contacto" element={<ContactForm />} />
            <Route path="/building" element={<Building />} />
            <Route path="/fixing" element={<Fixing />} />

            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

            <Route
              path="/productos"
              element={
                <ProductList
                />
              }
            />

            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <Checkout
                  />
                </PrivateRoute>
              }
            />
            <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />

            <Route
              path="/users"
              element={
                <PrivateRoute roles={['admin']}>
                  <UserManagementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/administrarProductos"
              element={
                <PrivateRoute roles={['admin']}>
                  <ProductManagementPage />
                </PrivateRoute>
              }
            />

            {/* Ruta comodín para 404 (siempre al final) */}
            <Route path="/notfound" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;