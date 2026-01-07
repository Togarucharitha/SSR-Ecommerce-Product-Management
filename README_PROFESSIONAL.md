# E-Commerce Admin Dashboard

A full-stack web application designed for managing products, tracking sales metrics, and monitoring inventory in real-time. Built with modern web technologies, this dashboard provides administrators with comprehensive insights into business performance while supporting role-based access control for secure operations.

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-Based Access Control (RBAC)**: Distinct admin and user roles with protected routes
- **Bcrypt Password Hashing**: Industry-standard password encryption
- **Session Management**: Cookie-based persistent sessions
- **Admin Bootstrap**: Automated admin account initialization

### 📊 Dashboard & Metrics
- **Sales Analytics**: Real-time sales count tracking and visualization
- **Revenue Calculation**: Automatic revenue computation (price × sales count)
- **Stock Monitoring**: Low stock indicators and inventory warnings
- **Sales Charts**: Interactive charting with Recharts library
- **Revenue Trends**: Time-series revenue analytics
- **Performance Metrics**: Key business metrics at a glance

### 📦 Product Management
- **Create Products**: Add new products with detailed information
- **Update Products**: Edit product details, pricing, and descriptions
- **Delete Products**: Remove products from the catalog
- **Bulk Image Upload**: Cloudinary integration for image management
- **Stock Management**: Track and update product inventory
- **Category Organization**: Products organized by category

### 🔍 Advanced Filtering & Search
- **Date-wise Filters**: Filter sales and metrics by date range
- **Product-wise Filters**: Search and filter by specific products
- **Category-wise Filters**: Browse products by category
- **Stock Level Filters**: Identify low-stock items

### 🛡️ Admin-Only Features
- **Admin Panel**: Exclusive administrative interface
- **User Management**: View and manage user accounts
- **Metrics API**: Dedicated API endpoints for analytics
- **Product Lifecycle**: Full control over product CRUD operations

### ☁️ Cloud Integration
- **Cloudinary CDN**: Optimized image storage and delivery
- **Multiple Formats**: Support for various image types and sizes

---

## 🛠 Tech Stack

### **Frontend**
- **Next.js 14**: React framework with App Router
- **React 18**: UI component library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Hook Form**: Form state management
- **Recharts**: Data visualization and charts
- **Zod**: Schema validation

### **Backend**
- **Next.js API Routes**: Serverless backend functions
- **Node.js**: JavaScript runtime
- **Express.js Principles**: RESTful API design patterns

### **Database & ORM**
- **PostgreSQL**: Relational database via Neon
- **Prisma**: Type-safe ORM with auto-generation
- **Migrations**: Database versioning and schema management

### **Authentication & Security**
- **JWT (JSON Web Tokens)**: Token-based authentication
- **Bcryptjs**: Password hashing and verification
- **Jose**: Edge-runtime compatible JWT verification

### **Cloud & Storage**
- **Cloudinary**: Image hosting and optimization
- **Next-Cloudinary**: Cloudinary integration library

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Prisma Studio**: Database visualization tool

---

## 🏗 Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│              Next.js Frontend (React)                    │
│         Tailwind CSS | Recharts | React Hook Form       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────┐
│               MIDDLEWARE LAYER                          │
│            JWT Token Verification                       │
│          Role-Based Access Control                      │
│            (Protected Routes)                           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            API ROUTES (Next.js Server)                  │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │   Auth API   │ Product API  │  Metrics API │        │
│  │   /login     │   /products  │  /sales      │        │
│  │   /logout    │   /[id]      │  /stock      │        │
│  │   /me        │              │  /revenue    │        │
│  └──────────────┴──────────────┴──────────────┘        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Prisma ORM
                     │
┌────────────────────▼────────────────────────────────────┐
│              DATABASE LAYER                             │
│    PostgreSQL (Neon) - Managed Cloud Database           │
│  ┌─────────────┬────────────┬──────────────┐           │
│  │   Users     │  Products  │  Orders      │           │
│  │   Table     │   Table    │  Table       │           │
│  └─────────────┴────────────┴──────────────┘           │
└────────────────────────────────────────────────────────┘

EXTERNAL SERVICES:
┌──────────────────────────────────────────────────────────┐
│              CLOUDINARY CDN                              │
│        Image Upload & Optimization Service              │
└──────────────────────────────────────────────────────────┘
```

### **Key Components**

1. **Authentication System**: 
   - Login → JWT Generation → Cookie Storage → Protected Routes

2. **Product Workflow**: 
   - Create → Upload Images (Cloudinary) → Store in DB → Display on Dashboard

3. **Metrics Calculation**: 
   - Track Sales → Calculate Revenue → Generate Charts

4. **Admin Access Flow**: 
   - Admin Login → Verify Role → Unlock Admin Panel → Full CRUD Operations

---

## 📋 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require&channel_binding=require"

# Next.js Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
PORT="3000"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Cloudinary Configuration (Image Upload)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"

# Default Admin Credentials (for initial setup)
DEFAULT_ADMIN_EMAIL="admin@example.com"
DEFAULT_ADMIN_PASSWORD="admin123"
DEFAULT_ADMIN_NAME="Admin User"
```

### **Environment Variable Descriptions**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret key for JWT signing | Any strong random string |
| `JWT_EXPIRES_IN` | Token expiration time | `7d`, `24h`, `30d` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud identifier | Available in Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API authentication | Available in Cloudinary dashboard |
| `DEFAULT_ADMIN_EMAIL` | Initial admin email for bootstrap | `admin@example.com` |
| `DEFAULT_ADMIN_PASSWORD` | Initial admin password | Your secure password |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL (accessible to browser) | `http://localhost:3000` |

---

## 🚀 Installation & Setup

### **Prerequisites**
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: Package manager
- **PostgreSQL**: Database server (or Neon account)
- **Cloudinary Account**: For image uploads (optional)

### **Step 1: Clone the Repository**
```bash
git clone <your-repository-url>
cd CDC\ Project
```

### **Step 2: Install Dependencies**
```bash
npm install
# or
yarn install
```

### **Step 3: Configure Environment Variables**
Create a `.env.local` file in the root directory:
```bash
cp .env .env.local
```
Edit `.env.local` and update with your actual configuration values.

### **Step 4: Generate Prisma Client**
```bash
npm run db:generate
```

### **Step 5: Run Database Migrations**
```bash
npm run db:migrate
```
This will create/update all database tables based on the schema.

### **Step 6: Bootstrap Admin Account**
```bash
node scripts/create-first-admin.js
```
This creates the default admin user using `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` from environment variables.

### **Step 7: Start Development Server**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

---

## 💾 Database Setup & Migrations

### **Database Schema**

The application uses four main tables:

#### **Users Table**
```sql
- id (CUID - Primary Key)
- name (String)
- email (String - Unique Index)
- password (String - Hashed)
- role (String - 'admin' | 'user')
- createdAt (DateTime)
- updatedAt (DateTime)
```

#### **Products Table**
```sql
- id (CUID - Primary Key)
- name (String)
- description (Text)
- price (Decimal 10,2)
- stock (Integer)
- salesCount (Integer)
- category (String - Indexed)
- images (Array of URLs)
- createdAt (DateTime - Indexed)
- updatedAt (DateTime)
```

#### **Orders Table**
```sql
- id (UUID - Primary Key)
- createdAt (DateTime)
- items (Relation to OrderItem)
```

#### **OrderItems Table**
```sql
- id (UUID - Primary Key)
- orderId (Foreign Key)
- productId (Foreign Key)
- quantity (Integer)
- price (Decimal 10,2)
- Indexes: productId, orderId
```

### **Running Migrations**

#### **Create Migration**
```bash
npm run db:migrate
```
Creates a new migration based on schema changes.

#### **View Database Schema**
```bash
npm run db:studio
```
Opens Prisma Studio to visually inspect and manage database.

#### **Push Schema Changes (Development)**
```bash
npm run db:push
```
Pushes schema changes to database without creating migrations (use only in development).

---

## ▶️ Running the Application

### **Development Mode**
```bash
npm run dev
```
- Hot reload enabled
- Debug logs visible
- Access at `http://localhost:3000`

### **Production Build**
```bash
npm run build
npm start
```
- Optimized bundle
- Production-ready performance

### **Linting**
```bash
npm run lint
```
Checks code quality and consistency using ESLint.

### **Database Studio** (Visual Database Manager)
```bash
npm run db:studio
```
Open an interactive database browser at `http://localhost:5555`

---

## 📊 Metrics & Dashboard Explanation

### **Dashboard Overview**

The metrics dashboard provides comprehensive business analytics:

#### **Sales Metrics**
- **Total Sales**: Sum of all sales count across products
- **Sales Chart**: Time-series visualization of sales trends
- **Top Selling Products**: Ranked by sales count

#### **Revenue Metrics**
- **Total Revenue**: Calculated as ∑(product.price × product.salesCount)
- **Revenue Trends**: Historical revenue visualization
- **Average Order Value**: Revenue / Total Orders

#### **Inventory Metrics**
- **Total Stock**: Sum of all product inventory
- **Low Stock Alerts**: Products below threshold
- **Stock by Category**: Inventory breakdown

#### **Available API Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/metrics/sales` | GET | Sales count metrics |
| `/api/admin/metrics/stock` | GET | Inventory metrics |
| `/api/admin/users` | GET | User list |

#### **Filtering Capabilities**

- **Date Range**: Filter metrics for specific periods
- **Product Filter**: Isolate metrics for specific products
- **Category Filter**: Analytics by product category
- **Status Filter**: Active/inactive product filtering

---

## 👥 Admin vs User Access Flow

### **Authentication Flow**

```
┌─────────────────────────────────────────────────────────┐
│                   USER VISITS APP                       │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │  Has Valid Auth Token?   │
         └───┬──────────────────┬───┘
             │ NO               │ YES
             │                  │
    ┌────────▼──────┐    ┌──────▼────────┐
    │ Redirect to   │    │ Verify Token  │
    │   /login      │    └──┬───────┬────┘
    └───────────────┘       │       │
                     ┌──────▼──┐    │ INVALID
                     │ VALID   │    │
                     │ TOKEN   │    │
                     └──┬──────┘    │
                        │          │
         ┌──────────────┴──────────┴──┬──────────────┐
         │  Check User Role          │              │
         └─────┬──────────────────────┴──────────────┘
               │
       ┌───────┴────────┐
       │ ADMIN | USER   │
       └───┬────────┬───┘
           │        │
    ┌──────▼──┐  ┌─▼───────────┐
    │ Access  │  │ Access Only │
    │ All     │  │ User Pages  │
    │ Routes  │  │ /dashboard  │
    └─────────┘  └─────────────┘
```

### **Admin Access**

**Protected Routes**: `/admin/*`, `/api/admin/*`

**Permissions**:
- ✅ Create, read, update, delete products
- ✅ View all metrics and analytics
- ✅ Manage user accounts
- ✅ Access admin panel
- ✅ Bootstrap admin accounts

**Admin Panel Endpoints**:
- `/admin/create-admin` - Create new admin users
- `/admin/metrics` - View business analytics
- `/dashboard/products` - Manage product catalog
- `/api/admin/users` - User management API
- `/api/admin/metrics/*` - Analytics APIs

### **User Access**

**Protected Routes**: `/dashboard/*`, `/api/*`

**Permissions**:
- ✅ View personal dashboard
- ✅ Browse products (read-only)
- ✅ View limited metrics
- ❌ Cannot modify products
- ❌ Cannot access admin panel
- ❌ Cannot create admin accounts

---

## 🌐 Deployment Instructions

### **Deployment Platforms**

#### **Vercel (Recommended for Next.js)**

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all `.env.local` variables

3. **Deploy**
   ```bash
   vercel deploy --prod
   ```

#### **Alternative: Heroku / Railway / DigitalOcean**

Ensure these are configured:
- Node.js buildpack
- PostgreSQL add-on (or external PostgreSQL URL)
- Environment variables set
- Build command: `npm run build`
- Start command: `npm start`

### **Pre-Deployment Checklist**

- [ ] Set secure `JWT_SECRET` (not default)
- [ ] Configure `NEXTAUTH_SECRET` for production
- [ ] Use production PostgreSQL instance
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Enable HTTPS for all connections
- [ ] Configure Cloudinary credentials
- [ ] Test authentication flow end-to-end
- [ ] Run database migrations on production
- [ ] Set up admin account on production
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring and error tracking

### **Production Environment Example**

```bash
DATABASE_URL="postgresql://prod-user:prod-password@prod-host:5432/ecommerce-db?sslmode=require"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
JWT_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NODE_ENV="production"
```

### **Monitoring & Maintenance**

- Monitor database performance
- Set up error tracking (Sentry, LogRocket)
- Configure automated backups
- Monitor API response times
- Set up uptime monitoring

---

## 🔮 Future Enhancements

### **Planned Features**

- [ ] **Email Notifications**: Order confirmation and status updates
- [ ] **Payment Gateway Integration**: Stripe / Razorpay / PayPal
- [ ] **Shopping Cart & Checkout**: Complete e-commerce flow
- [ ] **Order History**: User order tracking and management
- [ ] **Reviews & Ratings**: Product ratings system
- [ ] **Advanced Analytics**: Predictive analytics and forecasting
- [ ] **Multi-language Support**: i18n implementation
- [ ] **Dark Mode**: Theme switching capability
- [ ] **Mobile App**: React Native mobile application
- [ ] **Real-time Notifications**: WebSocket integration
- [ ] **Export Reports**: PDF/Excel report generation
- [ ] **User Preferences**: Wishlist and saved items
- [ ] **Discount Coupons**: Promotional code system
- [ ] **Inventory Alerts**: Low stock email notifications
- [ ] **Advanced Search**: Elasticsearch integration
- [ ] **2FA Authentication**: Two-factor authentication
- [ ] **API Documentation**: Swagger/OpenAPI docs
- [ ] **Performance Optimization**: Image CDN, caching strategies

---

## 📸 Screenshots

### **Login Page**
```
┌─────────────────────────────────────┐
│  E-Commerce Admin Dashboard         │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Email: [____________]       │  │
│  │  Password: [____________]    │  │
│  │  [Login Button]              │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### **Dashboard Overview**
```
┌────────────────────────────────────────────┐
│  Dashboard > Metrics                       │
├────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ │ Total    │ │ Revenue  │ │ Stock    │   │
│ │ Sales    │ │ $45,320  │ │ Level    │   │
│ │ 1,250    │ │ +12%     │ │ 892 units│   │
│ └──────────┘ └──────────┘ └──────────┘   │
│                                            │
│ ┌────────────────────────────────────┐   │
│ │ Sales Trend Chart                  │   │
│ │ [Chart showing time-series sales]  │   │
│ └────────────────────────────────────┘   │
└────────────────────────────────────────────┘
```

### **Product Management**
```
┌────────────────────────────────────────────┐
│  Dashboard > Products                      │
├────────────────────────────────────────────┤
│ ┌────────────────────────────────────┐    │
│ │ [+New Product]  [Search]  [Filter] │    │
│ └────────────────────────────────────┘    │
│                                            │
│ ┌────────────────────────────────────┐    │
│ │ Product Name │ Price │ Stock │Edit │    │
│ │ ─────────────────────────────────── │    │
│ │ Laptop       │ $999  │ 45   │ ✎ ✕ │    │
│ │ Mouse        │ $29   │ 120  │ ✎ ✕ │    │
│ │ Keyboard     │ $79   │ 8    │ ✎ ✕ │    │
│ └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

You are free to:
- ✅ Use this project commercially
- ✅ Modify the source code
- ✅ Distribute copies
- ✅ Include copyright and license notices

For more information, visit [MIT License](https://opensource.org/licenses/MIT)

---

## 📞 Support & Contact

For questions, issues, or feature requests:

1. **GitHub Issues**: Open an issue in the repository
2. **Email**: Create an issue via GitHub
3. **Documentation**: Check the project wiki for additional guides

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database ORM: [Prisma](https://www.prisma.io/)
- Charts: [Recharts](https://recharts.org/)
- Forms: [React Hook Form](https://react-hook-form.com/)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | Jan 2026 | Initial release with core features |

---

**Last Updated**: January 2026

---

## 🚀 Quick Start Checklist

Get started with these quick commands:

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env .env.local
# Edit .env.local with your configuration

# 3. Setup database
npm run db:generate
npm run db:migrate

# 4. Create admin user
node scripts/create-first-admin.js

# 5. Start development
npm run dev

# 6. Open browser
# Navigate to http://localhost:3000
# Login with admin@example.com / admin123
```

---

**Happy coding! 🎉**
