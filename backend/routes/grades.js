const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [grades] = await connection.query(
      `SELECT g.id, g.course_id, c.course_name, g.grade, g.points, g.semester 
       FROM grades g 
       JOIN courses c ON g.course_id = c.id 
       WHERE g.student_id = ?`,
      [req.params.studentId]
    );
    connection.release();
    res.json({ grades });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grades', error: error.message });
  }
});

router.post('/', authenticateToken, authorizeRole(['admin', 'instructor']), async (req, res) => {
  const { student_id, course_id, grade, points, semester } = req.body;

  try {
    if (!student_id || !course_id || !grade) {
      return res.status(400).json({ message: 'Required fields: student_id, course_id, grade' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO grades (student_id, course_id, grade, points, semester, recorded_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [student_id, course_id, grade, points, semester]
    );
    connection.release();

    res.status(201).json({ 
      message: 'Grade recorded successfully',
      gradeId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error recording grade', error: error.message });
  }
});

module.exports = router;
