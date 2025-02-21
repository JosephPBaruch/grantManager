import pymysql
import os
from dotenv import load_dotenv

load_dotenv('./.env')

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DB_PASSWORD'), # You will need to set this env var in a .env
    'database': 'budget'
}

def execute_sql_script(filename):
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

execute_sql_script('/Users/joseph.baruch/REPO/grantManager/expirement/insert.sql')
