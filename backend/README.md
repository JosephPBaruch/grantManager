# University of Idaho Grant Budget Management Backend Service

## Django Application Commands

### Virtual environment

#### Create the virtual environment

> This is not necessary after the first time

```bash
    python -m venv env
```

#### Activating the virtual environment

```bash
    source env/bin/activate
```

#### Install the dependencies

> This shouldn't be necessary after the first time.

```bash
    pip install -r requirements.txt
```

##### Updating the requirements.txt

> If you update the requirements.txt, it shoudl be updated. Use this command. 

```bash 
    pip freeze > requirements.txt
```

### Applying changes

'''bash

    python manage.py makemigrations

    python manage.py migrate

'''

### Running the Application

> Make sure you are in the backend/service directory. Note: The frontend requires port 8080. 

TODO: Solution to running the applications and configuring ports

```bash

    python manage.py runserver 8080

```

### Reset the database

> Clearing might be required when modifying models.

```bash

    python manage.py flush
    
```