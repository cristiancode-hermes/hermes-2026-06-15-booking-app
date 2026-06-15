# API Reference

Base URL: `http://localhost:3000/api`

Swagger UI: `http://localhost:3000/api/docs`

---

## Businesses

### List All Businesses

```http
GET /api/businesses
```

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Urban Barber Studio",
    "slug": "urban-barber",
    "email": "hello@urbanbarber.com",
    "phone": "555-0100",
    "address": "123 Main St, City",
    "description": "A premium barber shop in downtown.",
    "createdAt": "2026-06-15T01:00:00.000Z",
    "updatedAt": "2026-06-15T01:00:00.000Z"
  }
]
```

### Get Business by Slug

```http
GET /api/businesses/slug/urban-barber
```

**Response 200:** Single business object.

### Create Business

```http
POST /api/businesses
Content-Type: application/json

{
  "name": "New Business",
  "slug": "new-business",
  "email": "hello@newbusiness.com",
  "phone": "555-0200",
  "address": "456 Oak Ave",
  "description": "Optional description"
}
```

**Response 201:** Created business with id, createdAt, updatedAt.

---

## Services

### List Services

```http
GET /api/services?businessId=1
```

Optional `businessId` query param filters services by business.

**Response 200:**
```json
[
  {
    "id": 1,
    "businessId": 1,
    "name": "Classic Haircut",
    "description": "A standard haircut",
    "duration": 30,
    "price": 30,
    "isActive": true,
    "createdAt": "2026-06-15T01:00:00.000Z"
  }
]
```

### Create Service

```http
POST /api/services
Content-Type: application/json

{
  "businessId": 1,
  "name": "Beard Trim",
  "description": "Professional beard shaping",
  "duration": 20,
  "price": 20
}
```

**Response 201:** Created service.

---

## Appointments

### List Appointments

```http
GET /api/appointments?businessId=1&date=2026-06-16
```

Optional `businessId` and `date` filter.

**Response 200:**
```json
[
  {
    "id": 1,
    "businessId": 1,
    "serviceId": 1,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "555-0100",
    "startTime": "2026-06-16T10:00:00.000Z",
    "endTime": "2026-06-16T10:30:00.000Z",
    "status": "confirmed",
    "notes": null,
    "createdAt": "2026-06-15T01:00:00.000Z",
    "service": { "id": 1, "name": "Classic Haircut", ... },
    "business": { "id": 1, "name": "Urban Barber Studio", ... }
  }
]
```

### List Appointments by Date Range

```http
GET /api/appointments/range?businessId=1&start=2026-06-16T00:00:00Z&end=2026-06-18T23:59:59Z
```

### Create Appointment (with conflict detection)

```http
POST /api/appointments
Content-Type: application/json

{
  "businessId": 1,
  "serviceId": 1,
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "555-0200",
  "startTime": "2026-06-16T14:00:00.000Z",
  "notes": "First time customer"
}
```

**Response 201:** Created appointment with calculated endTime.

**Response 409:**
```json
{
  "message": "This time slot conflicts with an existing appointment",
  "error": "Conflict",
  "statusCode": 409
}
```

### Update Appointment Status

```http
PATCH /api/appointments/1
Content-Type: application/json

{
  "status": "cancelled"
}
```

**Response 200:** Updated appointment.

---

## Date/Time Format

All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

The `endTime` is computed automatically from `startTime + service.duration`.
