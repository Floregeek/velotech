const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/stock
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, f.nom as fournisseur_nom
      FROM stock s
      LEFT JOIN fournisseurs f ON s.id_fournisseur = f.id
      ORDER BY s.nom
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/stock — ajouter une pièce
router.post('/', authMiddleware, async (req, res) => {
  const { nom, categorie, quantite_stock, prix, seuil_alerte, id_fournisseur } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO stock (nom, categorie, quantite_stock, prix, seuil_alerte, id_fournisseur)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, categorie, quantite_stock, prix, seuil_alerte || 5, id_fournisseur || null]
    );
    res.status(201).json({ message: 'Pièce ajoutée', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/stock/:id — modifier une pièce
router.put('/:id', authMiddleware, async (req, res) => {
  const { nom, categorie, quantite_stock, prix, seuil_alerte, id_fournisseur } = req.body;
  try {
    await db.query(
      `UPDATE stock SET nom=?, categorie=?, quantite_stock=?,
       prix=?, seuil_alerte=?, id_fournisseur=? WHERE id=?`,
      [nom, categorie, quantite_stock, prix, seuil_alerte, id_fournisseur || null, req.params.id]
    );
    res.json({ message: 'Pièce mise à jour' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/stock/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM stock WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pièce supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;