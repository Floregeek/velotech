const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/fournisseurs
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.*, COUNT(s.id) as nb_pieces
      FROM fournisseurs f
      LEFT JOIN stock s ON s.id_fournisseur = f.id
      GROUP BY f.id
      ORDER BY f.nom
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/fournisseurs/:id/pieces — pièces d'un fournisseur
router.get('/:id/pieces', authMiddleware, async (req, res) => {
  try {
    const [fournisseur] = await db.query(
      'SELECT * FROM fournisseurs WHERE id = ?',
      [req.params.id]
    );
    if (fournisseur.length === 0) {
      return res.status(404).json({ message: 'Fournisseur introuvable' });
    }
    const [pieces] = await db.query(
      'SELECT * FROM stock WHERE id_fournisseur = ?',
      [req.params.id]
    );
    res.json({ fournisseur: fournisseur[0], pieces });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/fournisseurs
router.post('/', authMiddleware, async (req, res) => {
  const { nom, email, telephone, adresse, site_web, specialite } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO fournisseurs (nom, email, telephone, adresse, site_web, specialite)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, email, telephone, adresse, site_web, specialite]
    );
    res.status(201).json({ message: 'Fournisseur créé', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/fournisseurs/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { nom, email, telephone, adresse, site_web, specialite } = req.body;
  try {
    await db.query(
      `UPDATE fournisseurs SET nom=?, email=?, telephone=?,
       adresse=?, site_web=?, specialite=? WHERE id=?`,
      [nom, email, telephone, adresse, site_web, specialite, req.params.id]
    );
    res.json({ message: 'Fournisseur mis à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/fournisseurs/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM fournisseurs WHERE id = ?', [req.params.id]);
    res.json({ message: 'Fournisseur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;