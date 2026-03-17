import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sidebar } from './Dashboard';
import { useEco } from '../EcoContext';

function RepairDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState(null);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // IA states
  const [diagnostic, setDiagnostic] = useState(null);
  const [loadingIA, setLoadingIA] = useState(false);
  const [iaError, setIaError] = useState('');
  const [note, setNote] = useState(0);
  const [noteSaved, setNoteSaved] = useState(false);

  // Pièces states
  const [selectedPiece, setSelectedPiece] = useState('');
  const [quantitePiece, setQuantitePiece] = useState(1);
  const [pieceError, setPieceError] = useState('');

  // Statut & temps
  const [statut, setStatut] = useState('');
  const [temps, setTemps] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  const { ecoMode } = useEco();

  useEffect(() => {
    fetchRepair();
    fetchStock();
  }, [id]);

  const fetchRepair = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/repairs/${id}`, { headers });
      setRepair(res.data);
      setStatut(res.data.statut);
      setTemps(res.data.temps_reparation || '');
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stock', { headers });
      setStock(res.data);
    } catch (err) { console.error(err); }
  };

  const analyserAvecIA = async () => {
    setLoadingIA(true);
    setIaError('');
    setDiagnostic(null);
    setNoteSaved(false);
    try {
      const res = await axios.post('http://localhost:5000/api/llm/analyze', {
        description: repair.description,
        type_velo: `${repair.velo_marque || ''} ${repair.velo_modele || ''}`,
        id_reparation: id
      }, { headers });
      setDiagnostic(res.data.diagnostic);
    } catch (err) {
      if (err.response?.data?.fallback) {
        setIaError('⚠️ Service IA temporairement indisponible. Les autres fonctionnalités restent actives.');
      } else {
        setIaError('Erreur lors de l\'analyse IA.');
      }
    } finally {
      setLoadingIA(false);
    }
  };

  const ajouterPiece = async () => {
    if (!selectedPiece) return;
    setPieceError('');
    try {
      await axios.post(`http://localhost:5000/api/repairs/${id}/pieces`, {
        id_piece: selectedPiece,
        quantite: quantitePiece
      }, { headers });
      setSelectedPiece('');
      setQuantitePiece(1);
      fetchRepair();
      fetchStock();
    } catch (err) {
      setPieceError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const retirerPiece = async (pieceId) => {
    if (!window.confirm('Retirer cette pièce ? Le stock sera remis.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/repairs/${id}/pieces/${pieceId}`, { headers });
      fetchRepair();
      fetchStock();
    } catch (err) { console.error(err); }
  };

  const sauvegarderStatut = async () => {
    try {
      await axios.put(`http://localhost:5000/api/repairs/${id}`, {
        ...repair,
        statut,
        temps_reparation: temps,
        date_cloture: statut === 'Terminé' || statut === 'Livré'
          ? new Date().toISOString().split('T')[0]
          : null
      }, { headers });
      fetchRepair();
      alert('✅ Statut mis à jour !');
    } catch (err) { console.error(err); }
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

  if (!repair) return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <p style={{ color: '#e74c3c' }}>Réparation introuvable.</p>
      </div>
    </div>
  );

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
            <h1>🔧 Fiche réparation #{id}</h1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Colonne gauche */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Infos réparation */}
            <div className="table-container">
              <h2 style={{ marginBottom: '16px' }}>📋 Fiche de réparation</h2>
              <table>
                <tbody>
                  <tr>
                    <td style={{ color: '#888', width: '140px', padding: '8px 0' }}>Vélo</td>
                    <td><strong>{repair.velo_marque} {repair.velo_modele}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ color: '#888', padding: '8px 0' }}>N° cadre</td>
                    <td>{repair.numero_cadre || '—'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#888', padding: '8px 0' }}>Technicien</td>
                    <td>{repair.technicien_nom || '—'}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#888', padding: '8px 0' }}>Date entrée</td>
                    <td>{formatDate(repair.date_entree)}</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#888', padding: '8px 0' }}>Problème</td>
                    <td>{repair.description}</td>
                  </tr>
                  {repair.notes && (
                    <tr>
                      <td style={{ color: '#888', padding: '8px 0' }}>Notes</td>
                      <td>{repair.notes}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
                <button
                  className="btn btn-sm"
                  style={{ background: '#f0f0f0', color: '#111', width: '100%' }}
                  onClick={() => navigate(`/velos/${repair.id_velo}/historique`)}
                >
                  📜 Voir tout l'historique de ce vélo
                </button>
              </div>
            </div>

            {/* Statut + temps */}
            <div className="table-container">
              <h2 style={{ marginBottom: '16px' }}>⚙️ Statut & Temps</h2>
              <div className="form-group">
                <label>Statut actuel</label>
                <select value={statut} onChange={e => setStatut(e.target.value)}>
                  <option>En attente</option>
                  <option>En cours</option>
                  <option>Terminé</option>
                  <option>Livré</option>
                </select>
              </div>
              <div className="form-group">
                <label>Temps de réparation (minutes)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="ex: 45"
                  value={temps}
                  onChange={e => setTemps(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={sauvegarderStatut}>
                💾 Enregistrer
              </button>
            </div>

            {/* Pièces utilisées */}
            <div className="table-container">
              <h2 style={{ marginBottom: '16px' }}>🔩 Pièces utilisées</h2>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <select
                  value={selectedPiece}
                  onChange={e => setSelectedPiece(e.target.value)}
                  style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '7px', fontSize: '13px' }}
                >
                  <option value="">-- Choisir une pièce --</option>
                  {stock.map(s => (
                    <option key={s.id} value={s.id} disabled={s.quantite_stock === 0}>
                      {s.nom} (stock: {s.quantite_stock}) — {s.prix}€
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={quantitePiece}
                  onChange={e => setQuantitePiece(parseInt(e.target.value))}
                  style={{ width: '70px', padding: '8px', border: '1px solid #ddd', borderRadius: '7px', fontSize: '13px' }}
                />
                <button className="btn btn-success btn-sm" onClick={ajouterPiece}>
                  + Ajouter
                </button>
              </div>

              {pieceError && (
                <div className="error-msg" style={{ marginBottom: '12px' }}>{pieceError}</div>
              )}

              {!repair.pieces || repair.pieces.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '13px' }}>Aucune pièce utilisée pour l'instant.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Pièce</th>
                      <th>Qté</th>
                      <th>Prix unit.</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {repair.pieces.map(p => (
                      <tr key={p.id}>
                        <td>{p.piece_nom}</td>
                        <td>{p.quantite}</td>
                        <td>{parseFloat(p.prix_applique).toFixed(2)} €</td>
                        <td><strong>{(p.quantite * p.prix_applique).toFixed(2)} €</strong></td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => retirerPiece(p.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'right', fontWeight: '600', paddingTop: '8px' }}>
                        Total :
                      </td>
                      <td style={{ fontWeight: '700', color: '#111' }}>
                        {repair.pieces.reduce((acc, p) => acc + p.quantite * p.prix_applique, 0).toFixed(2)} €
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

          </div>

          {/* Colonne droite — IA */}
          <div>
            <div className="table-container" style={{ position: 'sticky', top: '20px' }}>
              <h2 style={{ marginBottom: '6px' }}>🤖 Assistant IA — Diagnostic</h2>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                L'IA analyse la description du problème et propose un diagnostic.
              </p>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '16px', padding: '12px' }}
                onClick={analyserAvecIA}
                disabled={loadingIA}
              >
                {loadingIA ? '⏳ Analyse en cours...' : '🔍 Analyser avec l\'IA'}
              </button>

              {iaError && (
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '13px',
                  color: '#856404',
                  marginBottom: '16px'
                }}>
                  {iaError}
                </div>
              )}

              {diagnostic && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#92400e' }}>⚠️ Causes possibles</h3>
                    <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#555' }}>
                      {diagnostic.causes?.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                    </ul>
                  </div>

                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#1e40af' }}>🔩 Pièces recommandées</h3>
                    <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#555' }}>
                      {diagnostic.pieces?.map((p, i) => <li key={i} style={{ marginBottom: '4px' }}>{p}</li>)}
                    </ul>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#166534' }}>📋 Étapes de diagnostic</h3>
                    <ol style={{ paddingLeft: '18px', fontSize: '13px', color: '#555' }}>
                      {diagnostic.etapes?.map((e, i) => <li key={i} style={{ marginBottom: '6px' }}>{e}</li>)}
                    </ol>
                  </div>

                  <div style={{ background: '#f9fafb', border: '1px solid #eee', borderRadius: '8px', padding: '14px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>⭐ Évaluer cette réponse</h3>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setNote(n)} style={{
                          fontSize: '22px', background: 'none', border: 'none',
                          cursor: 'pointer', opacity: note >= n ? 1 : 0.3, transition: 'opacity 0.2s'
                        }}>⭐</button>
                      ))}
                    </div>
                    {noteSaved ? (
                      <p style={{ fontSize: '13px', color: '#166534' }}>✅ Note enregistrée !</p>
                    ) : (
                      <button
                        className="btn btn-sm"
                        style={{ background: '#111', color: 'white' }}
                        onClick={async () => {
                          try {
                            await axios.post('http://localhost:5000/api/llm/rate',
                              { id_diagnostic: 1, note }, { headers });
                            setNoteSaved(true);
                          } catch (err) { console.error(err); }
                        }}
                        disabled={note === 0}
                      >
                        Enregistrer la note
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RepairDetail;