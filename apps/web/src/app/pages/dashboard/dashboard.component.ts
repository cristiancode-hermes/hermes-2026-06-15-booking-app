import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import type { Appointment, Business } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <!-- Header -->
    <div class="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">{{ business()?.name ?? 'Dashboard' }}</h1>
            <p class="text-brand-200 text-sm mt-1">Appointment Management</p>
          </div>
          <div class="flex gap-3">
            <a
              [routerLink]="['/dashboard', businessSlug, 'services']"
              class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              Services
            </a>
            <a
              [routerLink]="['/dashboard', businessSlug, 'settings']"
              class="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm"
            >
              Settings
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      @if (loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-8 animate-pulse">
          <div class="h-6 bg-surface-200 rounded w-48 mb-4"></div>
          <div class="space-y-3">
            @for (i of [1, 2, 3]; track i) {
              <div class="h-16 bg-surface-100 rounded"></div>
            }
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error(); as err) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-700 font-medium">{{ err }}</p>
          <button
            (click)="loadAppointments()"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      }

      <!-- Content -->
      @if (!loading() && !error()) {
        <!-- Date Picker -->
        <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-6 mb-6">
          <label class="block text-sm font-medium text-surface-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            [(ngModel)]="selectedDate"
            (ngModelChange)="onDateChange()"
            class="w-full max-w-xs px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
          />
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-4 text-center">
            <p class="text-2xl font-bold text-surface-900">{{ totalAppointments() }}</p>
            <p class="text-sm text-surface-500">Total</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-4 text-center">
            <p class="text-2xl font-bold text-green-600">{{ confirmedCount() }}</p>
            <p class="text-sm text-surface-500">Confirmed</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-4 text-center">
            <p class="text-2xl font-bold text-blue-600">{{ completedCount() }}</p>
            <p class="text-sm text-surface-500">Completed</p>
          </div>
        </div>

        <!-- Appointments List -->
        <div class="bg-white rounded-xl shadow-sm border border-surface-200">
          <div class="px-6 py-4 border-b border-surface-200">
            <h2 class="text-lg font-semibold text-surface-900">
              Appointments for {{ selectedDate }}
            </h2>
          </div>

          @if (appointments().length === 0) {
            <div class="p-12 text-center">
              <svg class="w-12 h-12 text-surface-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-surface-500 font-medium">No appointments for this date</p>
              <p class="text-surface-400 text-sm mt-1">Select a different date to view appointments.</p>
            </div>
          } @else {
            <div class="divide-y divide-surface-100">
              @for (appt of appointments(); track appt.id) {
                <div class="px-6 py-4 flex items-center gap-4 hover:bg-surface-50 transition-colors">
                  <!-- Time -->
                  <div class="text-center flex-shrink-0 w-16">
                    <p class="text-sm font-semibold text-surface-900">
                      {{ appt.startTime | date:'shortTime' }}
                    </p>
                  </div>

                  <!-- Customer + Service Info -->
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-surface-900 truncate">
                      {{ appt.customerName }}
                    </p>
                    <p class="text-sm text-surface-500 truncate">
                      {{ appt.service?.name ?? 'Unknown Service' }}
                      @if (appt.service) {
                        · {{ appt.service.duration }}min
                      }
                    </p>
                  </div>

                  <!-- Status Badge -->
                  <div class="flex-shrink-0">
                    @switch (appt.status) {
                      @case ('confirmed') {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      }
                      @case ('completed') {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Completed
                        </span>
                      }
                      @case ('cancelled') {
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      }
                    }
                  </div>

                  <!-- Actions -->
                  <div class="flex-shrink-0 flex gap-2">
                    @if (appt.status === 'confirmed') {
                      <button
                        (click)="markCompleted(appt)"
                        class="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        (click)="cancelAppointment(appt)"
                        class="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    }
                    @if (appt.status !== 'cancelled' && appt.status !== 'confirmed') {
                      <button
                        (click)="cancelAppointment(appt)"
                        class="px-3 py-1.5 text-xs font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Cancel
                      </button>
                    }
                    @if (appt.status === 'cancelled') {
                      <span class="text-xs text-surface-400 italic">No actions</span>
                    }
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
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly businessSlug = this.route.snapshot.paramMap.get('businessSlug') ?? '';
  protected selectedDate = new Date().toISOString().split('T')[0];

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly business = signal<Business | null>(null);
  protected readonly appointments = signal<Appointment[]>([]);

  protected readonly totalAppointments = computed(() => this.appointments().length);
  protected readonly confirmedCount = computed(
    () => this.appointments().filter((a) => a.status === 'confirmed').length,
  );
  protected readonly completedCount = computed(
    () => this.appointments().filter((a) => a.status === 'completed').length,
  );

  constructor() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const biz = await this.api.getBusinessBySlug(this.businessSlug);
      this.business.set(biz);
      const appts = await this.api.getAppointments(biz.id, this.selectedDate);
      this.appointments.set(appts);
    } catch (err: unknown) {
      this.error.set(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to load data',
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected loadAppointments(): void {
    this.loadData();
  }

  protected onDateChange(): void {
    this.loadAppointments();
  }

  protected async markCompleted(appt: Appointment): Promise<void> {
    try {
      const updated = await this.api.updateAppointment(appt.id, { status: 'completed' });
      this.appointments.update((list) =>
        list.map((a) => (a.id === updated.id ? { ...a, status: updated.status } : a)),
      );
    } catch {
      this.error.set('Failed to update appointment status');
    }
  }

  protected async cancelAppointment(appt: Appointment): Promise<void> {
    try {
      const updated = await this.api.updateAppointment(appt.id, { status: 'cancelled' });
      this.appointments.update((list) =>
        list.map((a) => (a.id === updated.id ? { ...a, status: updated.status } : a)),
      );
    } catch {
      this.error.set('Failed to cancel appointment');
    }
  }
}
