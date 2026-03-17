const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/repairs — liste toutes les réparations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, v.modele as velo_modele, v.numero_cadre,
             v.marque as velo_marque, u.username as technicien_nom
      FROM repairs r
      LEFT JOIN velos v ON r.id_velo = v.id
      LEFT JOIN users u ON r.id_technicien = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/repairs/:id — détail d'une réparation ✅ ÉTAPE 7
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, v.modele as velo_modele, v.numero_cadre,
             v.marque as velo_marque, u.username as technicien_nom
      FROM repairs r
      LEFT JOIN velos v ON r.id_velo = v.id
      LEFT JOIN users u ON r.id_technicien = u.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Réparation introuvable' });
    }

    const [pieces] = await db.query(`
      SELECT rp.*, s.nom as piece_nom
      FROM repair_pieces rp
      LEFT JOIN stock s ON rp.id_piece = s.id
      WHERE rp.id_reparation = ?
    `, [req.params.id]);

    res.json({ ...rows[0], pieces });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/repairs — créer une réparation
router.post('/', authMiddleware, async (req, res) => {
  const { id_velo, description, statut, date_entree, notes } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO repairs (id_velo, id_technicien, description, statut, date_entree, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_velo, req.user.id, description, statut || 'En attente', date_entree, notes]
    );
    res.status(201).json({ message: 'Réparation créée', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/repairs/:id — modifier une réparation
router.put('/:id', authMiddleware, async (req, res) => {
  const { description, statut, notes, temps_reparation, date_cloture } = req.body;
  try {
    await db.query(
      `UPDATE repairs SET description=?, statut=?, notes=?,
       temps_reparation=?, date_cloture=? WHERE id=?`,
      [description, statut, notes, temps_reparation, date_cloture, req.params.id]
    );
    res.json({ message: 'Réparation mise à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/repairs/:id — supprimer
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM repairs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Réparation supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/repairs/:id/pieces — ajouter une pièce + décrémentation auto
router.post('/:id/pieces', authMiddleware, async (req, res) => {
  const { id_piece, quantite } = req.body;
  const id_reparation = req.params.id;

  try {
    const [piece] = await db.query('SELECT * FROM stock WHERE id = ?', [id_piece]);
    if (piece.length === 0) return res.status(404).json({ message: 'Pièce introuvable' });

    const prix_applique = piece[0].prix;

    if (piece[0].quantite_stock < quantite) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    await db.query(
      'INSERT INTO repair_pieces (id_reparation, id_piece, quantite, prix_applique) VALUES (?, ?, ?, ?)',
      [id_reparation, id_piece, quantite, prix_applique]
    );

    await db.query(
      'UPDATE stock SET quantite_stock = quantite_stock - ? WHERE id = ?',
      [quantite, id_piece]
    );

    res.status(201).json({ message: 'Pièce ajoutée et stock décrémenté automatiquement' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/repairs/:id/pieces/:pieceId — retirer une pièce + remet le stock
router.delete('/:id/pieces/:pieceId', authMiddleware, async (req, res) => {
  try {
    const [rp] = await db.query(
      'SELECT * FROM repair_pieces WHERE id = ? AND id_reparation = ?',
      [req.params.pieceId, req.params.id]
    );
    if (rp.length === 0) return res.status(404).json({ message: 'Introuvable' });

    await db.query(
      'UPDATE stock SET quantite_stock = quantite_stock + ? WHERE id = ?',
      [rp[0].quantite, rp[0].id_piece]
    );

    await db.query('DELETE FROM repair_pieces WHERE id = ?', [req.params.pieceId]);
    res.json({ message: 'Pièce retirée et stock remis' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;