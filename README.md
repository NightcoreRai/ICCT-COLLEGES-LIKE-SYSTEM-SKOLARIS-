# ICCT School Portal Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create `.env` file
Copy `.env.example` to `.env` and update with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=icct_school_portal
DB_PORT=3306
PORT=5000
JWT_SECRET=your_secret_key
```

### 3. Create Database
Run the SQL schema file to set up your database:
```bash
mysql -u root -p < ../database/schema.sql
```

### 4. Start Server
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Students
- `GET /api/students` - Get all students (admin/staff)
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student (admin)
- `PUT /api/students/:id` - Update student (admin/staff)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin)

### Grades
- `GET /api/grades/student/:studentId` - Get student grades
- `POST /api/grades` - Record grade (admin/instructor)

### Attendance
- `GET /api/attendance/student/:studentId` - Get student attendance
- `POST /api/attendance` - Record attendance (admin/instructor)

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer your_jwt_token
```

## Database Schema

See `../database/schema.sql` for complete database structure.
