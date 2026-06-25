-- ICCT School Portal Database Schema
-- Student Information System (SIS)

-- Users Table (Authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type ENUM('student', 'staff', 'instructor', 'admin', 'parent') DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('M', 'F', 'Other') DEFAULT 'Other',
    grade_level INT,
    status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
    enrollment_date DATE,
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    description TEXT,
    credits INT NOT NULL,
    instructor VARCHAR(100),
    semester VARCHAR(50),
    year INT,
    max_students INT,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_course_code (course_code),
    INDEX idx_semester (semester)
);

-- Enrollment Table (Student-Course relationship)
CREATE TABLE IF NOT EXISTS enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('enrolled', 'completed', 'dropped', 'failed') DEFAULT 'enrolled',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_course (student_id, course_id)
);

-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    grade VARCHAR(5) NOT NULL,
    points DECIMAL(5, 2),
    semester VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id)
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_date (date)
);

-- Schedule Table
CREATE TABLE IF NOT EXISTS schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Parents Table
CREATE TABLE IF NOT EXISTS parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(120),
    phone VARCHAR(20),
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Parent-Student Relationship
CREATE TABLE IF NOT EXISTS parent_student (
    id INT PRIMARY KEY AUTO_INCREMENT,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    relationship VARCHAR(50),
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_student (parent_id, student_id)
);

-- Create indexes for common queries
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);

-- Seed users (all passwords are 'password123')
INSERT INTO users (id, email, password, name, user_type) VALUES
(1, 'admin@icct.edu', '$2a$10$8.K1tWv0J.u38E0Qh6XoKe/7y04B76z2pX7n/J3wK9e9Q.o87q1wG', 'Admin User', 'admin'),
(2, 'student@icct.edu', '$2a$10$8.K1tWv0J.u38E0Qh6XoKe/7y04B76z2pX7n/J3wK9e9Q.o87q1wG', 'Student User', 'student'),
(3, 'instructor@icct.edu', '$2a$10$8.K1tWv0J.u38E0Qh6XoKe/7y04B76z2pX7n/J3wK9e9Q.o87q1wG', 'Instructor User', 'instructor');

-- Seed student and staff profiles
INSERT INTO students (id, user_id, student_id, first_name, last_name, email, phone, date_of_birth, gender, grade_level, status, enrollment_date) VALUES
(1, 2, 'UA20250001', 'Student', 'User', 'student@icct.edu', '09171234567', '2004-05-15', 'M', 1, 'active', '2025-06-01');

INSERT INTO staff (id, user_id, staff_id, first_name, last_name, email, phone, position, department, hire_date) VALUES
(1, 1, 'ST20250001', 'Admin', 'User', 'admin@icct.edu', '09187654321', 'Registrar', 'Registrar Office', '2020-01-15');

-- Seed courses
INSERT INTO courses (id, course_code, course_name, description, credits, instructor, semester, year, max_students) VALUES
(1, 'IT101', 'Introduction to Computing', 'Fundamental concepts of computer science and IT.', 3, 'Instructor User', '1st Semester', 2026, 40),
(2, 'IT102', 'Computer Programming 1', 'Basic programming constructs, logic and problem solving.', 3, 'Instructor User', '1st Semester', 2026, 40),
(3, 'CS101', 'Discrete Structures', 'Mathematical structures useful in computer science.', 3, 'Instructor User', '1st Semester', 2026, 40);

-- Seed enrollments
INSERT INTO enrollments (student_id, course_id, enrollment_date, status) VALUES
(1, 1, '2026-06-01', 'enrolled'),
(1, 2, '2026-06-01', 'enrolled'),
(1, 3, '2026-06-01', 'enrolled');

-- Seed grades
INSERT INTO grades (student_id, course_id, grade, points, semester) VALUES
(1, 1, '1.25', 95.00, '1st Semester'),
(1, 2, '1.50', 92.00, '1st Semester');

-- Seed attendance
INSERT INTO attendance (student_id, course_id, date, status, remarks) VALUES
(1, 1, '2026-06-10', 'present', 'On time'),
(1, 1, '2026-06-17', 'present', 'On time'),
(1, 1, '2026-06-24', 'late', '10 mins late'),
(1, 2, '2026-06-11', 'present', 'On time'),
(1, 2, '2026-06-18', 'absent', 'Unexcused');

-- Seed schedules
INSERT INTO schedules (course_id, day_of_week, start_time, end_time, room_number) VALUES
(1, 'Monday', '08:00:00', '10:00:00', 'Room 302'),
(2, 'Wednesday', '10:30:00', '12:30:00', 'Lab 1'),
(3, 'Friday', '13:00:00', '15:00:00', 'Room 205');