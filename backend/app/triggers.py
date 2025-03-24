# Backup's for alembic Triggers
INSERT_TRIGGER_RULE = """
DROP FUNCTION IF EXISTS create_rule_function;
CREATE OR REPLACE FUNCTION create_rule_function(rule_id integer) RETURNS text
AS $RULE_FUNC$
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

    result = plpy.prepare(
        'SELECT a."RuleID", a."CID", a."Conjunction", c."LeftSID", c."Operator", c."RightSID" \
            FROM "Actions" a INNER JOIN "Conditions" c \
            ON c."CID" = a."CID" \
            WHERE a."RuleID" = $1; \
        ', ["integer"]
    )
    result = result.execute([rule_id])
    if not len(result):
        return ''

    temp = '\
        SELECT r."RuleID", r."Name", r."Table", r."Enabled", r."Description", r."Trigger", "CID", "Conjunction", "LeftSID", "Operator", "RightSID"\
        FROM "Rules" r LEFT JOIN ( \
            SELECT a."RuleID", a."CID", a."Conjunction", c."LeftSID", c."Operator", c."RightSID" \
            FROM "Actions" a INNER JOIN "Conditions" c  \
            ON c."CID" = a."CID" \
            ) ac \
        ON r."RuleID" = ac."RuleID" \
        WHERE r."RuleID" = {RID};\
    '.format(
        RID = rule_id
    )
    rv = plpy.execute(temp)
    rule_actions_sql = [""]
    cached_selections = {}
    if not len(rv):
        raise ValueError("Rule with id {ID} Does not exist".format(ID=rule_id))
    rule_name = rv[0]["Name"]
    target_table = rv[0]["Table"]
    rule_enabled = rv[0]["Enabled"]
    rule_name = rule_name.replace(" ","_").lower()
    count = 0
    for rule in rv:
        if not rule['CID']:
            raise ValueError("No CID associated with Selected Rule")
        plpy.notice(rule)
        left_sid = rule["LeftSID"]
        right_sid = rule["RightSID"]
        cached_selections, left_subquery = build_subquery(left_sid, cached_selections)
        cached_selections, right_subquery = build_subquery(right_sid, cached_selections)
        conjunction = rule["Conjunction"]
        if count == 0:
            conjunction = ""
        result = "{CONJUNCTION} ( SELECT {LEFT} {OPER} {RIGHT})".format(
            CONJUNCTION = conjunction,
            LEFT= left_subquery,
            OPER= rule["Operator"],
            RIGHT = right_subquery
        ).replace("    "," ")
        plpy.notice(result)
        rule_actions_sql.append(result)
        conjunction = 1
    actions_str = " ".join(rule_actions_sql)

    rule_sql = "\
    CREATE OR REPLACE FUNCTION {NAME}_validate() RETURNS boolean \
    LANGUAGE SQL \
    RETURN (SELECT {ACTION}); \
    ".format(
        NAME = rule_name,
        ACTION = actions_str
    )

    check_sql = '\\n'.join([
        'CREATE OR REPLACE FUNCTION {NAME}_check()',
        'RETURNS TRIGGER',
        'LANGUAGE PLPGSQL',
        'AS',
        '$$',
        'BEGIN',
            'IF NOT {NAME}_validate() THEN',
                "RAISE EXCEPTION USING ERRCODE ='RSERR', MESSAGE = 'Rule Could not be validated: ' || '{NAME}';",
            'END IF;',
            'RETURN NEW;',
        'END;',
        '$$;',
    ]).format(
        NAME = rule_name
    )

    if rule_enabled:
        trigger_sql = ' \
            CREATE OR REPLACE TRIGGER {NAME}_trigger \
            AFTER INSERT OR UPDATE OR DELETE ON "{TARGET_TABLE}" \
            FOR EACH STATEMENT \
            EXECUTE PROCEDURE {NAME}_check(); \
        '.format(
            NAME = rule_name,
            TARGET_TABLE = target_table
        )
    else:
        trigger_sql = 'DROP TRIGGER IF EXISTS {NAME}_trigger ON {TARGET_TABLE};'.format(
            NAME = rule_name,
            TARGET_TABLE = target_table
        )

    plpy.execute(rule_sql)
    plpy.execute(check_sql)
    plpy.execute(trigger_sql)

    return rule_name
$RULE_FUNC$ LANGUAGE plpython3u;
"""


RULES_TABLE_TRIGGER_FUNCTION = """
CREATE OR REPLACE FUNCTION rules_trigger_setter()
RETURNS TRIGGER
LANGUAGE PLPGSQL AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        raise notice 'OLD: %', OLD;
        PERFORM f_delfunc(OLD."Trigger");

        NEW."Trigger" = create_rule_function(NEW."RuleID");
        UPDATE public."Rules"
            SET "Trigger" = NEW."Trigger"
            WHERE "RuleID" = OLD."RuleID";
        IF NOT FOUND THEN RETURN NULL;
        END IF;

    ELSIF (TG_OP = 'INSERT') THEN
        NEW."Trigger" = create_rule_function(NEW."RuleID");
        INSERT INTO public."Rules" 
        VALUES (NEW.*);
        RETURN NEW;
    
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM f_delfunc(OLD."Trigger");
        DELETE FROM public."Rules" 
        WHERE "RuleID" = OLD."RuleID";
        IF NOT FOUND THEN
            RETURN NULL;
        END IF;
    END IF;
RETURN NEW;
END;
$$;
"""


RULES_TABLE_APPLY_TRIGGER = """
CREATE OR REPLACE TRIGGER rt_ins
AFTER UPDATE OR INSERT OR DELETE ON "Rules"
FOR EACH ROW
WHEN (pg_trigger_depth() < 1)
EXECUTE PROCEDURE rules_trigger_setter();
"""


FUNCTION_DELETER = """
CREATE OR REPLACE FUNCTION f_delfunc(_name text, OUT functions_dropped int)
   LANGUAGE plpgsql AS
$func$
-- drop all related rules functions with given _name in the current search_path
DECLARE
   _sql text;
BEGIN
   SELECT count(*)::int
        , 'DROP FUNCTION ' || string_agg(oid::regprocedure::text || ' CASCADE' , '; DROP FUNCTION ')
   FROM   pg_catalog.pg_proc
   WHERE  proname = _name || '_check' 
   OR proname = _name || '_validate'
   AND    pg_function_is_visible(oid)  -- restrict to current search_path
   INTO   functions_dropped, _sql;     -- count only returned if subsequent DROPs succeed
   
   IF functions_dropped > 0 THEN       -- only if function(s) found
     RAISE NOTICE 'Dropping Function %', _sql;
     EXECUTE _sql;
   END IF;

   SELECT count(*)::int
        , 'DROP TRIGGER IF EXISTS ' || string_agg(trigger_name || ' ON ' || event_object_table || ' CASCADE', '; DROP TRIGGER IF EXISTS')
   FROM   information_schema.triggers
   WHERE  trigger_name = _name || '_trigger'
   INTO   functions_dropped, _sql;

   IF functions_dropped > 0 THEN       -- only if function(s) found
     RAISE NOTICE 'Dropping Trigger %', _sql;
     EXECUTE _sql;
   END IF;
END;
$func$;
"""
