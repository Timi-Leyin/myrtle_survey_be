# Myrtle Wealth Blueprint Engine Backend API

A complete backend API built with Node.js, TypeScript, Express.js, Prisma, and Zod for the Myrtle Wealth Blueprint Questionnaire system.

## 🚀 Features

- **Questionnaire System**: Submit questionnaires with user information and receive comprehensive wealth analysis
- **Scoring Engine**: Automated calculation of net worth, risk scores, and personas
- **Portfolio Recommendations**: Personalized portfolio allocations based on user profile
- **Narrative Generation**: Automated wealth blueprint narrative generation
- **Swagger Documentation**: Auto-generated API documentation
- **Type Safety**: Full TypeScript implementation with Zod validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myrtle-survey-be
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development

# Supabase connection pooling (PgBouncer) URL
DATABASE_URL="postgresql://postgres.nyyddimlifvdwhgotjnp:[YOUR-PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection URL (used for Prisma migrations)
DIRECT_URL="postgresql://postgres.nyyddimlifvdwhgotjnp:[YOUR-PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres"

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false # set true if you use port 465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Myrtle Wealth <noreply@myrtlewealth.com>"
PLUNK_API_KEY=your-plunk-secret-key # optional - use Plunk API on hosts that block SMTP
```

**Note**: Replace `[YOUR-PASSWORD]` with the actual Supabase database password. The pooling URL is used by the application at runtime, while the direct URL is used for Prisma migrations and Studio.

4. Initialize the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Questionnaire Endpoints

- `POST /api/questionnaire/submit` - Submit questionnaire with user information and get analysis
- `GET /api/questionnaire/:id` - Get questionnaire by ID

### Documentation

- `GET /docs` - Swagger API documentation
- `GET /health` - Health check endpoint

## 📊 Scoring Logic

### Net Worth Calculation

Net worth is calculated from questions Q4-Q7:
- **Q4**: Assets midpoint (A=2.5m, B=27.5m, C=75m, D=300m)
- **Q5**: Additional assets midpoint (A=0, B=12.5m, C=137.5m, D=375m)
- **Q6**: Additional assets midpoint (A=0, B=12.5m, C=137.5m, D=375m)
- **Q7**: Liabilities midpoint (A=0, B=12.5m, C=137.5m, D=375m)

**Formula**: `NetWorth = (Q4 + Q5 + Q6) - Q7`

### Net Worth Bands

- **NW1 - Emerging**: < ₦20m
- **NW2 - Mass Affluent**: ₦20m - ₦100m
- **NW3 - Affluent**: ₦100m - ₦250m
- **NW4 - Private Wealth**: > ₦250m

### Risk Scoring

- **HIGH→LOW** (A=4, B=3, C=2, D=1): Q8, Q9, Q10
- **LOW→HIGH** (A=1, B=2, C=3, D=4): Q11, Q12, Q13, Q14

**Risk Profiles**:
- ≤12: Conservative
- 13-18: Moderate
- 19-23: Growth
- ≥24: Aggressive

### Persona Determination

- **Private Wealth Niche**: NW4 OR (NW3 AND STG3/STG4) OR (INC4 AND STG3/STG4)
- **Strategic Achiever**: NOT PWN AND NW2/NW3 AND INC2–INC4 AND STG2/3 AND T2–T4
- **Everyday Builder**: Default

### Portfolio Recommendations

- **Everyday Builder + Moderate**: 60% Cash, 30% Income, 10% Growth
- **Strategic Achiever + Growth**: 15% Cash, 35% Income, 30% Growth, 20% FX
- **Private Wealth + Aggressive**: 10% Cash, 25% Income, 30% Growth, 25% FX, 10% Alternatives

## 📁 Project Structure

```
src/
 ├─ index.ts                 # Application entry point
 ├─ app.ts                   # Express app configuration
 ├─ routes/                  # API routes
 │   └─ questionnaire.routes.ts
 ├─ controllers/             # Request handlers
 │   └─ questionnaire.controller.ts
 ├─ services/                # Business logic
 │   ├─ scoring.service.ts
 │   ├─ narrative.service.ts
 │   └─ pdf.service.ts
 ├─ utils/                   # Utility functions
 │   ├─ risk.config.ts
 │   ├─ networth.config.ts
 │   ├─ persona.config.ts
 │   ├─ portfolio.config.ts
 │   └─ helpers.ts
 └─ prisma/
     └─ client.ts           # Prisma client singleton
```

## 🎨 Brand Colors

- Primary: `#27dc85`
- Secondary: `#FFFFFF`

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | Supabase pooling URL (PgBouncer) | `postgresql://postgres.nyyddimlifvdwhgotjnp:[YOUR-PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase direct connection URL | `postgresql://postgres.nyyddimlifvdwhgotjnp:[YOUR-PASSWORD]@aws-1-eu-west-3.pooler.supabase.com:5432/postgres` |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_SECURE` | Use TLS (true/false). Defaults to `true` for port 465, otherwise `false`. | - |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_FROM` | From email/name. Defaults to `EMAIL_USER` | - |
| `PLUNK_API_KEY` | Secret key for Plunk transactional email API (use instead of SMTP on restricted hosts) | - |

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please contact the development team.

---

Built with ❤️ for Myrtle Wealth

