const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const authMiddleware = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/auth/register (réservé responsable)
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role || 'technicien']
    );
    res.status(201).json({ message: 'Utilisateur créé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/auth/techniciens — liste des techniciens (responsable uniquement)
router.get('/techniciens', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, role, created_at FROM users ORDER BY role, username'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/auth/techniciens/:id
router.delete('/techniciens/:id', authMiddleware, async (req, res) => {
  try {
    // Empêche de supprimer son propre compte
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ message: 'Impossible de supprimer votre propre compte' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;