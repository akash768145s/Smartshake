# Smartshake Vendor App

Customer-facing React application for ordering protein shakes from Smartshake vending machines.

## Overview

The vendor app provides an intuitive touch-screen interface for customers to:
- Select protein shake flavours and quantities
- Choose base (milk or water)
- Complete secure payments via Razorpay
- Track order preparation and dispensing

## Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui (Radix UI)
- **Routing**: React Router
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Notifications**: Sonner

## Prerequisites

- Node.js 18 or higher
- Backend API running on `http://localhost:3001`
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `vendor/` directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_MACHINE_ID=machine-1
```

**Environment Variables:**
- `VITE_API_URL` - Backend API base URL
- `VITE_MACHINE_ID` - Default machine ID (optional)

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:8080` (or next available port)

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Order Flow

The vendor app guides customers through a complete ordering experience:

1. **Welcome** (`/welcome`) - Machine selection and welcome screen
2. **Flavour Selection** (`/flavour`) - Choose protein flavours and number of scoops
3. **Base Selection** (`/base`) - Select milk or water base
4. **Quantity Selection** (`/quantity`) - Choose volume (0-500ml)
5. **Payment** (`/payment`) - Review order and complete Razorpay payment
6. **Dispense** (`/dispense`) - Real-time progress tracking while shake is prepared
7. **Done** (`/done`) - Order completion confirmation

## Features

### Order Management

- **Order Context**: React Context API manages order state throughout the flow
- **Price Calculation**: Automatic price calculation based on:
  - Flavour scoops: ₹99 per scoop
  - Milk base: ₹15 per 200ml
  - Water base: Free

### Payment Integration

- **Razorpay Checkout**: Integrated Razorpay Standard Checkout
- **Payment Flow**:
  1. Creates Razorpay order via backend API
  2. Opens Razorpay checkout modal
  3. Verifies payment signature server-side
  4. Creates Firestore order only after successful payment
  5. Redirects to dispense page

### User Experience

- **Touch-Optimized**: Large buttons and touch-friendly interface
- **Visual Feedback**: Progress indicators and animations
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on various screen sizes

## Project Structure

```
vendor/
├── src/
│   ├── pages/
│   │   ├── Welcome.tsx           # Welcome/machine selection
│   │   ├── FlavourSelection.tsx  # Flavour selection
│   │   ├── BaseSelection.tsx     # Base selection
│   │   ├── QuantitySelection.tsx # Quantity selection
│   │   ├── Payment.tsx           # Payment page
│   │   ├── Dispense.tsx          # Dispense progress
│   │   └── Done.tsx              # Order completion
│   ├── components/
│   │   ├── BrandLogo.tsx         # Brand logo component
│   │   └── ui/                   # shadcn-ui components
│   ├── contexts/
│   │   └── OrderContext.tsx      # Order state management
│   ├── lib/
│   │   ├── api.ts                # API client
│   │   └── utils.ts              # Utility functions
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # Entry point
├── index.html                    # HTML template
├── .env                          # Environment variables (create this)
└── package.json
```

## API Integration

The app communicates with the backend API via the `api.ts` client:

- `getFlavours()` - Fetch available flavours
- `getMachines()` - Fetch available machines
- `createPaymentOrder()` - Create Razorpay payment order
- `verifyPayment()` - Verify payment signature
- `createOrder()` - Create order in Firestore
- `updateOrderStatus()` - Update order status
- `getOrder()` - Fetch order details

## Payment Testing

### Test Cards (Indian Cards Only)

**Success Cards:**
- `5267 3181 8797 5449` (Visa)
- `5104 0600 0000 0008` (Mastercard)
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI IDs:**
- `success@razorpay` - Successful payment
- `failure@razorpay` - Failed payment

**Note**: Razorpay test mode only supports Indian cards. International cards will show an error.

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Hot Reload

The development server supports hot module replacement (HMR) for instant updates during development.

## Troubleshooting

### App Won't Start

- Verify Node.js version: `node --version` (should be 18+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for port conflicts

### API Connection Issues

- Verify backend is running on `http://localhost:3001`
- Check `VITE_API_URL` in `.env` file
- Open browser console (F12) for network errors
- Verify CORS is configured on backend

### Payment Issues

- Ensure Razorpay script is loaded (check `index.html`)
- Use Indian test cards only
- Check browser console for payment errors
- Verify backend payment endpoints are accessible

### Order Not Created

- Check browser console for API errors
- Verify payment was successful
- Check backend logs for order creation errors
- Ensure Firestore connection is working

## Production Deployment

Before deploying:

1. Update `VITE_API_URL` to production backend URL
2. Build the app: `npm run build`
3. Deploy the `dist/` directory to your hosting service
4. Ensure backend API is accessible from production domain
5. Configure CORS on backend for production domain

## License

ISC
