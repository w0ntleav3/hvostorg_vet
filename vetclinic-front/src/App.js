import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import AdminMainPage from './pages/Admin_main_page/Admin_main_page';
import Clients from './pages/Clients/ClientDashboard';
import Login from './pages/Login/Login';
import ServicesPage from './pages/Services/ServicesPage';
import Register from './pages/Register/Register';
import ClientDashboard from './pages/Clients/ClientDashboard';
import AdminClientDashboard from './pages/AdminClientDashboard/AdminClientDashboard';
import AdminPetMedCard from './pages/AdminPetMedCard/AdminPetMedCard';
import ContactsPage from './pages/Contacts_page/ContactsPage.js';
import VetMainPage from './pages/VetMainPage/VetMainPage.js';
import VetClientDashboard from './pages/VetClientDashboard/VetClientDashboard.js';

import ProtectedRoute from './ProtectedRoute.jsx';
import AdminVets from './pages/AdminVets/AdminVets.js';
import { AuthProvider } from './contexts/AuthContext';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<ProtectedRoute role={1}><AdminMainPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ClientDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/clients/:id" element={<ProtectedRoute role={1}><AdminClientDashboard /></ProtectedRoute>} />
          <Route path="/admin/pet/:id_pet" element={<ProtectedRoute role={1}><AdminPetMedCard /></ProtectedRoute>} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/vet" element={<VetMainPage />} />
          <Route path="/vet/clients/:id" element={<ProtectedRoute role={2}><VetClientDashboard /></ProtectedRoute>} />


        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
