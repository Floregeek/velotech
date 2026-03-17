import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Dashboard';
import { useEco } from '../EcoContext';

function Techniciens() {
  const [techniciens, setTechniciens] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    username: '', password: '', role: 'technicien'
  });
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const { ecoMode } = useEco();

  useEffect(() => { fetchTechniciens(); }, []);

  const fetchTechniciens = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/techniciens', { headers });
      setTechniciens(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', form, { headers });
      setSuccess(`✅ Compte "${form.username}" créé avec succès !`);
      setForm({ username: '', password: '', role: 'technicien' });
      setShowModal(false);
      fetchTechniciens();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Supprimer le compte "${username}" ?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/techniciens/${id}`, { headers });
      fetchTechniciens();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

  return (
     <div className={`layout ${ecoMode ? 'eco-mode' : ''}`}>
      <Sidebar />
      <div className="main-content">

        {ecoMode && (
          <div className="eco-banner">
            🌱 MODE ÉCO ACTIVÉ — Interface simplifiée pour réduire la consommation énergétique
          </div>
        )}

        <div className="page-header">
          <h1>👨‍🔧 Gestion des utilisateurs</h1>
          <button className="btn btn-primary" onClick={() => {
            setShowModal(true);
            setError('');
            setSuccess('');
          }}>
            + Ajouter un utilisateur
          </button>
        </div>

        {success && (
          <div style={{
            background: '#dcfce7', border: '1px solid #bbf7d0',
            borderRadius: '8px', padding: '12px 16px',
            marginBottom: '16px', color: '#166534', fontSize: '14px'
          }}>
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="cards-grid" style={{ marginBottom: '20px' }}>
          <div className="card">
            <div className="card-value">
              {techniciens.filter(t => t.role === 'technicien').length}
            </div>
            <div className="card-label">Techniciens</div>
          </div>
          <div className="card">
            <div className="card-value">
              {techniciens.filter(t => t.role === 'responsable').length}
            </div>
            <div className="card-label">Responsables</div>
          </div>
          <div className="card blue">
            <div className="card-value">{techniciens.length}</div>
            <div className="card-label">Total utilisateurs</div>
          </div>
        </div>

        {/* Tableau */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom d'utilisateur</th>
                <th>Rôle</th>
                <th>Date création</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {techniciens.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>
                    Aucun utilisateur
                  </td>
                </tr>
              ) : (
                techniciens.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td><strong>{t.username}</strong></td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: t.role === 'responsable' ? '#111' : '#f0f0f0',
                        color: t.role === 'responsable' ? 'white' : '#555'
                      }}>
                        {t.role === 'responsable' ? '👑 Responsable' : '🔧 Technicien'}
                      </span>
                    </td>
                    <td>{formatDate(t.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(t.id, t.username)}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>+ Nouvel utilisateur</h2>
              {error && <div className="error-msg">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom d'utilisateur</label>
                  <input
                    placeholder="ex: tech2"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    <option value="technicien">🔧 Technicien</option>
                    <option value="responsable">👑 Responsable</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn"
                    style={{ background: '#eee' }}
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Créer le compte
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Techniciens;