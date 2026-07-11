import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import type {
  Business,
  Service,
  Appointment,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CreateServiceDto,
  UpdateServiceDto,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // ── Businesses ──────────────────────────────────────────────

  getBusinesses(): Promise<Business[]> {
    return lastValueFrom(this.http.get<Business[]>(`${this.baseUrl}/businesses`));
  }

  getBusinessBySlug(slug: string): Promise<Business> {
    return lastValueFrom(this.http.get<Business>(`${this.baseUrl}/businesses/slug/${slug}`));
  }

  // ── Services ────────────────────────────────────────────────

  getServices(businessId: string): Promise<Service[]> {
    return lastValueFrom(
      this.http.get<Service[]>(`${this.baseUrl}/services?businessId=${businessId}`),
    );
  }

  createService(dto: CreateServiceDto): Promise<Service> {
    return lastValueFrom(this.http.post<Service>(`${this.baseUrl}/services`, dto));
  }

  updateService(id: string, dto: UpdateServiceDto): Promise<Service> {
    return lastValueFrom(this.http.patch<Service>(`${this.baseUrl}/services/${id}`, dto));
  }

  deleteService(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/services/${id}`));
  }

  // ── Appointments ────────────────────────────────────────────

  getAppointments(businessId: string, date?: string): Promise<Appointment[]> {
    const params = new URLSearchParams({ businessId });
    if (date) params.set('date', date);
    return lastValueFrom(
      this.http.get<Appointment[]>(`${this.baseUrl}/appointments?${params}`),
    );
  }

  getAppointmentsRange(businessId: string, start: string, end: string): Promise<Appointment[]> {
    return lastValueFrom(
      this.http.get<Appointment[]>(
        `${this.baseUrl}/appointments/range?businessId=${businessId}&start=${start}&end=${end}`,
      ),
    );
  }

  createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
    return lastValueFrom(this.http.post<Appointment>(`${this.baseUrl}/appointments`, dto));
  }

  updateAppointment(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    return lastValueFrom(this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}`, dto));
  }

  deleteAppointment(id: string): Promise<void> {
    return lastValueFrom(this.http.delete<void>(`${this.baseUrl}/appointments/${id}`));
  }
}
