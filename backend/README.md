# Medical Fitness Protocol - Backend API

Node.js/Express backend API for the Medical Fitness Protocol application.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB Atlas account
- Git

### Installation

1. **Clone and setup:**
```bash
cd backend
npm install
```

2. **Environment Configuration:**
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your actual values
nano .env
```

3. **Required Environment Variables:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5678
```

4. **Start Development Server:**
```bash
npm run dev
```

## 🌐 Deployment Options

### Option 1: Railway (Recommended)
1. Visit [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend` folder as root
4. Add environment variables in Railway dashboard
5. Deploy automatically

### Option 2: Render
1. Visit [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set root directory to `backend`
5. Add environment variables
6. Deploy

### Option 3: Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set CORS_ORIGIN=https://your-frontend.vercel.app
git subtree push --prefix backend heroku main
```

## 🔒 Security Configuration

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod-db
JWT_SECRET=production-super-secure-different-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Important Security Notes:
- **Never commit `.env` files** to version control
- Use **different JWT secrets** for each environment
- Generate **strong, random JWT secrets** (32+ characters)
- Update **CORS_ORIGIN** to match your frontend domain
- Use **MongoDB Atlas** with proper network access controls

## 📱 Frontend Integration

After deploying your backend, update your frontend's `.env`:

```env
# In frontend/.env
VITE_API_BASE_URL=https://your-backend-api.railway.app/api
```

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `GET /api/auth/me` - Get user profile

### Clients
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client (admin only)

### Assessments
- `GET /api/assessments` - List assessments
- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:id` - Get assessment
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment (admin only)

## 🔧 Development

### Scripts
```bash
npm run start    # Production server
npm run dev      # Development server with nodemon
npm run seed     # Seed database with sample users
```

### Database Seeding
```bash
npm run seed
```
Creates default admin user:
- Email: `admin@medical-fitness.com`
- Password: `admin123`

## 🚨 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
- Check your MongoDB Atlas connection string
- Verify network access settings in Atlas
- Ensure IP whitelist includes your deployment server

**2. CORS Errors**
- Update `CORS_ORIGIN` in your environment variables
- Make sure it matches your frontend domain exactly

**3. JWT Token Issues**  
- Verify `JWT_SECRET` is set and secure
- Check token expiry settings

**4. Port Conflicts**
- Default port is 5000
- Change `PORT` environment variable if needed

## 📄 License

MIT License - see LICENSE file for details.