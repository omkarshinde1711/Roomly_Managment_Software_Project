# Database Configuration Instructions for MySQL

## Setting up MySQL Connection

The application has been configured to work with MySQL (which runs on port 3306). Your current configuration should work with these settings.

### Current Configuration (MySQL)
```javascript
const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1711',
    database: 'HospitalityDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};
```

## Database Setup Steps

1. **Create the Database**
   - Open MySQL Workbench, phpMyAdmin, or MySQL Command Line
   - Connect to your MySQL server
   - Create a new database:
   ```sql
   CREATE DATABASE HospitalityDB;
   USE HospitalityDB;
   ```

2. **Run Schema Script**
   - Copy and paste the entire content of `database/schema.sql`
   - Execute it in your MySQL client
   - This will create tables and insert sample data

3. **Run Stored Procedures Script**
   - Copy and paste the entire content of `database/stored_procedures.sql`
   - Execute it in your MySQL client
   - This will create all stored procedures

4. **Test Connection**
   - Run `npm run test-db` to verify everything is working
   - Check console for "Connected to MySQL Server" message

## Alternative Database Clients

### Option 1: MySQL Workbench (Recommended)
- Download from: https://dev.mysql.com/downloads/workbench/
- Connect to localhost:3306 with user: root, password: 1711
- Create database and run scripts

### Option 2: Command Line
```bash
mysql -u root -p1711
CREATE DATABASE HospitalityDB;
USE HospitalityDB;
source /path/to/database/schema.sql
source /path/to/database/stored_procedures.sql
```

### Option 3: phpMyAdmin (if using XAMPP/WAMP)
- Open phpMyAdmin in browser
- Create new database "HospitalityDB"
- Go to SQL tab and paste the scripts

## Common Connection Issues

### Error: "Access denied for user 'root'"
- Check if password is correct (currently set to '1711')
- Ensure MySQL server is running
- Try connecting with MySQL Workbench first

### Error: "Database 'HospitalityDB' does not exist"
- Create the database first:
```sql
CREATE DATABASE HospitalityDB;
```

### Error: "Can't connect to MySQL server"
- Check if MySQL service is running
- Verify port 3306 is not blocked by firewall
- Try connecting to 127.0.0.1 instead of localhost

### Error: "Procedure doesn't exist"
- Make sure you ran the stored_procedures.sql file
- Check if you're connected to the correct database

## Testing Your Setup

1. **Test Database Connection**:
   ```cmd
   npm run test-db
   ```

2. **Start the Application**:
   ```cmd
   npm start
   ```

3. **Check the Console**:
   - Should see "Connected to MySQL Server"
   - Should see "Server running on http://localhost:3000"

## Sample Data Included

The schema.sql file includes sample data:
- 3 users (admin, staff1, reception)
- 2 hotels (Grand Hotel, Business Inn)
- 8 rooms across both hotels

**Login Credentials**:
- Admin: `admin` / `admin123`
- Staff: `staff1` / `staff123`

This allows you to test the system immediately after setup.

## MySQL vs SQL Server Note

The project was originally designed for SQL Server but has been converted to work with your MySQL setup. The functionality remains exactly the same - only the database syntax has been adapted.
