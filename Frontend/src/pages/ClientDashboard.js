import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ClientDashboard() {
  const [velos, setVelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const client = JSON.parse(localStorage.getItem('client') || '{}');
  const token = localStorage.getItem('client_token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchReparations(); }, []);

  const fetchReparations = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/clients/mes-reparations', { headers });
      setVelos(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client');
    navigate('/client');
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

  const getStatutMessage = (statut) => {
    const messages = {
      'En attente': '⏳ Votre vélo est en attente de prise en charge.',
      'En cours': '🔧 Votre vélo est en cours de réparation.',
      'Terminé': '✅ Votre vélo est prêt ! Vous pouvez venir le récupérer.',
      'Livré': '🎉 Votre vélo vous a été remis.',
    };
    return messages[statut] || '';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>

      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #eee',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px', fontWeight: '700' }}>🚲 VeloTech</span>
          <span style={{
            background: '#f0f0f0',
            padding: '2px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#555'
          }}>
            Espace Client
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#555' }}>
            👋 Bonjour, <strong>{client.prenom} {client.nom}</strong>
          </span>
          <button
            className="btn btn-sm"
            style={{ background: '#111', color: 'white' }}
            onClick={logout}
          >
            🚪 Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#111' }}>
          📋 Suivi de mes réparations
        </h1>

        {loading ? (
          <p style={{ color: '#888' }}>Chargement...</p>
        ) : velos.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #eee'
          }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🚲</p>
            <p style={{ color: '#888' }}>Aucun vélo enregistré pour votre compte.</p>
          </div>
        ) : (
          velos.map(v => (
            <div key={v.id} style={{
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #eee',
              marginBottom: '20px',
              overflow: 'hidden'
            }}>
              {/* Header vélo */}
              <div style={{
                background: '#f8f9fa',
                padding: '14px 20px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ fontSize: '16px' }}>🚲 {v.marque} {v.modele}</strong>
                  <span style={{ color: '#888', fontSize: '13px', marginLeft: '12px' }}>
                    N° cadre : {v.numero_cadre} — {v.type_velo} {v.annee}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  background: '#111',
                  color: 'white',
                  padding: '3px 10px',
                  borderRadius: '4px'
                }}>
                  {v.reparations.length} réparation(s)
                </span>
              </div>

              {/* Réparations */}
              {v.reparations.length === 0 ? (
                <p style={{ padding: '16px 20px', color: '#aaa', fontSize: '13px' }}>
                  Aucune réparation enregistrée pour ce vélo.
                </p>
              ) : (
                v.reparations.map(r => (
                  <div key={r.id} style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f5f5f5'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: '600', marginBottom: '4px' }}>{r.description}</p>
                        <p style={{ fontSize: '12px', color: '#888' }}>
                          Déposé le {formatDate(r.date_entree)}
                          {r.technicien_nom && ` — Technicien : ${r.technicien_nom}`}
                          {r.temps_reparation && ` — Durée : ${r.temps_reparation} min`}
                        </p>
                      </div>
                      <span className={getBadge(r.statut)}>{r.statut}</span>
                    </div>
                    {/* Message statut */}
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      background: '#f8f9fa',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#555'
                    }}>
                      {getStatutMessage(r.statut)}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;