import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'book/:businessSlug',
    loadComponent: () =>
      import('./pages/booking/booking-page.component').then(
        (m) => m.BookingPageComponent,
      ),
  },
  {
    path: 'dashboard/:businessSlug',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'dashboard/:businessSlug/services',
    loadComponent: () =>
      import('./pages/services/services.component').then(
        (m) => m.ServicesComponent,
      ),
  },
  {
    path: 'dashboard/:businessSlug/settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
