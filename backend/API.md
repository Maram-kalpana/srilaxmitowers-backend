# Srilaxmi API Documentation

Base URL: `http://localhost:5000/api`

## Response Format

**Success**
```json
{ "success": true, "message": "...", "data": {} }
```

**Error**
```json
{ "success": false, "message": "...", "errors": [] }
```

---

## Auth `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register user |
| POST | `/login` | No | Login |
| POST | `/logout` | No | Logout |
| POST | `/refresh` | Cookie | Refresh access token |
| GET | `/me` | Bearer | Current user |
| POST | `/forgot-password` | No | Request reset token |
| POST | `/reset-password` | No | Reset password |
| POST | `/change-password` | Bearer | Change password |

### Login
```http
POST /api/auth/login
Content-Type: application/json

{ "login": "admin", "password": "admin123" }
```

```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "name": "Admin", "role": "admin" },
    "accessToken": "eyJhbG..."
  }
}
```

---

## Dashboard `/api/dashboard`

| GET | `/stats` | Bearer | Totals, work overview, charts, recent activity |

---

## Projects `/api/projects`

| GET | `/` | List (paginated, `?search=&date=&page=&limit=`) |
| GET | `/all` | All projects (frontend sync) |
| GET | `/:id` | Get by ID |
| POST | `/` | Create |
| PUT | `/:id` | Update |
| DELETE | `/:id` | Soft delete |

**Create body**
```json
{
  "name": "Project Alpha",
  "companyName": "Client Co",
  "location": "Hyderabad",
  "startDate": "2026-01-15",
  "managerId": "emp-1"
}
```

---

## Employees `/api/employees`

| GET | `/lookup/:employeeId` | Public ID card lookup (e.g. EMP001) |
| GET | `/all` | All employees |
| CRUD | same pattern | |

**Employee fields:** name, employeeId, mobile, email, dob, designation, aadhar, monthlySalary, projectId, vehicleId, route, trainingDurationStart, trainingDurationEnd, passPhotoUrl, aadharCardUrl

---

## Vehicles `/api/vehicles` · Machines `/api/machines` · Expenses `/api/expenses` · Work Details `/api/work-details`

Full CRUD with search, date filter, pagination.

---

## Attendance `/api/attendance`

| POST | `/` | Upsert `{ employeeId, date, status: "present"|"absent"|null }` |
| POST | `/bulk` | `{ records: [...] }` |
| GET | `/all` | All records |

---

## Salary `/api/salary`

| GET | `/:employeeId?year=2026&month=6` | Salary breakdown |

---

## Uploads `/api/uploads`

| POST | `/image` | multipart `file` |
| POST | `/pdf` | multipart `file` |
| POST | `/document` | multipart `file` |

Files served at `/uploads/images|pdfs|documents/{filename}`

---

## Roles

- `admin` — full access
- `employee` — ERP modules
- `user` — dashboard read

Authorization header: `Bearer {accessToken}`
