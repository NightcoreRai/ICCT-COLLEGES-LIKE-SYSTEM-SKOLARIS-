const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, userType } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    const connection = await pool.getConnection();

    const [existingUser] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      'INSERT INTO users (email, password, name, user_type, created_at) VALUES (?, ?, ?, ?, NOW())',
      [email, hashedPassword, name, userType || 'student']
    );

    connection.release();

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();

    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.user_type
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, email, name, user_type FROM users WHERE id = ?', [req.user.userId]);
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

router.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const lookupId = req.user.userId || req.user.id;

    if (!lookupId) {
      return res.status(401).json({ message: 'Invalid token: no user ID found' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [lookupId]);

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Unable to find your account.' });
    }

    const user = users[0];
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      connection.release();
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashed, lookupId]);
    connection.release();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
});

module.exports = router;
