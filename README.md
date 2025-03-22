komendy do aplikacji: 

BAZA DANYCH:
C:\Program Files\MySQL\MySQL Server 8.0\bin z tego folderu
.\mysql -u root -p django_db
admin
SHOW TABLES;
SHOW * FROM users_user;
DROP DATABASE django_db;
CREATE DATABASE django_db;
USE django_db;


APLIKACJA:

cd C:\Users\v4d3rinho\Desktop\Studia\mgr\s3\Praca Dyplomowa\passwordApp\backend
python manage.py runserver
python manage.py makemigrations
python manage.py migrate


POSTMAN TESTY:

REJESTRACJA
POST http://127.0.0.1:8000/api/register/
{
    "username": "user123",
    "password": "admin",
    "hash_method": "argon2"
}

LISTA UŻYTKOWNIKÓW:
GET http://127.0.0.1:8000/api/users/

LOGOWANIE:
POST http://127.0.0.1:8000/api/login/
{
    "username": "user123",
    "password": "admine"
}

UAKTUALNIENIE HASLA I METODY
POST http://127.0.0.1:8000/api/update-password/
{
    "username": "user123",
    "old_password": "admin",
    "new_password": "admin1",
    "hash_method": "md5"
}

WYLOGOWANIE

POST http://127.0.0.1:8000/api/logout/

SPRAWDZENIE SESJI
GET http://127.0.0.1:8000/api/check-session/
USUWANIE KONTA
POST http://127.0.0.1:8000/api/delete-account/
{
    "password1": "test1",
    "password2": "test1"
}
POST http://127.0.0.1:8000/api/check-password/
SPRAWDZANIE HASLA(potrzebne do modala przy usuwaniu konta na frontendzie)


polecenia do hashcat

./hashcat.exe -a3 -m0 hash.txt ?a?a?a?a?a?a?a?a --increment --increment-min 3 --increment-max 8 --self-test-disable   lamanie hasla md5 brute-force

 ./hashcat.exe -a3 -m0 hash.txt --self-test-disable

./hashcat.exe --show -m 0 hash.txt   wyświetlenie złamanych hashy

