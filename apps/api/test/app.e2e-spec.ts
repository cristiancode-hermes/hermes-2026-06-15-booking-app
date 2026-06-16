import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModule } from '../src/business/business.module';
import { ServiceModule } from '../src/service/service.module';
import { AppointmentModule } from '../src/appointment/appointment.module';
import { Business } from '../src/business/business.entity';
import { Service } from '../src/service/service.entity';
import { Appointment } from '../src/appointment/appointment.entity';

describe('Booking API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Business, Service, Appointment],
          synchronize: true,
        }),
        BusinessModule,
        ServiceModule,
        AppointmentModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================================================================
  // Businesses CRUD
  // =========================================================================
  describe('Businesses CRUD', () => {
    const createDto = {
      name: 'Test Business',
      slug: 'test-business',
      email: 'test@business.com',
      phone: '+1234567890',
      address: '123 Test St',
      description: 'A test business',
    };

    let createdId: number;

    it('POST /businesses - should create a business', async () => {
      const res = await request(app.getHttpServer())
        .post('/businesses')
        .send(createDto)
        .expect(201);

      const body = res.body;
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(createDto.name);
      expect(body.slug).toBe(createDto.slug);
      expect(body.email).toBe(createDto.email);
      expect(body.phone).toBe(createDto.phone);
      expect(body.address).toBe(createDto.address);
      expect(body.description).toBe(createDto.description);
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
      createdId = body.id;
    });

    it('POST /businesses - should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/businesses')
        .send({ name: 'No Slug' })
        .expect(400);
    });

    it('GET /businesses - should return all businesses', async () => {
      const res = await request(app.getHttpServer())
        .get('/businesses')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body.map((b: any) => b.id)).toContain(createdId);
    });

    it('GET /businesses/:id - should return a business by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/businesses/${createdId}`)
        .expect(200);

      expect(res.body.id).toBe(createdId);
      expect(res.body.name).toBe(createDto.name);
    });

    it('GET /businesses/:id - should return 404 for unknown id', async () => {
      await request(app.getHttpServer())
        .get('/businesses/99999')
        .expect(404);
    });

    it('GET /businesses/slug/:slug - should return a business by slug', async () => {
      const res = await request(app.getHttpServer())
        .get(`/businesses/slug/${createDto.slug}`)
        .expect(200);

      expect(res.body.id).toBe(createdId);
      expect(res.body.slug).toBe(createDto.slug);
    });

    it('GET /businesses/slug/:slug - should return 404 for unknown slug', async () => {
      await request(app.getHttpServer())
        .get('/businesses/slug/unknown-slug')
        .expect(404);
    });

    it('PATCH /businesses/:id - should update a business', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/businesses/${createdId}`)
        .send({ name: 'Updated Business', phone: '+0987654321' })
        .expect(200);

      expect(res.body.name).toBe('Updated Business');
      expect(res.body.phone).toBe('+0987654321');
      expect(res.body.slug).toBe(createDto.slug); // unchanged
    });

    it('DELETE /businesses/:id - should delete a business', async () => {
      // Create a business to delete
      const createRes = await request(app.getHttpServer())
        .post('/businesses')
        .send({
          name: 'To Delete',
          slug: 'to-delete',
          email: 'delete@test.com',
          phone: '000',
        })
        .expect(201);

      const toDeleteId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/businesses/${toDeleteId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/businesses/${toDeleteId}`)
        .expect(404);
    });
  });

  // =========================================================================
  // Services CRUD (with filter by business)
  // =========================================================================
  describe('Services CRUD', () => {
    let business1Id: number;
    let business2Id: number;
    let service1Id: number;
    let service2Id: number;

    beforeAll(async () => {
      // Create two businesses for service filtering tests
      const b1 = await request(app.getHttpServer())
        .post('/businesses')
        .send({
          name: 'Business One',
          slug: 'business-one',
          email: 'one@test.com',
          phone: '111',
        })
        .expect(201);
      business1Id = b1.body.id;

      const b2 = await request(app.getHttpServer())
        .post('/businesses')
        .send({
          name: 'Business Two',
          slug: 'business-two',
          email: 'two@test.com',
          phone: '222',
        })
        .expect(201);
      business2Id = b2.body.id;
    });

    it('POST /services - should create a service', async () => {
      const res = await request(app.getHttpServer())
        .post('/services')
        .send({
          businessId: business1Id,
          name: 'Haircut',
          description: 'A classic haircut',
          duration: 30,
          price: 25.0,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Haircut');
      expect(res.body.businessId).toBe(business1Id);
      expect(res.body.duration).toBe(30);
      expect(res.body.price).toBe(25.0);
      expect(res.body.isActive).toBe(true);
      expect(res.body.description).toBe('A classic haircut');
      service1Id = res.body.id;
    });

    it('POST /services - should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/services')
        .send({ name: 'Missing Fields' })
        .expect(400);
    });

    it('GET /services - should return all services', async () => {
      // Create a second service for business2
      const s2 = await request(app.getHttpServer())
        .post('/services')
        .send({
          businessId: business2Id,
          name: 'Manicure',
          duration: 45,
          price: 35.0,
        })
        .expect(201);
      service2Id = s2.body.id;

      const res = await request(app.getHttpServer())
        .get('/services')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /services?businessId= - should filter by business', async () => {
      const res = await request(app.getHttpServer())
        .get(`/services?businessId=${business1Id}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(service1Id);
      expect(res.body[0].businessId).toBe(business1Id);

      // Check that business relation is included
      expect(res.body[0].business).toBeDefined();
      expect(res.body[0].business.id).toBe(business1Id);
    });

    it('GET /services?businessId= - empty result for business with no services', async () => {
      // Create a third business with no services
      const b3 = await request(app.getHttpServer())
        .post('/businesses')
        .send({
          name: 'Business Three',
          slug: 'business-three',
          email: 'three@test.com',
          phone: '333',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/services?businessId=${b3.body.id}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    it('GET /services/business/:businessId - should get services by business', async () => {
      const res = await request(app.getHttpServer())
        .get(`/services/business/${business2Id}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].id).toBe(service2Id);
    });

    it('GET /services/:id - should return a service by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/services/${service1Id}`)
        .expect(200);

      expect(res.body.id).toBe(service1Id);
      expect(res.body.name).toBe('Haircut');
    });

    it('GET /services/:id - should return 404 for unknown id', async () => {
      await request(app.getHttpServer())
        .get('/services/99999')
        .expect(404);
    });

    it('PATCH /services/:id - should update a service', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/services/${service1Id}`)
        .send({ price: 30.0, duration: 45 })
        .expect(200);

      expect(res.body.price).toBe(30.0);
      expect(res.body.duration).toBe(45);
      expect(res.body.name).toBe('Haircut'); // unchanged
    });

    it('DELETE /services/:id - should delete a service', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/services')
        .send({
          businessId: business1Id,
          name: 'Temporary Service',
          duration: 15,
          price: 10.0,
        })
        .expect(201);

      const tempId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/services/${tempId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/services/${tempId}`)
        .expect(404);
    });
  });

  // =========================================================================
  // Appointments CRUD (with conflict detection)
  // =========================================================================
  describe('Appointments CRUD', () => {
    let businessId: number;
    let serviceId: number;
    let serviceDuration: number;
    let appointmentId: number;

    beforeAll(async () => {
      // Create a dedicated business and service for appointment tests
      const bRes = await request(app.getHttpServer())
        .post('/businesses')
        .send({
          name: 'Appointment Business',
          slug: 'appointment-business',
          email: 'appt@test.com',
          phone: '444',
        })
        .expect(201);
      businessId = bRes.body.id;

      const sRes = await request(app.getHttpServer())
        .post('/services')
        .send({
          businessId,
          name: 'Consultation',
          duration: 60,
          price: 50.0,
        })
        .expect(201);
      serviceId = sRes.body.id;
      serviceDuration = sRes.body.duration;
    });

    it('POST /appointments - should create an appointment', async () => {
      const startTime = new Date('2030-01-01T10:00:00Z').toISOString();
      const res = await request(app.getHttpServer())
        .post('/appointments')
        .send({
          businessId,
          serviceId,
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          customerPhone: '+1111111111',
          startTime,
        })
        .expect(201);

      const body = res.body;
      expect(body).toHaveProperty('id');
      expect(body.businessId).toBe(businessId);
      expect(body.serviceId).toBe(serviceId);
      expect(body.customerName).toBe('John Doe');
      expect(body.customerEmail).toBe('john@example.com');
      expect(body.customerPhone).toBe('+1111111111');
      expect(body.status).toBe('confirmed');
      expect(body.startTime).toBe(startTime);

      // endTime should be startTime + duration (60 min)
      const expectedEnd = new Date('2030-01-01T11:00:00Z').toISOString();
      expect(body.endTime).toBe(expectedEnd);

      appointmentId = body.id;
    });

    it('POST /appointments - should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .send({ customerName: 'No IDs' })
        .expect(400);
    });

    // =====================================================================
    // Conflict Detection
    // =====================================================================
    describe('Conflict detection', () => {
      it('should reject an overlapping appointment (exact same time)', async () => {
        const startTime = new Date('2030-01-01T10:00:00Z').toISOString();

        const res = await request(app.getHttpServer())
          .post('/appointments')
          .send({
            businessId,
            serviceId,
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            customerPhone: '+1222222222',
            startTime,
          })
          .expect(409);

        expect(res.body.message).toContain('conflict');
      });

      it('should reject an overlapping appointment (starts before, ends during)', async () => {
        // 9:30 - 10:30 overlaps with 10:00 - 11:00
        const startTime = new Date('2030-01-01T09:30:00Z').toISOString();

        await request(app.getHttpServer())
          .post('/appointments')
          .send({
            businessId,
            serviceId,
            customerName: 'Bob Wilson',
            customerEmail: 'bob@example.com',
            customerPhone: '+1333333333',
            startTime,
          })
          .expect(409);
      });

      it('should reject an overlapping appointment (starts during, ends after)', async () => {
        // 10:30 - 11:30 overlaps with 10:00 - 11:00
        const startTime = new Date('2030-01-01T10:30:00Z').toISOString();

        await request(app.getHttpServer())
          .post('/appointments')
          .send({
            businessId,
            serviceId,
            customerName: 'Alice Brown',
            customerEmail: 'alice@example.com',
            customerPhone: '+1444444444',
            startTime,
          })
          .expect(409);
      });

      it('should reject an overlapping appointment (fully contained)', async () => {
        // 10:15 - 10:45 is fully inside 10:00 - 11:00
        const startTime = new Date('2030-01-01T10:15:00Z').toISOString();

        await request(app.getHttpServer())
          .post('/appointments')
          .send({
            businessId,
            serviceId,
            customerName: 'Charlie Davis',
            customerEmail: 'charlie@example.com',
            customerPhone: '+1555555555',
            startTime,
          })
          .expect(409);
      });

      it('should allow an adjacent appointment (back-to-back, no overlap)', async () => {
        // 11:00 - 12:00 is adjacent to 10:00 - 11:00, no overlap
        const startTime = new Date('2030-01-01T11:00:00Z').toISOString();

        const res = await request(app.getHttpServer())
          .post('/appointments')
          .send({
            businessId,
            serviceId,
            customerName: 'Diana Evans',
            customerEmail: 'diana@example.com',
            customerPhone: '+1666666666',
            startTime,
          })
          .expect(201);

        expect(res.body.status).toBe('confirmed');
        expect(res.body.startTime).toBe(startTime);
      });

      it('should allow a non-overlapping appointment on a different day', async () => {
        const startTime = new Date('2030-01-02T10:00:00Z').toISOString();

        const res = await request(app.getHttpServer())
          .post('/appointments')
          .send({
            businessId,
            serviceId,
            customerName: 'Frank Green',
            customerEmail: 'frank@example.com',
            customerPhone: '+1777777777',
            startTime,
          })
          .expect(201);

        expect(res.body.status).toBe('confirmed');
      });

      it('should allow an appointment for a different business at the same time', async () => {
        // Create another business with a service
        const bRes = await request(app.getHttpServer())
          .post('/businesses')
          .send({
            name: 'Other Business',
            slug: 'other-business',
            email: 'other@test.com',
            phone: '555',
          })
          .expect(201);

        const sRes = await request(app.getHttpServer())
          .post('/services')
          .send({
            businessId: bRes.body.id,
            name: 'Other Service',
            duration: 60,
            price: 20.0,
          })
          .expect(201);

        // Same time as the original appointment but different business
        const startTime = new Date('2030-01-01T10:00:00Z').toISOString();

        const res = await request(app.getHttpServer())
          .post('/appointments')
          .send({
            businessId: bRes.body.id,
            serviceId: sRes.body.id,
            customerName: 'Grace Harris',
            customerEmail: 'grace@example.com',
            customerPhone: '+1888888888',
            startTime,
          })
          .expect(201);

        expect(res.body.status).toBe('confirmed');
      });
    });

    it('GET /appointments - should return all appointments', async () => {
      const res = await request(app.getHttpServer())
        .get('/appointments')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /appointments?businessId= - should filter by business', async () => {
      const res = await request(app.getHttpServer())
        .get(`/appointments?businessId=${businessId}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      res.body.forEach((a: any) => {
        expect(a.businessId).toBe(businessId);
      });
    });

    it('GET /appointments?date= - should filter by date', async () => {
      const res = await request(app.getHttpServer())
        .get('/appointments?date=2030-01-01')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      res.body.forEach((a: any) => {
        const start = new Date(a.startTime);
        expect(start.toISOString().startsWith('2030-01-01')).toBe(true);
      });
    });

    it('GET /appointments/range - should return appointments in date range', async () => {
      const res = await request(app.getHttpServer())
        .get(`/appointments/range?businessId=${businessId}&start=2030-01-01T00:00:00Z&end=2030-01-02T23:59:59Z`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      res.body.forEach((a: any) => {
        expect(a.businessId).toBe(businessId);
      });
    });

    it('GET /appointments/:id - should return an appointment by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/appointments/${appointmentId}`)
        .expect(200);

      expect(res.body.id).toBe(appointmentId);
      expect(res.body.customerName).toBe('John Doe');
    });

    it('GET /appointments/:id - should return 404 for unknown id', async () => {
      await request(app.getHttpServer())
        .get('/appointments/99999')
        .expect(404);
    });

    it('PATCH /appointments/:id - should update an appointment', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/appointments/${appointmentId}`)
        .send({ customerName: 'John Updated', notes: 'Updated notes' })
        .expect(200);

      expect(res.body.customerName).toBe('John Updated');
      expect(res.body.notes).toBe('Updated notes');
    });

    it('DELETE /appointments/:id - should delete an appointment', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/appointments')
        .send({
          businessId,
          serviceId,
          customerName: 'Temp Appointment',
          customerEmail: 'temp@example.com',
          customerPhone: '+1999999999',
          startTime: new Date('2030-03-01T10:00:00Z').toISOString(),
        })
        .expect(201);

      const tempId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/appointments/${tempId}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/appointments/${tempId}`)
        .expect(404);
    });

    it('POST /appointments - should reject when service does not exist', async () => {
      await request(app.getHttpServer())
        .post('/appointments')
        .send({
          businessId,
          serviceId: 99999,
          customerName: 'No Service',
          customerEmail: 'noservice@example.com',
          customerPhone: '+1000000000',
          startTime: new Date('2030-04-01T10:00:00Z').toISOString(),
        })
        .expect(404);
    });
  });
});
