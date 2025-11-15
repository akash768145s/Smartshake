# Smartshake Admin Dashboard

Management interface for monitoring Smartshake vending machines, sales, and system health.

## Overview

The admin dashboard provides real-time insights and management capabilities for:
- Sales analytics and revenue tracking
- Machine status and health monitoring
- Alert management and resolution
- Inventory and stock levels
- Cleaning schedules and compliance
- System configuration

## Technology Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui (Radix UI)
- **Routing**: React Router
- **Data Fetching**: TanStack Query (React Query)
- **Charts**: Recharts
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

Create a `.env` file in the `admin/` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

**Environment Variables:**
- `VITE_API_URL` - Backend API base URL

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will run on `http://localhost:5173` (or next available port)

### 4. Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Dashboard Pages

### Overview (`/`)
- Key Performance Indicators (KPIs)
- Revenue and dispense metrics
- Sales by hour chart
- Flavour distribution pie chart
- Fleet health cards
- Recent activity feed

### Machines (`/machines`)
- Machine list with status indicators
- Uptime and performance metrics
- Inventory levels (milk, water, powders)
- Last ping and cleaning status
- Machine detail drawer

### Stocks (`/stocks`)
- Inventory levels across all machines
- Powder levels by flavour
- Low stock alerts
- Reorder recommendations

### Sales (`/sales`)
- Revenue analytics and trends
- Sales by date range
- Top flavours by revenue
- Sales table with filtering
- Export capabilities

### Alerts (`/alerts`)
- System alerts with severity levels
- Filter by machine, status, or severity
- Alert resolution and management
- Alert history and occurrences

### Cleaning (`/cleaning`)
- Cleaning schedule tracking
- Compliance metrics
- Machine cleaning status
- Next due dates
- Cleaning cycle management

### Settings (`/settings`)
- System configuration
- Machine settings
- User preferences

### Support (`/support`)
- Help documentation
- Troubleshooting guides
- Contact information

## Features

### Real-Time Updates

- **Auto-refresh**: Dashboard automatically refreshes every 30 seconds
- **Live Metrics**: KPIs update in real-time
- **Status Indicators**: Machine status updates automatically

### Smart Time Formatting

Human-readable relative time display:
- Less than 1 minute: "just now"
- 1-59 minutes: "5m ago", "30m ago"
- 1-23 hours: "1hr ago", "12hr ago"
- 24-47 hours: "yesterday"
- 48+ hours: "2 days ago", "5 days ago"

### Data Visualization

- **Charts**: Bar charts, line charts, pie charts
- **KPIs**: Key metrics with trend indicators
- **Sparklines**: Mini trend charts in KPI cards
- **Responsive**: Charts adapt to screen size

### Filtering and Search

- Filter sales by date range
- Filter alerts by severity and status
- Search machines by name or location
- Date range pickers for analytics

## Project Structure

```
admin/
├── src/
│   ├── pages/
│   │   ├── Overview.tsx      # Dashboard overview
│   │   ├── Machines.tsx      # Machine management
│   │   ├── Stocks.tsx        # Inventory management
│   │   ├── Sales.tsx         # Sales analytics
│   │   ├── Alerts.tsx        # Alert management
│   │   ├── Cleaning.tsx      # Cleaning schedules
│   │   ├── Settings.tsx      # System settings
│   │   └── Support.tsx       # Help and support
│   ├── components/
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── layout/           # Layout components
│   │   ├── machines/         # Machine components
│   │   └── ui/              # shadcn-ui components
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── utils.ts         # Utility functions (including formatTimeAgo)
│   │   └── mockData.ts      # Mock data for development
│   ├── hooks/               # Custom React hooks
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── index.html               # HTML template
├── .env                     # Environment variables (create this)
└── package.json
```

## API Integration

The dashboard uses TanStack Query for efficient data fetching and caching:

- `getMachines()` - Fetch all machines
- `getMachine(id)` - Fetch specific machine
- `updateMachine(id, data)` - Update machine data
- `getSales(params)` - Fetch sales with filters
- `getSalesStats(days)` - Fetch sales statistics
- `getAlerts(params)` - Fetch alerts with filters
- `createAlert(data)` - Create new alert
- `updateAlert(id, data)` - Update alert status

## Key Components

### KPICard
Displays key metrics with:
- Icon and title
- Current value
- Trend indicators (delta)
- Sparkline charts

### FleetHealthCard
Shows machine health status:
- Machine name and location
- Status indicator
- Uptime percentage
- Revenue metrics

### StatusPill
Visual status indicator:
- Color-coded status (online, warning, critical, offline)
- Optional pulse animation

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Data Fetching

The dashboard uses TanStack Query for:
- Automatic caching
- Background refetching
- Optimistic updates
- Error handling

### Styling

- Tailwind CSS for utility-first styling
- Custom CSS variables for theming
- Responsive design with mobile support
- Dark mode support (via next-themes)

## Troubleshooting

### Dashboard Shows No Data

- Verify backend is running on `http://localhost:3001`
- Check `VITE_API_URL` in `.env` file
- Run `npm run seed` in backend folder
- Check browser console for API errors
- Verify Firestore collections exist

### Charts Not Rendering

- Check browser console for errors
- Verify Recharts is installed
- Ensure data is in correct format
- Check responsive container sizing

### Auto-refresh Not Working

- Check browser console for errors
- Verify API endpoints are accessible
- Check network tab for failed requests
- Ensure TanStack Query is configured correctly

### Build Errors

- Clear `node_modules` and reinstall
- Check Node.js version compatibility
- Review error messages in terminal
- Verify all dependencies are installed

## Production Deployment

Before deploying:

1. Update `VITE_API_URL` to production backend URL
2. Build the app: `npm run build`
3. Deploy the `dist/` directory to your hosting service
4. Ensure backend API is accessible from production domain
5. Configure CORS on backend for production domain
6. Set up proper error monitoring and logging

## Performance Considerations

- TanStack Query caching reduces API calls
- Auto-refresh interval can be adjusted
- Large datasets are paginated
- Charts use responsive containers
- Images are optimized

## License

ISC
