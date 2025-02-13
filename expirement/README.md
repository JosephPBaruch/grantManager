# MySQL Database Guide

## 📌 Setting Up & Interacting with the Database

### **1. Create a New MySQL Database**
To create a new database, use the MySQL shell:
```sh
mysql -u root -p -e "CREATE DATABASE my_database;"
```
Or enter MySQL and run:
```sql
CREATE DATABASE my_database;
```

### **2. Selecting the Database**
After creating the database, select it to run queries:
```sql
USE my_database;
```

### **3. Creating a Table**
Example table:
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE
);
```

### **4. Inserting Data**
```sql
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
```

### **5. Querying Data**
```sql
SELECT * FROM users;
```

---

## 💾 Storing (Exporting) the Database
To back up the database and store it in the current directory:
```sh
mysqldump -u root -p my_database > my_database.sql
```
- This creates a file `my_database.sql` in the current directory.

To check if the file exists:
```sh
ls -l my_database.sql  # Linux/macOS
dir my_database.sql    # Windows
```

---

## 🔄 Restoring (Importing) the Database
If you need to recreate the database from a stored file:
```sh
mysql -u root -p < my_database.sql
```
Or to restore it into a specific database:
```sh
mysql -u root -p my_database < my_database.sql
```

---

## 📂 Changing MySQL Storage Directory (Optional)
If you want to store MySQL databases in a custom directory:
1. Find your MySQL config file:
   - Linux/macOS: `/etc/mysql/my.cnf`
   - Windows: `C:\ProgramData\MySQL\MySQL Server X.X\my.ini`
2. Update the `datadir` setting:
   ```ini
   [mysqld]
   datadir=/path/to/custom/directory
   ```
3. Restart MySQL:
   ```sh
   sudo systemctl restart mysql  # Linux/macOS
   net stop mysql && net start mysql  # Windows
   ```
4. Verify the new data directory:
   ```sh
   mysql -u root -p -e "SHOW VARIABLES LIKE 'datadir';"
   ```

---

## 🚀 Quick Reference Commands
| Command | Description |
|---------|------------|
| `mysql -u root -p` | Open MySQL CLI |
| `CREATE DATABASE my_database;` | Create a new database |
| `USE my_database;` | Select a database |
| `SHOW TABLES;` | List tables in the selected database |
| `mysqldump -u root -p my_database > my_database.sql` | Export database to a file |
| `mysql -u root -p < my_database.sql` | Restore database from a file |
| `SHOW VARIABLES LIKE 'datadir';` | Check default MySQL storage directory |

---

✅ Now you can **create, store, and restore** your MySQL database efficiently!



### Apply schema.sql and data.sql to my_database.sql

mysql -u root -p < schema.sql
mysql -u root -p < data.sql

mysql -u root -p


USE my_database;

SOURCE ./schema.sql;

SOURCE ./data.sql;
