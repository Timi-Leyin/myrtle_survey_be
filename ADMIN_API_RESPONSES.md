# Admin API Response Objects

Complete documentation of all admin endpoint responses.

## 1. Admin Login

**Endpoint:** `POST /api/admin/login`

**Request:**
```json
{
  "username": "oluwaseunadesoye",
  "password": "myrtleng123@"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNjA4M2JiLTBmZDktNDAyYS05ZjQ4LWQ2MTEwMWM2M2Q5MiIsInVzZXJuYW1lIjoib2x1d2FzZXVuYWRlc295ZSIsImVtYWlsIjoib2x1d2FzZXVuYWRlc295ZUBteXJ0bGV3ZWFsdGguY29tIiwiaWF0IjoxNzM1Mjc2MDcxLCJleHAiOjE3MzUzNjI0NzF9",
    "admin": {
      "id": "616083bb-0fd9-402a-9f48-d61101c63d92",
      "username": "oluwaseunadesoye",
      "email": "oluwaseunadesoye@myrtlewealth.com"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Username and password are required"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## 2. Get Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSubmissions": 15,
      "totalNetWorth": 6750000000,
      "averageNetWorth": 450000000
    },
    "personaDistribution": {
      "Private Wealth Niche": 5,
      "Strategic Achiever": 7,
      "Everyday Builder": 3
    },
    "riskProfileDistribution": {
      "Conservative": 2,
      "Moderate": 6,
      "Growth": 5,
      "Aggressive": 2
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

**Error Response (401 - Invalid Token):**
```json
{
  "success": false,
  "message": "Invalid token. Please login again."
}
```

**Error Response (401 - Expired Token):**
```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

---

## 3. Get All Questionnaires (Paginated)

**Endpoint:** `GET /api/admin/questionnaires?page=1&limit=20`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "questionnaires": [
      {
        "id": "310810e1-c56d-41c1-a65b-3a6bff3124a8",
        "fullName": "Timileyin Oyelekan",
        "email": "timileyinoyelekan11@gmail.com",
        "phone": "08028022818",
        "netWorth": 675000000,
        "netWorthBand": "NW4-Private Wealth",
        "riskScore": 19,
        "riskProfile": "Growth",
        "persona": "Private Wealth Niche",
        "createdAt": "2025-11-28T00:28:06.719Z"
      },
      {
        "id": "abc123-def456-ghi789",
        "fullName": "John Doe",
        "email": "john@example.com",
        "phone": "08012345678",
        "netWorth": 2500000,
        "netWorthBand": "NW1-Emerging",
        "riskScore": 16,
        "riskProfile": "Moderate",
        "persona": "Everyday Builder",
        "createdAt": "2025-11-27T15:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to fetch questionnaires"
}
```

---

## 4. Get Questionnaire Details

**Endpoint:** `GET /api/admin/questionnaires/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "questionnaire": {
      "id": "310810e1-c56d-41c1-a65b-3a6bff3124a8",
      "fullName": "Timileyin Oyelekan",
      "email": "timileyinoyelekan11@gmail.com",
      "phone": "08028022818",
      "gender": "Male",
      "dateOfBirth": "2005-11-08T00:00:00.000Z",
      "occupation": "Software Dev",
      "address": "Nigeria",
      "maritalStatus": "Married",
      "dependantsCount": 0,
      "answers": {
        "Q1": "D",
        "Q2": "D",
        "Q3": "D",
        "Q4": "D",
        "Q5": "D",
        "Q6": "D",
        "Q7": "D",
        "Q8": "D",
        "Q9": "D",
        "Q10": "D",
        "Q11": "D",
        "Q12": "D",
        "Q13": "D",
        "Q14": "D"
      },
      "netWorth": 675000000,
      "netWorthBand": "NW4-Private Wealth",
      "riskScore": 19,
      "riskProfile": "Growth",
      "persona": "Private Wealth Niche",
      "portfolio": {
        "custom": true
      },
      "narrative": "MYRTLE WEALTH BLUEPRINT - Personalized Report\n\n1. Financial Identity\nYou are classified as: Private Wealth Niche\n\n2. Net Worth Summary\nYour estimated net worth is NGN 675,000,000 placing you in the NW4-Private Wealth category.\n\n3. Investment Personality\nYou are a Growth investor with a score of 19/28.\n\n4. Recommended Pathway\nSuggested Allocation:\nCustom allocation based on your unique profile\n\n5. Wealth Story Going Forward\nWe help you build a confident, structured, long-term financial future with Myrtle.",
      "createdAt": "2025-11-28T00:28:06.719Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Questionnaire not found"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to fetch questionnaire"
}
```

---

## Common Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation error: username: Username is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Please login first."
}
```

or

```json
{
  "success": false,
  "message": "Invalid token. Please login again."
}
```

or

```json
{
  "success": false,
  "message": "Token expired. Please login again."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Questionnaire not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch questionnaires"
}
```

---

## Authentication Flow

1. **Login** → Get JWT token
2. **Store token** in your frontend (localStorage, sessionStorage, or state)
3. **Include token** in all subsequent requests:
   ```
   Authorization: Bearer {token}
   ```
4. **Token expires** after 24 hours → User needs to login again

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Net worth values are in Nigerian Naira (NGN)
- Portfolio object can be either:
  - `{ custom: true }` - Custom allocation
  - `{ cash: 60, income: 30, growth: 10 }` - Specific percentages
- Answers object contains Q1-Q14 with values "A", "B", "C", or "D"
- All admin endpoints require authentication except `/api/admin/login`

