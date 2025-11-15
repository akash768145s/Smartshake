# Smartshake 🥤

A complete protein shake vending machine management system with customer ordering interface, payment processing, and real-time admin dashboard.

## Overview

Smartshake is a full-stack solution for managing protein shake vending machines. It consists of three main components:

- **Backend API** (`backend/`): Express.js server with Firebase Firestore integration
- **Vendor App** (`vendor/`): Customer-facing React application for ordering shakes
- **Admin Dashboard** (`admin/`): Management interface for monitoring sales, machines, and alerts

## Features

- 🛒 **Customer Ordering**: Intuitive interface for selecting flavours, base (milk/water), and quantity
- 💳 **Payment Integration**: Razorpay payment gateway with test mode support
- 📊 **Real-time Dashboard**: Live metrics, sales analytics, and machine health monitoring
- 🔔 **Alert System**: Automated alerts for machine issues and maintenance
- 📈 **Sales Analytics**: Revenue tracking, flavour popularity, and performance metrics
- 🧹 **Cleaning Management**: Track and schedule machine cleaning cycles
- ⚡ **Auto-refresh**: Dashboard updates every 30 seconds for real-time data
- 🕐 **Smart Time Formatting**: Human-readable relative time (e.g., "2hr ago", "yesterday", "3 days ago")

## Technology Stack

### Backend
- Node.js 18+
- Express.js
- TypeScript
- Firebase Admin SDK
- Razorpay SDK

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui (Radix UI components)
- React Router
- TanStack Query (React Query)
- Recharts
- Sonner (Toast notifications)
- Lucide React (Icons)

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase project with Firestore enabled
- Razorpay account (for payment processing)

## Quick Start

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firestore Database** (Build → Firestore Database)
4. Navigate to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key** to download credentials JSON file

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Razorpay Payment Gateway (Test keys are pre-configured)
RAZORPAY_KEY_ID=rzp_test_RfxCaQGgFsdSRu
RAZORPAY_KEY_SECRET=XnUkIhgRiEoRf7KoRkChdtwH
```

**Important**: Copy values from your Firebase credentials JSON:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes and `\n` characters)
- `client_email` → `FIREBASE_CLIENT_EMAIL`

Seed initial data:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Vendor App Setup

```bash
cd vendor
npm install
```

Create a `.env` file in the `vendor/` directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MACHINE_ID=machine-1
```

Start the development server:

```bash
npm run dev
```

The vendor app will run on `http://localhost:8080` (or the next available port)

### 4. Admin Dashboard Setup

```bash
cd admin
npm install
```

Create a `.env` file in the `admin/` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

Start the development server:

```bash
npm run dev
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Flavours
- `GET /flavours` - Get all available flavours
- `GET /flavours/:id` - Get a specific flavour

#### Orders
- `POST /orders` - Create a new order
- `GET /orders` - Get all orders (with optional `status` query param)
- `GET /orders/:id` - Get a specific order
- `PATCH /orders/:id/status` - Update order status

#### Machines
- `GET /machines` - Get all machines
- `GET /machines/:id` - Get a specific machine
- `POST /machines` - Create a new machine
- `PATCH /machines/:id` - Update machine data

#### Sales
- `GET /sales` - Get sales data
  - Query params: `machineId`, `days`, `startDate`, `endDate`
- `GET /sales/stats` - Get sales statistics
  - Query params: `days` (default: 7)

#### Alerts
- `GET /alerts` - Get alerts
  - Query params: `machineId`, `status`, `severity`
- `POST /alerts` - Create a new alert
- `PATCH /alerts/:id` - Update alert status

#### Payments (Razorpay)
- `POST /payments/create-order` - Create Razorpay payment order
  - Body: `{ amount, currency?, receipt?, notes? }`
- `POST /payments/verify` - Verify payment signature
  - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`

## Payment Integration

### Razorpay Test Mode

The project comes pre-configured with Razorpay test keys. Test cards for Indian accounts:

**Success Cards:**
- Card: `5267 3181 8797 5449` (Visa)
- Card: `5104 0600 0000 0008` (Mastercard)
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI IDs:**
- `success@razorpay` - Successful payment
- `failure@razorpay` - Failed payment

**Note**: Razorpay test mode only supports Indian cards. International cards will show an error.

### Payment Flow

1. Customer selects order details (flavours, base, quantity)
2. Clicks "Pay with Razorpay"
3. Backend creates Razorpay order
4. Razorpay checkout modal opens
5. Customer completes payment
6. Payment signature verified server-side
7. Order created in Firestore only after successful payment
8. Customer redirected to dispense page

## Data Models

### Firestore Collections

- **`flavours`**: Available protein shake flavours
  - `id`, `name`, `icon`, `price_per_scoop`, `available`, `created_at`

- **`orders`**: Customer orders
  - `id`, `base`, `quantity`, `total_price`, `status`, `created_at`, `completed_at`, `machineId`, `machineName`

- **`order_items`**: Individual flavour selections per order
  - `id`, `order_id`, `flavour_id`, `scoops`, `price_per_scoop`, `created_at`

- **`machines`**: Machine status and inventory
  - `id`, `name`, `location`, `status`, `uptime7d`, `dispenses24h`, `milkLevel`, `waterLevel`, `powderLevels`, `lastClean`, `lastPing`, `revenue24h`

- **`sales`**: Calculated sales data (derived from completed orders)

- **`alerts`**: System alerts
  - `id`, `machineId`, `machineName`, `severity`, `title`, `description`, `category`, `timestamp`, `status`, `occurrences`

## Order Status Flow

```
pending → preparing → dispensing → completed
```

Orders can also have a `failed` status if processing encounters errors.

## Troubleshooting

### Backend Issues

**Backend won't start:**
- Verify `.env` file exists with correct Firebase credentials
- Ensure Firestore is enabled in Firebase Console
- Check Node.js version: `node --version` (should be 18+)
- Review backend console logs for specific errors

**Firebase connection errors:**
- Verify `FIREBASE_PROJECT_ID` matches your Firebase project
- Check that `FIREBASE_PRIVATE_KEY` includes quotes and `\n` characters
- Ensure service account has Firestore permissions
- Verify the JSON credentials file is valid

**Port already in use:**
- Change `PORT` in `.env` to a different port (e.g., 3002)
- Or stop the process using port 3001

### Frontend Issues

**Vendor app can't create orders:**
- Verify backend is running on port 3001
- Check `VITE_API_URL` in vendor `.env` file
- Open browser console (F12) for CORS or network errors
- Ensure backend CORS is properly configured
- Check that backend health endpoint responds: `http://localhost:3001/health`

**Admin dashboard shows no data:**
- Verify backend is running
- Check `VITE_API_URL` in admin `.env` file
- Run `npm run seed` in backend folder to populate initial data
- Check browser console for API errors
- Verify Firestore collections exist

**Build errors:**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Review error messages in terminal

### Payment Issues

**Payment gateway not loading:**
- Ensure Razorpay script is loaded (check `vendor/index.html`)
- Check browser console for script loading errors
- Verify internet connection (script loads from CDN)

**"International cards are not supported":**
- Use Indian test cards: `5267 3181 8797 5449` or `5104 0600 0000 0008`
- Or use UPI payment method with test UPI ID: `success@razorpay`
- This is expected behavior in Razorpay test mode

**Payment verification failed:**
- Check backend logs for signature verification errors
- Verify `RAZORPAY_KEY_SECRET` matches the key used to create the order
- Ensure payment data is sent correctly from frontend

**Order not created after payment:**
- Check backend logs for errors during order creation
- Verify Firestore connection
- Check payment verification response in browser console
- Ensure order data is valid (flavours, base, quantity)

### Common Errors

**"Unknown Machine" in orders:**
- Ensure machine is selected in vendor app
- Check that `VITE_MACHINE_ID` is set in vendor `.env`
- Verify machines collection exists in Firestore
- Run `npm run seed` in backend to create sample machines

**CORS errors:**
- Verify backend CORS middleware is configured
- Check that frontend URL is allowed in CORS settings
- Ensure backend is running before starting frontend apps

**Date/time display issues:**
- Verify timestamps are stored correctly in Firestore
- Check browser timezone settings
- Ensure date conversion utilities are working correctly

## Production Deployment

Before going live:

1. **Environment Variables**
   - Replace test Razorpay keys with live keys
   - Use production Firebase credentials
   - Set production API URLs

2. **Security**
   - Enable Firebase security rules for Firestore
   - Add authentication for admin endpoints
   - Configure CORS for production domains
   - Never expose `RAZORPAY_KEY_SECRET` in frontend code

3. **Performance**
   - Enable Firestore indexes for complex queries
   - Set up proper error logging and monitoring
   - Configure rate limiting for API endpoints

4. **Testing**
   - Test payment flow thoroughly
   - Verify all API endpoints work correctly
   - Test with real payment methods (small amounts)

## Project Structure

```
Smartshake/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/   # Firebase & Razorpay configuration
│   │   ├── routes/   # API route handlers
│   │   ├── scripts/  # Database seeding scripts
│   │   └── types/    # TypeScript type definitions
│   └── package.json
├── vendor/           # Customer-facing React app
│   ├── src/
│   │   ├── pages/    # Order flow pages
│   │   ├── components/ # UI components
│   │   ├── contexts/  # React contexts
│   │   └── lib/       # API client & utilities
│   └── package.json
├── admin/            # Admin dashboard React app
│   ├── src/
│   │   ├── pages/    # Dashboard pages
│   │   ├── components/ # UI components
│   │   └── lib/       # API client & utilities
│   └── package.json
└── README.md
```

## Development

### Running All Services

Open three terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Vendor App:**
```bash
cd vendor && npm run dev
```

**Terminal 3 - Admin Dashboard:**
```bash
cd admin && npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend Apps:**
```bash
cd vendor  # or admin
npm run build
```

## License

ISC

## Additional Features

### Time Formatting

The admin dashboard includes smart time formatting that displays:
- **Less than 1 minute**: "just now"
- **1-59 minutes**: "5m ago", "30m ago"
- **1-23 hours**: "1hr ago", "12hr ago"
- **24-47 hours**: "yesterday"
- **48+ hours**: "2 days ago", "5 days ago"

This provides a better user experience compared to raw timestamps.

### Order Flow

The vendor app guides customers through a complete ordering experience:
1. **Welcome** - Machine selection
2. **Flavour Selection** - Choose protein flavours and scoops
3. **Base Selection** - Select milk or water base
4. **Quantity Selection** - Choose volume (0-500ml)
5. **Payment** - Secure Razorpay checkout
6. **Dispense** - Real-time progress tracking
7. **Done** - Order completion confirmation

### Admin Dashboard Pages

- **Overview**: KPIs, charts, fleet health, recent activity
- **Machines**: Machine status, inventory levels, uptime metrics
- **Stocks**: Inventory management and levels
- **Sales**: Revenue analytics, flavour popularity, trends
- **Alerts**: System alerts with filtering and management
- **Cleaning**: Cleaning schedules and compliance tracking
- **Settings**: System configuration
- **Support**: Help and documentation

## Support

For issues and questions:
- Check the troubleshooting section above
- Review console logs for error messages
- Verify all environment variables are set correctly
- Check Firebase Console for Firestore data and errors
- Review Razorpay Dashboard for payment logs

---

Built with ❤️ for smart vending machine management