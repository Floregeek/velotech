import React, { useState } from 'react';
import axios from 'axios';
import { Sidebar } from './Dashboard';

function Rapports() {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [loading, setLoading] = useState('');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const telechargerRapport = async (type) => {
    setLoading(type);
    try {
      let url = `http://localhost:5000/api/rapports/${type}`;
      if (type === 'reparations' && (dateDebut || dateFin)) {
        url += `?date_debut=${dateDebut}&date_fin=${dateFin}`;
      }

      const res = await axios.get(url, {
        headers,
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rapport_${type}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert('Erreur lors de la génération du rapport');
      console.error(err);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">

        <div className="page-header">
          <h1>📄 Rapports PDF</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>

          {/* Rapport réparations */}
          <div className="table-container">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔧</div>
            <h2 style={{ marginBottom: '8px' }}>Rapport Réparations</h2>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
              Liste complète des réparations avec statuts, techniciens et dates.
              Filtrable par période.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Date début</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                  style={{ padding: '7px', border: '1px solid #ddd', borderRadius: '7px', width: '100%', fontSize: '13px' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0, flex: 1 }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Date fin</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={e => setDateFin(e.target.value)}
                  style={{ padding: '7px', border: '1px solid #ddd', borderRadius: '7px', width: '100%', fontSize: '13px' }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => telechargerRapport('reparations')}
              disabled={loading === 'reparations'}
            >
              {loading === 'reparations' ? '⏳ Génération...' : '📥 Télécharger PDF'}
            </button>
          </div>

          {/* Rapport stock */}
          <div className="table-container">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📦</div>
            <h2 style={{ marginBottom: '8px' }}>Rapport Stock</h2>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
              État complet du stock avec alertes, valeur totale et fournisseurs associés.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '52px' }}
              onClick={() => telechargerRapport('stock')}
              disabled={loading === 'stock'}
            >
              {loading === 'stock' ? '⏳ Génération...' : '📥 Télécharger PDF'}
            </button>
          </div>

          {/* Rapport activité */}
          <div className="table-container">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
            <h2 style={{ marginBottom: '8px' }}>Rapport d'Activité</h2>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
              Vue générale : stats clients, vélos, pannes fréquentes, pièces utilisées et activité par technicien.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '28px' }}
              onClick={() => telechargerRapport('activite')}
              disabled={loading === 'activite'}
            >
              {loading === 'activite' ? '⏳ Génération...' : '📥 Télécharger PDF'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Rapports;