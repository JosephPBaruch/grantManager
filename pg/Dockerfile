FROM postgres:17

RUN apt-get update
RUN apt-get -y install python3 postgresql-plpython3-17
# Ensures plpy is enabled
COPY ./plpython3-enable.sh /docker-entrypoint-initdb.d/plpython3-enable.sh

# Grant Manager Scripting Functions
COPY ./pg_create_rule_function.plpy /docker-entrypoint-initdb.d/pg_create_rule_function.plpy
COPY ./add_rule_function.sh /docker-entrypoint-initdb.d/add_rule_function.sh


# Removes Windows line endings
RUN sed -i 's/\r$//g' /docker-entrypoint-initdb.d/plpython3-enable.sh

