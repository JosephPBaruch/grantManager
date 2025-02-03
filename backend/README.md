pip install django djangorestframework

django-admin startproject backend         

cd backend

python manage.py startapp app

python manage.py makemigrations
python manage.py migrate

python manage.py runserver