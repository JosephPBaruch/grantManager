from app.meta.common import INSERT_TRIGGER_RULE
from app.models import Rule
from sqlalchemy import DDL

trigger = DDL(INSERT_TRIGGER_RULE)

Rule


# event.listen(Rule.__table__, "after_create", trigger.execute_if(dialect="postgresql"))
# event.listen(Rule.__table__, "after_create", trigger.execute_if(dialect="postgresql"))
