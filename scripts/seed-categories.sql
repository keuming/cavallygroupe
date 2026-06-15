-- Insérer les nouvelles catégories
INSERT INTO categories (name, slug, description, createdAt, updatedAt) VALUES
('Écritures', 'ecritures', 'Crayons, stylos, gommes, règles, ciseaux, taille-crayons et autres fournitures d''écriture', NOW(), NOW()),
('Papeterie', 'papeterie', 'Cahiers, agendas scolaires, blocs notes et autres articles de papeterie', NOW(), NOW()),
('Littérature', 'litterature', 'Romans, contes et autres œuvres littéraires', NOW(), NOW()),
('Maroquinerie', 'maroquinerie', 'Sacs, cartables et autres articles en cuir', NOW(), NOW());
