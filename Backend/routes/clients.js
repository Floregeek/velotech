const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/clients/login — connexion client
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM clients WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Client introuvable' });
    }
    const client = rows[0];
    const valid = await bcrypt.compare(password, client.password);
    if (!valid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    const token = jwt.sign(
      { id: client.id, username: client.username, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      client: { id: client.id, username: client.username, nom: client.nom, prenom: client.prenom }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/clients/register — créer compte client + vélo
router.post('/register', async (req, res) => {
  const { nom, prenom, email, telephone, username, password,
          numero_cadre, marque, modele, type_velo, annee } = req.body;
  try {
    // Vérifie si username déjà pris
    const [existing] = await db.query(
      'SELECT id FROM clients WHERE username = ?', [username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà pris' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Crée le client
    const [clientResult] = await db.query(
      `INSERT INTO clients (nom, prenom, email, telephone, username, password)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, email, telephone, username, hashedPassword]
    );
    const id_client = clientResult.insertId;

    // Crée le vélo
    await db.query(
      `INSERT INTO velos (id_client, numero_cadre, marque, modele, type_velo, annee)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id_client, numero_cadre, marque, modele, type_velo, annee]
    );

    res.status(201).json({ message: 'Compte créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/clients/mes-reparations — suivi réparations du client connecté
router.get('/mes-reparations', authMiddleware, async (req, res) => {
  try {
    const [velos] = await db.query(
      'SELECT * FROM velos WHERE id_client = ?',
      [req.user.id]
    );

    const velosAvecReparations = await Promise.all(velos.map(async (v) => {
      const [reparations] = await db.query(`
        SELECT r.*, u.username as technicien_nom
        FROM repairs r
        LEFT JOIN users u ON r.id_technicien = u.id
        WHERE r.id_velo = ?
        ORDER BY r.date_entree DESC
      `, [v.id]);
      return { ...v, reparations };
    }));

    res.json(velosAvecReparations);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/clients
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nom, prenom, email, telephone, username FROM clients ORDER BY nom'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await db.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Client supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;