import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Navbar -->
      <nav class="bg-white border-b border-surface-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-14">
            <a
              routerLink="/"
              class="text-lg font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              BookingApp
            </a>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {}
