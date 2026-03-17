# 🚲 VeloTech — Logiciel de Gestion d'Atelier Vélo

Projet académique réalisé dans le cadre du Master I IM/MIAGE  
Université de Haute-Alsace — Faculté des Sciences et Techniques

**Réalisé par :** ANATO Floriane & HAMOUDI Amine  
**Superviseur :** Dr. Karim HAMMOUDI  
**Date :** Mars 2026

---

## 📋 Description

VeloTech est un logiciel de gestion de réparation spécialisé pour les ateliers vélo.
Il intègre un assistant IA (LLM) capable de :
- Proposer un diagnostic automatique basé sur la description de la panne
- Répondre à toutes les questions liées au domaine du vélo (VeloBot)

---

## ⚙️ Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | React.js |
| Backend | Node.js + Express |
| Base de données | MySQL (XAMPP ou WAMP) |
| IA | Groq API (LLaMA 3.3 70B) |
| Authentification | JWT + bcrypt |

---

## 🚀 Installation et Lancement

### Prérequis
- [Node.js LTS](https://nodejs.org)
- [XAMPP](https://www.apachefriends.org) OU [WAMP](https://www.wampserver.com)
- [VS Code](https://code.visualstudio.com)

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

✅ Tu dois voir la base `velotech` avec 7 tables créées.

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
```

> 💡 Clé Groq gratuite : https://console.groq.com  
> ⚠️ Le fichier `.env` est identique que tu utilises XAMPP ou WAMP

---

### Étape 3 — Installer les dépendances

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

### Étape 4 — Lancer le projet

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
| tech1 | password | Technicien | Réparations + Assistant IA |
| admin | password | Responsable | Dashboard + Stock |

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
- Filtres par statut et par période
- Fiche détail réparation avec diagnostic IA automatique
- Ajout de pièces utilisées (décrémentation stock automatique)
- Historique complet par vélo
- Chat IA spécialisé vélo (VeloBot)

### 👑 Responsable
- Tableau de bord avec statistiques et alertes stock
- Gestion complète du stock de pièces
- Alertes automatiques sous le seuil configurable

### 👤 Client
- Création de compte avec dépôt de vélo
- Suivi en temps réel de l'état des réparations
- Accès via http://localhost:3000/client

---

## 🤖 Fonctionnalités IA

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
│   │   ├── auth.js          # Authentification JWT
│   │   ├── repairs.js       # CRUD réparations + pièces
│   │   ├── stock.js         # CRUD stock
│   │   ├── velos.js         # Gestion vélos + historique
│   │   ├── clients.js       # Gestion clients + suivi
│   │   └── llm.js           # Diagnostic IA + Chat VeloBot
│   ├── middleware/
│   │   ├── auth.js          # Vérification token JWT
│   │   └── role.js          # Vérification rôle
│   ├── db.js                # Connexion MySQL
│   ├── server.js            # Point d'entrée API
│   └── .env                 # Variables d'environnement
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Login.js           # Connexion atelier
│       │   ├── Dashboard.js       # Tableau de bord
│       │   ├── Repairs.js         # Liste réparations
│       │   ├── RepairDetail.js    # Fiche + diagnostic IA
│       │   ├── Stock.js           # Gestion stock
│       │   ├── VeloHistorique.js  # Historique vélo
│       │   ├── ChatIA.js          # Chat VeloBot
│       │   ├── ClientLogin.js     # Connexion client
│       │   └── ClientDashboard.js # Espace client
│       ├── App.js
│       └── index.css
│
└── database.sql             # Script création BDD
```

---

## 🧪 Scénarios de Test

### Test 1 — Connexion technicien
1. Aller sur http://localhost:3000/login
2. Se connecter avec `tech1` / `password`
3. ✅ Accès au tableau de bord avec menu Réparations + Assistant IA

### Test 2 — Connexion responsable
1. Se connecter avec `admin` / `password`
2. ✅ Menu affiche uniquement Dashboard + Stock
3. ✅ Impossible d'accéder à /repairs (redirigé)

### Test 3 — Créer une réparation
1. Aller dans **Réparations**
2. Cliquer **+ Nouvelle réparation**
3. Sélectionner un vélo, décrire le problème
4. ✅ Réparation visible dans la liste avec statut "En attente"

### Test 4 — Diagnostic IA
1. Cliquer **👁️ Voir** sur une réparation
2. Cliquer **🔍 Analyser avec l'IA**
3. ✅ Causes, pièces recommandées et étapes affichées en moins de 8s

### Test 5 — Décrémentation stock automatique
1. Dans la fiche réparation, ajouter une pièce
2. Aller dans **Stock** (connecté en admin)
3. ✅ Quantité décrémentée automatiquement

### Test 6 — Alerte stock
1. Modifier une pièce avec quantité ≤ seuil
2. ✅ Badge rouge + bannière d'alerte visible

### Test 7 — Chat VeloBot
1. Aller dans **🤖 Assistant IA**
2. Poser une question vélo : "Comment régler un dérailleur ?"
3. ✅ Réponse détaillée et professionnelle
4. Poser une question hors sujet : "Quelle est la capitale de la France ?"
5. ✅ VeloBot répond qu'il est spécialisé vélo uniquement

### Test 8 — Espace client
1. Aller sur http://localhost:3000/client
2. Créer un compte avec "Déposer mon vélo"
3. Se connecter avec les identifiants créés
4. ✅ Voir le statut des réparations de son vélo

### Test 9 — Historique vélo
1. Ouvrir une fiche réparation
2. Cliquer **📜 Voir tout l'historique de ce vélo**
3. ✅ Liste de toutes les réparations du vélo avec stats

### Test 10 — Mode dégradé IA
1. Mettre une clé API invalide dans .env
2. Cliquer "Analyser avec l'IA"
3. ✅ Message d'erreur clair, application reste fonctionnelle

---

## ⚠️ Remarques

- Connexion internet requise pour l'assistant IA (Groq API)
- En cas d'indisponibilité de l'IA, toutes les autres fonctionnalités restent actives
- Les données sont stockées localement dans MySQL via XAMPP ou WAMP
- Interface entièrement en français
- Le fichier `.env` est identique que tu utilises XAMPP ou WAMP