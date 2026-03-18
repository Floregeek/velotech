const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { callLLM } = require('../llmService');

// POST /api/llm/analyze — diagnostic automatique
router.post('/analyze', authMiddleware, async (req, res) => {
  const { description, type_velo, id_reparation } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Description requise' });
  }

  try {
    const prompt = `Tu es un expert mécanicien vélo. Réponds UNIQUEMENT en JSON valide.

Vélo : ${type_velo || 'vélo non précisé'}
Problème : ${description}

Réponds avec exactement ce JSON et rien d'autre :
{
  "causes": ["cause 1", "cause 2", "cause 3"],
  "pieces": ["pièce 1", "pièce 2"],
  "etapes": ["étape 1", "étape 2", "étape 3", "étape 4"]
}`;

    const result = await callLLM(
  [{ role: 'user', content: prompt }],
  `Tu es un expert mécanicien vélo. 
   Utilise le vocabulaire technique correct : dérailleur, cassette, plateau, shifter, plaquettes, câble.
   Réponds UNIQUEMENT en JSON valide sans texte autour.`
  );

    const rawResponse = result.content;
    const tokens = result.tokens;

    let diagnostic;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      diagnostic = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(rawResponse);
    } catch {
      diagnostic = {
        causes: ['Impossible de parser la réponse'],
        pieces: [],
        etapes: ['Vérifiez manuellement']
      };
    }

    if (id_reparation) {
      await db.query(
        `INSERT INTO llm_diagnostics 
         (id_reparation, id_technicien, question_posee, reponse_llm, tokens_utilises)
         VALUES (?, ?, ?, ?, ?)`,
        [id_reparation, req.user.id, description, rawResponse, tokens]
      );
    }

    res.json({ diagnostic, tokens });

  } catch (err) {
    console.error('Erreur LLM:', err);
    res.status(503).json({
      message: 'Service IA temporairement indisponible',
      fallback: true
    });
  }
});

// POST /api/llm/rate — noter la qualité
router.post('/rate', authMiddleware, async (req, res) => {
  const { id_diagnostic, note } = req.body;
  try {
    await db.query(
      'UPDATE llm_diagnostics SET note_qualite = ? WHERE id = ?',
      [note, id_diagnostic]
    );
    res.json({ message: 'Note enregistrée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/llm/chat — chat avec RAG complet
router.post('/chat', authMiddleware, async (req, res) => {
  const { messages } = req.body;

  if (!messages || messages.length === 0) {
    return res.status(400).json({ message: 'Messages requis' });
  }

  try {
    // ============ RAG — Toute la BDD ============
    const [clients] = await db.query(
      'SELECT id, nom, prenom, email, telephone FROM clients ORDER BY nom'
    );
    const [velos] = await db.query(`
      SELECT v.id, v.marque, v.modele, v.type_velo, v.annee, v.numero_cadre,
             c.nom as client_nom, c.prenom as client_prenom
      FROM velos v LEFT JOIN clients c ON v.id_client = c.id
      ORDER BY v.marque
    `);
    const [repairs] = await db.query(`
      SELECT r.id, r.description, r.statut, r.date_entree, r.date_cloture,
             r.temps_reparation, v.marque as velo_marque, v.modele as velo_modele,
             u.username as technicien
      FROM repairs r
      LEFT JOIN velos v ON r.id_velo = v.id
      LEFT JOIN users u ON r.id_technicien = u.id
      ORDER BY r.created_at DESC
    `);
    const [stock] = await db.query(`
      SELECT s.nom, s.categorie, s.quantite_stock, s.prix, s.seuil_alerte,
             f.nom as fournisseur_nom, f.email as fournisseur_email,
             f.telephone as fournisseur_tel
      FROM stock s
      LEFT JOIN fournisseurs f ON s.id_fournisseur = f.id
      ORDER BY s.categorie, s.nom
    `);
    const [fournisseurs] = await db.query(
      'SELECT id, nom, email, telephone, specialite, adresse FROM fournisseurs ORDER BY nom'
    );
    const [techniciens] = await db.query(
      'SELECT username, role FROM users ORDER BY role'
    );
    const [topPannes] = await db.query(`
      SELECT description, COUNT(*) as nb FROM repairs
      GROUP BY description ORDER BY nb DESC LIMIT 5
    `);
    const [topPieces] = await db.query(`
      SELECT s.nom, SUM(rp.quantite) as total_utilise
      FROM repair_pieces rp LEFT JOIN stock s ON rp.id_piece = s.id
      GROUP BY s.nom ORDER BY total_utilise DESC LIMIT 5
    `);

    const enAttente = repairs.filter(r => r.statut === 'En attente').length;
    const enCours = repairs.filter(r => r.statut === 'En cours').length;
    const terminees = repairs.filter(r => r.statut === 'Terminé').length;
    const stockAlerte = stock.filter(p => p.quantite_stock <= p.seuil_alerte);

    const contexteAtelier = `
=== CONTEXTE COMPLET DE L'ATELIER VELOTECH ===

👥 CLIENTS (${clients.length} clients) :
${clients.length > 0
  ? clients.map(c => `- ${c.prenom} ${c.nom} | ${c.email || '—'} | ${c.telephone || '—'}`).join('\n')
  : '- Aucun client'}

🚲 VÉLOS (${velos.length} vélos) :
${velos.length > 0
  ? velos.map(v => `- ${v.marque} ${v.modele} (${v.type_velo || '—'} ${v.annee || '—'}) | N°: ${v.numero_cadre} | ${v.client_prenom || '—'} ${v.client_nom || '—'}`).join('\n')
  : '- Aucun vélo'}

🔧 RÉPARATIONS (${repairs.length} total | ${enAttente} en attente | ${enCours} en cours | ${terminees} terminées) :
${repairs.length > 0
  ? repairs.map(r => `- #${r.id} ${r.velo_marque || ''} ${r.velo_modele || ''} | "${r.description}" | ${r.statut} | ${r.technicien || '—'}`).join('\n')
  : '- Aucune réparation'}

📦 STOCK (${stock.length} pièces) :
${stock.length > 0
  ? stock.map(p => `- ${p.nom} (${p.categorie}) | ${p.quantite_stock} en stock | ${p.prix}€${p.fournisseur_nom ? ` | Fournisseur: ${p.fournisseur_nom}` : ''}`).join('\n')
  : '- Aucune pièce'}

${stockAlerte.length > 0
  ? `⚠️ STOCK BAS (${stockAlerte.length} pièces) :
${stockAlerte.map(p => `- ${p.nom} : ${p.quantite_stock} restants (seuil: ${p.seuil_alerte})${p.fournisseur_nom ? ` → Contacter: ${p.fournisseur_nom} (${p.fournisseur_tel || p.fournisseur_email || '—'})` : ''}`).join('\n')}`
  : '✅ Aucune rupture de stock'}

🏭 FOURNISSEURS (${fournisseurs.length} fournisseurs) :
${fournisseurs.length > 0
  ? fournisseurs.map(f => `- ${f.nom} | Spécialité: ${f.specialite || '—'} | Email: ${f.email || '—'} | Tél: ${f.telephone || '—'} | ${f.adresse || '—'}`).join('\n')
  : '- Aucun fournisseur'}

👨‍🔧 ÉQUIPE (${techniciens.length} personnes) :
${techniciens.map(t => `- ${t.username} (${t.role})`).join('\n')}

📊 PANNES FRÉQUENTES :
${topPannes.length > 0
  ? topPannes.map(p => `- "${p.description}" : ${p.nb} fois`).join('\n')
  : '- Pas encore de données'}

🔩 PIÈCES LES PLUS UTILISÉES :
${topPieces.length > 0
  ? topPieces.map(p => `- ${p.nom} : ${p.total_utilise} fois`).join('\n')
  : '- Pas encore de données'}

=== FIN DU CONTEXTE ===`;
const systemPrompt = `Tu es VeloBot, expert mécanicien vélo de l'atelier VeloTech.

VOCABULAIRE TECHNIQUE OBLIGATOIRE :
- Dérailleur arrière/avant
- Câble de dérailleur
- Cassette = pignons arrière
- Plateau = grand pignon avant
- Shifter = manette de vitesse
- Plaquettes de frein
- Tension du câble
- Vis de butée H et L
- Tendeur de câble
- Chaîne (pas "courroie")
- Pignons (pas "cogs")

DONNÉES DE L'ATELIER :
${contexteAtelier}

RÈGLES STRICTES :
- MAXIMUM 5 lignes ou 5 étapes par réponse, pas plus
- Pas d'introduction, commence directement par la réponse
- Pas de conclusion comme "Si vous ne vous sentez pas..."
- Pas de "Il est recommandé de consulter un professionnel"
- Utilise le vocabulaire technique ci-dessus obligatoirement
- Questions vélo → réponds avec ton expertise
- Questions atelier → utilise les données ci-dessus
- Questions hors vélo → refuse en une phrase courte
- Réponds en français uniquement`;

    const result = await callLLM(messages, systemPrompt);

    res.json({ response: result.content, tokens: result.tokens });

  } catch (err) {
    console.error('Erreur chat LLM:', err);
    res.status(503).json({
      message: 'Service IA temporairement indisponible',
      fallback: true
    });
  }
});

module.exports = router;