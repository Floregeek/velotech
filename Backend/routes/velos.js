const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/velos

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, c.nom as client_nom, c.prenom as client_prenom
      FROM velos v LEFT JOIN clients c ON v.id_client = c.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/velos/:id/historique — historique complet d'un vélo
router.get('/:id/historique', authMiddleware, async (req, res) => {
  try {
    const [velo] = await db.query(`
      SELECT v.*, c.nom as client_nom, c.prenom as client_prenom
      FROM velos v 
      LEFT JOIN clients c ON v.id_client = c.id
      WHERE v.id = ?
    `, [req.params.id]);

    if (velo.length === 0) {
      return res.status(404).json({ message: 'Vélo introuvable' });
    }

    const [reparations] = await db.query(`
      SELECT r.*, u.username as technicien_nom
      FROM repairs r
      LEFT JOIN users u ON r.id_technicien = u.id
      WHERE r.id_velo = ?
      ORDER BY r.date_entree DESC
    `, [req.params.id]);

    res.json({ velo: velo[0], reparations });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


module.exports = router;