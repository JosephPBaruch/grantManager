# MySQL Help

## Create a MySQL Database
> Do this only the first time.

```sh
mysql -u root -p -e "CREATE DATABASE budget;"
```

Or enter MySQL and run:

```sql
CREATE DATABASE budget;
```

## Selecting the Database
```sql
USE budget;
```

## Creating a TABLE and Insert Rows

> Refer to other sql files, create new ones and SOURCE. 

## Querying Data

> Use basic SQL like the following example while referencing schemea.sql.

```sql
SELECT * FROM users;
```

## Exporting Database

```sh
mysqldump -u root -p budget > budget_db.sql
```

## Restoring (Importing) the Database

Restore it into a specific database:
```sh
mysql -u root -p budget < budget_db.sql
```

### Apply schema.sql, data.sql, and (other).sql to budget_db.sql

```sh
mysql -u root -p < schema.sql
mysql -u root -p < data.sql
```

Or, use a "budget" database and use commands in sql: 

```sql
SOURCE ./schema.sql;

SOURCE ./data.sql;

SOURCE ./trigger.sql;
```

## Sign In: 

```sh
mysql -u root -p
```

## Viewing and Selecting Databases Name

```sql
SHOW DATABASES;
```

```sql
USE budget;
```

## Rehydrate Database Into File

```sql
mysqldump -u root -p budget > budget_db.sql
```