import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import type { Business, Service, Appointment } from '../../models';

type BookingStep = 'service' | 'datetime' | 'info' | 'confirm';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <!-- Business Header -->
    <div class="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div class="max-w-3xl mx-auto px-4 py-10 sm:px-6">
        <a
          routerLink="/"
          class="inline-flex items-center text-brand-200 hover:text-white mb-4 transition-colors"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to businesses
        </a>
        <h1 class="text-3xl font-bold">{{ business()?.name ?? 'Loading...' }}</h1>
        @if (business()?.description) {
          <p class="mt-2 text-brand-100">{{ business()?.description }}</p>
        }
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-8 sm:px-6">
      <!-- Steps indicator -->
      <div class="flex items-center justify-center gap-2 mb-10">
        @for (step of ['service', 'datetime', 'info']; track step; let i = $index) {
          <div class="flex items-center">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
              [class.bg-brand-600]="stepName() === step || stepsDone()[i]"
              [class.text-white]="stepName() === step || stepsDone()[i]"
              [class.bg-surface-200]="stepName() !== step && !stepsDone()[i]"
              [class.text-surface-600]="stepName() !== step && !stepsDone()[i]"
            >
              @if (stepsDone()[i]) {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              } @else {
                {{ i + 1 }}
              }
            </div>
            <span class="ml-2 text-sm text-surface-600 hidden sm:inline">
              {{ stepLabels[i] }}
            </span>
            @if (i < 2) {
              <div
                class="w-12 h-0.5 mx-2 transition-colors"
                [class.bg-brand-400]="stepsDone()[i]"
                [class.bg-surface-200]="!stepsDone()[i]"
              ></div>
            }
          </div>
        }
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-surface-200 p-8 text-center animate-pulse">
          <div class="h-6 bg-surface-200 rounded w-48 mx-auto mb-4"></div>
          <div class="h-4 bg-surface-100 rounded w-64 mx-auto"></div>
        </div>
      }

      <!-- Error State -->
      @if (error(); as err) {
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-700 font-medium">{{ err }}</p>
          <button
            (click)="loadData()"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      }

      <!-- Step 1: Select Service -->
      @if (stepName() === 'service' && !loading() && !error()) {
        <div>
          <h2 class="text-xl font-semibold text-surface-900 mb-6">
            Select a Service
          </h2>
          @if (services().length === 0) {
            <div class="bg-surface-50 rounded-xl p-8 text-center">
              <p class="text-surface-500">No services available for this business.</p>
            </div>
          }
          <div class="grid gap-4">
            @for (service of services(); track service.id) {
              <button
                (click)="selectService(service)"
                class="w-full text-left bg-white rounded-xl border-2 p-5 transition-all hover:border-brand-300"
                [class.border-brand-500]="selectedService()?.id === service.id"
                [class.border-surface-200]="selectedService()?.id !== service.id"
              >
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-semibold text-surface-900">{{ service.name }}</h3>
                    @if (service.description) {
                      <p class="text-sm text-surface-500 mt-1">{{ service.description }}</p>
                    }
                  </div>
                  <div class="text-right flex-shrink-0 ml-4">
                    <p class="font-bold text-brand-600">
                      \${{ service.price.toFixed(2) }}
                    </p>
                    <p class="text-sm text-surface-500">{{ service.duration }} min</p>
                  </div>
                </div>
              </button>
            }
          </div>
        </div>
      }

      <!-- Step 2: Date & Time -->
      @if (stepName() === 'datetime' && !loading() && !error()) {
        <div>
          <h2 class="text-xl font-semibold text-surface-900 mb-6">
            Select Date & Time
          </h2>

          <div class="mb-6">
            <label class="block text-sm font-medium text-surface-700 mb-2">
              Date
            </label>
            <input
              type="date"
              [ngModel]="selectedDate"
              (ngModelChange)="onDateChange($event)"
              class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
              [min]="minDate"
            />
          </div>

          @if (selectedDate) {
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-2">
                Available Times
              </label>
              @if (availableTimes().length === 0) {
                <p class="text-surface-500 text-sm">No available times for this date.</p>
              }
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
                @for (slot of availableTimes(); track slot) {
                  <button
                    (click)="selectTime(slot)"
                    class="py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all"
                    [class.border-brand-500]="selectedTime() === slot"
                    [class.bg-brand-50]="selectedTime() === slot"
                    [class.text-brand-700]="selectedTime() === slot"
                    [class.border-surface-200]="selectedTime() !== slot"
                    [class.text-surface-700]="selectedTime() !== slot"
                    [class.hover:border-brand-300]="selectedTime() !== slot"
                    [class.opacity-50]="bookedTimes().includes(slot)"
                    [class.cursor-not-allowed]="bookedTimes().includes(slot)"
                    [disabled]="bookedTimes().includes(slot)"
                  >
                    {{ slot }}
                    @if (bookedTimes().includes(slot)) {
                      <span class="block text-xs text-red-500">Booked</span>
                    }
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Step 3: Customer Info -->
      @if (stepName() === 'info' && !loading() && !error()) {
        <div>
          <h2 class="text-xl font-semibold text-surface-900 mb-6">
            Your Information
          </h2>
          <div class="bg-white rounded-xl border border-surface-200 p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Name <span class="text-red-500">*</span>
              </label>
              <input
                [(ngModel)]="customerName"
                type="text"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                placeholder="John Doe"
              />
              @if (submitted() && !customerName.trim()) {
                <p class="text-red-500 text-xs mt-1">Name is required</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                [(ngModel)]="customerEmail"
                type="email"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                placeholder="john@example.com"
              />
              @if (submitted() && !customerEmail.trim()) {
                <p class="text-red-500 text-xs mt-1">Email is required</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Phone <span class="text-red-500">*</span>
              </label>
              <input
                [(ngModel)]="customerPhone"
                type="tel"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
                placeholder="(555) 123-4567"
              />
              @if (submitted() && !customerPhone.trim()) {
                <p class="text-red-500 text-xs mt-1">Phone is required</p>
              }
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                [(ngModel)]="customerNotes"
                rows="3"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow resize-none"
                placeholder="Any special requests..."
              ></textarea>
            </div>
          </div>

          @if (submitError()) {
            <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-700 text-sm">{{ submitError() }}</p>
            </div>
          }
        </div>
      }

      <!-- Confirmation Step (after successful submission) -->
      @if (stepName() === 'confirm') {
        <div class="bg-white rounded-xl border border-surface-200 p-8 text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-surface-900 mb-2">Booking Confirmed!</h2>
          <p class="text-surface-600 mb-6">Your appointment has been booked successfully.</p>
          <div class="bg-surface-50 rounded-lg p-4 mb-6 text-left space-y-2">
            <p class="text-sm"><span class="font-medium text-surface-700">Service:</span> {{ selectedService()?.name }}</p>
            <p class="text-sm"><span class="font-medium text-surface-700">Date:</span> {{ selectedDate }}</p>
            <p class="text-sm"><span class="font-medium text-surface-700">Time:</span> {{ selectedTime() }}</p>
            <p class="text-sm"><span class="font-medium text-surface-700">Name:</span> {{ customerName }}</p>
          </div>
          <div class="flex gap-3 justify-center">
            <a
              routerLink="/"
              class="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
            >
              Back to Home
            </a>
            <button
              (click)="resetBooking()"
              class="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
            >
              Book Another
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Bottom navigation buttons -->
    @if (stepName() !== 'confirm' && !loading() && !error()) {
      <div class="max-w-3xl mx-auto px-4 pb-10 sm:px-6">
        <div class="flex justify-between">
          @if (stepName() !== 'service') {
            <button
              (click)="prevStep()"
              class="px-6 py-2.5 border border-surface-300 text-surface-700 rounded-lg hover:bg-surface-50 transition-colors"
            >
              Back
            </button>
          } @else {
            <div></div>
          }
          @if (stepName() === 'service') {
            <button
              (click)="nextStep()"
              [disabled]="!selectedService()"
              class="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          }
          @if (stepName() === 'datetime') {
            <button
              (click)="nextStep()"
              [disabled]="!selectedTime()"
              class="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          }
          @if (stepName() === 'info') {
            <button
              (click)="submitBooking()"
              [disabled]="submitting()"
              class="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (submitting()) {
                Booking...
              } @else {
                Confirm Booking
              }
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class BookingPageComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  // ── State signals ───────────────────────────────────────────
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly business = signal<Business | null>(null);
  protected readonly services = signal<Service[]>([]);
  protected readonly appointments = signal<Appointment[]>([]);

  protected readonly step = signal<BookingStep>('service');
  protected readonly selectedServiceId = signal<string | null>(null);
  protected readonly selectedTime = signal<string | null>(null);
  // selectedDate is a plain property (not signal) — used with ngModel binding
  // Cannot be protected because the onDateChange method needs to assign it
  selectedDate: string = '';
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly submitted = signal(false);

  // Step tracking
  protected readonly stepsDone = signal([false, false, false]);
  protected readonly stepLabels = ['Service', 'Date & Time', 'Info'];

  // Form properties (plain, not signals — for ngModel)
  protected customerName = '';
  protected customerEmail = '';
  protected customerPhone = '';
  protected customerNotes = '';

  protected businessSlug = '';

  constructor() {
    this.businessSlug = this.route.snapshot.paramMap.get('businessSlug') ?? '';
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.loadData();
  }

  // ── Derived ─────────────────────────────────────────────────
  protected readonly selectedService = computed(() => {
    const id = this.selectedServiceId();
    return this.services().find((s) => s.id === id) ?? null;
  });

  protected readonly stepName = computed(() => this.step());

  protected readonly minDate = new Date().toISOString().split('T')[0];

  protected readonly bookedTimes = computed(() => {
    const appts = this.appointments();
    return appts
      .filter((a) => a.status !== 'cancelled')
      .map((a) => {
        const d = new Date(a.startTime);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      });
  });

  protected readonly availableTimes = computed(() => {
    const svc = this.selectedService();
    if (!svc) return [];
    const allSlots = this.generateTimeSlots();
    const booked = this.bookedTimes();
    return allSlots.filter((t) => !booked.includes(t));
  });

  // ── Methods ─────────────────────────────────────────────────
  protected loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getBusinessBySlug(this.businessSlug)
      .then(async (biz) => {
        this.business.set(biz);
        const svcs = await this.api.getServices(biz.id);
        this.services.set(svcs.filter((s) => s.isActive));
        this.loading.set(false);
      })
      .catch((err) => {
        this.error.set(err.message ?? 'Failed to load business');
        this.loading.set(false);
      });
  }

  protected selectService(service: Service): void {
    this.selectedServiceId.set(service.id);
  }

  protected onDateChange(date: string): void {
    this.selectedDate = date;
    this.selectedTime.set(null);
    // Reload appointments for this date
    const biz = this.business();
    if (biz && date) {
      this.api.getAppointments(biz.id, date).then((a) => this.appointments.set(a));
    }
  }

  protected selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  protected nextStep(): void {
    const steps: BookingStep[] = ['service', 'datetime', 'info'];
    const idx = steps.indexOf(this.stepName());
    if (idx < steps.length - 1) {
      const done = [...this.stepsDone()];
      done[idx] = true;
      this.stepsDone.set(done);
      this.step.set(steps[idx + 1]);
    }
  }

  protected prevStep(): void {
    const steps: BookingStep[] = ['service', 'datetime', 'info'];
    const idx = steps.indexOf(this.stepName());
    if (idx > 0) {
      this.step.set(steps[idx - 1]);
    }
  }

  protected async submitBooking(): Promise<void> {
    this.submitted.set(true);
    if (!this.customerName.trim() || !this.customerEmail.trim() || !this.customerPhone.trim()) {
      return;
    }

    const svc = this.selectedService();
    const biz = this.business();
    if (!svc || !biz || !this.selectedTime() || !this.selectedDate) return;

    const [hours, minutes] = this.selectedTime()!.split(':').map(Number);
    const startTime = new Date(this.selectedDate);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = new Date(startTime.getTime() + svc.duration * 60_000);

    this.submitting.set(true);
    this.submitError.set(null);

    try {
      await this.api.createAppointment({
        businessId: biz.id,
        serviceId: svc.id,
        customerName: this.customerName.trim(),
        customerEmail: this.customerEmail.trim(),
        customerPhone: this.customerPhone.trim(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: this.customerNotes.trim() || undefined,
      });
      this.step.set('confirm');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 409) {
        this.submitError.set('This time slot has just been booked. Please choose another time.');
      } else {
        this.submitError.set(
          (err && typeof err === 'object' && 'message' in err)
            ? String((err as { message: unknown }).message)
            : 'Booking failed. Please try again.',
        );
      }
    } finally {
      this.submitting.set(false);
    }
  }

  protected resetBooking(): void {
    this.step.set('service');
    this.selectedServiceId.set(null);
    this.selectedTime.set(null);
    this.submitError.set(null);
    this.submitted.set(false);
    this.stepsDone.set([false, false, false]);
    this.customerName = '';
    this.customerEmail = '';
    this.customerPhone = '';
    this.customerNotes = '';
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 8; h < 18; h++) {
      for (const m of [0, 30]) {
        slots.push(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        );
      }
    }
    return slots;
  }
}
