FROM postgres:17

RUN apt-get update
RUN apt-get -y install python3 postgresql-plpython3-17
COPY ./plpython3-enable.sh /docker-entrypoint-initdb.d/plpython3-enable.sh
# Removes Windows line endings
RUN sed -i 's/\r$//g' /docker-entrypoint-initdb.d/plpython3-enable.sh

