import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repairs from './pages/Repairs';
import Stock from './pages/Stock';
import RepairDetail from './pages/RepairDetail';
import VeloHistorique from './pages/VeloHistorique';
import ClientLogin from './pages/ClientLogin';
import ClientDashboard from './pages/ClientDashboard';
import ChatIA from './pages/ChatIA';
import Techniciens from './pages/Techniciens';
import Fournisseurs from './pages/Fournisseurs';
import Rapports from './pages/Rapports';


// Vérifie juste si connecté (atelier)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Réservé au technicien uniquement
const TechnicienRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" />;
  if (user.role !== 'technicien') return <Navigate to="/" />;
  return children;
};

// Réservé au responsable uniquement
const ResponsableRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" />;
  if (user.role !== 'responsable') return <Navigate to="/" />;
  return children;
};

// Réservé au client uniquement
const ClientRoute = ({ children }) => {
  const token = localStorage.getItem('client_token');
  return token ? children : <Navigate to="/client" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public atelier */}
        <Route path="/login" element={<Login />} />

        {/* Public client */}
        <Route path="/client" element={<ClientLogin />} />

        {/* Espace client */}
        <Route path="/client/dashboard" element={<ClientRoute><ClientDashboard /></ClientRoute>} />

        {/* Commun aux deux rôles atelier */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Technicien uniquement */}
        <Route path="/repairs" element={<TechnicienRoute><Repairs /></TechnicienRoute>} />
        <Route path="/repairs/:id" element={<TechnicienRoute><RepairDetail /></TechnicienRoute>} />
        <Route path="/velos/:id/historique" element={<TechnicienRoute><VeloHistorique /></TechnicienRoute>} />
        <Route path="/chat" element={<TechnicienRoute><ChatIA /></TechnicienRoute>} />

        {/* Responsable uniquement */}
        <Route path="/stock" element={<ResponsableRoute><Stock /></ResponsableRoute>} />
        <Route path="/techniciens" element={<ResponsableRoute><Techniciens /></ResponsableRoute>} />
        
       <Route path="/fournisseurs" element={<ResponsableRoute><Fournisseurs /></ResponsableRoute>} />
       <Route path="/rapports" element={<ResponsableRoute><Rapports /></ResponsableRoute>} />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;