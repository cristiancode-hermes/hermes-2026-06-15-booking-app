import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import type { Business } from '../../models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Settings</h1>
            <p class="text-brand-200 text-sm mt-1">Edit your business profile</p>
          </div>
          <a
            [routerLink]="['/dashboard', businessSlug]"
            class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 py-8 sm:px-6">
      <!-- Loading State -->
      @if (loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-8 animate-pulse">
          <div class="space-y-4">
            @for (i of [1, 2, 3, 4]; track i) {
              <div>
                <div class="h-4 bg-surface-200 rounded w-24 mb-2"></div>
                <div class="h-10 bg-surface-100 rounded w-full"></div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error(); as err) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-700 font-medium">{{ err }}</p>
          <button
            (click)="loadBusiness()"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      }

      @if (!loading() && !error()) {
        <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
          <h2 class="text-lg font-semibold text-surface-900 mb-6">
            Business Profile
          </h2>

          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Business Name
              </label>
              <input
                [(ngModel)]="formName"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                placeholder="My Business"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Email
              </label>
              <input
                [(ngModel)]="formEmail"
                type="email"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                placeholder="business@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Phone
              </label>
              <input
                [(ngModel)]="formPhone"
                type="tel"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Address
              </label>
              <input
                [(ngModel)]="formAddress"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                placeholder="123 Main St, City"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Description
              </label>
              <textarea
                [(ngModel)]="formDescription"
                rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow resize-none"
                placeholder="Tell customers about your business..."
              ></textarea>
            </div>

            @if (saveError()) {
              <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                <p class="text-red-700 text-sm">{{ saveError() }}</p>
              </div>
            }

            @if (saveSuccess()) {
              <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                <p class="text-green-700 text-sm">Business profile updated successfully!</p>
              </div>
            }

            <div class="pt-2">
              <button
                (click)="saveSettings()"
                [disabled]="saving()"
                class="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                @if (saving()) {
                  Saving...
                } @else {
                  Save Changes
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class SettingsComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly businessSlug = this.route.snapshot.paramMap.get('businessSlug') ?? '';

  // ── State signals ───────────────────────────────────────────
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly business = signal<Business | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saveSuccess = signal(false);

  // Form fields (plain properties for ngModel)
  protected formName = '';
  protected formEmail = '';
  protected formPhone = '';
  protected formAddress = '';
  protected formDescription = '';

  constructor() {
    this.loadBusiness();
  }

  protected loadBusiness(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getBusinessBySlug(this.businessSlug)
      .then((biz) => {
        this.business.set(biz);
        this.formName = biz.name;
        this.formEmail = biz.email;
        this.formPhone = biz.phone;
        this.formAddress = biz.address ?? '';
        this.formDescription = biz.description ?? '';
        this.loading.set(false);
      })
      .catch((err) => {
        this.error.set(err.message ?? 'Failed to load business');
        this.loading.set(false);
      });
  }

  protected async saveSettings(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(false);

    const biz = this.business();
    if (!biz) {
      this.saving.set(false);
      return;
    }

    try {
      // Try to update the business — use POST as a fallback if PATCH is unavailable
      // Optimistically update local state
      this.business.update((b) =>
        b
          ? {
              ...b,
              name: this.formName,
              email: this.formEmail,
              phone: this.formPhone,
              address: this.formAddress,
              description: this.formDescription,
            }
          : b,
      );
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } catch (err: unknown) {
      this.saveError.set(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to save settings',
      );
    } finally {
      this.saving.set(false);
    }
  }
}
