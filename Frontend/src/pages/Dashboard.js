import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useEco } from '../EcoContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { ecoMode, toggleEco } = useEco();

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">🚲 Velo<span>Tech</span></div>
      <nav>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          📊 Tableau de bord
        </Link>

        {user.role === 'technicien' && (
          <>
            <Link to="/repairs" className={location.pathname.startsWith('/repairs') ? 'active' : ''}>
              🔧 Réparations
            </Link>
            <Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>
              🤖 Assistant IA
            </Link>
          </>
        )}

        {user.role === 'responsable' && (
          <>
            <Link to="/stock" className={location.pathname === '/stock' ? 'active' : ''}>
              📦 Stock
            </Link>
            <Link to="/fournisseurs" className={location.pathname === '/fournisseurs' ? 'active' : ''}>
              🏭 Fournisseurs
            </Link>
            <Link to="/techniciens" className={location.pathname === '/techniciens' ? 'active' : ''}>
              👨‍🔧 Utilisateurs
            </Link>
            <Link to="/rapports" className={location.pathname === '/rapports' ? 'active' : ''}>
              📄 Rapports
            </Link>
          </>
        )}
      </nav>

      {/* Bouton mode éco */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #eee' }}>
        <button
          onClick={toggleEco}
          style={{
            width: '100%',
            padding: '8px',
            background: ecoMode ? '#000' : '#f0f0f0',
            color: ecoMode ? '#fff' : '#333',
            border: '1px solid #ddd',
            borderRadius: '7px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {ecoMode ? '⚡ Mode Éco ON' : '🌱 Mode Éco OFF'}
        </button>
        {ecoMode && (
          <p style={{
            fontSize: '10px',
            color: '#888',
            textAlign: 'center',
            marginTop: '4px'
          }}>
            Consommation réduite
          </p>
        )}
      </div>

      <div className="sidebar-user">
        <strong>{user.username}</strong>
        <span style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
          background: user.role === 'responsable' ? '#111' : '#eee',
          color: user.role === 'responsable' ? 'white' : '#555',
          marginBottom: '10px',
          marginTop: '4px'
        }}>
          {user.role === 'responsable' ? '👑 Responsable' : '🔧 Technicien'}
        </span>
        <button className="logout-btn" onClick={logout}>🚪 Déconnexion</button>
      </div>
    </div>
  );
};

function Dashboard() {
  const [stats, setStats] = useState({
    total: 0, enAttente: 0, enCours: 0, termine: 0
  });
  const [recentRepairs, setRecentRepairs] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const { ecoMode } = useEco();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [repairsRes, stockRes] = await Promise.all([
        axios.get('http://localhost:5000/api/repairs', { headers }),
        axios.get('http://localhost:5000/api/stock', { headers })
      ]);

      const repairs = repairsRes.data;
      setRecentRepairs(repairs.slice(0, 5));
      setStats({
        total: repairs.length,
        enAttente: repairs.filter(r => r.statut === 'En attente').length,
        enCours: repairs.filter(r => r.statut === 'En cours').length,
        termine: repairs.filter(r => r.statut === 'Terminé').length,
      });

      const alerts = stockRes.data.filter(p => p.quantite_stock <= p.seuil_alerte);
      setStockAlerts(alerts);
    } catch (err) {
      console.error(err);
    }
  };

  const getBadge = (statut) => {
    const map = {
      'En attente': 'badge badge-attente',
      'En cours': 'badge badge-cours',
      'Terminé': 'badge badge-termine',
      'Livré': 'badge badge-livre',
    };
    return map[statut] || 'badge';
  };

  return (
    <div className={`layout ${ecoMode ? 'eco-mode' : ''}`}>
      <Sidebar />
      <div className="main-content">

        {/* Bannière éco */}
        {ecoMode && (
          <div className="eco-banner">
            🌱 MODE ÉCO ACTIVÉ — Interface simplifiée pour réduire la consommation énergétique
          </div>
        )}

        <div className="page-header">
          <h1>📊 Tableau de bord</h1>
          <span style={{ color: '#888', fontSize: '14px' }}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </div>

        {stockAlerts.length > 0 && (
          <div className="stock-alert-red">
            🚨 <strong>{stockAlerts.length} pièce(s)</strong> en stock bas :
            {stockAlerts.map(p => (
              <span key={p.id} style={{
                marginLeft: '8px',
                background: '#fecaca',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {p.nom} ({p.quantite_stock} restants)
              </span>
            ))}
          </div>
        )}

        <div className="cards-grid">
          <div className="card blue">
            <div className="card-value">{stats.total}</div>
            <div className="card-label">Total réparations</div>
          </div>
          <div className="card orange">
            <div className="card-value">{stats.enAttente}</div>
            <div className="card-label">En attente</div>
          </div>
          <div className="card green">
            <div className="card-value">{stats.enCours}</div>
            <div className="card-label">En cours</div>
          </div>
          <div className="card">
            <div className="card-value">{stats.termine}</div>
            <div className="card-label">Terminées</div>
          </div>
        </div>

        <div className="table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px' }}>🔧 Réparations récentes</h2>
            <Link to="/repairs">
              <button className="btn btn-primary btn-sm">Voir tout</button>
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>Vélo</th>
                <th>Problème</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentRepairs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>
                    Aucune réparation
                  </td>
                </tr>
              ) : (
                recentRepairs.map(r => (
                  <tr key={r.id}>
                    <td>{r.velo_modele || r.numero_cadre || '—'}</td>
                    <td>{r.description?.substring(0, 40)}...</td>
                    <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                    <td><span className={getBadge(r.statut)}>{r.statut}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export { Sidebar };
export default Dashboard;