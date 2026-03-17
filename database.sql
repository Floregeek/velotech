CREATE DATABASE IF NOT EXISTS velotech;
USE velotech;

-- Table utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('technicien','responsable') NOT NULL DEFAULT 'technicien',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table clients
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    telephone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password VARCHAR(255),
    username VARCHAR(50) UNIQUE
);

-- Table vélos
CREATE TABLE velos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_client INT,
    numero_cadre VARCHAR(50) UNIQUE NOT NULL,
    marque VARCHAR(100),
    modele VARCHAR(100),
    type_velo VARCHAR(50),
    annee INT,
    FOREIGN KEY (id_client) REFERENCES clients(id) ON DELETE SET NULL
);

-- Table fournisseurs (avant stock pour la FK)
CREATE TABLE fournisseurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    telephone VARCHAR(20),
    adresse TEXT,
    site_web VARCHAR(200),
    specialite VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table stock
CREATE TABLE stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_fournisseur INT,
    nom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50),
    quantite_stock INT DEFAULT 0,
    prix DECIMAL(10,2),
    seuil_alerte INT DEFAULT 5,
    FOREIGN KEY (id_fournisseur) REFERENCES fournisseurs(id) ON DELETE SET NULL
);

-- Table réparations
CREATE TABLE repairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_velo INT,
    id_technicien INT,
    description TEXT,
    statut ENUM('En attente','En cours','Terminé','Livré') DEFAULT 'En attente',
    date_entree DATE,
    date_cloture DATE,
    temps_reparation INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_velo) REFERENCES velos(id) ON DELETE SET NULL,
    FOREIGN KEY (id_technicien) REFERENCES users(id) ON DELETE SET NULL
);

-- Table liaison réparation-pièces
CREATE TABLE repair_pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_reparation INT,
    id_piece INT,
    quantite INT DEFAULT 1,
    prix_applique DECIMAL(10,2),
    FOREIGN KEY (id_reparation) REFERENCES repairs(id) ON DELETE CASCADE,
    FOREIGN KEY (id_piece) REFERENCES stock(id) ON DELETE SET NULL
);

-- Table diagnostics LLM
CREATE TABLE llm_diagnostics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_reparation INT,
    id_technicien INT,
    question_posee TEXT,
    reponse_llm TEXT,
    note_qualite INT,
    tokens_utilises INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reparation) REFERENCES repairs(id) ON DELETE CASCADE,
    FOREIGN KEY (id_technicien) REFERENCES users(id) ON DELETE SET NULL
);

-- Données de test
INSERT INTO users (username, password, role) VALUES
('tech1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'technicien'),
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'responsable');

INSERT INTO clients (nom, prenom, email, telephone, password, username) VALUES
('Dupont', 'Jean', 'jean@mail.com', '0612345678', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jean.dupont'),
('Martin', 'Sophie', 'sophie@mail.com', '0698765432', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sophie.martin');

INSERT INTO velos (id_client, numero_cadre, marque, modele, type_velo, annee) VALUES
(1, 'CADRE001', 'Trek', 'Marlin 7', 'VTT', 2022),
(2, 'CADRE002', 'Giant', 'Contend', 'Route', 2023);

INSERT INTO fournisseurs (nom, email, telephone, adresse, specialite) VALUES
('Shimano France', 'contact@shimano.fr', '0145678901', 'Paris, France', 'Transmission'),
('Schwalbe', 'info@schwalbe.fr', '0156789012', 'Lyon, France', 'Pneus'),
('Mavic', 'pro@mavic.com', '0167890123', 'Annecy, France', 'Roues');

INSERT INTO stock (nom, categorie, quantite_stock, prix, seuil_alerte, id_fournisseur) VALUES
('Chaîne 9 vitesses', 'Transmission', 10, 15.00, 3, 1),
('Plaquettes frein V-brake', 'Freinage', 8, 8.50, 5, 1),
('Chambre à air 700x25', 'Pneus', 15, 6.00, 5, 2),
('Câble frein arrière', 'Freinage', 12, 4.50, 3, 1),
('Patte de dérailleur', 'Transmission', 4, 12.00, 3, 1);

INSERT INTO repairs (id_velo, id_technicien, description, statut, date_entree) VALUES
(1, 1, 'Frein arrière ne fonctionne plus', 'En attente', '2026-03-01'),
(2, 1, 'Pneu crevé à réparer', 'En cours', '2026-03-02');