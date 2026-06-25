const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [courses] = await connection.query('SELECT id, course_code, course_name, credits, instructor, semester FROM courses');
    connection.release();
    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [courses] = await connection.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    connection.release();

    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course: courses[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
});

router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  const { course_code, course_name, credits, instructor, semester, description } = req.body;

  try {
    if (!course_code || !course_name || !credits) {
      return res.status(400).json({ message: 'Required fields: course_code, course_name, credits' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO courses (course_code, course_name, credits, instructor, semester, description, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [course_code, course_name, credits, instructor, semester, description]
    );
    connection.release();

    res.status(201).json({ 
      message: 'Course created successfully',
      courseId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
});

module.exports = router;
