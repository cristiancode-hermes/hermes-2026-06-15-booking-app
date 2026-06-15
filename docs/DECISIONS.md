# Architecture Decision Records

## ADR-1: SQLite for Development (Neon-Ready Architecture)

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** The mission prompt requires Neon/PostgreSQL. However, NEON_API_KEY is unavailable in the cron environment (5th consecutive run).  
**Decision:** Use SQLite via better-sqlite3 with TypeORM abstraction. The entity design, query patterns, and migration structure are all Neon-compatible. Switch requires: change `type: 'postgres'`, update connection string, run migrations.  
**Consequences:** + Rapid development without infrastructure dependency; - Cannot exercise actual PostgreSQL features (pgvector, RLS, connection pooling).

## ADR-2: No Authentication (Open Booking System)

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Adding JWT auth would consume 20-30 minutes of the 150-minute budget on something done in 3 previous projects.  
**Decision:** Skip authentication. The system is designed as an open booking platform where customers book without login and business owners access their dashboard via a known slug.  
**Consequences:** + More time for core booking logic and conflict detection; - Not production-ready without auth; Dashboard is accessible to anyone who knows the slug.

## ADR-3: TypeORM synchronize:true for Schema Management

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Migration tooling setup adds complexity and time. With SQLite in local-only mode, schema changes come from code only.  
**Decision:** Use `synchronize: true` in TypeORM config for dev. Document migration setup for production.  
**Consequences:** + Fast iteration, no migration files to maintain; - Schema changes are implicit, not reviewable as code; Not suitable for production.

## ADR-4: Conflict Detection via Application Layer

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Appointment booking requires preventing double-booking at overlapping times. Options: database constraints (exclusion constraints in PostgreSQL), application-level queries, or database triggers.  
**Decision:** Implement conflict detection in the NestJS service layer using TypeORM query with `LessThan`/`MoreThan` operators to find overlapping confirmed appointments.  
**Consequences:** + Simple, portable across databases (works with SQLite and PostgreSQL); - Race condition possible under high concurrency (mitigated by unique constraint on businessId + startTime in production).

## ADR-5: Signal-First Angular Architecture

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Angular 22 provides signals, zoneless change detection, and new control flow.  
**Decision:** Use signal() for all component-local state, computed() for derived data, input()/output() for component APIs, and @if/@for/@switch control flow. Never use @Input/@Output decorators.  
**Consequences:** + Better performance (zoneless, fine-grained reactivity), cleaner code, alignment with Angular's future direction; - Learning curve for developers used to RxJS-heavy patterns.

## ADR-6: No WebSockets or Real-Time Updates

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Booking systems benefit from real-time updates when someone books a slot.  
**Decision:** Use simple REST API with manual refresh. The dashboard loads appointments via GET on page load, and users can refresh.  
**Consequences:** + Simpler architecture, faster build; - Users must refresh to see new bookings; Acceptable for MVP.

## ADR-7: Inline Templates with Tailwind (No CSS Files)

**Status:** Accepted  
**Date:** 2026-06-15  
**Context:** Angular 22 + Tailwind CSS.  
**Decision:** Use inline templates with Tailwind utility classes exclusively. No separate HTML or CSS files.  
**Consequences:** + Single-file components, fast styling, no context switching; - Templates can get verbose with many utilities.
