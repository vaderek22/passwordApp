komendy do aplikacji: 

BAZA DANYCH:
C:\Program Files\MySQL\MySQL Server 8.0\bin z tego folderu
.\mysql -u root -p django_db
haslo do bazy
SHOW TABLES;
SHOW * FROM users_user;

DROP DATABASE django_db;
CREATE DATABASE django_db;
USE django_db;


APLIKACJA:

cd C:\passwordApp\backend
python manage.py runserver
python manage.py makemigrations
python manage.py migrate


POSTMAN TESTY:

	REJESTRACJA
		POST http://127.0.0.1:8000/api/register/
		{
			"username": "user123",
			"password": "adminADMIN25@",
			"hash_method": "argon2"
		}


	LOGOWANIE:
		POST http://127.0.0.1:8000/api/login/
		{
			"username": "user123",
			"password": "adminADMIN25@"
		}

	UAKTUALNIENIE HASLA I METODY:
		POST http://127.0.0.1:8000/api/update-password/
		{
			"username": "user123",
			"old_password": "adminADMIN25@",
			"new_password": "AdminADMIN25!",
			"hash_method": "bcrypt"
		}

	WYLOGOWANIE:
		POST http://127.0.0.1:8000/api/logout/

	SPRAWDZENIE SESJI:
		GET http://127.0.0.1:8000/api/check-session/
	USUWANIE KONTA:
		POST http://127.0.0.1:8000/api/delete-account/
		{
			"password1": "AdminADMIN25!",
			"password2": "AdminADMIN25!"
		}
	POST http://127.0.0.1:8000/api/check-password/
	SPRAWDZANIE HASLA(potrzebne do modala przy usuwaniu konta na frontendzie)


polecenia do hashcat:

hashcat -m 0 -a 0 exported_hashes_md5.txt rockyou.txt

hashcat -m 100 -a 0 exported_hashes_sha1.txt rockyou.txt

hashcat -m 3200 -a 0 exported_hashes_bcrypt.txt rockyou.txt

hashcat --show -m 0 exported_hashes_md5.txt   wyświetlenie złamanych hashy

polecenia do john the ripper: 

john --format=raw-md5 --wordlist=rockyou.txt exported_hashes_md5.txt

john --format=raw-sha1 --wordlist=rockyou.txt exported_hashes_sha.txt

john --format=bcrypt --wordlist=rockyou.txt exported_hashes_bcrypt.txt

polecenia do Argon2Cracker: 

python Argon2Cracker.py exported_hashes_argon2.txt -w ./example/rockyou.txt -v