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
- shadcn-ui
- React Router
- Recharts

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

**Payment issues:**
- Ensure Razorpay script is loaded (check `vendor/index.html`)
- Use Indian test cards only (international cards won't work in test mode)
- Check browser console for payment initialization errors
- Verify backend payment routes are accessible

### Common Errors

**"International cards are not supported":**
- Use Indian test cards: `5267 3181 8797 5449` or `5104 0600 0000 0008`
- Or use UPI payment method with test UPI ID: `success@razorpay`

**"Unknown Machine" in orders:**
- Ensure machine is selected in vendor app
- Check that `VITE_MACHINE_ID` is set in vendor `.env`
- Verify machines collection exists in Firestore

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

## Support

For issues and questions:
- Check the troubleshooting section above
- Review console logs for error messages
- Verify all environment variables are set correctly

---

Built with ❤️ for smart vending machine management