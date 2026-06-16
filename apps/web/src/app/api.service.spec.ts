import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lastValueFrom, of } from 'rxjs';

// Mock HttpClient using vi.hoisted so it's available in vi.mock factory
const mockHttp = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

// Mock @angular/common/http entirely to avoid JIT compilation errors in test env
vi.mock('@angular/common/http', () => ({
  HttpClient: class MockHttpClient {},
  HttpHandler: class MockHttpHandler {},
  HttpErrorResponse: class MockHttpErrorResponse {},
  HttpEvent: class MockHttpEvent {},
  HttpInterceptor: class MockHttpInterceptor {},
  HttpRequest: class MockHttpRequest {},
  HttpResponse: class MockHttpResponse {},
}));

// Mock @angular/core's inject to return our mockHttp instead of failing
vi.mock('@angular/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@angular/core')>();
  return {
    ...actual,
    inject: vi.fn(() => mockHttp),
  };
});

// We'll import the class after mocking
let ApiService: any;

describe('ApiService', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to get fresh module state
    const mod = await import('./services/api.service');
    ApiService = mod.ApiService;
  });

  it('should be defined', () => {
    expect(ApiService).toBeDefined();
  });

  it('should have expected methods', () => {
    const instance = new ApiService();
    expect(typeof instance.getBusinesses).toBe('function');
    expect(typeof instance.getBusinessBySlug).toBe('function');
    expect(typeof instance.getServices).toBe('function');
    expect(typeof instance.createService).toBe('function');
    expect(typeof instance.updateService).toBe('function');
    expect(typeof instance.deleteService).toBe('function');
    expect(typeof instance.getAppointments).toBe('function');
    expect(typeof instance.getAppointmentsRange).toBe('function');
    expect(typeof instance.createAppointment).toBe('function');
    expect(typeof instance.updateAppointment).toBe('function');
    expect(typeof instance.deleteAppointment).toBe('function');
  });
});
