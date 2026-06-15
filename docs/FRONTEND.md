# Frontend Architecture

## Signal Architecture

Angular 22 signal-first approach. All component state uses signals from `@angular/core`. Zoneless change detection via `provideZonelessChangeDetection()`.

### State Management Pattern

```
Component State
├── signal<T>()          → Mutable local state (lists, form data, toggles)
├── computed<T>()        → Derived state (isEmpty, filtered lists)
├── input.required<T>()  → Component inputs (no @Input)
└── output<T>()          → Component outputs (no @Output)
```

### Standard State Pattern

Every page component follows this pattern:

```typescript
// State
const items = signal<T[]>([]);
const loading = signal(false);
const error = signal<string | null>(null);

// Derived
const isEmpty = computed(() => !loading() && items().length === 0);

// Template
@if (loading()) {
  <div class="...">Loading...</div>
} @else if (error()) {
  <div class="...">{{ error() }}</div>
} @else if (isEmpty()) {
  <div class="...">No items yet</div>
} @else {
  @for (item of items(); track item.id) {
    <div>...</div>
  }
}
```

### API Service Pattern

HTTP calls use `lastValueFrom()` to convert observables to promises:

```typescript
async getBusinesses(): Promise<Business[]> {
  return lastValueFrom(
    this.http.get<Business[]>('/api/businesses')
  );
}
```

This keeps components promise-based while HttpClient remains RxJS under the hood.

### ngModel Binding Rule

For `[(ngModel)]` bindings, use plain TypeScript properties, not signals:

```typescript
// Component class
customerName = '';
customerEmail = '';

// Template
<input [(ngModel)]="customerName" ... />
<input [(ngModel)]="customerEmail" ... />
```

Signals auto-unwrap inconsistently with ngModel, causing write-back issues.

## Component Structure

```
app/
├── app.ts                     → Root component with nav + router-outlet
├── app.config.ts              → provideZonelessChangeDetection, provideHttpClient
├── app.routes.ts              → Lazy-loaded routes with loadComponent()
├── models.ts                  → TypeScript interfaces
└── services/
    └── api.service.ts         → HTTP API service
└── pages/
    ├── home/
    │   └── home.component.ts
    ├── booking/
    │   └── booking-page.component.ts
    ├── dashboard/
    │   └── dashboard.component.ts
    ├── services/
    │   └── services.component.ts
    └── settings/
        └── settings.component.ts
```

## Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | HomeComponent | Landing page with business listing |
| `/book/:slug` | BookingPageComponent | Multi-step booking wizard |
| `/dashboard/:slug` | DashboardComponent | Business owner appointment management |
| `/dashboard/:slug/services` | ServicesComponent | CRUD service management |
| `/dashboard/:slug/settings` | SettingsComponent | Edit business profile |

## Zoneless Notes

- `provideZonelessChangeDetection()` in app.config.ts eliminates zone.js dependency
- Change detection triggers on signal changes automatically
- No `ChangeDetectorRef.detectChanges()` needed
- Works with `@if`/`@for` control flow natively
- Async operations via `Promise.then()` or `setTimeout()` trigger change detection automatically

## Tailwind Design System

- **brand-* (blue)** — Primary actions, links, buttons
- **surface-* (slate)** — Backgrounds, borders, text
- **Status colors**: green (confirmed), red (cancelled), blue (completed)
- **Spacing**: Tailwind defaults (4, 6, 8, 12, 16, 24, 32, etc.)
- **Typography**: Inter font via system-ui fallback
