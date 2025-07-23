// Database configuration for MySQL
const mysql = require('mysql2/promise');

// Database configuration for MySQL
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password_here',
    // database: 'HospitalityDB', // Comment out for initial setup
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Test connection and create database if needed
async function testConnection() {
    let connection;
    try {
        // Connect without specifying database first
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });
        console.log('Connected to MySQL Server');
        
        // Check if database exists, create if not (using query instead of execute)
        const [rows] = await connection.query("SHOW DATABASES LIKE 'HospitalityDB'");
        if (rows.length === 0) {
            console.log('Creating HospitalityDB database...');
            await connection.query('CREATE DATABASE HospitalityDB');
            console.log('✅ Database HospitalityDB created successfully!');
        } else {
            console.log('✅ Database HospitalityDB already exists');
        }
        
        await connection.end();
        console.log('✅ Database setup complete');
        return true;
    } catch (err) {
        console.error('Database connection failed:', err);
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

// Initialize connection test
testConnection();

// Create a new pool connection specifically for HospitalityDB
const dbConfig = {
    ...config,
    database: 'HospitalityDB'
};

const dbPool = mysql.createPool(dbConfig);

module.exports = {
    pool: dbPool,
    mysql
};
