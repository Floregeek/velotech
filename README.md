# 🚲 VeloTech — Logiciel de Gestion d'Atelier Vélo

Projet académique réalisé dans le cadre du Master I IM/MIAGE
Université de Haute-Alsace — Faculté des Sciences et Techniques

**Réalisé par :** ANATO Floriane & HAMOUDI Amine
**Superviseur :** Dr. Karim HAMMOUDI
**Date :** 17 Mars 2026

---

## 📋 Description

VeloTech est un logiciel de gestion de réparation spécialisé pour les ateliers vélo.
Il intègre un assistant IA (LLM) capable de :
- Proposer un diagnostic automatique basé sur la description de la panne
- Répondre à toutes les questions liées au domaine du vélo (VeloBot)
- Accéder aux données réelles de l'atelier via le RAG (Retrieval Augmented Generation)

---

## ⚙️ Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Base de données | MySQL (XAMPP ou WAMP) |
| IA principale | Ollama — llama3.2:1b (local, hermétique) |
| IA secondaire | Groq API — LLaMA 3.3 70B (fallback cloud) |
| Authentification | JWT + bcrypt |

---

## 🚀 Installation et Lancement

### Prérequis
- [Node.js LTS](https://nodejs.org)
- [XAMPP](https://www.apachefriends.org) OU [WAMP](https://www.wampserver.com)
- [Ollama](https://ollama.com/download) (pour le mode IA local)
- [VS Code](https://code.visualstudio.com) (recommandé)

---

### Étape 1 — Base de données

**Avec XAMPP :**
1. Ouvre XAMPP → démarre **Apache** et **MySQL**
2. Va sur http://localhost/phpmyadmin

**Avec WAMP :**
1. Clique sur l'icône WAMP dans la barre des tâches
2. Clique **Start All Services** → attends que l'icône soit **verte** ✅
3. Clique sur l'icône WAMP → **phpMyAdmin**

**Les deux :**
1. Clique sur **SQL**
2. Colle le contenu du fichier `database.sql`
3. Clique **Exécuter**

✅ Tu dois voir la base `velotech` avec 9 tables créées.

---

### Étape 2 — Configuration Backend

Dans le dossier `backend/`, crée un fichier `.env` :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=velotech
JWT_SECRET=velotechsecret
PORT=5000
GROQ_API_KEY=ta_clé_groq_ici
OLLAMA_URL=http://localhost:11434
LLM_MODE=ollama
```

> 💡 Clé Groq gratuite : https://console.groq.com
> 💡 LLM_MODE=ollama → utilise Ollama local | LLM_MODE=groq → utilise Groq cloud
> ⚠️ Le fichier `.env` est identique que tu utilises XAMPP ou WAMP

---

### Étape 3 — Installer Ollama et le modèle IA

```bash
# 1. Télécharge et installe Ollama sur https://ollama.com/download
# 2. Redémarre ton PC
# 3. Télécharge le modèle léger
ollama pull llama3.2:1b

# 4. Vérifie que ça fonctionne
ollama run llama3.2:1b "Bonjour, tu es expert vélo ?"
```

> ℹ️ Sur Windows, Ollama se lance automatiquement au démarrage.
> Tu n'as pas besoin de faire `ollama serve` manuellement.

---

### Étape 4 — Installer les dépendances

**Backend :**
```bash
cd backend
npm install
```

**Frontend :**
```bash
cd frontend
npm install
```

---

### Étape 5 — Lancer le projet

Ouvre **2 terminaux** dans VS Code :

**Terminal 1 — Backend :**
```bash
cd backend
node server.js
```
✅ Tu dois voir : `Serveur démarré sur http://localhost:5000`

**Terminal 2 — Frontend :**
```bash
cd frontend
npm start
```
✅ Le navigateur s'ouvre sur `http://localhost:3000`

---

## 🔐 Comptes de test

### Atelier (http://localhost:3000/login)

| Utilisateur | Mot de passe | Rôle | Accès |
|---|---|---|---|
| tech1 | password | Technicien | Réparations + Assistant IA + VeloBot |
| admin | password | Responsable | Dashboard + Stock + Fournisseurs + Utilisateurs + Rapports |

### Client (http://localhost:3000/client)

| Utilisateur | Mot de passe | Accès |
|---|---|---|
| jean.dupont | password | Suivi réparations |
| sophie.martin | password | Suivi réparations |

---

## 📱 Fonctionnalités par rôle

### 🔧 Technicien
- Tableau de bord avec statistiques en temps réel
- Gestion complète des réparations (CRUD)
- Filtres par statut et par période (date début → date fin)
- Fiche détail réparation avec diagnostic IA automatique
- Ajout de pièces utilisées (décrémentation stock automatique)
- Historique complet par vélo
- Chat IA spécialisé vélo (VeloBot) avec RAG

### 👑 Responsable
- Tableau de bord avec statistiques et alertes stock
- Gestion complète du stock de pièces
- Alertes automatiques sous le seuil configurable
- Gestion des fournisseurs (CRUD complet)
- Liaison pièces ↔ fournisseurs
- Gestion des utilisateurs (créer/supprimer techniciens et responsables)
- Génération de rapports PDF (réparations, stock, activité)

### 👤 Client
- Création de compte avec dépôt de vélo
- Suivi en temps réel de l'état des réparations
- Messages contextuels selon le statut
- Accès via http://localhost:3000/client

---

## 🤖 Fonctionnalités IA

### Architecture hybride Ollama + Groq
- **Mode Ollama (local)** : exécution hermétique sur la machine,
  aucune donnée ne quitte le réseau local
- **Mode Groq (cloud)** : fallback automatique si Ollama indisponible,
  ou mode démonstration pour comparer les performances
- Basculement via `LLM_MODE` dans le fichier `.env`

### RAG — Retrieval Augmented Generation
L'IA accède en temps réel aux données de la BDD avant chaque réponse :
clients, vélos, réparations, stock, fournisseurs, techniciens.
Permet de répondre précisément à des questions comme :
- "Quel est mon stock actuel ?"
- "Quel fournisseur contacter pour les plaquettes ?"
- "Quelles sont les pannes les plus fréquentes ?"

### Diagnostic automatique
- Analyse la description du problème en langage naturel
- Propose les causes possibles
- Recommande les pièces à vérifier
- Détaille les étapes de diagnostic étape par étape
- Notation de la qualité de la réponse (1 à 5 étoiles)
- Mode dégradé si l'IA est indisponible

### VeloBot — Chat IA spécialisé
- Assistant conversationnel spécialisé dans le domaine du vélo
- Répond à toutes les questions : réparations, entretien, réglages, pièces
- Historique de conversation maintenu
- Questions suggérées pour démarrer
- Refuse poliment les questions hors domaine vélo

---

## 📁 Structure du Projet

```
velotech/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Authentification JWT + gestion utilisateurs
│   │   ├── repairs.js       # CRUD réparations + pièces + décrémentation
│   │   ├── stock.js         # CRUD stock + liaison fournisseurs
│   │   ├── velos.js         # Gestion vélos + historique
│   │   ├── clients.js       # Espace client + suivi réparations
│   │   ├── fournisseurs.js  # CRUD fournisseurs + pièces liées
│   │   ├── llm.js           # Diagnostic IA + Chat VeloBot + RAG
│   │   └── rapports.js      # Génération PDF (réparations, stock, activité)
│   ├── middleware/
│   │   ├── auth.js          # Vérification token JWT
│   │   └── role.js          # Vérification rôle
│   ├── llmService.js        # Service hybride Ollama + Groq
│   ├── db.js                # Connexion MySQL
│   ├── server.js            # Point d'entrée API
│   └── .env                 # Variables d'environnement
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.js           # Connexion atelier
│       │   ├── Dashboard.js       # Tableau de bord + Sidebar
│       │   ├── Repairs.js         # Liste réparations + filtres
│       │   ├── RepairDetail.js    # Fiche + diagnostic IA + pièces
│       │   ├── Stock.js           # Gestion stock + fournisseurs
│       │   ├── Fournisseurs.js    # Gestion fournisseurs
│       │   ├── VeloHistorique.js  # Historique vélo
│       │   ├── ChatIA.js          # Chat VeloBot
│       │   ├── Rapports.js        # Génération rapports PDF
│       │   ├── Techniciens.js     # Gestion utilisateurs
│       │   ├── ClientLogin.js     # Connexion client
│       │   └── ClientDashboard.js # Espace client suivi
│       ├── App.js
│       └── index.css
│
└── database.sql             # Script création BDD (9 tables)
```

---

## 🧪 Scénarios de Test

### Test 1 — Connexion technicien
1. Aller sur http://localhost:3000/login
2. Se connecter avec `tech1` / `password`
3. ✅ Menu : Tableau de bord + Réparations + Assistant IA

### Test 2 — Connexion responsable
1. Se connecter avec `admin` / `password`
2. ✅ Menu : Dashboard + Stock + Fournisseurs + Utilisateurs + Rapports
3. ✅ Impossible d'accéder à /repairs (redirigé automatiquement)

### Test 3 — Créer une réparation
1. Aller dans **Réparations**
2. Cliquer **+ Nouvelle réparation**
3. Sélectionner un vélo, décrire le problème
4. ✅ Réparation visible dans la liste avec statut "En attente"

### Test 4 — Diagnostic IA
1. Cliquer **👁️ Voir** sur une réparation
2. Cliquer **🔍 Analyser avec l'IA**
3. ✅ Causes, pièces recommandées et étapes affichées

### Test 5 — Décrémentation stock automatique
1. Dans la fiche réparation, ajouter une pièce
2. Se connecter en admin → aller dans **Stock**
3. ✅ Quantité décrémentée automatiquement

### Test 6 — Alerte stock
1. Modifier une pièce avec quantité ≤ seuil
2. ✅ Badge rouge + bannière d'alerte avec fournisseur à contacter

### Test 7 — Chat VeloBot avec RAG
1. Aller dans **🤖 Assistant IA**
2. Poser : "Combien de vélos j'ai dans l'atelier ?"
3. ✅ Réponse avec données réelles de la BDD
4. Poser : "Quel fournisseur pour les pneus ?"
5. ✅ Réponse avec le fournisseur lié dans la BDD

### Test 8 — Espace client
1. Aller sur http://localhost:3000/client
2. Créer un compte avec "Déposer mon vélo"
3. Se connecter → voir le statut des réparations
4. ✅ Message contextuel selon le statut

### Test 9 — Historique vélo
1. Ouvrir une fiche réparation
2. Cliquer **📜 Voir tout l'historique de ce vélo**
3. ✅ Liste de toutes les réparations avec statistiques

### Test 10 — Rapports PDF
1. Se connecter en admin
2. Aller dans **📄 Rapports**
3. Cliquer **Télécharger PDF** sur chaque rapport
4. ✅ PDF généré et téléchargé en moins de 3s

### Test 11 — Gestion utilisateurs
1. Se connecter en admin
2. Aller dans **👨‍🔧 Utilisateurs**
3. Créer un nouveau technicien
4. ✅ Compte créé, visible dans la liste

### Test 12 — Mode dégradé IA
1. Mettre `LLM_MODE=ollama` avec Ollama arrêté
2. Cliquer "Analyser avec l'IA"
3. ✅ Fallback automatique vers Groq
4. ✅ Application reste fonctionnelle dans tous les cas

---

## ⚠️ Remarques

- Ollama doit être installé pour le mode IA local hermétique
- En mode Groq, une connexion internet est requise
- En cas d'indisponibilité totale de l'IA, toutes les autres fonctionnalités restent actives
- Les données sont stockées localement dans MySQL via XAMPP ou WAMP
- Interface entièrement en français
- Le fichier `.env` est identique que tu utilises XAMPP ou WAMP