# Learnings: Appointment Scheduler (2026-06-15)

## What This Project Taught Me

### 1. Conflict Detection with TypeORM `LessThan`/`MoreThan`
The appointment conflict detection pattern is clean and portable:
```typescript
const conflicts = await this.appointmentRepository.find({
  where: {
    businessId: dto.businessId,
    status: 'confirmed',
    startTime: LessThan(endTime),  // existing starts before new ends
    endTime: MoreThan(startTime),  // existing ends after new starts
  },
});
```
This works identically on SQLite and PostgreSQL — no raw SQL needed.

### 2. Computing endTime from Service Duration
Instead of asking users to enter both start and end times, the backend calculates `endTime = startTime + service.duration * 60000`. This eliminates a common source of user error and ensures data consistency.

### 3. Multi-Step Booking Flow Complexity
A step-by-step booking flow (select service → pick time → enter details → confirm) is significantly more complex than a simple form. State management between steps requires careful signal/state design. The booking page's `step` signal with `@switch` control flow keeps it manageable.

### 4. Date Handling Across Client/Server
Working with ISO 8601 dates across Angular (local browser time) and NestJS (UTC) requires attention. The seed service creates dates relative to "today" so they always appear in the future, regardless of when the app starts.

### 5. ngModel + Signals Still Tricky
Despite the playbook's guidance to use plain properties with ngModel, there are edge cases where signal auto-unwrapping causes unexpected behavior. The rule stands: **plain strings for ngModel, signals for everything else**.

### 6. Lazy Loading Works Well with Standalone Components
Angular 22's `loadComponent()` in routes produces clean chunk separation (7 lazy chunks in this build). Each page is its own chunk that only loads when navigated to.

### 7. Better Lesson Application
Applied from previous run's learnings:
- Confirmed that repeated builds get faster (established patterns pay off) — this was the fastest build yet
- Applied the loading/empty/error signal pattern consistently across all 5 pages
- Used object-syntax for TypeORM 1.0 relations (from Habit Tracker playbook entry)

### 8. Credential Situation (5th Consecutive Run)
GITHUB_TOKEN and NEON_API_KEY remain empty. This is now a permanently accepted constraint — the build quality does not depend on them. The project is fully functioning locally with comprehensive documentation for deployment.

## Skills Exercises

| Skill | How This Project Exercised It |
|-------|-------------------------------|
| SQL Performance | Conflict detection queries with LessThan/MoreThan operators; date-range filtering |
| RxJS Interop | lastValueFrom() bridge for HTTP calls |
| Angular Signals | All 5 pages use signal()/computed()/input() consistently |
| NestJS Architecture | 3 feature modules, service layer, global ValidationPipe, Swagger |
| Testing | 21 unit tests covering conflict detection, CRUD, edge cases (rate: B+) |

## What To Improve Next Time

1. **More comprehensive frontend tests** — No Angular component tests were written this time
2. **Business hours / availability model** — Currently no time-slot generation; users can book any time on any day
3. **Better error UX** — The 409 conflict error shows as a JSON message, not a polished UI
4. **Auth** — Should revisit auth once per 3 projects to keep it fresh
