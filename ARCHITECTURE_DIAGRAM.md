# 📊 Data Isolation Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      THRIFTY APPLICATION                         │
│                   (Multi-User Architecture)                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐              ┌──────────────────┐
│   User: Alice    │              │    User: Bob     │
│ alice@test.com   │              │  bob@test.com    │
└────────┬─────────┘              └────────┬─────────┘
         │                                  │
         │ Login (JWT)                      │ Login (JWT)
         │                                  │
         ▼                                  ▼
┌────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                          │
│  ┌──────────────────┐           ┌──────────────────┐          │
│  │  Alice's Session │           │   Bob's Session  │          │
│  │  Token: JWT_A    │           │   Token: JWT_B   │          │
│  └────────┬─────────┘           └────────┬─────────┘          │
└───────────┼─────────────────────────────┼────────────────────┘
            │                              │
            │ API Requests                 │ API Requests
            │ (with JWT_A)                 │ (with JWT_B)
            ▼                              ▼
┌────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Django)                         │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         JWT Authentication Middleware                  │    │
│  │  - Validates JWT_A → User ID: 1 (Alice)               │    │
│  │  - Validates JWT_B → User ID: 2 (Bob)                 │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────┐    │
│  │            Data Filtering Layer                        │    │
│  │  Request from Alice:                                   │    │
│  │    Transaction.objects.filter(user_id=1)              │    │
│  │                                                         │    │
│  │  Request from Bob:                                     │    │
│  │    Transaction.objects.filter(user_id=2)              │    │
│  └───────────────────────────────────────────────────────┘    │
└───────────────┬─────────────────────────────┬──────────────────┘
                │                              │
                ▼                              ▼
┌────────────────────────────────────────────────────────────────┐
│                      DATABASE (SQLite)                          │
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │   Users Table       │                                        │
│  ├─────────────────────┤                                        │
│  │ ID │ Email          │                                        │
│  │  1 │ alice@test.com │                                        │
│  │  2 │ bob@test.com   │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │          Transactions Table                     │            │
│  ├────────────────────────────────────────────────┤            │
│  │ ID │ User_ID │ Type    │ Amount  │ Description │            │
│  ├────┼─────────┼─────────┼─────────┼─────────────┤            │
│  │ 1  │    1    │ expense │  500    │ Groceries   │ ← Alice   │
│  │ 2  │    1    │ income  │ 50000   │ Salary      │ ← Alice   │
│  │ 3  │    1    │ expense │  150    │ Coffee      │ ← Alice   │
│  │ 4  │    2    │ expense │ 20000   │ Rent        │ ← Bob     │
│  │ 5  │    2    │ income  │ 30000   │ Freelance   │ ← Bob     │
│  └────────────────────────────────────────────────┘            │
│                                                                  │
│  ┌────────────────────────────────────────────────┐            │
│  │            Badges Table                         │            │
│  ├────────────────────────────────────────────────┤            │
│  │ ID │ User_ID │ Name            │ Description   │            │
│  ├────┼─────────┼─────────────────┼───────────────┤            │
│  │ 1  │    1    │ Novice Tracker  │ First trans.  │ ← Alice   │
│  │ 2  │    2    │ Budget Master   │ 10 trans.     │ ← Bob     │
│  └────────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Example

### Scenario: Alice Fetches Her Transactions

```
┌────────────┐
│   Alice    │
│  (Browser) │
└──────┬─────┘
       │
       │ 1. GET /api/transactions/
       │    Authorization: Bearer eyJhbGc...
       │
       ▼
┌──────────────────────┐
│   Axios Interceptor  │
│  (Frontend)          │
│  - Adds JWT to       │
│    headers           │
└──────┬───────────────┘
       │
       │ 2. HTTP Request with JWT
       │
       ▼
┌──────────────────────┐
│  Django Middleware   │
│  (Backend)           │
│  - Validates JWT     │
│  - Extracts user_id  │
│  - Sets request.user │
└──────┬───────────────┘
       │
       │ 3. request.user = Alice (ID: 1)
       │
       ▼
┌──────────────────────┐
│  TransactionViewSet  │
│  (Django View)       │
│                      │
│  def get_queryset(): │
│    return            │
│    Transaction       │
│    .objects          │
│    .filter(          │
│      user=request    │
│           .user      │
│    )                 │
└──────┬───────────────┘
       │
       │ 4. SQL: SELECT * FROM transactions
       │         WHERE user_id = 1
       │
       ▼
┌──────────────────────┐
│     Database         │
│  Returns:            │
│  [                   │
│    {id:1, ...},      │
│    {id:2, ...},      │
│    {id:3, ...}       │
│  ]                   │
└──────┬───────────────┘
       │
       │ 5. JSON Response
       │
       ▼
┌──────────────────────┐
│   Alice's Browser    │
│  Displays:           │
│  - Groceries ₹500    │
│  - Salary ₹50,000    │
│  - Coffee ₹150       │
└──────────────────────┘
```

---

## Key Security Points

### 1. JWT Token Structure
```
Header.Payload.Signature

Payload contains:
{
  "user_id": 1,
  "username": "alice@test.com",
  "exp": 1234567890
}
```

### 2. Database Foreign Keys
```python
class Transaction(models.Model):
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,  # Delete transactions when user deleted
        related_name='transactions'
    )
```

### 3. Automatic Filtering
```python
# In Django views
def get_queryset(self):
    # This ensures users ONLY see their own data
    return Transaction.objects.filter(user=self.request.user)
```

---

## Data Isolation Benefits

✅ **Privacy**: Users can't see each other's financial data
✅ **Security**: No way to access another user's transactions
✅ **Scalability**: Each user's data is independently managed
✅ **Compliance**: Meets data protection requirements
✅ **Multi-tenancy**: Thousands of users can use the same app

---

## What Happens When...

### Alice Tries to Access Bob's Transaction Directly?

```
Alice's Request:
GET /api/transactions/4/
(Transaction #4 belongs to Bob)

Backend Response:
404 Not Found

Why?
- Backend filters: Transaction.objects.filter(user=alice)
- Transaction #4 has user=bob
- Alice's query returns empty
- 404 error returned
```

### Bob Deletes His Account?

```
Bob triggers account deletion
↓
DELETE /api/users/delete/
↓
Django CASCADE deletes:
- Bob's UserProfile
- All Bob's Transactions
- All Bob's Badges
↓
Alice's data remains untouched
```

---

## Summary

Your THRIFTY app uses a **multi-tenant architecture** with **row-level security**:

- Each row in the database has a `user_id` foreign key
- API endpoints automatically filter by the authenticated user
- Users can only access their own data
- Complete data isolation between accounts

This is the **industry-standard approach** used by applications like:
- Banking apps
- Expense trackers
- Social media platforms
- Any multi-user SaaS application

Your implementation is **correct and secure**! 🎉
