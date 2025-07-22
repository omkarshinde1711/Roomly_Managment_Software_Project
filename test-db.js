// Database connection test script for MySQL
const mysql = require('mysql2/promise');

// First connect without database to create it
const initialConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1711'
};

async function testConnection() {
    let connection;
    try {
        console.log('Testing MySQL database connection...');
        
        // Connect without specifying database
        connection = await mysql.createConnection(initialConfig);
        console.log('✅ Connected to MySQL Server!');
        
        // Check if database exists, create if not (using query instead of execute)
        const [rows] = await connection.query("SHOW DATABASES LIKE 'HospitalityDB'");
        if (rows.length === 0) {
            console.log('🔨 Creating HospitalityDB database...');
            await connection.query('CREATE DATABASE HospitalityDB');
            console.log('✅ Database HospitalityDB created successfully!');
        } else {
            console.log('✅ Database HospitalityDB already exists');
        }
        
        // Close current connection and reconnect with database specified
        await connection.end();
        
        const dbConfig = {
            ...initialConfig,
            database: 'HospitalityDB'
        };
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to HospitalityDB database');
        
        // Test if our tables exist
        const [tableRows] = await connection.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'HospitalityDB'
            AND TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);
        
        console.log('\n📋 Available tables:');
        if (tableRows.length === 0) {
            console.log('  ⚠️  No tables found - please run database/schema.sql');
        } else {
            tableRows.forEach(table => {
                console.log(`  - ${table.TABLE_NAME}`);
            });
        }
        
        // Test if stored procedures exist
        const [procRows] = await connection.query(`
            SELECT ROUTINE_NAME 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_SCHEMA = 'HospitalityDB'
            AND ROUTINE_TYPE = 'PROCEDURE'
            ORDER BY ROUTINE_NAME
        `);
        
        console.log('\n⚙️ Available stored procedures:');
        if (procRows.length === 0) {
            console.log('  ⚠️  No stored procedures found - please run database/stored_procedures.sql');
        } else {
            procRows.forEach(proc => {
                console.log(`  - ${proc.ROUTINE_NAME}`);
            });
        }
        
        // Test sample login if tables exist
        if (tableRows.length > 0 && procRows.length > 0) {
            try {
                const [loginRows] = await connection.execute('CALL sp_UserLogin(?, ?)', ['admin', 'admin123']);
                
                if (loginRows[0].length > 0) {
                    console.log('\n👤 Sample login test successful!');
                    console.log('Admin user found:', loginRows[0][0]);
                } else {
                    console.log('\n❌ Sample login test failed - check if sample data was inserted');
                }
            } catch (err) {
                console.log('\n⚠️  Could not test login:', err.message);
            }
        }
        
        console.log('\n🎉 Database setup is ready!');
        
        if (tableRows.length === 0) {
            console.log('\n📝 Next steps:');
            console.log('1. Copy the content of database/schema.sql');
            console.log('2. Run it in MySQL Workbench or your MySQL client');
            console.log('3. Copy the content of database/stored_procedures.sql'); 
            console.log('4. Run it in MySQL Workbench or your MySQL client');
            console.log('5. Run "npm start" to start the application');
        } else {
            console.log('\n🚀 You can now run "npm start" to start the application!');
        }
        
        await connection.end();
        process.exit(0);
        
    } catch (err) {
        console.error('\n❌ Database connection failed:');
        console.error(err.message);
        console.log('\n🔧 Please check:');
        console.log('1. MySQL Server is running on port 3306');
        console.log('2. Username "root" and password "1711" are correct');
        console.log('3. MySQL service is started');
        console.log('\n💡 Try connecting with MySQL Workbench first to verify credentials');
        
        if (connection) {
            await connection.end();
        }
        process.exit(1);
    }
}

testConnection();
