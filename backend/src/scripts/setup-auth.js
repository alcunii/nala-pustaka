const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function setupAuth() {
  console.log('?? Setting up Authentication System...');
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // 1. Create Users Table
    console.log('?? Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // 2. Create Admin User
    const email = 'abinawa007@gmail.com';
    const password = 'Bismillah001!';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log(`?? Creating admin user: ${email}`);
    
    // Check if exists first
    const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (check.rows.length > 0) {
      console.log('??  User already exists. Updating password...');
      await client.query('UPDATE users SET password_hash = $1, role = $2 WHERE email = $3', [hash, 'admin', email]);
    } else {
      await client.query(
        'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
        [email, hash, 'admin']
      );
      console.log('? Admin user created.');
    }

    await client.query('COMMIT');
    console.log('? Auth setup completed!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('? Auth setup failed:', error);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

setupAuth();
