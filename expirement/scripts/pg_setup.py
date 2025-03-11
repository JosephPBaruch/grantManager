import psycopg
from psycopg import Connection as plpy
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


def test(rule_id:int):

    SD['temp_idx'] = 0
    def build_subquery(sid, cached_selections):
        plan = plpy.prepare("""SELECT * FROM Rules."Selectors" s WHERE s."SID" = $1""", ["integer"])
        if sid not in cached_selections:
            result = plan.execute([sid])
            if len(result) == 0:
                raise ValueError
            cached_selections[sid] = result[0]
        if cached_selections[sid]['Schema'] == None:
            subquery = f"(SELECT {cached_selections[sid]["Aggregator"]}({cached_selections[sid]["Target"]}))::{cached_selections[sid]["Type"]}"
        else:
            temp_id = f'{cached_selections[sid]["Target"]}{SD['temp_idx']}'
            table = f'{cached_selections[sid]["Schema"]}."{cached_selections[sid]["Table"]}"'
            SD['temp_idx'] = SD['temp_idx'] + 1
            subquery = f'''(SELECT {cached_selections[sid]["Aggregator"]}({temp_id}."{cached_selections[sid]["Target"]}") FROM {table} {temp_id})::{cached_selections[sid]["Type"]}'''
        plpy.notice(sid, cached_selections[sid], subquery)
        return (cached_selections, subquery)

    plan = plpy.prepare("""
        SELECT r."RuleID", "Name", "Description", "Trigger", "CID", "Conjunction", "LeftSID", "Operator", "RightSID"
        FROM Rules."Rule" r INNER JOIN (
            SELECT a."RuleID", a."CID", a."Conjunction", c."LeftSID", c."Operator", c."RightSID"
            FROM Rules."Actions" a INNER JOIN  Rules."Conditions" c 
            ON c."CID" = a."CID"
        ) ac ON r."RuleID" = ac."RuleID"
        WHERE r."RuleID" = $1;
        """, ["integer"]
    )
    rv = plan.execute([rule_id])
    rule_actions_sql = [""]
    cached_selections = {}
    rule_name = rv[0]["Name"]
    rule_name = rule_name.replace(" ","_").lower()
    for rule in rv:
        plpy.notice(rule)
        left_sid = rule["LeftSID"]
        right_sid = rule["RightSID"]
        cached_selections, left_subquery = build_subquery(left_sid, cached_selections)
        cached_selections, right_subquery = build_subquery(right_sid, cached_selections)
        result = f"{rule["Conjunction"]} ( SELECT {left_subquery} {rule["Operator"]} {right_subquery})".replace("    "," ")
        plpy.notice(result)
        rule_actions_sql.append(result)
    actions_str = " ".join(rule_actions_sql)
    rule_sql = f"""
    DROP FUNCTION IF EXISTS func_{rule_name};
    CREATE OR REPLACE FUNCTION func_{rule_name}() RETURNS boolean
    LANGUAGE SQL
    RETURNS NULL ON NULL INPUT
    RETURN (SELECT TRUE {actions_str});
    """
    plpy.notice(rule_sql)
    plpy.execute(rule_sql)
   
    return rv


if __name__ == "__main__":
    main()