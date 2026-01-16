-- Seed blog categories for Brega Funk
INSERT INTO blog_categories (name, slug, description, icon) VALUES
('Música', 'musica', 'Lançamentos, clipes e novidades musicais', '🎵'),
('Artistas', 'artistas', 'Perfis e entrevistas com artistas', '⭐'),
('Eventos', 'eventos', 'Shows, festas e eventos de brega funk', '🎉'),
('Cultura', 'cultura', 'Cultura da favela e do Recife', '🏙️'),
('Moda', 'moda', 'Estilo e moda da cena', '👟'),
('Notícias', 'noticias', 'Últimas notícias do brega funk', '📰')
ON CONFLICT (slug) DO NOTHING;
