# ⚡ Быстрый старт - Coffee POS на Railway

Ваш backend уже задеплоен: **https://coffee-pos-production-6cc0.up.railway.app**

## 📋 Что нужно сделать (5 минут):

### 1️⃣ Добавить переменные окружения в Railway

Откройте файл `RAILWAY_ENV.txt` и скопируйте все переменные в Railway:

1. Откройте https://railway.app → ваш проект → backend сервис → **Settings** → **Variables**
2. Добавьте каждую переменную из файла `RAILWAY_ENV.txt`

### 2️⃣ Добавить PostgreSQL

В Railway:
1. Нажмите **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Готово! Railway автоматически создаст `DATABASE_URL`

### 3️⃣ Настроить базу данных

**Вариант А - Автоматически (Windows):**
```bash
setup_railway.bat
```

**Вариант Б - Вручную:**
```bash
npm install -g @railway/cli
railway login
railway link
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

### 4️⃣ Проверить работу

Откройте:
- API: https://coffee-pos-production-6cc0.up.railway.app/api/
- Админка: https://coffee-pos-production-6cc0.up.railway.app/admin/

### 5️⃣ Деплой Frontend на Vercel

1. Откройте https://vercel.com → **New Project**
2. Выберите репозиторий **coffee-pos**
3. Настройки:
   - Root Directory: `frontend`
   - Framework: Vite
4. Переменная окружения:
   ```
   VITE_API_URL=https://coffee-pos-production-6cc0.up.railway.app/api
   ```
5. Нажмите **Deploy**

### 6️⃣ Обновить CORS

После деплоя frontend обновите в Railway переменную:
```
CORS_ALLOWED_ORIGINS=https://ваш-frontend.vercel.app,https://coffee-pos-production-6cc0.up.railway.app
```

## 🎉 Готово!

Ваше приложение работает в интернете!

---

📖 **Подробная инструкция**: см. `RAILWAY_SETUP.md`
