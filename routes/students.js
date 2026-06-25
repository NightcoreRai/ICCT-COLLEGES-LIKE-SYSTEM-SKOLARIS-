const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.query(
      'SELECT id, student_id, first_name, last_name, email, grade_level, status FROM students'
    );
    connection.release();
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.query(
      'SELECT * FROM students WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (students.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ student: students[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching student', error: error.message });
  }
});

router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { student_id, first_name, last_name, email, date_of_birth, grade_level, phone } = req.body;

  try {
    if (!student_id || !first_name || !last_name || !email) {
      return res.status(400).json({ message: 'Required fields: student_id, first_name, last_name, email' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO students (student_id, first_name, last_name, email, date_of_birth, grade_level, phone, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [student_id, first_name, last_name, email, date_of_birth, grade_level, phone]
    );
    connection.release();

    res.status(201).json({ 
      message: 'Student created successfully',
      studentId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error.message });
  }
});

router.put('/:id', authenticateToken, authorizeRole(['admin', 'staff']), async (req, res) => {
  const { first_name, last_name, email, grade_level, phone, status } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE students SET first_name = ?, last_name = ?, email = ?, grade_level = ?, phone = ?, status = ? 
       WHERE id = ?`,
      [first_name, last_name, email, grade_level, phone, status, req.params.id]
    );
    connection.release();

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});

module.exports = router;
