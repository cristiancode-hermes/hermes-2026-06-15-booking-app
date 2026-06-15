# Hermes Booking App — Appointment Scheduler

> A modern appointment scheduling system for small businesses. Book services, manage appointments, and run your business with a clean, fast Angular 22 + NestJS stack.

## Features

- **Business profiles** — Register your business with contact info and description
- **Service catalog** — Manage services with duration, pricing, and availability
- **Customer booking** — Step-by-step booking flow: select service → pick date/time → enter contact info
- **Conflict detection** — Smart time-slot validation prevents double-booking
- **Dashboard** — Business owner view with date-picker and appointment list
- **Status management** — Confirm, cancel, or complete appointments with one click
- **Seed data** — Pre-loaded demo businesses, services, and appointments for immediate testing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 22 (standalone, signals, zoneless) |
| Styling | Tailwind CSS 3 |
| Backend | NestJS 11 |
| Database | SQLite via TypeORM (Neon/PostgreSQL upgrade path) |
| API | REST + Swagger/OpenAPI |
| Testing | Jest (21 unit tests) |

## Architecture Overview

```
┌─────────────┐     HTTP      ┌──────────────┐     TypeORM     ┌────────┐
│  Angular 22  │ ──────────>  │   NestJS 11   │ ─────────────> │ SQLite │
│  (signals,   │ <──────────  │  (modules,    │ <───────────── │  (dev) │
│   zoneless)  │     JSON     │   services)   │                │        │
└─────────────┘               └──────────────┘                └────────┘
       │                                                            │
       │ 5 pages: Home, Booking,                                   │
       │ Dashboard, Services, Settings                             │
       │                                                            │
       └────────────────────── * ──────────────────────────────────┘
               Seed data runs on module init if DB empty
```

## Prerequisites

- Node.js 18+
- npm 9+

## Local Setup

```bash
# 1. Clone or navigate to the project
cd hermes-2026-06-15-booking-app

# 2. Backend setup
cd apps/api
cp ../../.env.example .env  # or use defaults
npm install
npm run build

# 3. Frontend setup
cd ../web
npm install
npm run build

# 4. Run both
# Terminal 1:
cd apps/api && npm run start:dev

# Terminal 2:
cd apps/web && npm run start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `./data/booking.db` | SQLite database path |
| `PORT` | `3000` | API server port |

## Seed Data

The app automatically seeds on first startup:

- **2 Businesses:** Urban Barber Studio, Serenity Spa & Wellness
- **5 Services:** Classic Haircut, Beard Trim, Hair & Beard Combo, Swedish Massage, Facial Treatment
- **10 Appointments:** Mixed statuses across the next 7 days

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/businesses` | List all businesses |
| POST | `/api/businesses` | Create a business |
| GET | `/api/businesses/:id` | Get business by ID |
| GET | `/api/businesses/slug/:slug` | Get business by slug |
| PATCH | `/api/businesses/:id` | Update business |
| DELETE | `/api/businesses/:id` | Delete business |
| GET | `/api/services` | List services (filter by `?businessId=`) |
| POST | `/api/services` | Create a service |
| GET | `/api/services/:id` | Get service by ID |
| GET | `/api/services/business/:businessId` | Get services for a business |
| PATCH | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |
| GET | `/api/appointments` | List appointments (`?businessId=&date=`) |
| GET | `/api/appointments/range` | Appointments in date range (`?businessId=&start=&end=`) |
| POST | `/api/appointments` | Create appointment (returns 409 on conflict) |
| GET | `/api/appointments/:id` | Get appointment by ID |
| PATCH | `/api/appointments/:id` | Update appointment (status changes) |
| DELETE | `/api/appointments/:id` | Delete appointment |

Full Swagger docs available at `/api/docs` when running.

## Roadmap

- [ ] PostgreSQL / Neon database for production
- [ ] Authentication (JWT for business owners)
- [ ] Email/SMS appointment reminders
- [ ] Recurring appointment support
- [ ] Business hours configuration with automatic time-slot generation
- [ ] Multi-staff scheduling per business
- [ ] Customer self-service portal (view/cancel own bookings)
- [ ] Calendar integration (Google Calendar sync)
- [ ] Payment processing (Stripe)
- [ ] Mobile-responsive improvements

## License

MIT
