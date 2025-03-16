import psycopg

from pathlib import Path

SETUP_SQL = Path(__file__).parent.parent / 'sql' / 'pg_setup.sql'
CONN_STR = 'dbname=testing user=postgres password=toor'

def main():
    create_command_sql = ""
    with SETUP_SQL.open('r') as fd:
        create_command_sql = fd.read()
    # Connect to an existing database
    with psycopg.connect(CONN_STR) as conn:

        # Open a cursor to perform database operations
        with conn.cursor() as cur:
            # Execute a create commands
            cur.execute(create_command_sql)
            # Make the changes to the database persistent
            conn.commit()


if __name__ == "__main__":
    main()