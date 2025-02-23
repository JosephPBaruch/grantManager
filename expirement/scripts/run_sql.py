import pymysql
import os
import sys
from dotenv import load_dotenv

load_dotenv('../.env')

# HOW TO USE
# Run: 
#     python run_sql.py <file.sql>

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DB_PASSWORD'),  # You will need to set this env var in a .env
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

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_sql.py <file.sql>")
        sys.exit(1)
    
    filename = sys.argv[1]
    execute_sql_script(filename)
