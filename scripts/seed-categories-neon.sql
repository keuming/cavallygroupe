INSERT INTO categories (name, slug, description, icon, "displayOrder", "isActive") VALUES
('Manuels Scolaires', 'manuels-scolaires', 'Livres scolaires officiels pour tous niveaux', 'BookOpen', 1, true),
('Littérature', 'litterature', 'Romans, contes et œuvres littéraires', 'Book', 2, true),
('Parascolaire', 'parascolaire', 'Livres d aide et exercices complémentaires', 'GraduationCap', 3, true),
('Fournitures Scolaires', 'fournitures-scolaires', 'Cahiers, stylos et matériel scolaire', 'Pencil', 4, true),
('Livres Religieux', 'livres-religieux', 'Ouvrages religieux et spirituels', 'Heart', 5, true),
('Dictionnaires', 'dictionnaires', 'Dictionnaires et encyclopédies', 'Search', 6, true),
('Sciences', 'sciences', 'Livres scientifiques et techniques', 'Flask', 7, true),
('Arts et Culture', 'arts-culture', 'Livres d art, musique et culture générale', 'Palette', 8, true);

INSERT INTO "educationLevels" (name, slug, "displayOrder", "isActive") VALUES
('Maternelle', 'maternelle', 1, true),
('Primaire', 'primaire', 2, true),
('Collège', 'college', 3, true),
('Lycée', 'lycee', 4, true),
('Université', 'universite', 5, true);

INSERT INTO "educationClasses" ("educationLevelId", name, slug, "displayOrder", "isActive") VALUES
(1, 'Toute Petite Section (TPS)', 'tps', 1, true),
(1, 'Petite Section (PS)', 'ps', 2, true),
(1, 'Moyenne Section (MS)', 'ms', 3, true),
(1, 'Grande Section (GS)', 'gs', 4, true),
(2, 'CP1', 'cp1', 1, true),
(2, 'CP2', 'cp2', 2, true),
(2, 'CE1', 'ce1', 3, true),
(2, 'CE2', 'ce2', 4, true),
(2, 'CM1', 'cm1', 5, true),
(2, 'CM2', 'cm2', 6, true),
(3, '6ème', '6eme', 1, true),
(3, '5ème', '5eme', 2, true),
(3, '4ème', '4eme', 3, true),
(3, '3ème', '3eme', 4, true),
(4, '2nde', '2nde', 1, true),
(4, '1ère', '1ere', 2, true),
(4, 'Terminale', 'terminale', 3, true);
