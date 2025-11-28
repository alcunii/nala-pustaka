const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

const authService = {
  async login(email, password) {
    // 1. Find user
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    const user = rows[0];

    if (!user) {
      throw new Error('User tidak ditemukan');
    }

    // 2. Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new Error('Password salah');
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info (without password) and token
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      session: {
        access_token: token
      }
    };
  }
};

module.exports = authService;
