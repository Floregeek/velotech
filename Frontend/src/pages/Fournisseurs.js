import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Dashboard';
import { useEco } from '../EcoContext';

function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPieces, setShowPieces] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [piecesData, setPiecesData] = useState(null);
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '',
    adresse: '', site_web: '', specialite: ''
  });
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const { ecoMode } = useEco();

  useEffect(() => { fetchFournisseurs(); }, []);

  const fetchFournisseurs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fournisseurs', { headers });
      setFournisseurs(res.data);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ nom: '', email: '', telephone: '', adresse: '', site_web: '', specialite: '' });
    setShowModal(true);
  };

  const openEdit = (f) => {
    setEditItem(f);
    setForm({
      nom: f.nom, email: f.email || '',
      telephone: f.telephone || '', adresse: f.adresse || '',
      site_web: f.site_web || '', specialite: f.specialite || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`http://localhost:5000/api/fournisseurs/${editItem.id}`, form, { headers });
      } else {
        await axios.post('http://localhost:5000/api/fournisseurs', form, { headers });
      }
      setShowModal(false);
      fetchFournisseurs();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer le fournisseur "${nom}" ?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/fournisseurs/${id}`, { headers });
      fetchFournisseurs();
    } catch (err) { console.error(err); }
  };

  const voirPieces = async (f) => {
    setSelectedFournisseur(f);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/fournisseurs/${f.id}/pieces`,
        { headers }
      );
      setPiecesData(res.data);
      setShowPieces(true);
    } catch (err) { console.error(err); }
  };

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
          <h1>🏭 Gestion des Fournisseurs</h1>
          <button className="btn btn-primary" onClick={openCreate}>
            + Ajouter un fournisseur
          </button>
        </div>

        {/* Stats */}
        <div className="cards-grid" style={{ marginBottom: '20px' }}>
          <div className="card blue">
            <div className="card-value">{fournisseurs.length}</div>
            <div className="card-label">Fournisseurs</div>
          </div>
          <div className="card green">
            <div className="card-value">
              {fournisseurs.reduce((acc, f) => acc + (f.nb_pieces || 0), 0)}
            </div>
            <div className="card-label">Pièces liées</div>
          </div>
          <div className="card orange">
            <div className="card-value">
              {new Set(fournisseurs.map(f => f.specialite).filter(Boolean)).size}
            </div>
            <div className="card-label">Spécialités</div>
          </div>
        </div>

        {/* Tableau */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Spécialité</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Site web</th>
                <th>Pièces</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fournisseurs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>
                    Aucun fournisseur enregistré
                  </td>
                </tr>
              ) : (
                fournisseurs.map(f => (
                  <tr key={f.id}>
                    <td>#{f.id}</td>
                    <td><strong>{f.nom}</strong></td>
                    <td>
                      {f.specialite ? (
                        <span style={{
                          background: '#f0f0f0', padding: '2px 8px',
                          borderRadius: '4px', fontSize: '12px'
                        }}>
                          {f.specialite}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{f.email || '—'}</td>
                    <td>{f.telephone || '—'}</td>
                    <td>
                      {f.site_web ? (
                        <a
                          href={f.site_web.startsWith('http') ? f.site_web : `https://${f.site_web}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#111', fontSize: '13px' }}
                        >
                          🔗 Voir
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        style={{ background: '#f0f0f0', color: '#111' }}
                        onClick={() => voirPieces(f)}
                      >
                        📦 {f.nb_pieces || 0} pièce(s)
                      </button>
                    </td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => openEdit(f)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(f.id, f.nom)}
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

        {/* Modal ajout/modification */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editItem ? '✏️ Modifier fournisseur' : '+ Nouveau fournisseur'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom du fournisseur *</label>
                  <input
                    placeholder="ex: Shimano France"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="contact@fournisseur.fr"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input
                      placeholder="0145678901"
                      value={form.telephone}
                      onChange={e => setForm({ ...form, telephone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Spécialité</label>
                  <select
                    value={form.specialite}
                    onChange={e => setForm({ ...form, specialite: e.target.value })}
                  >
                    <option value="">-- Choisir --</option>
                    <option>Transmission</option>
                    <option>Freinage</option>
                    <option>Pneus</option>
                    <option>Roues</option>
                    <option>Cadres</option>
                    <option>Accessoires</option>
                    <option>Entretien</option>
                    <option>Général</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Adresse</label>
                  <input
                    placeholder="Paris, France"
                    value={form.adresse}
                    onChange={e => setForm({ ...form, adresse: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Site web</label>
                  <input
                    placeholder="www.fournisseur.fr"
                    value={form.site_web}
                    onChange={e => setForm({ ...form, site_web: e.target.value })}
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
                    {editItem ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal pièces du fournisseur */}
        {showPieces && piecesData && (
          <div className="modal-overlay">
            <div className="modal" style={{ width: '600px' }}>
              <h2>📦 Pièces — {piecesData.fournisseur.nom}</h2>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
                {piecesData.fournisseur.specialite && `Spécialité : ${piecesData.fournisseur.specialite}`}
                {piecesData.fournisseur.email && ` | ${piecesData.fournisseur.email}`}
              </p>
              {piecesData.pieces.length === 0 ? (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>
                  Aucune pièce liée à ce fournisseur.
                  <br />
                  <span style={{ fontSize: '12px' }}>
                    Vous pouvez lier des pièces depuis la page Stock.
                  </span>
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Pièce</th>
                      <th>Catégorie</th>
                      <th>Stock</th>
                      <th>Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {piecesData.pieces.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.nom}</strong></td>
                        <td>{p.categorie}</td>
                        <td>
                          <span className={
                            p.quantite_stock <= p.seuil_alerte
                              ? 'badge badge-alerte'
                              : 'badge badge-ok'
                          }>
                            {p.quantite_stock}
                          </span>
                        </td>
                        <td>{parseFloat(p.prix).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPieces(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Fournisseurs;