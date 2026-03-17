import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from './Dashboard';
import { useEco } from '../EcoContext';

function Stock() {
  const [stock, setStock] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filterCat, setFilterCat] = useState('Tous');
  const [form, setForm] = useState({
    nom: '', categorie: '', quantite_stock: '', prix: '', seuil_alerte: 5, id_fournisseur: ''
  });
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const { ecoMode } = useEco();

  useEffect(() => {
    fetchStock();
    fetchFournisseurs();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stock', { headers });
      setStock(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchFournisseurs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/fournisseurs', { headers });
      setFournisseurs(res.data);
    } catch (err) { console.error(err); }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ nom: '', categorie: '', quantite_stock: '', prix: '', seuil_alerte: 5, id_fournisseur: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      nom: item.nom,
      categorie: item.categorie,
      quantite_stock: item.quantite_stock,
      prix: item.prix,
      seuil_alerte: item.seuil_alerte,
      id_fournisseur: item.id_fournisseur || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await axios.put(`http://localhost:5000/api/stock/${editItem.id}`, form, { headers });
      } else {
        await axios.post('http://localhost:5000/api/stock', form, { headers });
      }
      setShowModal(false);
      fetchStock();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette pièce du catalogue ?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/stock/${id}`, { headers });
      fetchStock();
    } catch (err) { console.error(err); }
  };

  const alertPieces = stock.filter(s => s.quantite_stock <= s.seuil_alerte);
  const categories = ['Tous', ...new Set(stock.map(s => s.categorie).filter(Boolean))];
  const filtered = filterCat === 'Tous' ? stock : stock.filter(s => s.categorie === filterCat);

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
          <h1>📦 Gestion du Stock</h1>
          <button className="btn btn-primary" onClick={openCreate}>
            + Ajouter une pièce
          </button>
        </div>

        {/* Bannière rouge si alertes */}
        {alertPieces.length > 0 && (
          <div className="stock-alert-red">
            🚨 <strong>{alertPieces.length} pièce(s) sous le seuil d'alerte</strong> — réapprovisionnement nécessaire !
            <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {alertPieces.map(p => (
                <span key={p.id} style={{
                  background: '#fecaca',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  {p.nom} : {p.quantite_stock} restants (seuil : {p.seuil_alerte})
                  {p.fournisseur_nom && ` — Fournisseur : ${p.fournisseur_nom}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filtres catégories */}
        <div className="filters">
          {categories.map(c => (
            <button
              key={c}
              className={`btn btn-sm ${filterCat === c ? 'btn-primary' : ''}`}
              style={filterCat !== c ? { background: 'white', border: '1px solid #ddd' } : {}}
              onClick={() => setFilterCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Tableau stock */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pièce</th>
                <th>Catégorie</th>
                <th>Fournisseur</th>
                <th>Prix</th>
                <th>Quantité en stock</th>
                <th>Seuil alerte</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>
                    Aucune pièce en stock
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.nom}</strong></td>
                    <td>{item.categorie}</td>
                    <td>
                      {item.fournisseur_nom ? (
                        <span style={{
                          background: '#f0f0f0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          🏭 {item.fournisseur_nom}
                        </span>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td>{parseFloat(item.prix).toFixed(2)} €</td>
                    <td>
                      <span className={
                        item.quantite_stock <= item.seuil_alerte
                          ? 'badge badge-alerte'
                          : 'badge badge-ok'
                      }>
                        {item.quantite_stock}
                      </span>
                    </td>
                    <td>{item.seuil_alerte}</td>
                    <td style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => openEdit(item)}
                        title="Modifier / Réapprovisionner"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
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
              <h2>{editItem ? '✏️ Modifier la pièce' : '+ Nouvelle pièce'}</h2>
              {editItem && (
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                  💡 Pour réapprovisionner, modifiez la quantité en stock.
                  La décrémentation se fait automatiquement lors des réparations.
                </p>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom de la pièce</label>
                  <input
                    placeholder="ex: Chaîne 9 vitesses"
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    value={form.categorie}
                    onChange={e => setForm({ ...form, categorie: e.target.value })}
                  >
                    <option value="">-- Choisir --</option>
                    <option>Transmission</option>
                    <option>Freinage</option>
                    <option>Pneus</option>
                    <option>Entretien</option>
                    <option>Accessoires</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fournisseur</label>
                  <select
                    value={form.id_fournisseur}
                    onChange={e => setForm({ ...form, id_fournisseur: e.target.value })}
                  >
                    <option value="">-- Aucun fournisseur --</option>
                    {fournisseurs.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.nom} {f.specialite ? `(${f.specialite})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    {editItem ? '📦 Quantité en stock (modifiez pour réapprovisionner)' : 'Quantité initiale'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantite_stock}
                    onChange={e => setForm({ ...form, quantite_stock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prix (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.prix}
                    onChange={e => setForm({ ...form, prix: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Seuil d'alerte</label>
                  <input
                    type="number"
                    min="0"
                    value={form.seuil_alerte}
                    onChange={e => setForm({ ...form, seuil_alerte: e.target.value })}
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

      </div>
    </div>
  );
}

export default Stock;