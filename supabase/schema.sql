-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: families
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_code VARCHAR UNIQUE,
  family_name VARCHAR,
  description TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: persons
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_code VARCHAR REFERENCES families(family_code) ON DELETE SET NULL,
  nik VARCHAR,
  family_status VARCHAR,
  full_name VARCHAR NOT NULL,
  nickname VARCHAR,
  gender VARCHAR,
  birth_place VARCHAR,
  birth_date DATE,
  death_date DATE,
  education VARCHAR,
  occupation VARCHAR,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  city VARCHAR,
  province VARCHAR,
  photo_path TEXT,
  parent_name VARCHAR,
  parent_address TEXT,
  life_status VARCHAR DEFAULT 'alive',
  data_status VARCHAR DEFAULT 'draft',
  edit_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: family_members
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  role VARCHAR, -- head, spouse, child, member
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: relationships
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  related_person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  relationship_type VARCHAR, -- parent, child, spouse
  status VARCHAR DEFAULT 'active',
  created_by UUID REFERENCES persons(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES persons(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: pending_persons
CREATE TABLE pending_persons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  gender VARCHAR,
  birth_place VARCHAR,
  birth_date DATE,
  relationship_type VARCHAR,
  created_by_person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  linked_person_id UUID REFERENCES persons(id) ON DELETE SET NULL,
  status VARCHAR DEFAULT 'pending', -- pending, linked, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: relationship_requests
CREATE TABLE relationship_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  target_person_id UUID REFERENCES persons(id) ON DELETE CASCADE,
  relationship_type VARCHAR,
  status VARCHAR DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: books
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR,
  subtitle VARCHAR,
  family_name VARCHAR,
  cover_path TEXT,
  status VARCHAR DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: book_sections
CREATE TABLE book_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  section_type VARCHAR, -- cover, toc, tree, generation, family, member, custom
  title VARCHAR,
  sort_order INTEGER,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: activity_logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT DO NOTHING;

-- Set up storage policies (allowing anonymous uploads for simplicity in this project)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
-- Since this project does NOT use Supabase Auth, we enable RLS
-- and create permissive policies so the anon key can read/write.

ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read for all tables
CREATE POLICY "Allow public read persons" ON persons FOR SELECT USING (true);
CREATE POLICY "Allow public insert persons" ON persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update persons" ON persons FOR UPDATE USING (true);
CREATE POLICY "Allow public delete persons" ON persons FOR DELETE USING (true);

CREATE POLICY "Allow public read families" ON families FOR SELECT USING (true);
CREATE POLICY "Allow public insert families" ON families FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update families" ON families FOR UPDATE USING (true);

CREATE POLICY "Allow public read family_members" ON family_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert family_members" ON family_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read relationships" ON relationships FOR SELECT USING (true);
CREATE POLICY "Allow public insert relationships" ON relationships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update relationships" ON relationships FOR UPDATE USING (true);
CREATE POLICY "Allow public delete relationships" ON relationships FOR DELETE USING (true);

CREATE POLICY "Allow public read pending_persons" ON pending_persons FOR SELECT USING (true);
CREATE POLICY "Allow public insert pending_persons" ON pending_persons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update pending_persons" ON pending_persons FOR UPDATE USING (true);

CREATE POLICY "Allow public read relationship_requests" ON relationship_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert relationship_requests" ON relationship_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update relationship_requests" ON relationship_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public read books" ON books FOR SELECT USING (true);
CREATE POLICY "Allow public insert books" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update books" ON books FOR UPDATE USING (true);

CREATE POLICY "Allow public read book_sections" ON book_sections FOR SELECT USING (true);
CREATE POLICY "Allow public insert book_sections" ON book_sections FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read activity_logs" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (true);
