import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import type { Business } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div class="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
            Book Your Appointment
          </h1>
          <p class="mt-4 text-lg text-brand-100 max-w-2xl mx-auto">
            Find and book appointments with local businesses. Simple, fast, and
            reliable.
          </p>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    @if (loading()) {
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (skeleton of [1, 2, 3]; track skeleton) {
            <div
              class="bg-white rounded-xl shadow-sm border border-surface-200 p-6 animate-pulse"
            >
              <div class="h-5 bg-surface-200 rounded w-3/4 mb-3"></div>
              <div class="h-4 bg-surface-100 rounded w-full mb-2"></div>
              <div class="h-4 bg-surface-100 rounded w-1/2"></div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Error State -->
    @if (error(); as err) {
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div
          class="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
        >
          <p class="text-red-700 font-medium">Failed to load businesses</p>
          <p class="text-red-500 text-sm mt-1">{{ err }}</p>
          <button
            (click)="loadBusinesses()"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    }

    <!-- Business Listing -->
    @if (!loading() && !error()) {
      <div class="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-surface-900 mb-8">
          Available Businesses
        </h2>

        @if (businesses().length === 0) {
          <div
            class="bg-white rounded-xl shadow-sm border border-surface-200 p-12 text-center"
          >
            <p class="text-surface-500 text-lg">
              No businesses available yet.
            </p>
            <p class="text-surface-400 text-sm mt-1">
              Check back later for new listings.
            </p>
          </div>
        } @else {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (business of businesses(); track business.id) {
              <a
                [routerLink]="['/book', business.slug]"
                class="block bg-white rounded-xl shadow-sm border border-surface-200 p-6 hover:shadow-md hover:border-brand-300 transition-all group"
              >
                <h3
                  class="text-lg font-semibold text-surface-900 group-hover:text-brand-600 transition-colors"
                >
                  {{ business.name }}
                </h3>
                @if (business.description) {
                  <p class="mt-2 text-surface-600 text-sm line-clamp-2">
                    {{ business.description }}
                  </p>
                }
                <div class="mt-4 flex items-center gap-4 text-sm text-surface-500">
                  @if (business.phone) {
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {{ business.phone }}
                    </span>
                  }
                  <span class="text-brand-600 font-medium ml-auto">
                    Book now →
                  </span>
                </div>
              </a>
            }
          </div>
        }
      </div>
    }
  `,
})
export class HomeComponent {
  private readonly api = inject(ApiService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly businesses = signal<Business[]>([]);

  constructor() {
    this.loadBusinesses();
  }

  protected loadBusinesses(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getBusinesses()
      .then((data) => {
        this.businesses.set(data);
        this.loading.set(false);
      })
      .catch((err) => {
        this.error.set(err.message ?? 'Unknown error');
        this.loading.set(false);
      });
  }
}
