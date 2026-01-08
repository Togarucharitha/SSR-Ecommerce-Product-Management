# SSR-Ecommerce-Product-Management
SSR E-Commerce Product Management Dashboard

E-Commerce Admin Dashboard

A full-stack Admin Dashboard for managing products, inventory, and sales metrics with secure role-based access control. Built using Next.js, Prisma, PostgreSQL (Neon), and modern web tooling.

#Default admin email=admin@example.com
#Default admin password=admin123

Deployment Link=https://observant-creativity-production-ff11.up.railway.app/

# Key Features
 Authentication & Security

#JWT-based authentication

Role-Based Access Control (Admin / User)

Secure password hashing with bcrypt

Protected routes via middleware

Admin-only access to critical operations

#Product Management

Create, update, delete products

Stock and sales count tracking

Category-based organization

Image upload via Cloudinary

#Metrics & Analytics

Total sales and revenue calculation

Revenue = price × salesCount

Inventory and low-stock monitoring

Interactive charts using Recharts

#Admin Capabilities

Create additional admin accounts

View users

Access full metrics dashboard

Manage product lifecycle

# Tech Stack

Frontend

Next.js 14 (App Router)

React 18

TypeScript

Tailwind CSS

Recharts

Backend

Next.js API Routes

Prisma ORM

Database

PostgreSQL (Neon)

Auth & Security

JWT

bcryptjs

jose

Cloud

Cloudinary (image storage)

#Architecture (High-Level)
Client (Next.js)
   ↓
Middleware (JWT + RBAC)
   ↓
API Routes (Node.js)
   ↓
Prisma ORM
   ↓
PostgreSQL (Neon)


Images are stored and served via Cloudinary CDN.

 Environment Variables

Create a .env.local file:

DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=your-secret-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=Admin

 Setup & Run Locally
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Create initial admin
node scripts/create-first-admin.js

# Start dev server
npm run dev


App runs at: http://localhost:3000

Admin Access

Admin Routes

/admin/create-admin

/admin/metrics

/dashboard/products

Only users with admin role can access these routes.

 Deployment

Works with Railway, Vercel, Render

Prisma runs in Node.js runtime

Ensure production environment variables are set

Run migrations on production DB before first use

Production Checklist

Prisma client generated during build

DATABASE_URL set in production

JWT_SECRET secured

First admin created

Login & admin flows tested

🔮 Future Improvements

Payments integration

Order management

Email notifications

Advanced analytics


---

