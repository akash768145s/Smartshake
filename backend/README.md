# Smartshake Backend API

Express backend for Smartshake vending machine system connecting vendor app and admin dashboard to Firebase Firestore.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

3. Get Firebase Admin SDK credentials:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Copy the project ID, private key, and client email to `.env`

4. Seed initial data (flavours and machines):
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Flavours
- `GET /api/flavours` - Get all flavours
- `GET /api/flavours/:id` - Get a specific flavour

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get a specific order
- `PATCH /api/orders/:id/status` - Update order status

### Machines
- `GET /api/machines` - Get all machines
- `GET /api/machines/:id` - Get a specific machine
- `POST /api/machines` - Create a new machine
- `PATCH /api/machines/:id` - Update machine data

### Sales
- `GET /api/sales` - Get sales data (supports `machineId`, `days`, `startDate`, `endDate` query params)
- `GET /api/sales/stats` - Get sales statistics

### Alerts
- `GET /api/alerts` - Get alerts (supports `machineId`, `status`, `severity` query params)
- `POST /api/alerts` - Create a new alert
- `PATCH /api/alerts/:id` - Update alert

## Data Models

All data models match the existing frontend types. Timestamps are stored as Firestore Timestamps and converted to JavaScript Dates in responses.

