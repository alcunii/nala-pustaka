const { Client } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

async function initDB() {
  console.log('?? Starting Database Initialization...');

  // 1. Create Database if not exists
  const sysClient = new Client({ ...dbConfig, database: 'postgres' });
  try {
    await sysClient.connect();
    const res = await sysClient.query("SELECT 1 FROM pg_database WHERE datname = 'nala_pustaka'");
    if (res.rowCount === 0) {
      console.log('?? Creating database "nala_pustaka"...');
      await sysClient.query('CREATE DATABASE nala_pustaka');
      console.log('? Database created.');
    } else {
      console.log('??  Database "nala_pustaka" already exists.');
    }
  } catch (err) {
    console.error('? Error checking/creating database:', err);
    process.exit(1);
  } finally {
    await sysClient.end();
  }

  // 2. Create Tables in nala_pustaka
  const client = new Client({ ...dbConfig, database: 'nala_pustaka' });
  try {
    await client.connect();
    console.log('?? Connected to "nala_pustaka". Creating tables...');

    await client.query('BEGIN');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Manuscripts Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS manuscripts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        author TEXT,
        year TEXT,
        description TEXT,
        slug TEXT UNIQUE NOT NULL,
        source_url TEXT,
        full_text TEXT,
        category TEXT,
        created_by UUID,
        display_order INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        knowledge_graph JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('? Table "manuscripts" created/verified.');

    // Educational Content Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS educational_content (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
        content_data JSONB NOT NULL,
        token_count INTEGER,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(manuscript_id)
      )
    `);
    console.log('? Table "educational_content" created/verified.');

    // Manuscript Relationships Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS manuscript_relationships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        source_manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
        related_manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
        relationship_type VARCHAR(50) NOT NULL,
        relationship_data JSONB,
        strength DECIMAL(3, 2) DEFAULT 0.5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(source_manuscript_id, related_manuscript_id, relationship_type)
      )
    `);
    console.log('? Table "manuscript_relationships" created/verified.');

    await client.query('COMMIT');
    console.log('?? Initialization complete!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('? Error initializing tables:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDB();
