-- Insérer les catégories principales (niveau 1)
INSERT INTO categories (name, slug, description, icon, displayOrder, isActive) VALUES
('Écritures', 'ecritures', 'Crayons, stylos, gommes, règles et autres fournitures d''écriture', 'pen', 1, true),
('Papeterie', 'papeterie', 'Cahiers, agendas, blocs notes et articles de papeterie', 'book', 2, true),
('Littérature', 'litterature', 'Romans et œuvres littéraires', 'book-open', 3, true),
('Maroquinerie', 'maroquinerie', 'Sacs, cartables et articles en cuir', 'briefcase', 4, true),
('Manuels Scolaires', 'manuels-scolaires', 'Manuels pour l''école primaire et secondaire', 'book-marked', 5, true),
('Manuels Universitaires', 'manuels-universitaires', 'Livres et manuels pour l''enseignement supérieur', 'graduation-cap', 6, true);

-- Insérer les sous-catégories pour Écritures (niveau 2)
INSERT INTO categories (parentCategoryId, name, slug, description, icon, displayOrder, isActive) VALUES
((SELECT id FROM categories WHERE slug = 'ecritures'), 'Crayons', 'crayons', 'Crayons de couleur et crayons à papier', 'pencil', 1, true),
((SELECT id FROM categories WHERE slug = 'ecritures'), 'Stylos', 'stylos', 'Stylos à bille, gel et encre', 'pen-tool', 2, true),
((SELECT id FROM categories WHERE slug = 'ecritures'), 'Gommes', 'gommes', 'Gommes à effacer et correcteurs', 'eraser', 3, true),
((SELECT id FROM categories WHERE slug = 'ecritures'), 'Règles', 'regles', 'Règles, équerre et rapporteur', 'ruler', 4, true),
((SELECT id FROM categories WHERE slug = 'ecritures'), 'Ciseaux', 'ciseaux', 'Ciseaux et cutters', 'scissors', 5, true),
((SELECT id FROM categories WHERE slug = 'ecritures'), 'Taille-crayons', 'taille-crayons', 'Taille-crayons et affûteurs', 'tool', 6, true);

-- Insérer les sous-catégories pour Papeterie (niveau 2)
INSERT INTO categories (parentCategoryId, name, slug, description, icon, displayOrder, isActive) VALUES
((SELECT id FROM categories WHERE slug = 'papeterie'), 'Cahiers', 'cahiers', 'Cahiers de différents formats et lignes', 'book', 1, true),
((SELECT id FROM categories WHERE slug = 'papeterie'), 'Cahiers 200 pages', 'cahiers-200-pages', 'Cahiers de 200 pages', 'book', 2, true),
((SELECT id FROM categories WHERE slug = 'papeterie'), 'Cahiers 300 pages', 'cahiers-300-pages', 'Cahiers de 300 pages', 'book', 3, true),
((SELECT id FROM categories WHERE slug = 'papeterie'), 'Cahiers TP', 'cahiers-tp', 'Cahiers de travaux pratiques', 'book', 4, true),
((SELECT id FROM categories WHERE slug = 'papeterie'), 'Agendas', 'agendas', 'Agendas scolaires et semainiers', 'calendar', 5, true),
((SELECT id FROM categories WHERE slug = 'papeterie'), 'Blocs notes', 'blocs-notes', 'Blocs notes et carnets', 'sticky-note', 6, true);

-- Insérer les sous-catégories pour Littérature (niveau 2)
INSERT INTO categories (parentCategoryId, name, slug, description, icon, displayOrder, isActive) VALUES
((SELECT id FROM categories WHERE slug = 'litterature'), 'Romans', 'romans', 'Romans et fictions', 'book-open', 1, true),
((SELECT id FROM categories WHERE slug = 'litterature'), 'Littérature Africaine', 'litterature-africaine', 'Œuvres littéraires africaines', 'globe', 2, true),
((SELECT id FROM categories WHERE slug = 'litterature'), 'Littérature Française', 'litterature-francaise', 'Œuvres littéraires françaises', 'flag', 3, true);

-- Insérer les sous-catégories pour Maroquinerie (niveau 2)
INSERT INTO categories (parentCategoryId, name, slug, description, icon, displayOrder, isActive) VALUES
((SELECT id FROM categories WHERE slug = 'maroquinerie'), 'Cartables', 'cartables', 'Cartables et sacs d''école', 'backpack', 1, true),
((SELECT id FROM categories WHERE slug = 'maroquinerie'), 'Sacs à dos', 'sacs-a-dos', 'Sacs à dos de différents styles', 'backpack', 2, true),
((SELECT id FROM categories WHERE slug = 'maroquinerie'), 'Trousses', 'trousses', 'Trousses et étuis', 'briefcase', 3, true),
((SELECT id FROM categories WHERE slug = 'maroquinerie'), 'Porte-documents', 'porte-documents', 'Serviettes et porte-documents', 'briefcase', 4, true);
