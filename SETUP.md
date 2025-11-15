# Smartshake Setup Guide 🚀

Yo! Here's how to get this protein shake vending machine backend running. It's basically connecting your vendor app (where customers order) and admin dashboard (where you monitor everything) to Firebase.

## What's What

- **Backend** (`backend/`): The API server that talks to Firebase
- **Vendor App** (`vendor/`): The customer-facing ordering screen
- **Admin Dashboard** (`admin/`): Where gym owners watch sales and machine health

## What You Need

- Node.js 18+ (check with `node --version`)
- A Firebase project with Firestore enabled
- Firebase service account credentials (we'll get these)

---

## Step 1: Firebase Setup 🔥

1. Head to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Enable **Firestore Database** (it's in the Build section)
4. Go to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key** (downloads a JSON file)
6. Keep that JSON file handy - you'll need it in a sec

---

## Step 2: Backend Setup 💻

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` folder:

```env
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Razorpay Payment Gateway (Optional - test keys are already configured)
RAZORPAY_KEY_ID=rzp_test_RfxCaQGgFsdSRu
RAZORPAY_KEY_SECRET=XnUkIhgRiEoRf7KoRkChdtwH
```

**Copy from your JSON file:**
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and `\n` characters!)
- `client_email` → `FIREBASE_CLIENT_EMAIL`

Then seed some initial data:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

Backend runs on `http://localhost:3001` ✨

---

## Step 3: Vendor App (Customer Side) 🛒

```bash
cd vendor
npm install
```

Create `.env` in `vendor/`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MACHINE_ID=machine-1
```

Start it:

```bash
npm run dev
```

Runs on `http://localhost:8080`

---

## Step 4: Admin Dashboard 📊

```bash
cd admin
npm install
```

Create `.env` in `admin/`:

```env
VITE_API_URL=http://localhost:3001/api
```

Start it:

```bash
npm run dev
```

---

## API Endpoints

### Flavours
- `GET /api/flavours` - Get all flavours
- `GET /api/flavours/:id` - Get one flavour

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `PATCH /api/orders/:id/status` - Update status

### Machines
- `GET /api/machines` - Get all machines
- `GET /api/machines/:id` - Get one machine
- `POST /api/machines` - Create machine
- `PATCH /api/machines/:id` - Update machine

### Sales
- `GET /api/sales` - Get sales (supports `machineId`, `days`, `startDate`, `endDate`)
- `GET /api/sales/stats` - Get stats

### Alerts
- `GET /api/alerts` - Get alerts (supports `machineId`, `status`, `severity`)
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/:id` - Update alert

### Payments (Razorpay)
- `POST /api/payments/create-order` - Create Razorpay payment order
- `POST /api/payments/verify` - Verify payment signature

**Note:** Razorpay test keys are already configured. See [RAZORPAY_INTEGRATION.md](./RAZORPAY_INTEGRATION.md) for details.

---

## How It Works

1. **Customer orders** (Vendor App):
   - Picks flavours, base, quantity
   - Pays
   - Order hits Firestore via `/api/orders`

2. **Order gets processed**:
   - Status goes: `pending` → `preparing` → `dispensing` → `completed`
   - Each update saves to Firestore

3. **Admin watches** (Admin Dashboard):
   - Auto-refreshes every 30 seconds
   - Shows metrics, sales, machine health
   - Can update machine status and fix alerts

---

## Firestore Collections

- `flavours` - Protein shake flavours
- `orders` - Customer orders
- `order_items` - Flavour selections per order
- `machines` - Machine status and inventory
- `sales` - Sales data (calculated from orders)
- `alerts` - System alerts

---

## Troubleshooting 🔧

### Backend won't start
- Check `.env` exists and has correct Firebase stuff
- Make sure Firestore is enabled in Firebase Console
- Node.js version 18+? (`node --version`)

### Vendor app can't create orders
- Backend running on port 3001?
- Check `VITE_API_URL` in vendor `.env`
- Open browser console (F12) - any CORS errors?

### Admin dashboard shows nothing
- Backend running?
- Check `VITE_API_URL` in admin `.env`
- Run `npm run seed` in backend folder
- Check browser console for errors

### Date errors
- Dates are stored as ISO strings
- Frontend converts with `new Date(timestamp)`
- Check browser console for specific errors

---

## Going Live (Production) 🌐

When you're ready to deploy:

1. Set `VITE_API_URL` to your production backend URL
2. Use production Firebase credentials (not dev ones)
3. Enable CORS properly in production
4. Set up Firebase security rules for Firestore
5. Add auth for admin endpoints (security first!)

---

That's it! If something breaks, check the console logs - they usually tell you what's wrong. Good luck! 💪
