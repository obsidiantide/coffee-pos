# ☕ Coffee POS - Modern Order Management System

A production-ready, feature-rich Point of Sale system designed specifically for coffee shops. Built with modern technologies and best practices, this system streamlines operations from order taking to business analytics.

## ✨ Features

### 🎯 Core Functionality
- **Dual Interface**: Separate POS for baristas and comprehensive admin panel
- **Real-time Order Management**: Track orders from creation to completion
- **Advanced Order Workflow**: Pending → Preparing → Ready → Completed
- **Preparation Time Tracking**: Monitor and optimize service efficiency
- **Split Payments**: Support for cash, card, and combined payment methods
- **Shift Management**: Complete shift tracking with opening/closing balances

### 📊 Business Intelligence
- **Analytics Dashboard**: Real-time sales statistics and insights
- **Popular Products Tracking**: Identify best-selling items
- **Revenue Analytics**: Cash vs card payment breakdown
- **Preparation Time Analytics**: Optimize service speed
- **Expense Tracking**: Monitor operational costs

### 🔒 Security & Audit
- **Activity Logging**: Comprehensive audit trail for all user actions
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Admin and Barista roles
- **IP & User Agent Tracking**: Enhanced security monitoring

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with TailwindCSS
- **Loading States**: Professional loading indicators
- **TypeScript**: Full type safety for better development experience
- **Real-time Updates**: Live order status updates

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **TailwindCSS** for modern, responsive styling
- **Zustand** for state management
- **Axios** for API communication
- **Lucide React** for beautiful icons

### Backend
- **Django 4.x** with Django REST Framework
- **Simple JWT** for authentication
- **MySQL 8.0** for robust data storage
- **Whitenoise** for static file serving
- **CORS Headers** for seamless frontend integration

## 📁 Project Structure

```
coffee-pos/
├── backend/
│   ├── coffee_pos/          # Django project configuration
│   ├── authentication/      # Custom user model & auth endpoints
│   ├── api/                 # Core business logic (orders, products, reports)
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand state management
│   │   └── types.ts        # TypeScript type definitions
│   └── package.json         # Node.js dependencies
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MySQL 8.0+ (or Docker)

### Backend Setup (Windows PowerShell)

1. **Start MySQL** (Docker optional)
```powershell
docker compose up -d db
```

2. **Environment Configuration**
```powershell
Copy-Item backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

3. **Virtual Environment & Dependencies**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

4. **Database Setup**
```powershell
python backend/manage.py makemigrations authentication api
python backend/manage.py migrate
python backend/manage.py createsuperuser
```

5. **Start Backend Server**
```powershell
python backend/manage.py runserver 0.0.0.0:8000
```

### Frontend Setup

1. **Environment Configuration**
```powershell
Copy-Item frontend/.env.example frontend/.env
```

2. **Install Dependencies & Start**
```powershell
cd frontend
npm install
npm run dev
```

3. **Access Application**
```
http://127.0.0.1:5173
```

## 👤 User Management

### Creating Users
- **Via Django Admin**: `/admin` - Create users and assign roles
- **Via API**: 
```bash
POST /api/auth/register/
{
  "username": "barista1",
  "password": "securepassword",
  "password_confirm": "securepassword",
  "role": "barista"  // or "admin"
}
```

### Role Permissions
- **Admin**: Full access to menu management, reports, user management
- **Barista**: POS operations, today's orders, shift management

## 📡 API Documentation

### Base URL
```
http://127.0.0.1:8000/api
```

### Authentication Endpoints
- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `POST /auth/logout/` - User logout
- `POST /auth/token/refresh/` - Refresh JWT token
- `GET /auth/profile/` - Get user profile

### Menu Management
- `GET /categories/` - List product categories
- `GET /products/` - List all products
- `GET /extras/` - List available extras

### Order Management
- `GET /orders/` - List orders
- `POST /orders/` - Create new order
- `PATCH /orders/{id}/prepare/` - Start order preparation
- `PATCH /orders/{id}/ready/` - Mark order as ready
- `PATCH /orders/{id}/complete/` - Complete order
- `GET /orders/today/` - Today's orders

### Analytics & Reports
- `GET /dashboard/stats/` - Dashboard statistics
- `GET /reports/sales/?days=7` - Sales report
- `GET /reports/popular-products/?days=30` - Popular products

### Shift Management
- `GET /shifts/` - List shifts
- `POST /shifts/` - Open new shift
- `PATCH /shifts/{id}/close/` - Close shift

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=mysql://user:password@localhost:3306/coffee_pos
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 🌟 Advanced Features

### Order Workflow
- **Preparation Tracking**: Monitor time from order start to completion
- **Status Updates**: Real-time order status changes
- **Price Snapshots**: Historical pricing preserved for accurate reporting

### Analytics Capabilities
- **Daily Statistics**: Revenue, order count, average preparation time
- **Product Performance**: Most popular items and sales trends
- **Payment Analytics**: Cash vs card payment breakdown

### Security Features
- **Activity Logging**: Complete audit trail with IP tracking
- **JWT Security**: Refresh token rotation and blacklist
- **CORS Protection**: Secure cross-origin requests

## 🚀 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically build and deploy

### Docker
```bash
docker-compose up -d
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries for large datasets
- **Static File Compression**: WhiteNoise middleware for efficient serving
- **JWT Refresh Tokens**: Reduced authentication overhead
- **React Code Splitting**: Optimized frontend bundle size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [QUICK_START.md](QUICK_START.md) for detailed setup instructions
- Review the [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guidance

---

**Built with ❤️ for coffee shop owners who deserve the best tools for their business.**
