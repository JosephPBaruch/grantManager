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

## Install the Application
To run and install the application use the following 
```sh
    pip install -e .
```

## Running the Application

> Make sure you are in the backend/service directory.

```bash
    fastapi dev ./app/main.py

```
