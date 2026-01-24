@echo off
echo ========================================
echo Railway Setup - Coffee POS
echo ========================================
echo.

echo Установка Railway CLI...
call npm install -g @railway/cli
echo.

echo Вход в Railway...
call railway login
echo.

echo Связывание проекта...
call railway link
echo.

echo Применение миграций...
call railway run python manage.py migrate
echo.

echo ========================================
echo Создание суперпользователя
echo ========================================
echo Введите данные для администратора:
call railway run python manage.py createsuperuser
echo.

echo ========================================
echo Готово! Backend настроен.
echo ========================================
echo.
echo API: https://coffee-pos-production-6cc0.up.railway.app/api
echo Admin: https://coffee-pos-production-6cc0.up.railway.app/admin
echo.
pause
