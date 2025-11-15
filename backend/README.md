# Smartshake Backend API

Express.js backend server for the Smartshake vending machine system. Provides RESTful API endpoints connecting the vendor app and admin dashboard to Firebase Firestore.

## Overview

The backend serves as the central API layer, handling:
- Order processing and status management
- Payment integration with Razorpay
- Machine status and inventory tracking
- Sales data aggregation and analytics
- Alert management
- Flavour and product management

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Payment**: Razorpay SDK
- **Development**: tsx (TypeScript execution)

## Prerequisites

- Node.js 18 or higher
- Firebase project with Firestore enabled
- Firebase service account credentials
- Razorpay account (for payment processing)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Razorpay Payment Gateway (Test keys are pre-configured)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**Getting Firebase Credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Copy values from the downloaded JSON file:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep quotes and `\n` characters)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 3. Seed Initial Data

Populate Firestore with sample flavours and machines:

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

Base URL: `http://localhost:3001/api`

### Health Check
- `GET /health` - Server health status

### Flavours
- `GET /flavours` - Get all available flavours
- `GET /flavours/:id` - Get a specific flavour by ID

### Orders
- `POST /orders` - Create a new order
  - Body: `{ base, quantity, total_price, flavours, machineId?, machineName?, idempotencyKey? }`
- `GET /orders` - Get all orders
  - Query params: `status` (optional)
- `GET /orders/:id` - Get a specific order by ID
- `PATCH /orders/:id/status` - Update order status
  - Body: `{ status: 'pending' | 'preparing' | 'dispensing' | 'completed' | 'failed' }`

### Machines
- `GET /machines` - Get all machines
- `GET /machines/:id` - Get a specific machine by ID
- `POST /machines` - Create a new machine
- `PATCH /machines/:id` - Update machine data

### Sales
- `GET /sales` - Get sales data
  - Query params:
    - `machineId` (optional) - Filter by machine
    - `days` (optional) - Last N days
    - `startDate` (optional) - Start date (ISO string)
    - `endDate` (optional) - End date (ISO string)
- `GET /sales/stats` - Get sales statistics
  - Query params: `days` (default: 7)

### Alerts
- `GET /alerts` - Get alerts
  - Query params:
    - `machineId` (optional)
    - `status` (optional) - 'open' | 'muted' | 'resolved'
    - `severity` (optional) - 'critical' | 'high' | 'medium' | 'low'
- `POST /alerts` - Create a new alert
- `PATCH /alerts/:id` - Update alert status

### Payments (Razorpay)
- `POST /payments/create-order` - Create Razorpay payment order
  - Body: `{ amount, currency?, receipt?, notes? }`
  - Returns: `{ id, amount, currency, receipt, key_id }`
- `POST /payments/verify` - Verify payment signature
  - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
  - Returns: `{ verified: boolean, order_id?, payment_id?, error? }`

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── firebase.ts      # Firebase Admin SDK configuration
│   │   └── razorpay.ts      # Razorpay SDK configuration
│   ├── routes/
│   │   ├── flavours.ts     # Flavour endpoints
│   │   ├── orders.ts        # Order endpoints
│   │   ├── machines.ts      # Machine endpoints
│   │   ├── sales.ts         # Sales endpoints
│   │   ├── alerts.ts        # Alert endpoints
│   │   └── payments.ts      # Payment endpoints
│   ├── scripts/
│   │   └── seed.ts          # Database seeding script
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── index.ts             # Express app entry point
├── .env                     # Environment variables (create this)
├── package.json
└── tsconfig.json
```

## Data Models

All data models are defined in `src/types/index.ts`. Timestamps are stored as Firestore Timestamps and automatically converted to JavaScript Dates in API responses.

### Order Status Flow

```
pending → preparing → dispensing → completed
```

Orders can also have a `failed` status if processing encounters errors.

## Payment Integration

The backend integrates with Razorpay for payment processing:

1. Creates Razorpay orders when customers initiate payment
2. Verifies payment signatures server-side for security
3. Only creates Firestore orders after successful payment verification

**Security Note**: Payment signature verification is critical and must be done server-side. Never trust client-side payment data.

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed Firestore with initial data

### Environment Variables

All environment variables are loaded from `.env` file using `dotenv`. Never commit `.env` files to version control.

## Troubleshooting

### Server Won't Start

- Verify `.env` file exists with correct Firebase credentials
- Check Node.js version: `node --version` (should be 18+)
- Ensure port 3001 is not already in use
- Review console logs for specific errors

### Firebase Connection Issues

- Verify `FIREBASE_PROJECT_ID` matches your Firebase project
- Check that `FIREBASE_PRIVATE_KEY` includes quotes and `\n` characters
- Ensure Firestore is enabled in Firebase Console
- Verify service account has Firestore permissions

### Payment Issues

- Verify Razorpay keys are correct
- Check payment signature verification logic
- Review Razorpay dashboard for payment logs
- Ensure payment amounts are in paise (multiply rupees by 100)

## Production Considerations

- Set up proper error logging and monitoring
- Configure rate limiting for API endpoints
- Enable Firebase security rules for Firestore
- Use production Razorpay keys (not test keys)
- Set up proper CORS configuration
- Add authentication for admin endpoints
- Enable Firestore indexes for complex queries

## License

ISC
