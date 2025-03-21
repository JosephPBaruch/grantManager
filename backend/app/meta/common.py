INSERT_TRIGGER_RULE = """
DROP FUNCTION IF EXISTS create_rule_function;
CREATE OR REPLACE FUNCTION create_rule_function(rule_id integer) RETURNS text
AS $$
    SD['temp_idx'] = 0
    def build_subquery(sid, cached_selections):
        plan = plpy.prepare('SELECT * FROM "Selectors" s WHERE s."SID" = $1', ["integer"])
        if sid not in cached_selections:
            result = plan.execute([sid])
            if len(result) == 0:
                raise ValueError("No SELECTORS could be found that match.")
            cached_selections[sid] = result[0]
        if cached_selections[sid]['Table'] in [""," ", None]:
            subquery = "(SELECT {AGGREGATOR}({TARGET}))::{TYPE}".format(
                AGGREGATOR = cached_selections[sid]["Aggregator"],
                TARGET = cached_selections[sid]["Target"],
                TYPE = cached_selections[sid]["Type"]
            )
        else:
            temp_id = '{TARGET}{idx}'.format(TARGET = cached_selections[sid]["Target"], idx=SD["temp_idx"])
            table = cached_selections[sid]["Table"]
            SD['temp_idx'] = SD['temp_idx'] + 1
            subquery = f'''(SELECT {cached_selections[sid]["Aggregator"]}({temp_id}."{cached_selections[sid]["Target"]}") FROM {table} {temp_id})::{cached_selections[sid]["Type"]}'''
        plpy.notice(sid, cached_selections[sid], subquery)
        return (cached_selections, subquery)

    plan = plpy.prepare(
        'SELECT r."RuleID", "Name", "Description", "Trigger", "CID", "Conjunction", "LeftSID", "Operator", "RightSID" \
        FROM "Rules" r LEFT JOIN ( \
            SELECT a."RuleID", a."CID", a."Conjunction", c."LeftSID", c."Operator", c."RightSID" \
            FROM "Actions" a INNER JOIN  "Conditions" c  \
            ON c."CID" = a."CID" \
        ) ac ON r."RuleID" = ac."RuleID" \
        WHERE r."RuleID" = $1; \
        ', ["integer"]
    )

    rv = plan.execute([rule_id])
    rule_actions_sql = [""]
    cached_selections = {}
    if not len(rv):
        raise ValueError("Rule with id {ID} Does not exist".format(ID=rule_id))
    rule_name = rv[0]["Name"]
    rule_name = rule_name.replace(" ","_").lower()
    for rule in rv:
        if not rule['CID']:
            raise ValueError("No CID associated with Selected Rule")
        plpy.notice(rule)
        left_sid = rule["LeftSID"]
        right_sid = rule["RightSID"]
        cached_selections, left_subquery = build_subquery(left_sid, cached_selections)
        cached_selections, right_subquery = build_subquery(right_sid, cached_selections)
        result = "{CONJUNCTION} ( SELECT {LEFT} {OPER} {RIGHT})".format(
            CONJUNCTION = rule["Conjunction"],
            LEFT= left_subquery,
            OPER= rule["Operator"],
            RIGHT = right_subquery
        ).replace("    "," ")
        plpy.notice(result)
        rule_actions_sql.append(result)
    actions_str = " ".join(rule_actions_sql)
    rule_sql = " \
    DROP FUNCTION IF EXISTS func_{NAME}; \
    CREATE OR REPLACE FUNCTION func_{NAME}() RETURNS boolean\
    LANGUAGE SQL\
    RETURN (SELECT TRUE {ACTION});\
    ".format(
        NAME = rule_name,
        ACTION = actions_str
    )
    plpy.notice(rule_sql)
    plpy.execute(rule_sql)
    function_name =f'func_{rule_name}'
    return function_name

$$ LANGUAGE plpython3u;

-- SELECT create_rule_function(1)
"""
