-- Create blog tables for Brega Funk Recife

-- Articles/News table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog categories (different from finance categories)
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  photo TEXT,
  instagram TEXT,
  spotify TEXT,
  youtube TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos/Clips table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  thumbnail TEXT,
  artist_id UUID REFERENCES artists(id),
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table (extends auth.users)
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for articles
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all articles"
  ON articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can view categories"
  ON blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON blog_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- RLS Policies for artists
CREATE POLICY "Anyone can view artists"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage artists"
  ON artists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- RLS Policies for videos
CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage videos"
  ON videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles
      WHERE admin_roles.user_id = auth.uid()
    )
  );

-- Function to update article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET views = views + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
