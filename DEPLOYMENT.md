# Deployment Guide

This guide covers deploying the Udyam Registration Form application to various platforms.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database (or use Docker)
- Git repository access

## Local Development Setup

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd udyam-registration-form
```

### 2. Run the Windows Setup Script

```bash
# For Windows users
setup.bat

# For Unix/Linux/Mac users
chmod +x setup.sh
./setup.sh
```

### 3. Manual Setup (Alternative)

If the setup script fails, follow these steps manually:

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma db push
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Python Scraper Setup
```bash
cd scraper
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix/Linux/Mac:
source venv/bin/activate
pip install -r requirements.txt
python scrape_udyam.py
```

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Individual Docker Builds

#### Backend
```bash
cd backend
docker build -f ../docker/backend.Dockerfile -t udyam-backend .
docker run -p 5000:5000 --env-file .env udyam-backend
```

#### Frontend
```bash
cd frontend
docker build -f ../docker/frontend.Dockerfile -t udyam-frontend .
docker run -p 3000:3000 udyam-frontend
```

#### Database
```bash
docker run --name udyam-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=udyam_db \
  -p 5432:5432 \
  -d postgres:15
```

## Cloud Deployment

### Frontend Deployment

#### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel login
   cd frontend
   vercel
   ```

2. **Environment Variables**
   - Set `NEXT_PUBLIC_API_URL` to your backend API URL
   - Set `NEXT_PUBLIC_ENVIRONMENT` to `production`

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

#### Netlify

1. **Deploy from Git**
   - Connect your Git repository
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` in Netlify dashboard

### Backend Deployment

#### Railway

1. **Connect Repository**
   - Connect your Git repository to Railway
   - Railway will auto-detect Node.js

2. **Environment Variables**
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-domain.com
   JWT_SECRET=your-secret-key
   ```

3. **Database**
   - Railway provides PostgreSQL
   - Use the connection string from Railway dashboard

#### Heroku

1. **Create App**
   ```bash
   heroku create your-udyam-app
   heroku addons:create heroku-postgresql:mini
   ```

2. **Deploy**
   ```bash
   git push heroku main
   heroku run npx prisma db push
   ```

3. **Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   ```

#### DigitalOcean App Platform

1. **Create App**
   - Connect your Git repository
   - Select Node.js as runtime

2. **Environment Variables**
   - Add all required environment variables
   - Set `PORT` to `8080` (DigitalOcean default)

3. **Database**
   - Create managed PostgreSQL database
   - Use connection string in `DATABASE_URL`

### Database Deployment

#### Managed PostgreSQL Services

1. **Supabase (Free Tier Available)**
   - Create project at supabase.com
   - Use connection string from dashboard
   - Run migrations: `npx prisma db push`

2. **Neon (Free Tier Available)**
   - Create database at neon.tech
   - Use connection string from dashboard
   - Run migrations: `npx prisma db push`

3. **AWS RDS**
   - Create PostgreSQL instance
   - Configure security groups
   - Use connection string in environment variables

## Production Configuration

### 1. Environment Variables

Create `.env.production` files:

#### Backend (.env.production)
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-super-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Frontend (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### 2. Security Considerations

- Use strong, unique JWT secrets
- Enable HTTPS everywhere
- Set up CORS properly
- Configure rate limiting
- Use environment-specific database URLs
- Never commit `.env` files to Git

### 3. Performance Optimization

#### Backend
- Enable compression middleware
- Use Redis for caching (optional)
- Implement database connection pooling
- Set up monitoring and logging

#### Frontend
- Enable Next.js optimizations
- Use CDN for static assets
- Implement lazy loading
- Optimize bundle size

## Monitoring and Maintenance

### 1. Health Checks

The application includes health check endpoints:
- Backend: `GET /health`
- Database: Checked in health endpoint

### 2. Logging

- Backend logs to console (use PM2 or similar for production)
- Frontend errors logged to console
- Consider using services like Sentry for error tracking

### 3. Database Maintenance

```bash
# Regular backups
pg_dump your_database > backup.sql

# Run migrations
npx prisma db push

# Check database status
npx prisma studio
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Verify database is running
   - Check firewall settings

2. **Frontend Can't Connect to Backend**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check CORS configuration
   - Ensure backend is running

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables are set

4. **Docker Issues**
   - Check Docker daemon is running
   - Clear Docker cache: `docker system prune`
   - Verify ports aren't already in use

### Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test locally first
4. Check platform-specific documentation

## Cost Optimization

### Free Tier Options

- **Frontend**: Vercel, Netlify (free)
- **Backend**: Railway, Heroku (free tiers)
- **Database**: Supabase, Neon (free tiers)
- **Total**: $0/month for small applications

### Paid Options

- **Frontend**: Vercel Pro ($20/month)
- **Backend**: Railway ($5/month), Heroku ($7/month)
- **Database**: Managed PostgreSQL ($15-50/month)
- **Total**: $25-80/month for production applications

## Next Steps

After successful deployment:

1. Set up custom domain names
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Implement CI/CD pipelines
5. Set up backup strategies
6. Plan for scaling
