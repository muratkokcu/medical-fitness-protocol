# Medical Fitness Platform

Medical Fitness Assessment Platform built as a monorepo with modern architecture.

## 🏗 Architecture

- **Frontend (React SPA)** – `apps/web`
  - React + Vite + React Router
  - Dashboard, patient forms (/t/:token), report pages
  - Auth: JWT cookie or session cookie
- **Backend (Node API)** – `apps/api`
  - Express-based REST API
  - Invitation token generation/consumption, form submission
- **Database** – MongoDB Atlas
  - `tenants`, `users`, `invitations`, `submissions`, `auditLogs`
- **Shared Packages** – `packages/`
  - Types and configuration shared across apps

## 📂 Directory Structure

```
medical-fitness-platform/
├─ apps/
│  ├─ web/                    # React (Vite) SPA
│  │  ├─ src/
│  │  │  ├─ pages/
│  │  │  │  ├─ Auth/
│  │  │  │  ├─ Dashboard/
│  │  │  │  ├─ TokenForm/     # /t/:token
│  │  │  │  └─ Report/        # /report/:id
│  │  │  ├─ services/http.ts  # API client
│  │  │  ├─ contexts/auth.tsx # auth state
│  │  │  └─ utils/...
│  └─ api/                    # Node backend
│     ├─ src/
│     │  ├─ routes/
│     │  │  ├─ auth.js        # login/logout/me
│     │  │  ├─ clients.js     # client management
│     │  │  ├─ invitations.js # invitation tokens
│     │  │  ├─ forms.js       # patient forms
│     │  │  └─ reports.js     # PDF reports
│     │  ├─ core/
│     │  │  ├─ tokens.js      # token generation/validation
│     │  │  ├─ derive.js      # score/recommendation calculation
│     │  │  ├─ pdf.js         # PDF generation helper
│     │  │  └─ rbac.js        # role-based access control
│     │  ├─ db/mongo.js       # MongoDB connection
│     │  └─ middleware/...
├─ packages/
│  ├─ shared-types/           # Shared TypeScript types
│  └─ shared-config/          # Shared configuration
└─ package.json               # Workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd medical-fitness-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy environment files
cp .env.example .env
cp apps/api/.env.example apps/api/.env

# Configure your MongoDB URI and other settings
```

4. Start development servers:
```bash
# Start both frontend and backend
npm run dev:all

# Or start individually
npm run dev       # Frontend only
npm run dev:api   # Backend only
```

## 📜 Available Scripts

### Root level
- `npm run dev` - Start frontend development server
- `npm run dev:api` - Start backend development server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build all workspaces
- `npm run build:web` - Build frontend only
- `npm run build:api` - Build backend only
- `npm run lint` - Lint all workspaces
- `npm run clean` - Clean all dist and node_modules

### Web app (apps/web)
- `npm run dev --workspace=@medical-fitness/web` - Start dev server
- `npm run build --workspace=@medical-fitness/web` - Build for production
- `npm run lint --workspace=@medical-fitness/web` - Lint code

### API (apps/api)
- `npm run dev --workspace=@medical-fitness/api` - Start with nodemon
- `npm run start --workspace=@medical-fitness/api` - Start production server
- `npm run seed --workspace=@medical-fitness/api` - Seed database

## 🛠 Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **TypeScript** - Type safety

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Helmet** - Security middleware

### Development
- **npm Workspaces** - Monorepo management
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Concurrently** - Running multiple scripts

## 🔧 Configuration

### Environment Variables

#### Root (.env)
```
NODE_ENV=development
```

#### API (apps/api/.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

#### Web (apps/web/.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🚢 Deployment

### Frontend (Vercel)
The frontend is configured for deployment on Vercel. The `vercel.json` configuration handles routing and API proxying.

### Backend (Railway/Heroku)
The backend can be deployed on any Node.js hosting platform. Ensure environment variables are properly configured.

## 📁 Key Features

### ✅ Tamamlanan Özellikler

- **Kimlik Doğrulama & Yetkilendirme**
  - JWT tabanlı authentication
  - Role-based access control (admin, practitioner, manager)
  - Güvenli login/register sistemi

- **Dashboard**
  - Modern ve responsive tasarım
  - Real-time istatistikler
  - Hızlı erişim araçları

- **Müşteri Yönetimi**
  - Müşteri listesi ve arama
  - Detaylı müşteri profilleri
  - Tıbbi geçmiş takibi
  - Acil durum iletişim bilgileri

- **Backend API**
  - RESTful API endpoints
  - MongoDB veri tabanı entegrasyonu
  - Data validation ve error handling
  - Pagination ve sorting

### 🔄 Geliştirme Aşamasında

- Assessment management (form entegrasyonu)
- Rapor oluşturma ve export
- Advanced analytics
- Notification system

## 🛠 Teknoloji Stack

### Frontend
- React 19 + TypeScript
- React Router Dom
- Axios
- Modern CSS (Responsive Design)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs, Helmet, CORS

## 📦 Kurulum

### Ön Gereksinimler

- Node.js (v18 veya üzeri)
- MongoDB (local veya cloud)
- npm veya yarn

### 1. Repository'yi Clone Edin

```bash
git clone <repository-url>
cd medical-fitness-protocol
```

### 2. Frontend Kurulumu

```bash
# Frontend dependencies
npm install

# Development server'ı başlatın
npm run dev
```

Frontend http://localhost:5173 adresinde çalışacaktır.

### 3. Backend Kurulumu

```bash
# Backend klasörüne gidin
cd backend

# Dependencies'leri kurun
npm install

# Environment variables'ları ayarlayın
cp .env.example .env
# .env dosyasını düzenleyin (aşağıya bakın)

# Development server'ı başlatın
npm run dev
```

Backend http://localhost:5000 adresinde çalışacaktır.

### 4. Environment Variables

`backend/.env` dosyasını aşağıdaki şekilde düzenleyin:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-fitness-dashboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### 5. MongoDB Kurulumu

#### Local MongoDB
```bash
# MongoDB'yi başlatın
mongod

# Veya MongoDB Compass kullanın
```

#### MongoDB Atlas (Cloud)
1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)'ta account oluşturun
2. Cluster oluşturun
3. Connection string'i alın
4. `.env` dosyasındaki `MONGODB_URI`'yi güncelleyin

## 🚀 Kullanım

### 1. İlk Kullanıcı Oluşturma

1. http://localhost:5173/register adresine gidin
2. Admin veya practitioner hesabı oluşturun
3. Dashboard'a erişin

### 2. Müşteri Ekleme

1. Dashboard'ta "Yeni Müşteri" butonuna tıklayın
2. Müşteri bilgilerini doldurun
3. Tıbbi geçmiş ve acil durum bilgilerini ekleyin

### 3. Assessment (Geliştirme Aşamasında)

Legacy assessment http://localhost:5173/assessment adresinde hala kullanılabilir.

## 📁 Proje Yapısı

```
medical-fitness-protocol/
├── src/                          # Frontend kaynak kodları
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   ├── layout/             # Layout components
│   │   └── common/             # Shared components
│   ├── pages/                  # Page components
│   ├── contexts/               # React contexts
│   ├── services/               # API services
│   └── types/                  # TypeScript types
├── backend/                    # Backend kaynak kodları
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/            # Mongoose models
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   └── utils/             # Utility functions
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/me` - Mevcut kullanıcı bilgileri
- `PUT /api/auth/profile` - Profil güncelleme

### Clients
- `GET /api/clients` - Müşteri listesi
- `GET /api/clients/:id` - Müşteri detayı
- `POST /api/clients` - Yeni müşteri
- `PUT /api/clients/:id` - Müşteri güncelleme
- `DELETE /api/clients/:id` - Müşteri silme

### Assessments
- `GET /api/assessments` - Assessment listesi
- `GET /api/assessments/:id` - Assessment detayı
- `POST /api/assessments` - Yeni assessment
- `PUT /api/assessments/:id` - Assessment güncelleme

## 🔒 Güvenlik

- Şifreler bcryptjs ile hash'lenir
- JWT token'lar güvenli şekilde saklanır
- API rate limiting
- Input validation
- CORS koruması
- Helmet.js ile güvenlik headers

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📝 License

Bu proje MIT license altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorunuz veya öneriniz için lütfen issue oluşturun.

---

**Not**: Bu proje aktif geliştirme aşamasındadır. Assessment management, reporting ve diğer advanced özellikler yakında eklenecektir.
