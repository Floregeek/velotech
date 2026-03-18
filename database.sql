CREATE DATABASE IF NOT EXISTS velotech;
USE velotech;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('technicien','responsable') NOT NULL DEFAULT 'technicien',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE repair_pieces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_reparation INT,
    id_piece INT,
    quantite INT DEFAULT 1,
    prix_applique DECIMAL(10,2),
    FOREIGN KEY (id_reparation) REFERENCES repairs(id) ON DELETE CASCADE,
    FOREIGN KEY (id_piece) REFERENCES stock(id) ON DELETE SET NULL
);

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

-- ============ DONNÉES ============

-- Utilisateurs (mot de passe = "password")
INSERT INTO users (username, password, role) VALUES
('tech1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'technicien'),
('tech2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'technicien'),
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'responsable');

-- 4 Clients
INSERT INTO clients (nom, prenom, email, telephone, password, username) VALUES
('Dupont',  'Jean',    'jean.dupont@gmail.com',   '0612345678', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jean.dupont'),
('Martin',  'Sophie',  'sophie.martin@gmail.com', '0698765432', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sophie.martin'),
('Bernard', 'Lucas',   'lucas.bernard@gmail.com', '0634567890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lucas.bernard'),
('Leroy',   'Emma',    'emma.leroy@gmail.com',    '0656789012', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'emma.leroy');

-- 8 Vélos
INSERT INTO velos (id_client, numero_cadre, marque, modele, type_velo, annee) VALUES
(1, 'TRK-2022-001', 'Trek',        'Marlin 7',         'VTT',        2022),
(1, 'TRK-2020-002', 'Trek',        'FX 3 Disc',        'Ville',      2020),
(2, 'GNT-2023-003', 'Giant',       'Contend AR 2',     'Route',      2023),
(2, 'GNT-2021-004', 'Giant',       'Talon 3',          'VTT',        2021),
(3, 'SPZ-2021-005', 'Specialized', 'Rockhopper Comp',  'VTT',        2021),
(3, 'SCT-2023-006', 'Scott',       'Aspect 950',       'VTT',        2023),
(4, 'CAN-2022-007', 'Cannondale',  'Trail 5',          'VTT',        2022),
(4, 'YAM-2022-008', 'Yamaha',      'Cross Core RC',    'Électrique', 2022);

-- Fournisseurs
INSERT INTO fournisseurs (nom, email, telephone, adresse, site_web, specialite) VALUES
('Shimano France',   'pro@shimano-europe.com', '0145678901', '75008 Paris',      'www.shimano.com',   'Transmission'),
('SRAM Europe',      'dealer@sram.com',         '0156789012', '69002 Lyon',       'www.sram.com',      'Transmission'),
('Schwalbe',         'info@schwalbe.fr',         '0167890123', '67000 Strasbourg', 'www.schwalbe.com',  'Pneus'),
('Continental Vélo', 'velo@continental.fr',      '0178901234', '31000 Toulouse',   'www.continental.com','Pneus'),
('Mavic',            'pro@mavic.com',            '0189012345', '74000 Annecy',     'www.mavic.com',     'Roues'),
('SKS Germany',      'contact@sks-germany.fr',   '0112345678', '67000 Strasbourg', 'www.sks-germany.com','Accessoires');

-- Stock 20 pièces
INSERT INTO stock (nom, categorie, quantite_stock, prix, seuil_alerte, id_fournisseur) VALUES
('Chaîne Shimano 9v HG53',           'Transmission',  12,  15.90,  4,  1),
('Câble dérailleur Shimano',         'Transmission',  20,   3.50,  5,  1),
('Gaine dérailleur 1m',              'Transmission',  30,   1.20,  8,  1),
('Cassette Shimano 105 11-32T',      'Transmission',   5,  55.00,  3,  1),
('Dérailleur arrière Shimano Alivio','Transmission',   4,  38.00,  2,  1),
('Manette Shimano Altus 3x8v',       'Transmission',   3,  28.00,  2,  1),
('Patte de dérailleur universelle',  'Transmission',   8,  12.00,  3,  1),
('Plaquettes Shimano BR-M315',       'Freinage',      15,   8.50,  5,  1),
('Câble frein Shimano',              'Freinage',      25,   2.80,  6,  1),
('Gaine frein noire 1m',             'Freinage',      20,   1.50,  5,  1),
('Disque frein 160mm Shimano',       'Freinage',       6,  18.00,  3,  1),
('Liquide frein DOT5.1 500ml',       'Freinage',       4,  14.00,  3,  1),
('Patins frein V-brake Kool Stop',   'Freinage',      18,   6.50,  5,  1),
('Pneu Schwalbe Marathon 700x38',    'Pneus',          8,  32.00,  3,  3),
('Pneu Schwalbe Magic Mary 29x2.35', 'Pneus',          6,  48.00,  3,  3),
('Chambre à air 700x25-32',          'Pneus',         25,   5.50,  8,  3),
('Chambre à air 29x2.0-2.4',         'Pneus',         20,   6.00,  6,  3),
('Bidon lubrifiant chaîne 100ml',    'Entretien',     15,   8.00,  5,  6),
('Dégraissant vélo 500ml',           'Entretien',      3,  10.00,  4,  6),
('Graisse assemblage 150g',          'Entretien',     10,   9.00,  3,  6);

-- 12 Réparations variées
INSERT INTO repairs (id_velo, id_technicien, description, statut, date_entree, date_cloture, temps_reparation, notes) VALUES
(1, 1, 'Dérailleur arrière mal réglé, saut de chaîne en côte',      'Livré',      '2026-01-10', '2026-01-11',  45,  'Réglage butées H/L + tension câble'),
(2, 1, 'Frein avant qui frotte sur le disque',                       'Livré',      '2026-01-15', '2026-01-15',  30,  'Centrage étrier + purge légère'),
(3, 2, 'Crevaison pneu arrière, chambre à air percée',               'Livré',      '2026-01-20', '2026-01-20',  20,  'Remplacement chambre à air'),
(4, 1, 'Câble de frein arrière cassé',                               'Livré',      '2026-02-01', '2026-02-01',  25,  'Remplacement câble + gaine'),
(5, 2, 'Pneu VTT avant coupé, irréparable',                         'Livré',      '2026-02-05', '2026-02-06',  35,  'Remplacement pneu Schwalbe'),
(6, 1, 'Révision complète : chaîne usée, câbles oxydés',            'Livré',      '2026-02-15', '2026-02-17', 120,  'Chaîne + câbles dérailleurs + freins'),
(7, 2, 'Dérailleur arrière tordu après chute',                      'Livré',      '2026-02-25', '2026-02-26',  50,  'Remplacement patte + réglage'),
(8, 1, 'Batterie vélo électrique ne charge plus',                    'Terminé',    '2026-03-01', '2026-03-03',  45,  'Diagnostic électrique, contacteur nettoyé'),
(3, 2, 'Freins hydrauliques mous, besoin de purge',                  'Terminé',    '2026-03-05', '2026-03-06',  75,  'Purge DOT5.1 avant et arrière'),
(1, 1, 'Crevaison pneu arrière tubeless',                            'En cours',   '2026-03-10', NULL,         NULL, 'Réparation kit tubeless en cours'),
(6, 2, 'Dérailleur avant qui frotte sur le grand plateau',           'En attente', '2026-03-14', NULL,         NULL, NULL),
(7, 1, 'Chaîne qui saute sur le 3ème pignon, cassette à vérifier',  'En attente', '2026-03-17', NULL,         NULL, NULL);

-- Pièces utilisées
INSERT INTO repair_pieces (id_reparation, id_piece, quantite, prix_applique) VALUES
(1,  2,  1,  3.50),  -- Câble dérailleur
(1,  3,  1,  1.20),  -- Gaine dérailleur
(2,  11, 1, 18.00),  -- Disque frein
(3,  16, 1,  5.50),  -- Chambre à air 700x25
(4,  9,  1,  2.80),  -- Câble frein
(4,  10, 1,  1.50),  -- Gaine frein
(5,  15, 1, 48.00),  -- Pneu Schwalbe Magic Mary
(6,  1,  1, 15.90),  -- Chaîne Shimano 9v
(6,  2,  2,  3.50),  -- Câbles dérailleurs x2
(6,  9,  2,  2.80),  -- Câbles freins x2
(6,  10, 2,  1.50),  -- Gaines freins x2
(7,  7,  1, 12.00),  -- Patte dérailleur
(7,  2,  1,  3.50),  -- Câble dérailleur
(8,  19, 1, 10.00),  -- Dégraissant
(9,  12, 2, 14.00);  -- Liquide frein DOT5.1 x2