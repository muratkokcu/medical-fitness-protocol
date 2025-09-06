# 🔒 Security Guidelines

Security best practices for the Medical Fitness Protocol application.

## ⚠️ CRITICAL: Environment Variables

### **NEVER COMMIT THESE FILES:**
- `backend/.env` 
- `.env`
- Any file containing real passwords, API keys, or secrets

### **Current Setup:**
✅ `backend/.gitignore` - Excludes environment files  
✅ `backend/.env.example` - Safe template without credentials  
✅ Main `.gitignore` - Excludes all environment files  

## 🚨 Immediate Actions Required

### 1. **Secure Your MongoDB Credentials**
The current `backend/.env` contains real MongoDB credentials. After deployment:

```bash
# Generate new MongoDB user with limited permissions
# Update connection string in production environment
# Rotate the current password for security
```

### 2. **Generate Production JWT Secrets**
```bash
# Use a secure random generator for JWT secrets:
# Option 1: Use online generator (https://www.allkeysgenerator.com/)
# Option 2: Use Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use DIFFERENT secrets for:
# - Development
# - Staging  
# - Production
```

### 3. **Database Security**
- **IP Whitelist**: Configure MongoDB Atlas to only allow your server IPs
- **Limited User Permissions**: Create database users with minimal required permissions
- **Connection Encryption**: Always use SSL/TLS (included in Atlas URLs)

## 🛡️ Deployment Security Checklist

### **Before Going Live:**

#### Backend Security:
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong, unique JWT secret generated
- [ ] Database user has minimal permissions
- [ ] CORS configured for production domain only
- [ ] Environment variables set in hosting platform (not in code)
- [ ] SSL/HTTPS enabled

#### Frontend Security:
- [ ] API URLs point to HTTPS endpoints
- [ ] No sensitive data in client-side code
- [ ] Environment variables use `VITE_` prefix only for non-sensitive data
- [ ] Content Security Policy headers configured (in `vercel.json`)

#### General:
- [ ] `.env` files excluded from git
- [ ] Production secrets different from development
- [ ] Regular security updates planned
- [ ] Error messages don't expose sensitive information

## 🔐 Environment Variable Management

### **Development:**
```env
# backend/.env (NEVER COMMIT)
MONGODB_URI=mongodb+srv://dev_user:dev_pass@cluster.mongodb.net/dev_db
JWT_SECRET=development-secret-key-not-production
```

### **Production:**
```env
# Set in hosting platform dashboard (Railway, Render, etc.)
MONGODB_URI=mongodb+srv://prod_user:different_pass@cluster.mongodb.net/prod_db  
JWT_SECRET=completely-different-production-secret-key
```

## 📋 Security Monitoring

### **Recommended Practices:**
1. **Regular Security Audits**: `npm audit` for dependency vulnerabilities
2. **MongoDB Atlas Monitoring**: Monitor for suspicious database access
3. **Error Logging**: Implement proper error logging (without exposing secrets)
4. **Rate Limiting**: Consider implementing rate limiting for API endpoints

### **Incident Response:**
If credentials are ever exposed:
1. **Immediately rotate** all affected secrets
2. **Check logs** for suspicious access
3. **Update** all applications with new credentials
4. **Monitor** for unusual activity

## 🚨 Emergency Contacts

**If security breach suspected:**
1. Rotate all secrets immediately
2. Check MongoDB Atlas activity logs
3. Update all environment configurations
4. Monitor application logs for unusual patterns

---

## ✅ Quick Security Verification

Before deployment, verify:
```bash
# 1. Check no .env files are tracked by git
git status --ignored

# 2. Verify .gitignore includes environment files  
cat .gitignore | grep -E "(\.env|backend/\.env)"

# 3. Test environment variable loading
cd backend && node -e "require('dotenv').config(); console.log(process.env.JWT_SECRET ? 'JWT_SECRET loaded' : 'JWT_SECRET missing')"
```

**Remember: Security is not a one-time setup, it's an ongoing process! 🛡️**