# How to Run WhatsoFlow Project

This is a Laravel + React (Inertia.js) + Vite project. Follow these steps to run it.

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- SQLite (or MySQL/PostgreSQL)

## Initial Setup

### 1. Install PHP Dependencies
```bash
composer install
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment file if it doesn't exist
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database (if using SQLite)
touch database/database.sqlite
```

### 4. Database Setup
```bash
# Run migrations
php artisan migrate

# (Optional) Seed database
php artisan db:seed
```

## Running the Project

### Option 1: Run Everything Together (Recommended)
```bash
composer run dev
```

This runs:
- Laravel server (http://localhost:8000)
- Vite dev server (for hot reload)
- Queue worker (if needed)

### Option 2: Run Separately

**Terminal 1 - Laravel Server:**
```bash
php artisan serve
```
Server runs at: http://localhost:8000

**Terminal 2 - Vite Dev Server:**
```bash
npm run dev
```
Vite runs at: http://localhost:5173 (or next available port)

## Building for Production

```bash
# Build frontend assets
npm run build

# Or build with SSR
npm run build:ssr
```

## Checking What's Working

### 1. Check Laravel Routes
```bash
php artisan route:list
```

### 2. Check Available Pages
The following pages have been created:
- `/login` - Login page (resources/js/pages/Login/Login.tsx)
- `/dashboard` - Dashboard page (resources/js/pages/Dashboard/Dashboard.tsx)
- `/leads` - Leads Pipeline (resources/js/pages/Leads/Leads.tsx)
- `/automations` - Automations (resources/js/pages/Automations/Automations.tsx)
- `/broadcast` - Broadcast (resources/js/pages/Broadcast/Broadcast.tsx)
- `/settings` - Settings (resources/js/pages/Settings/Settings.tsx)
- `/billing` - Billing (resources/js/pages/Billing/Billing.tsx)

### 3. Check API Routes
You need to create these API routes in Laravel:
- `GET /api/dashboard`
- `GET /api/pipeline`
- `POST /api/pipeline/update`
- `GET /api/automations`
- `POST /api/automations/create`
- `PUT /api/automations/update`
- `GET /api/broadcast/history`
- `POST /api/broadcast/send`
- `POST /api/upload`
- `GET /api/settings`
- `POST /api/settings/update`
- `GET /api/billing`
- `GET /api/billing/invoices`
- `POST /api/billing/upgrade`

### 4. Check Frontend Build
```bash
# Check for TypeScript errors
npm run types

# Check for linting errors
npm run lint
```

### 5. Check Database
```bash
# Check migrations status
php artisan migrate:status

# Check database connection
php artisan tinker
# Then run: DB::connection()->getPdo();
```

## Troubleshooting

### Frontend Not Loading
1. Check if Vite is running: `npm run dev`
2. Check browser console for errors
3. Clear cache: `php artisan cache:clear`
4. Rebuild assets: `npm run build`

### API Routes Not Working
1. Check if routes are registered in `routes/api.php`
2. Check middleware (auth, etc.)
3. Check CORS settings in `config/cors.php`
4. Verify authentication token in localStorage

### Database Issues
1. Check `.env` database configuration
2. Verify database file exists (SQLite): `ls database/database.sqlite`
3. Run migrations: `php artisan migrate:fresh`

### Port Already in Use
```bash
# Change Laravel port
php artisan serve --port=8001

# Vite will auto-select next available port
```

## Development Workflow

1. **Start development servers:**
   ```bash
   composer run dev
   ```

2. **Open browser:**
   - Main app: http://localhost:8000
   - Vite HMR: Automatically connected

3. **Make changes:**
   - React components: Edit files in `resources/js/`
   - Laravel backend: Edit files in `app/`
   - Hot reload should work automatically

4. **Check logs:**
   ```bash
   # Laravel logs
   tail -f storage/logs/laravel.log
   
   # Or use Pail (if installed)
   php artisan pail
   ```

## Testing Pages

Since API routes may not be implemented yet, pages will show:
- Loading states
- Error messages (if API fails)
- Demo/fallback data (in some cases)

To test pages without backend:
1. Pages will attempt API calls
2. On failure, some show demo data
3. Check browser console for API errors
4. Implement API routes as needed

## Next Steps

1. **Create API Routes:**
   - Add routes in `routes/api.php`
   - Create controllers in `app/Http/Controllers/`
   - Add authentication middleware

2. **Set up Authentication:**
   - The Login page expects `POST /api/login`
   - Should return `{ token: "..." }` or `{ access_token: "..." }`
   - Token stored in localStorage

3. **Configure Database:**
   - Set up proper database connection
   - Run migrations for tables (leads, automations, etc.)

4. **Test Each Page:**
   - Visit each route
   - Check browser console for errors
   - Verify API calls in Network tab

