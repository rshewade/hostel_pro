# NestJS Backend - Hostel Management System

This is the NestJS backend for the Hostel Management Application.

## 🚀 Quick Start

### Installation
```bash
cd backend
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure the required variables:
```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_JWT_SECRET` - Supabase JWT secret
- `JWT_SECRET` - NestJS JWT secret
- `PORT` - Backend port (default: 3001)

### Running the Backend
```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start
```

### Running from Root
```bash
# Run backend only
npm run dev:backend

# Run all services (backend + frontend)
npm run dev:all
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.ts                 # Application entry point
│   ├── app.module.ts           # Root module
│   ├── health/                 # Health check module
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   └── supabase/               # Supabase integration
│       ├── supabase.module.ts  # Supabase module
│       └── supabase.provider.ts # Supabase client provider
├── dist/                      # Compiled output
├── .env                       # Environment variables (not in git)
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## 🔑 Features Implemented

- **Supabase Integration**: Configured with service role key for admin operations
- **Dependency Injection**: Supabase client available throughout the app
- **Rate Limiting**: ThrottlerModule configured for API protection
- **Health Checks**: `/health` and `/health/supabase` endpoints
- **Global Configuration**: ConfigModule with environment variable support
- **CORS**: Enabled for frontend at http://localhost:3000
- **Validation**: Global validation pipes for DTOs

## 🔌 API Endpoints

### Health Check
- `GET /health` - Basic health status
- `GET /health/supabase` - Supabase connection status

### Authentication (Coming Soon)
- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

## 🛠️ Technology Stack

- **Framework**: NestJS 11+
- **Language**: TypeScript 5+
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Validation**: class-validator, class-transformer
- **Rate Limiting**: @nestjs/throttler

## 📝 Environment Variables

See `.env.example` for all available variables.

## 🧪 Testing

```bash
# Run health check
curl http://localhost:3001/health

# Run Supabase health check
curl http://localhost:3001/health/supabase
```

## 🚧 Next Steps

- Implement AuthModule with JWT strategy
- Create authentication endpoints (OTP, login, logout)
- Implement role-based guards
- Add audit logging
- Implement device fingerprinting
- Add MFA for admin roles

## 📚 Documentation

For complete project documentation, see:
- `../.docs/prd.md` - Product Requirements
- `../.docs/architecture.md` - System Architecture
- `../CLAUDE.md` - Development Guidelines
