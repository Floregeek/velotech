import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar } from './Dashboard';
import { useEco } from '../EcoContext';

function VeloHistorique() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const { ecoMode } = useEco();

  useEffect(() => { fetchHistorique(); }, [id]);

  const fetchHistorique = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/velos/${id}/historique`, { headers });
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  if (loading) return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <p style={{ color: '#888', marginTop: '40px' }}>Chargement...</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <p style={{ color: '#e74c3c' }}>Vélo introuvable.</p>
      </div>
    </div>
  );

  const { velo, reparations } = data;
  const totalReparations = reparations.length;
  const terminees = reparations.filter(r => r.statut === 'Terminé' || r.statut === 'Livré').length;
  const enCours = reparations.filter(r => r.statut === 'En cours').length;

  return (
    <div className={`layout ${ecoMode ? 'eco-mode' : ''}`}>
      <Sidebar />
      <div className="main-content">

        {ecoMode && (
          <div className="eco-banner">
            🌱 MODE ÉCO ACTIVÉ — Interface simplifiée pour réduire la consommation énergétique
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn btn-sm"
              style={{ background: '#eee' }}
              onClick={() => navigate('/repairs')}
            >
              ← Retour
            </button>
            <h1>🚲 Historique du vélo</h1>
          </div>
        </div>

        {/* Infos vélo */}
        <div className="table-container" style={{ marginBottom: '20px' }}>
          <h2 style={{ marginBottom: '16px' }}>📋 Informations du vélo</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <span style={{ color: '#888', fontSize: '13px' }}>Marque / Modèle</span>
              <p style={{ fontWeight: '700', fontSize: '16px' }}>{velo.marque} {velo.modele}</p>
            </div>
            <div>
              <span style={{ color: '#888', fontSize: '13px' }}>N° de cadre</span>
              <p style={{ fontWeight: '700', fontSize: '16px' }}>{velo.numero_cadre}</p>
            </div>
            <div>
              <span style={{ color: '#888', fontSize: '13px' }}>Type</span>
              <p style={{ fontWeight: '600' }}>{velo.type_velo || '—'}</p>
            </div>
            <div>
              <span style={{ color: '#888', fontSize: '13px' }}>Année</span>
              <p style={{ fontWeight: '600' }}>{velo.annee || '—'}</p>
            </div>
            <div>
              <span style={{ color: '#888', fontSize: '13px' }}>Propriétaire</span>
              <p style={{ fontWeight: '600' }}>
                {velo.client_prenom} {velo.client_nom}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="cards-grid" style={{ marginBottom: '20px' }}>
          <div className="card blue">
            <div className="card-value">{totalReparations}</div>
            <div className="card-label">Total réparations</div>
          </div>
          <div className="card green">
            <div className="card-value">{terminees}</div>
            <div className="card-label">Terminées</div>
          </div>
          <div className="card orange">
            <div className="card-value">{enCours}</div>
            <div className="card-label">En cours</div>
          </div>
        </div>

        {/* Historique réparations */}
        <div className="table-container">
          <h2 style={{ marginBottom: '16px' }}>🔧 Historique des réparations</h2>
          {reparations.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '30px' }}>
              Aucune réparation enregistrée pour ce vélo.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Technicien</th>
                  <th>Date entrée</th>
                  <th>Date clôture</th>
                  <th>Temps (min)</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reparations.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td style={{ maxWidth: '200px' }}>
                      {r.description?.length > 40
                        ? r.description.substring(0, 40) + '...'
                        : r.description}
                    </td>
                    <td>{r.technicien_nom || '—'}</td>
                    <td>{formatDate(r.date_entree)}</td>
                    <td>{formatDate(r.date_cloture)}</td>
                    <td>{r.temps_reparation ? `${r.temps_reparation} min` : '—'}</td>
                    <td><span className={getBadge(r.statut)}>{r.statut}</span></td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/repairs/${r.id}`)}
                      >
                        👁️ Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default VeloHistorique;