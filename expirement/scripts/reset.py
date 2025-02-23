import pymysql
import os
from dotenv import load_dotenv

load_dotenv('./.env')

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DB_PASSWORD'),  # You will need to set this env var in a .env
}

def execute_sql_script(filename, db_config):
    with open(filename, 'r') as file:
        sql_script = file.read()
    connection = pymysql.connect(**db_config)
    try:
        with connection.cursor() as cursor:
            for statement in sql_script.split(';'):
                if statement.strip():
                    cursor.execute(statement)
        connection.commit()
    finally:
        connection.close()

# Create a new database
connection = pymysql.connect(**db_config)
try:
    with connection.cursor() as cursor:
        cursor.execute("DROP DATABASE IF EXISTS budget;")
        cursor.execute("CREATE DATABASE budget;")
    connection.commit()
finally:
    connection.close()

# Update db_config to use the new database
db_config['database'] = 'budget'

# Execute the scripts in the required order
execute_sql_script('../sql/schema.sql', db_config)
execute_sql_script('../sql/data.sql', db_config)

# Dump the database to budget_db.sql
os.system("mysqldump -u root -p{} budget > ../sql/budget_db.sql".format(os.getenv('DB_PASSWORD')))
