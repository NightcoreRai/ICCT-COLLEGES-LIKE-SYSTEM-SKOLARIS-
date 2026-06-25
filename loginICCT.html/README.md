# ICCT Colleges Student Portal - Database Setup & Connection Guide

Ang gabay na ito ay makatutulong sa iyo para ma-connect ang MySQL database sa student portal backend at frontend.

---

## 🛠️ Step-by-Step Installation (Paano Simulan)

### 1. Pag-setup ng MySQL Server
Dahil kailangan ng backend ng MySQL database server, kailangan mo munang mag-install ng **XAMPP** o **Laragon**:
1. I-download at i-install ang **XAMPP** mula sa [Apache Friends](https://www.apachefriends.org/).
2. Buksan ang **XAMPP Control Panel** at i-click ang **Start** button sa katabi ng **MySQL** at **Apache**.

### 2. Pag-setup at Pag-initialize ng Database
Ang ating system ay may script na awtomatikong gagawa ng database at maglalagay ng sample data.
1. Buksan ang Terminal (PowerShell o Command Prompt) at pumunta sa `backend` directory:
   ```bash
   cd backend
   ```
2. Patakbuhin ang database initializer:
   ```bash
   npm run db:init
   ```
3. Kung matagumpay, lalabas ang:
   `✅ Database schema and seed data initialized successfully!`

### 3. Pag-start ng Backend API Server
1. Patakbuhin ang command na ito para simulan ang development server gamit ang `nodemon`:
   ```bash
   npm run dev
   ```
2. Makikita mo ang mensaheng:
   `🚀 Server running on port 5000`

### 4. Pagbukas ng Frontend Student Portal
1. Pumunta sa folder na `loginICCT.html/Project/` at buksan ang `icctlogin.html` sa iyong web browser.
2. Maaari mo ring gamitin ang seeded testing accounts sa ibaba para mag-login.

---

## 🔑 Seeded Accounts (Pang-test sa Login)

Gamit ang password na: **`password123`** para sa lahat ng accounts:

*   **Admin / Registrar**: `admin@icct.edu`
*   **Student User**: `student@icct.edu` (Student ID: `UA20250001`)
*   **Instructor User**: `instructor@icct.edu`

---

## 📂 Project Structure (Mga Folder)

*   `database/` - Naglalaman ng corrected `schema.sql` na may kumpletong table schemas at sample seed data.
*   `backend/` - Node.js Express API server na kumokonekta sa MySQL.
*   `loginICCT.html/` - Mga HTML, CSS, at JS files para sa UI (Login at Dashboard).
*   `website/` - Ang static main landing page ng eskwelahan.
