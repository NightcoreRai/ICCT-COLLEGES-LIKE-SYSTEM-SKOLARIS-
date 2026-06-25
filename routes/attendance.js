const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [attendance] = await connection.query(
      'SELECT id, course_id, date, status FROM attendance WHERE student_id = ? ORDER BY date DESC',
      [req.params.studentId]
    );
    connection.release();
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
});

router.post('/', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  const { student_id, course_id, date, status } = req.body;

  try {
    if (!student_id || !course_id || !date || !status) {
      return res.status(400).json({ message: 'Required fields: student_id, course_id, date, status' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO attendance (student_id, course_id, date, status) VALUES (?, ?, ?, ?)',
      [student_id, course_id, date, status]
    );
    connection.release();

    res.status(201).json({ 
      message: 'Attendance recorded successfully',
      attendanceId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording attendance', error: error.message });
  }
});

module.exports = router;
