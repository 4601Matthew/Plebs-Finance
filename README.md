# Plebs Finance

A personal finance and debt management application built for Cloudflare Pages with KV storage. Manage your finances, track debts, set goals, and stay on top of your bills all in one place.

## Features

### 🔐 Authentication
- **PIN-based login**: Secure your app with a 4-6 digit PIN code
- **Changeable PIN**: Update your PIN anytime from the Profile page
- **First-time setup**: Create your PIN on first launch

### 💰 Cashflow Management
- **Manual entry**: Add income and expense entries manually
- **Bank statement upload**: Upload CSV/text bank statements and automatically parse transactions
- **Transaction history**: View all your cashflow entries with filtering and sorting
- **Summary statistics**: See total income, expenses, and net cashflow at a glance

### 💳 Credit Card Management
- **Multiple cards**: Add and manage multiple credit cards
- **Interest-free plans**: Create plans for purchases with interest-free periods
- **Auto-calculated payments**: Automatically calculates weekly payment needed to pay off each plan before interest kicks in
- **Total payment tracking**: See combined weekly payment requirements across all plans
- **Deadline tracking**: Visual indicators for remaining time on interest-free periods

### 📊 Expenses
- **One-time expenses**: Track individual expenses
- **Recurring expenses**: Set up weekly, monthly, or yearly recurring expenses
- **Expense history**: View all expenses with date and amount tracking

### 📄 Bills
- **Single bills**: Add one-time bills (e.g., car mechanic, medical bills)
- **Due date tracking**: Never miss a payment with due date tracking
- **Status indicators**: Visual indicators for paid, pending, due today, and overdue bills
- **Payment tracking**: Mark bills as paid/unpaid

### 🎯 Goals
- **Financial goals**: Set savings goals with target amounts
- **Progress tracking**: Visual progress bars showing completion percentage
- **Target dates**: Optional target dates for goals
- **Progress updates**: Easily add money to your goals

### 👤 Profile & Settings
- **Profile picture**: Upload and change your profile picture
- **Name**: Personalize your account with your name
- **Currency**: Choose from multiple currencies (default: NZD)
- **Timezone**: Set your timezone for accurate date/time display (default: Pacific/Auckland)
- **PIN management**: Change your PIN from the profile page

### 📱 Dashboard
- **Overview**: Quick summary of your financial status
- **Net cashflow**: See your income vs expenses at a glance
- **Total debt**: View combined credit card debt
- **Weekly payments**: Total weekly payment requirements
- **Recent activity**: Latest cashflow entries and upcoming bills

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Handling**: date-fns and date-fns-tz
- **Backend**: Cloudflare Pages Functions
- **Storage**: Cloudflare KV

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- GitHub account (for deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Plebs-Finance
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Cloudflare KV

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages > KV
3. Create a new KV namespace (e.g., `FINANCE_KV`)
4. Note the namespace ID

### 4. Update Configuration

Edit `wrangler.toml` and replace the KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "FINANCE_KV"
id = "your-kv-namespace-id"
preview_id = "your-kv-namespace-id"
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 6. Test with Wrangler (Optional)

To test Cloudflare Functions locally:

```bash
npm install -g wrangler
wrangler pages dev dist --kv FINANCE_KV=your-kv-namespace-id
```

## Deployment to Cloudflare Pages

### 1. Connect GitHub Repository

1. Go to Cloudflare Dashboard > Workers & Pages
2. Click "Create a project" > "Connect to Git"
3. Select your GitHub repository
4. Authorize Cloudflare to access your repository

### 2. Configure Build Settings

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (or leave empty)

### 3. Configure Environment Variables

In Cloudflare Pages settings, add your KV namespace binding:

- **Variable name**: `FINANCE_KV`
- **KV namespace**: Select your created KV namespace

### 4. Deploy

Cloudflare Pages will automatically deploy on every push to your main branch. You can also trigger manual deployments from the dashboard.

## Project Structure

```
Plebs-Finance/
├── functions/
│   └── api/
│       └── [[path]].ts          # Cloudflare Pages Functions API
├── src/
│   ├── components/
│   │   ├── Login.tsx            # PIN authentication
│   │   ├── Layout.tsx           # Navigation layout
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Cashflow.tsx         # Cashflow management
│   │   ├── CreditCards.tsx      # Credit card plans
│   │   ├── Expenses.tsx         # Expenses tracking
│   │   ├── Bills.tsx            # Bills management
│   │   ├── Goals.tsx            # Financial goals
│   │   └── Profile.tsx          # Profile settings
│   ├── api.ts                   # API client functions
│   ├── types.ts                 # TypeScript type definitions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── wrangler.toml                # Cloudflare Workers config
└── README.md
```

## API Endpoints

All API endpoints are handled by Cloudflare Pages Functions at `/api/*`:

### Authentication
- `POST /api/auth/verify` - Verify PIN
- `POST /api/auth/change-pin` - Change PIN

### Profile
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Update user profile

### Cashflow
- `GET /api/cashflow` - Get all cashflow entries
- `POST /api/cashflow` - Add cashflow entry
- `DELETE /api/cashflow/:id` - Delete cashflow entry

### Credit Cards
- `GET /api/credit-cards` - Get all credit cards
- `POST /api/credit-cards` - Add credit card
- `PUT /api/credit-cards/:id` - Update credit card
- `DELETE /api/credit-cards/:id` - Delete credit card

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Add expense
- `DELETE /api/expenses/:id` - Delete expense

### Bills
- `GET /api/bills` - Get all bills
- `POST /api/bills` - Add bill
- `DELETE /api/bills/:id` - Delete bill

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Add goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Bank Statements
- `POST /api/bank-statement/parse` - Parse uploaded bank statement file

## Data Storage

All data is stored in Cloudflare KV with the following keys:

- `user:pin` - User PIN (encrypted in production recommended)
- `user:profile` - User profile data (JSON)
- `cashflow` - Cashflow entries array (JSON)
- `credit-cards` - Credit cards array (JSON)
- `expenses` - Expenses array (JSON)
- `bills` - Bills array (JSON)
- `goals` - Goals array (JSON)

## Bank Statement Parsing

The app includes basic CSV/text parsing for bank statements. It looks for:
- Date patterns (DD/MM/YYYY, MM/DD/YYYY, etc.)
- Amount patterns (currency symbols, numbers)
- Transaction descriptions

**Note**: The parser is basic and may require manual adjustment for different bank formats. For production use, consider integrating with bank APIs or more sophisticated parsing libraries.

## Security Considerations

⚠️ **Important**: This app uses PIN-based authentication stored in plain text in KV. For production use, consider:

1. **Encrypting PINs**: Hash PINs using bcrypt or similar before storage
2. **Session management**: Implement proper session tokens instead of localStorage
3. **HTTPS**: Always use HTTPS in production (Cloudflare Pages provides this)
4. **Rate limiting**: Add rate limiting to API endpoints
5. **Input validation**: Enhance input validation and sanitization

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Roadmap

Potential future features:
- [ ] Budget planning and tracking
- [ ] Category-based expense tracking
- [ ] Financial reports and analytics
- [ ] Export data to CSV/PDF
- [ ] Mobile app (React Native)
- [ ] Bank account integration (Open Banking)
- [ ] Investment tracking
- [ ] Bill reminders and notifications
- [ ] Multi-user support
- [ ] Data backup and restore

---

Built with ❤️ for personal finance management
