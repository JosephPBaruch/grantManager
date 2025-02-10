# User Guide


Install env file: 
```
python -m venv env
```


Activate the environment 
source env/bin/activate


python manage.py makemigrations

python manage.py migrate

python manage.py runserver 8080

## Reset the database

python manage.py flush

## Creating the database

happens in 
```
python manage.py migrate
```