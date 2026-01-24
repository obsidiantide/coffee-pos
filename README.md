# Coffee POS / Order Management System

Production-ready MVP for a coffee shop with Barista POS and Admin panel.

## Tech Stack
- Frontend: React + TypeScript, Vite, TailwindCSS, Zustand, Axios
- Backend: Django + DRF, Simple JWT, MySQL 8.0

## Project Structure
- backend/
  - coffee_pos/ (Django project)
  - authentication/ (custom user + auth endpoints)
  - api/ (menu, orders, reports)
- frontend/
  - src/ (React app)

## Backend Setup (Windows PowerShell)
1) Start MySQL (Docker optional)
```
# optional
docker compose up -d db
```

2) Environment
```
Copy-Item backend/.env.example backend/.env
```

3) Virtualenv + install
```
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

4) Migrate + superuser
```
python backend/manage.py makemigrations authentication api
python backend/manage.py migrate
python backend/manage.py createsuperuser
```

5) Run backend
```
python backend/manage.py runserver 0.0.0.0:8000
```

## Frontend Setup
1) Environment
```
Copy-Item frontend/.env.example frontend/.env
```

2) Install deps
```
cd frontend
npm install
npm run dev
```

Open http://127.0.0.1:5173

## First Login
- Use Django admin to create users and assign `role` (admin or barista) or use API:
  - POST /api/auth/register/ { username, password, password_confirm, role: 'admin'|'barista' }
- Admin can manage menu and view reports. Barista uses POS and Today’s Orders.

## API Base URL
- http://127.0.0.1:8000/api

Key endpoints
- Auth: /auth/register/, /auth/login/, /auth/logout/, /auth/token/refresh/, /auth/profile/
- Menu: /categories/, /products/, /extras/
- Orders: /orders/, /orders/{id}/complete/, /orders/today/
- Reports: /dashboard/stats/, /reports/sales/?days=7

## Notes
- CORS enabled for Vite (5173).
- JWT with refresh + blacklist enabled.
- Prices are snapshotted via price_at_time for OrderItems and Extras.
- Timezone: Asia/Baku.
