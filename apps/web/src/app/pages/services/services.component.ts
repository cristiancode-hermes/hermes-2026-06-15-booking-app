import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import type { Business, Service } from '../../models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">{{ business()?.name ?? 'Services' }}</h1>
            <p class="text-brand-200 text-sm mt-1">Manage Services</p>
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

    <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      <!-- Loading State -->
      @if (loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-8 animate-pulse">
          <div class="h-6 bg-surface-200 rounded w-48 mb-6"></div>
          @for (i of [1, 2, 3]; track i) {
            <div class="h-16 bg-surface-100 rounded mb-3"></div>
          }
        </div>
      }

      <!-- Error State -->
      @if (error(); as err) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-700 font-medium">{{ err }}</p>
          <button
            (click)="loadServices()"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      }

      @if (!loading() && !error()) {
        <!-- Add Service Button -->
        <div class="mb-6">
          <button
            (click)="showAddForm.set(true)"
            class="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            + Add Service
          </button>
        </div>

        <!-- Add/Edit Form -->
        @if (showAddForm() || editingService()) {
          <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-6 mb-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">
              {{ editingService() ? 'Edit Service' : 'New Service' }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-surface-700 mb-1">Name</label>
                <input
                  [(ngModel)]="formName"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  placeholder="Haircut"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 mb-1">Description</label>
                <textarea
                  [(ngModel)]="formDescription"
                  rows="2"
                  class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none"
                  placeholder="Optional description"
                ></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-surface-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    [(ngModel)]="formDuration"
                    type="number"
                    min="15"
                    step="15"
                    class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-surface-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    [(ngModel)]="formPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
              <div class="flex gap-3 pt-2">
                <button
                  (click)="saveService()"
                  class="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
                >
                  {{ editingService() ? 'Update' : 'Create' }}
                </button>
                <button
                  (click)="cancelForm()"
                  class="px-4 py-2 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Services List -->
        <div class="bg-white rounded-xl shadow-sm border border-surface-200">
          <div class="px-6 py-4 border-b border-surface-200">
            <h2 class="text-lg font-semibold text-surface-900">All Services</h2>
          </div>

          @if (services().length === 0) {
            <div class="p-12 text-center">
              <p class="text-surface-500">No services yet. Add your first service above.</p>
            </div>
          } @else {
            <div class="divide-y divide-surface-100">
              @for (svc of services(); track svc.id) {
                <div
                  class="px-6 py-4 flex items-center gap-4 hover:bg-surface-50 transition-colors"
                  [class.opacity-60]="!svc.isActive"
                >
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-surface-900">{{ svc.name }}</p>
                      @if (!svc.isActive) {
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-100 text-surface-500">
                          Inactive
                        </span>
                      }
                    </div>
                    @if (svc.description) {
                      <p class="text-sm text-surface-500 truncate">{{ svc.description }}</p>
                    }
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="font-semibold text-surface-900">\${{ svc.price.toFixed(2) }}</p>
                    <p class="text-sm text-surface-500">{{ svc.duration }} min</p>
                  </div>
                  <div class="flex-shrink-0 flex gap-2">
                    <button
                      (click)="editService(svc)"
                      class="px-3 py-1.5 text-xs font-medium border border-surface-300 text-surface-600 rounded-lg hover:bg-surface-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      (click)="toggleActive(svc)"
                      class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                      [class.bg-green-100]="svc.isActive"
                      [class.text-green-700]="svc.isActive"
                      [class.bg-surface-100]="!svc.isActive"
                      [class.text-surface-600]="!svc.isActive"
                      [class.hover:bg-green-200]="svc.isActive"
                      [class.hover:bg-surface-200]="!svc.isActive"
                    >
                      {{ svc.isActive ? 'Active' : 'Inactive' }}
                    </button>
                    <button
                      (click)="deleteService(svc)"
                      class="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ServicesComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly businessSlug = this.route.snapshot.paramMap.get('businessSlug') ?? '';

  // ── State signals ───────────────────────────────────────────
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly business = signal<Business | null>(null);
  protected readonly services = signal<Service[]>([]);
  protected readonly showAddForm = signal(false);
  protected readonly editingServiceId = signal<string | null>(null);

  // Form fields (plain properties for ngModel)
  protected formName = '';
  protected formDescription = '';
  protected formDuration = 60;
  protected formPrice = 0;

  protected readonly editingService = computed(() => {
    const id = this.editingServiceId();
    return id ? this.services().find((s) => s.id === id) ?? null : null;
  });

  constructor() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const biz = await this.api.getBusinessBySlug(this.businessSlug);
      this.business.set(biz);
      const svcs = await this.api.getServices(biz.id);
      this.services.set(svcs);
    } catch (err: unknown) {
      this.error.set(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load services',
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected loadServices(): void {
    this.loadData();
  }

  protected editService(svc: Service): void {
    this.editingServiceId.set(svc.id);
    this.formName = svc.name;
    this.formDescription = svc.description ?? '';
    this.formDuration = svc.duration;
    this.formPrice = svc.price;
    this.showAddForm.set(true);
  }

  protected cancelForm(): void {
    this.showAddForm.set(false);
    this.editingServiceId.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.formName = '';
    this.formDescription = '';
    this.formDuration = 60;
    this.formPrice = 0;
  }

  protected async saveService(): Promise<void> {
    if (!this.formName.trim() || !this.formDuration || this.formPrice < 0) return;

    const biz = this.business();
    if (!biz) return;

    const editId = this.editingServiceId();
    try {
      if (editId) {
        const updated = await this.api.updateService(editId, {
          name: this.formName.trim(),
          description: this.formDescription.trim() || undefined,
          duration: this.formDuration,
          price: this.formPrice,
        });
        this.services.update((list) =>
          list.map((s) => (s.id === editId ? updated : s)),
        );
      } else {
        const created = await this.api.createService({
          businessId: biz.id,
          name: this.formName.trim(),
          description: this.formDescription.trim() || undefined,
          duration: this.formDuration,
          price: this.formPrice,
          isActive: true,
        });
        this.services.update((list) => [...list, created]);
      }
      this.cancelForm();
    } catch (err: unknown) {
      this.error.set(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to save service',
      );
    }
  }

  protected async toggleActive(svc: Service): Promise<void> {
    try {
      const updated = await this.api.updateService(svc.id, {
        isActive: !svc.isActive,
      });
      this.services.update((list) =>
        list.map((s) => (s.id === svc.id ? updated : s)),
      );
    } catch (err: unknown) {
      this.error.set(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to toggle service status',
      );
    }
  }

  protected async deleteService(svc: Service): Promise<void> {
    if (!confirm(`Delete "${svc.name}"?`)) return;
    try {
      await this.api.deleteService(svc.id);
      this.services.update((list) => list.filter((s) => s.id !== svc.id));
    } catch (err: unknown) {
      this.error.set(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to delete service',
      );
    }
  }
}
