# University of Idaho Grant Budget Management Backend Service

## Virtual environment
If you haven't created your virtual enviroment use the following command,
only needs to be done once per machine
```sh
    python -m venv .venv
```
### Activating the virtual environment
Use the following to activate the virtual environment before running the server

Windows:
```powershell
    ./env/scripts/activate
```

Linux
```sh
    source .venv/bin/activate
```

## Install the Application
To run and install the application use the following 
```sh
    pip install -e .
```
## Postgres Migration
If this is your first time running the backend or if you update the backend models file
then you need to run the migration script.

Create a new migration. (ONLY RUN IF YOU UPDATED THE MODELS)
```sh
    alembic revision --autogenerate -m "CHANGE DESCRIPTION"
```

Update the db to the current migration
```sh
    alembic upgrade head
```

## Running the Application

> Make sure you are in the backend/service directory.

```bash
    fastapi dev ./app/main.py

```
