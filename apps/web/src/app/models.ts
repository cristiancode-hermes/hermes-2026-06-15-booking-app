export interface Business {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  service?: Service;
}

export interface CreateAppointmentDto {
  businessId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
}

export interface CreateServiceDto {
  businessId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  isActive?: boolean;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  isActive?: boolean;
}
