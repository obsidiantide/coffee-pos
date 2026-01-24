# 🚂 Настройка Railway - Пошаговая инструкция

Ваш backend уже задеплоен на: **https://coffee-pos-production-6cc0.up.railway.app**

## ✅ Шаг 1: Добавить переменные окружения

1. Откройте **https://railway.app**
2. Выберите проект **coffee-pos**
3. Кликните на ваш **backend сервис**
4. Перейдите в **Settings** (вкладка)
5. Найдите секцию **"Variables"** или **"Environment"**
6. Нажмите **"+ New Variable"** и добавьте каждую переменную:

```
SECRET_KEY=9U1eee_nbNwBV8TEcxyC5cfNebgNvzGc58WdiueT2jYlQ76QXAND0NUNCjHyuX6f-zA
DEBUG=False
ALLOWED_HOSTS=coffee-pos-production-6cc0.up.railway.app,*.railway.app
CORS_ALLOWED_ORIGINS=https://coffee-pos-production-6cc0.up.railway.app
```

7. Нажмите **"Save"** или **"Add"** для каждой переменной

---

## ✅ Шаг 2: Добавить PostgreSQL базу данных

1. В вашем проекте Railway нажмите **"+ New"**
2. Выберите **"Database"**
3. Выберите **"Add PostgreSQL"**
4. Railway автоматически:
   - Создаст базу данных
   - Добавит переменную `DATABASE_URL`
   - Свяжет её с вашим backend сервисом

---

## ✅ Шаг 3: Применить миграции и создать суперпользователя

### Вариант А: Через Railway CLI (Рекомендуется)

1. Установите Railway CLI:
```bash
npm install -g @railway/cli
```

2. Войдите в Railway:
```bash
railway login
```

3. Свяжите проект:
```bash
cd c:\Users\mrxxm\OneDrive\Desktop\github\coffee-pos\coffee-pos
railway link
```

4. Примените миграции:
```bash
railway run python manage.py migrate
```

5. Создайте суперпользователя:
```bash
railway run python manage.py createsuperuser
```
Введите:
- Username: `admin`
- Email: `admin@example.com`
- Password: `ваш_надежный_пароль`

### Вариант Б: Через Railway Dashboard

1. Откройте ваш сервис в Railway
2. Перейдите в **"Deployments"**
3. Выберите последний успешный деплой
4. Нажмите **"View Logs"**
5. Найдите кнопку **"Shell"** или **"Terminal"**
6. Выполните команды:
```bash
python manage.py migrate
python manage.py createsuperuser
```

---

## ✅ Шаг 4: Проверить работу backend

Откройте в браузере:

- **API**: https://coffee-pos-production-6cc0.up.railway.app/api/
- **Админка**: https://coffee-pos-production-6cc0.up.railway.app/admin/

Если видите страницу Django или можете войти в админку - всё работает! ✅

---

## ✅ Шаг 5: Деплой Frontend на Vercel

1. Откройте **https://vercel.com**
2. Войдите через GitHub
3. Нажмите **"Add New Project"**
4. Выберите репозиторий **coffee-pos**
5. Настройте проект:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Добавьте переменную окружения:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://coffee-pos-production-6cc0.up.railway.app/api`

7. Нажмите **"Deploy"**

8. После деплоя скопируйте URL вашего frontend (например: `https://coffee-pos.vercel.app`)

---

## ✅ Шаг 6: Обновить CORS на Backend

После деплоя frontend обновите переменную в Railway:

1. Откройте **Settings** → **Variables** в Railway
2. Найдите `CORS_ALLOWED_ORIGINS`
3. Измените на:
```
https://ваш-frontend.vercel.app,https://coffee-pos-production-6cc0.up.railway.app
```

4. Railway автоматически перезапустит сервис

---

## 🎉 Готово!

Ваше приложение полностью задеплоено:

- **Frontend**: https://ваш-frontend.vercel.app
- **Backend API**: https://coffee-pos-production-6cc0.up.railway.app/api
- **Админка**: https://coffee-pos-production-6cc0.up.railway.app/admin

---

## 🔧 Полезные команды Railway CLI

```bash
# Просмотр логов
railway logs

# Выполнить команду Django
railway run python manage.py <команда>

# Открыть shell Django
railway run python manage.py shell

# Собрать статические файлы
railway run python manage.py collectstatic --noinput

# Создать резервную копию БД
railway run python manage.py dumpdata > backup.json
```

---

## 🐛 Решение проблем

### Ошибка 500 Internal Server Error
- Проверьте логи: `railway logs`
- Убедитесь, что все переменные окружения установлены
- Проверьте, что миграции применены: `railway run python manage.py migrate`

### CORS errors
- Обновите `CORS_ALLOWED_ORIGINS` с URL вашего frontend
- Перезапустите сервис в Railway

### Database connection error
- Убедитесь, что PostgreSQL добавлен в проект
- Проверьте наличие переменной `DATABASE_URL` в Settings → Variables

---

## 💰 Стоимость

- **Railway** (Backend + PostgreSQL): ~$5-10/месяц
- **Vercel** (Frontend): Бесплатно
- **Итого**: $5-10/месяц

Первый месяц бесплатно благодаря $5 кредитам Railway!
