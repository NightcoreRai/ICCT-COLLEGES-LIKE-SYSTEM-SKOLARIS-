const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initializeDatabase() {
  console.log('🔄 Connecting to MySQL server and running schema initialization...');
  
  const schemaPath = path.join(__dirname, '../../database/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found at: ${schemaPath}`);
    process.exit(1);
  }

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbPort = process.env.DB_PORT || 3306;
  const dbName = process.env.DB_NAME || 'icct_school_portal';

  try {
    // Connect to MySQL server without database selected
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort,
      multipleStatements: true
    });

    console.log(`🚀 Connected to MySQL. Ensuring database "${dbName}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    console.log(`✅ Selected database "${dbName}"`);

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove SQL comments (-- comments)
    const cleanSql = schemaSql.replace(/--.*$/gm, '');
    
    // Split queries by semicolon, removing empty lines
    const queries = cleanSql
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    console.log(`📦 Executing ${queries.length} SQL statements...`);
    for (const query of queries) {
      const preview = query.split('\n')[0].substring(0, 60);
      console.log(`Executing: "${preview}..."`);
      await connection.query(query);
    }

    await connection.end();
    console.log('✅ Database schema and seed data initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();

