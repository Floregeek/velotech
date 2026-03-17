import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Dashboard';
import { useEco } from '../EcoContext';

function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [velos, setVelos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editRepair, setEditRepair] = useState(null);
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [form, setForm] = useState({
    id_velo: '', description: '', statut: 'En attente',
    date_entree: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();
  const { ecoMode } = useEco();

  useEffect(() => {
    fetchRepairs();
    fetchVelos();
  }, []);

  const fetchRepairs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/repairs', { headers });
      setRepairs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchVelos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/velos', { headers });
      setVelos(res.data);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => {
    setEditRepair(null);
    setForm({
      id_velo: '', description: '', statut: 'En attente',
      date_entree: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditRepair(r);
    setForm({
      id_velo: r.id_velo || '',
      description: r.description || '',
      statut: r.statut || 'En attente',
      date_entree: r.date_entree ? r.date_entree.split('T')[0] : '',
      notes: r.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRepair) {
        await axios.put(`http://localhost:5000/api/repairs/${editRepair.id}`, form, { headers });
      } else {
        await axios.post('http://localhost:5000/api/repairs', form, { headers });
      }
      setShowModal(false);
      fetchRepairs();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette réparation ?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/repairs/${id}`, { headers });
      fetchRepairs();
    } catch (err) { console.error(err); }
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const filtered = repairs.filter(r => {
    const matchStatut = filterStatut === 'Tous' || r.statut === filterStatut;
    const dateRep = r.date_entree ? new Date(r.date_entree) : null;
    const matchDebut = !dateDebut || (dateRep && dateRep >= new Date(dateDebut));
    const matchFin = !dateFin || (dateRep && dateRep <= new Date(dateFin));
    return matchStatut && matchDebut && matchFin;
  });

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
          <h1>🔧 Réparations</h1>
          <button className="btn btn-primary" onClick={openCreate}>
            + Nouvelle réparation
          </button>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>

          {/* Filtre par statut */}
          <div className="filters">
            {['Tous', 'En attente', 'En cours', 'Terminé', 'Livré'].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${filterStatut === s ? 'btn-primary' : ''}`}
                style={filterStatut !== s ? { background: 'white', border: '1px solid #ddd' } : {}}
                onClick={() => setFilterStatut(s)}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Filtre par date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>📅 Période :</span>
            <input
              type="date"
              value={dateDebut}
              onChange={e => setDateDebut(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '7px', fontSize: '13px' }}
            />
            <span style={{ color: '#888', fontSize: '13px' }}>→</span>
            <input
              type="date"
              value={dateFin}
              onChange={e => setDateFin(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '7px', fontSize: '13px' }}
            />
            {(dateDebut || dateFin) && (
              <button
                className="btn btn-sm"
                style={{ background: '#fee2e2', color: '#991b1b', border: 'none' }}
                onClick={() => { setDateDebut(''); setDateFin(''); }}
              >
                ✕ Réinitialiser
              </button>
            )}
            <span style={{ fontSize: '12px', color: '#aaa' }}>
              {filtered.length} réparation(s) trouvée(s)
            </span>
          </div>

        </div>

        {/* Tableau */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Modèle de vélo</th>
                <th>Problème</th>
                <th>Technicien</th>
                <th>Date d'entrée</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>
                    Aucune réparation trouvée
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <strong>{r.velo_modele || '—'}</strong>
                      {r.numero_cadre && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#aaa' }}>
                          {r.numero_cadre}
                        </span>
                      )}
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      {r.description?.length > 45
                        ? r.description.substring(0, 45) + '...'
                        : r.description}
                    </td>
                    <td>{r.technicien_nom || '—'}</td>
                    <td>{formatDate(r.date_entree)}</td>
                    <td>
                      <span className={getBadge(r.statut)}>{r.statut}</span>
                    </td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/repairs/${r.id}`)}
                        title="Voir les détails"
                      >
                        👁️ Voir
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => openEdit(r)}
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(r.id)}
                        title="Supprimer"
                      >
                        🗑️
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
              <h2>{editRepair ? '✏️ Modifier la réparation' : '+ Nouvelle réparation'}</h2>
              <form onSubmit={handleSubmit}>

                <div className="form-group">
                  <label>Vélo</label>
                  <select
                    value={form.id_velo}
                    onChange={e => setForm({ ...form, id_velo: e.target.value })}
                    required
                  >
                    <option value="">-- Sélectionner un vélo --</option>
                    {velos.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.marque} {v.modele} — {v.numero_cadre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description du problème</label>
                  <textarea
                    rows="3"
                    placeholder="Décrivez le problème en détail..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Statut</label>
                  <select
                    value={form.statut}
                    onChange={e => setForm({ ...form, statut: e.target.value })}
                  >
                    <option>En attente</option>
                    <option>En cours</option>
                    <option>Terminé</option>
                    <option>Livré</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date d'entrée</label>
                  <input
                    type="date"
                    value={form.date_entree}
                    onChange={e => setForm({ ...form, date_entree: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Notes optionnelles..."
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                  />
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
                    {editRepair ? 'Enregistrer' : 'Créer'}
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

export default Repairs;