# MySQL Database Guide

## 📌 Setting Up & Interacting with the Database

### **1. Create a New MySQL Database**
To create a new database, use the MySQL shell:
```sh
mysql -u root -p -e "CREATE DATABASE budget;"
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

---

## Restoring (Importing) the Database
If you need to recreate the database from a stored file:
```sh
mysql -u root -p < my_database.sql
```
Or to restore it into a specific database:
```sh
mysql -u root -p my_database < my_database.sql
```

---

### Apply schema.sql and data.sql to my_database.sql

mysql -u root -p < schema.sql
mysql -u root -p < data.sql

mysql -u root -p


USE my_database;

SOURCE ./schema.sql;

SOURCE ./data.sql;


```sh
mysqldump -u root -p my_database > my_database.sql
```