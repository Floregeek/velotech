const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// GET /api/rapports/reparations — rapport des réparations
router.get('/reparations', authMiddleware, async (req, res) => {
  const { date_debut, date_fin } = req.query;

  try {
    let query = `
      SELECT r.*, v.modele as velo_modele, v.marque as velo_marque,
             v.numero_cadre, u.username as technicien_nom,
             c.nom as client_nom, c.prenom as client_prenom
      FROM repairs r
      LEFT JOIN velos v ON r.id_velo = v.id
      LEFT JOIN users u ON r.id_technicien = u.id
      LEFT JOIN clients c ON v.id_client = c.id
      WHERE 1=1
    `;
    const params = [];

    if (date_debut) { query += ' AND r.date_entree >= ?'; params.push(date_debut); }
    if (date_fin) { query += ' AND r.date_entree <= ?'; params.push(date_fin); }
    query += ' ORDER BY r.date_entree DESC';

    const [repairs] = await db.query(query, params);

    const enAttente = repairs.filter(r => r.statut === 'En attente').length;
    const enCours = repairs.filter(r => r.statut === 'En cours').length;
    const terminees = repairs.filter(r => r.statut === 'Terminé').length;
    const livrees = repairs.filter(r => r.statut === 'Livré').length;

    // Génère le PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport_reparations.pdf');
    doc.pipe(res);

    // En-tête
    doc.fontSize(22).font('Helvetica-Bold').text('VeloTech', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Rapport des Réparations', { align: 'center' });
    doc.moveDown(0.5);

    if (date_debut || date_fin) {
      doc.fontSize(11).text(
        `Période : ${date_debut || '—'} → ${date_fin || '—'}`,
        { align: 'center' }
      );
    }

    doc.fontSize(10).text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      { align: 'center', color: 'grey' }
    );

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Stats
    doc.fontSize(13).font('Helvetica-Bold').text('Résumé');
    doc.moveDown(0.5);

    const statsY = doc.y;
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total réparations : ${repairs.length}`, 50, statsY);
    doc.text(`En attente : ${enAttente}`, 200, statsY);
    doc.text(`En cours : ${enCours}`, 320, statsY);
    doc.text(`Terminées : ${terminees}`, 430, statsY);
    doc.moveDown(2);

    // Tableau
    doc.fontSize(13).font('Helvetica-Bold').text('Détail des réparations');
    doc.moveDown(0.5);

    // En-têtes tableau
    const tableTop = doc.y;
    const col = { id: 50, velo: 90, probleme: 210, tech: 360, date: 430, statut: 490 };

    doc.fontSize(9).font('Helvetica-Bold');
    doc.rect(50, tableTop - 5, 495, 18).fill('#f0f0f0');
    doc.fill('black');
    doc.text('#', col.id, tableTop);
    doc.text('Vélo', col.velo, tableTop);
    doc.text('Problème', col.probleme, tableTop);
    doc.text('Technicien', col.tech, tableTop);
    doc.text('Date', col.date, tableTop);
    doc.text('Statut', col.statut, tableTop);
    doc.moveDown(0.8);

    // Lignes tableau
    doc.font('Helvetica').fontSize(8);
    repairs.forEach((r, i) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }

      const rowY = doc.y;
      if (i % 2 === 0) {
        doc.rect(50, rowY - 3, 495, 16).fill('#fafafa');
        doc.fill('black');
      }

      doc.text(`#${r.id}`, col.id, rowY, { width: 35 });
      doc.text(`${r.velo_marque || ''} ${r.velo_modele || '—'}`, col.velo, rowY, { width: 115 });
      doc.text(r.description ? r.description.substring(0, 40) : '—', col.probleme, rowY, { width: 145 });
      doc.text(r.technicien_nom || '—', col.tech, rowY, { width: 65 });
      doc.text(r.date_entree ? new Date(r.date_entree).toLocaleDateString('fr-FR') : '—', col.date, rowY, { width: 55 });
      doc.text(r.statut || '—', col.statut, rowY, { width: 55 });
      doc.moveDown(0.8);
    });

    // Pied de page
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).fill('grey').text('VeloTech — Document confidentiel', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur génération rapport', error: err.message });
  }
});

// GET /api/rapports/stock — rapport du stock
router.get('/stock', authMiddleware, async (req, res) => {
  try {
    const [stock] = await db.query(`
      SELECT s.*, f.nom as fournisseur_nom, f.telephone as fournisseur_tel
      FROM stock s
      LEFT JOIN fournisseurs f ON s.id_fournisseur = f.id
      ORDER BY s.categorie, s.nom
    `);

    const alertes = stock.filter(p => p.quantite_stock <= p.seuil_alerte);
    const valeurTotale = stock.reduce((acc, p) => acc + p.quantite_stock * p.prix, 0);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport_stock.pdf');
    doc.pipe(res);

    // En-tête
    doc.fontSize(22).font('Helvetica-Bold').text('VeloTech', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Rapport du Stock', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      { align: 'center', color: 'grey' }
    );
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Stats
    doc.fontSize(13).font('Helvetica-Bold').text('Résumé du stock');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total pièces : ${stock.length}`);
    doc.text(`Pièces en alerte : ${alertes.length}`);
    doc.text(`Valeur totale du stock : ${valeurTotale.toFixed(2)} €`);
    doc.moveDown();

    // Alertes
    if (alertes.length > 0) {
      doc.fontSize(13).font('Helvetica-Bold').fillColor('red').text('⚠ Pièces sous le seuil d\'alerte');
      doc.fillColor('black').moveDown(0.5);
      alertes.forEach(p => {
        doc.fontSize(10).font('Helvetica').text(
          `• ${p.nom} : ${p.quantite_stock} restants (seuil: ${p.seuil_alerte})${p.fournisseur_nom ? ` — Fournisseur: ${p.fournisseur_nom} (${p.fournisseur_tel || '—'})` : ''}`
        );
      });
      doc.moveDown();
    }

    // Tableau stock par catégorie
    const categories = [...new Set(stock.map(s => s.categorie).filter(Boolean))];

    categories.forEach(cat => {
      const pieces = stock.filter(s => s.categorie === cat);

      doc.fontSize(12).font('Helvetica-Bold').text(cat);
      doc.moveDown(0.3);

      const tableTop = doc.y;
      const col = { nom: 50, stock: 260, seuil: 320, prix: 380, fournisseur: 440 };

      // En-têtes
      doc.fontSize(9).font('Helvetica-Bold');
      doc.rect(50, tableTop - 3, 495, 16).fill('#f0f0f0');
      doc.fill('black');
      doc.text('Pièce', col.nom, tableTop);
      doc.text('Stock', col.stock, tableTop);
      doc.text('Seuil', col.seuil, tableTop);
      doc.text('Prix', col.prix, tableTop);
      doc.text('Fournisseur', col.fournisseur, tableTop);
      doc.moveDown(0.8);

      pieces.forEach((p, i) => {
        if (doc.y > 700) { doc.addPage(); doc.y = 50; }

        const rowY = doc.y;
        if (i % 2 === 0) {
          doc.rect(50, rowY - 3, 495, 14).fill('#fafafa');
          doc.fill('black');
        }

        const isAlerte = p.quantite_stock <= p.seuil_alerte;
        doc.fontSize(8).font('Helvetica');
        doc.text(p.nom, col.nom, rowY, { width: 205 });
        doc.fillColor(isAlerte ? 'red' : 'black')
           .text(`${p.quantite_stock}`, col.stock, rowY, { width: 55 });
        doc.fillColor('black')
           .text(`${p.seuil_alerte}`, col.seuil, rowY, { width: 55 });
        doc.text(`${parseFloat(p.prix).toFixed(2)} €`, col.prix, rowY, { width: 55 });
        doc.text(p.fournisseur_nom || '—', col.fournisseur, rowY, { width: 100 });
        doc.moveDown(0.8);
      });

      doc.moveDown();
    });

    // Pied de page
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).fill('grey').text('VeloTech — Document confidentiel', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur génération rapport', error: err.message });
  }
});

// GET /api/rapports/activite — rapport d'activité général
router.get('/activite', authMiddleware, async (req, res) => {
  try {
    const [repairs] = await db.query(`
      SELECT r.*, v.modele as velo_modele, v.marque as velo_marque,
             u.username as technicien_nom
      FROM repairs r
      LEFT JOIN velos v ON r.id_velo = v.id
      LEFT JOIN users u ON r.id_technicien = u.id
      ORDER BY r.created_at DESC
    `);

    const [clients] = await db.query('SELECT COUNT(*) as nb FROM clients');
    const [velos] = await db.query('SELECT COUNT(*) as nb FROM velos');
    const [techniciens] = await db.query('SELECT username FROM users WHERE role = "technicien"');

    const [topPannes] = await db.query(`
      SELECT description, COUNT(*) as nb FROM repairs
      GROUP BY description ORDER BY nb DESC LIMIT 5
    `);

    const [topPieces] = await db.query(`
      SELECT s.nom, SUM(rp.quantite) as total
      FROM repair_pieces rp
      LEFT JOIN stock s ON rp.id_piece = s.id
      GROUP BY s.nom ORDER BY total DESC LIMIT 5
    `);

    const tempsMoyen = repairs
      .filter(r => r.temps_reparation)
      .reduce((acc, r, _, arr) => acc + r.temps_reparation / arr.length, 0);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rapport_activite.pdf');
    doc.pipe(res);

    // En-tête
    doc.fontSize(22).font('Helvetica-Bold').text('VeloTech', { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('Rapport d\'Activité Général', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      { align: 'center', color: 'grey' }
    );
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown();

    // Stats générales
    doc.fontSize(13).font('Helvetica-Bold').text('Vue d\'ensemble');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Total clients : ${clients[0].nb}`);
    doc.text(`Total vélos enregistrés : ${velos[0].nb}`);
    doc.text(`Total réparations : ${repairs.length}`);
    doc.text(`Techniciens actifs : ${techniciens.length}`);
    doc.text(`Temps moyen de réparation : ${tempsMoyen ? tempsMoyen.toFixed(0) + ' min' : '—'}`);
    doc.moveDown();

    // Répartition par statut
    doc.fontSize(13).font('Helvetica-Bold').text('Répartition par statut');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    ['En attente', 'En cours', 'Terminé', 'Livré'].forEach(s => {
      const nb = repairs.filter(r => r.statut === s).length;
      const pct = repairs.length ? ((nb / repairs.length) * 100).toFixed(1) : 0;
      doc.text(`${s} : ${nb} (${pct}%)`);
    });
    doc.moveDown();

    // Pannes fréquentes
    doc.fontSize(13).font('Helvetica-Bold').text('Pannes les plus fréquentes');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    topPannes.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.description} — ${p.nb} fois`);
    });
    doc.moveDown();

    // Pièces les plus utilisées
    doc.fontSize(13).font('Helvetica-Bold').text('Pièces les plus utilisées');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    topPieces.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.nom} — ${p.total} unités`);
    });
    doc.moveDown();

    // Activité par technicien
    doc.fontSize(13).font('Helvetica-Bold').text('Activité par technicien');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    techniciens.forEach(t => {
      const nb = repairs.filter(r => r.technicien_nom === t.username).length;
      doc.text(`${t.username} : ${nb} réparation(s)`);
    });

    // Pied de page
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(9).fill('grey').text('VeloTech — Document confidentiel', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur génération rapport', error: err.message });
  }
});

module.exports = router;