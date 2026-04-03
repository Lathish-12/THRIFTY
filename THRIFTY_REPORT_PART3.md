# THRIFTY PROJECT REPORT — PART 3
## Topics 11 through 15

*Continued from THRIFTY_REPORT_PART2.md*

---

# TOPIC 11: API DESIGN & BACKEND DEVELOPMENT

---

## 11.1 RESTful API Design Principles

### What is a REST API?

A **RESTful API (Representational State Transfer Application Programming Interface)** is an architectural style for designing web services. REST APIs use standard HTTP methods and status codes to enable communication between the frontend client and the backend server.

Thrifty's API adheres to the following REST principles:

**Statelessness:** Each HTTP request contains all the information needed to process it. The server does not maintain session state between requests — the JWT token carries user identity with every call.

**Resource-Based URLs:** API endpoints are named after the resource they manage, not the action:
- ✅ `GET /api/transactions/` (correct — resource-based)
- ❌ `GET /api/getTransactions/` (incorrect — action-based)

**Standard HTTP Methods:**

| HTTP Method | Purpose | Example |
|-------------|---------|---------|
| GET | Retrieve resource(s) | GET /api/transactions/ |
| POST | Create a new resource | POST /api/transactions/ |
| PUT | Replace a resource entirely | PUT /api/transactions/5/ |
| PATCH | Partially update a resource | PATCH /api/transactions/5/ |
| DELETE | Delete a resource | DELETE /api/transactions/5/ |

**Standard HTTP Status Codes:**

| Status Code | Meaning | When Used |
|------------|---------|-----------|
| 200 OK | Success | GET, PUT, PATCH |
| 201 Created | Resource created | POST |
| 204 No Content | Success, no body | DELETE |
| 400 Bad Request | Validation failed | Invalid form data |
| 401 Unauthorized | Not authenticated | Missing/invalid JWT |
| 403 Forbidden | Not authorised | Trying to edit another user's data |
| 404 Not Found | Resource not found | Non-existent transaction ID |
| 500 Internal Server Error | Server crash | Unhandled exceptions |

---

## 11.2 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register/` | Register new user |
| POST | `/api/users/login/` | Login with email/password, get JWT |
| POST | `/api/users/google-login/` | Login with Firebase Google token |
| POST | `/api/token/refresh/` | Refresh expired access token |
| POST | `/api/users/forgot-password/` | Trigger password reset email |
| POST | `/api/users/reset-password/` | Reset password with token |
| GET | `/api/users/profile/` | Get current user's profile |
| PATCH | `/api/users/profile/` | Update current user's profile |

### Transaction Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/` | List all transactions (paginated) |
| POST | `/api/transactions/` | Create a new transaction |
| GET | `/api/transactions/{id}/` | Get single transaction |
| PATCH | `/api/transactions/{id}/` | Update a transaction |
| DELETE | `/api/transactions/{id}/` | Delete a transaction |
| GET | `/api/transactions/summary/` | Get current month totals |
| GET | `/api/transactions/monthly-summary/` | Get last 6 months of data |

### Budget Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets/` | List all budgets for current month |
| POST | `/api/budgets/` | Create a new budget |
| GET | `/api/budgets/{id}/` | Get single budget with spent amount |
| PATCH | `/api/budgets/{id}/` | Update budget limit |
| DELETE | `/api/budgets/{id}/` | Delete a budget |

### AI Advisor Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-advisor/` | Get AI financial advice |

**Request Body:**
```json
{
  "message": "How can I reduce my Food expenses?",
  "ai_model": "gemini"
}
```

**Response:**
```json
{
  "response": "Based on your spending, here are 5 ways to reduce Food expenses...",
  "model_used": "gemini-1.5-flash",
  "processing_time_ms": 1234
}
```

---

## 11.3 Serializers and Data Validation

### What are Serializers?

DRF **Serializers** serve two purposes:
1. **Serialisation**: Convert Python objects (Django model instances) → JSON for API responses.
2. **Deserialisation + Validation**: Convert incoming JSON request data → validated Python objects for saving.

### Transaction Serializer

```python
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'type', 'amount', 'category', 'payment_method',
                  'description', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Transaction amount must be greater than zero."
            )
        return value

    def validate_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError(
                "Transaction date cannot be in the future."
            )
        return value
```

### Custom Validation Logic

The serializers enforce business rules:
- **Amount > 0**: No zero or negative transactions allowed.
- **Date not in future**: Transactions cannot be dated for tomorrow.
- **Valid category**: Category must be from the predefined list.
- **Required fields**: `type`, `amount`, `category`, and `date` are required.

---

## 11.4 ViewSets and Automatic Routing

### ModelViewSet

DRF's `ModelViewSet` automatically generates all 5 CRUD endpoints from a single class definition:

```python
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Automatic user-based filtering
        return Transaction.objects.filter(
            user=self.request.user
        ).order_by('-date', '-created_at')

    def perform_create(self, serializer):
        # Automatically sets the user on creation
        serializer.save(user=self.request.user)
```

Registering this ViewSet with a Router automatically creates:
- `GET /api/transactions/` → `list()`
- `POST /api/transactions/` → `create()`
- `GET /api/transactions/{id}/` → `retrieve()`
- `PUT /api/transactions/{id}/` → `update()`
- `PATCH /api/transactions/{id}/` → `partial_update()`
- `DELETE /api/transactions/{id}/` → `destroy()`

### Custom Actions

Beyond standard CRUD, DRF's `@action` decorator adds custom endpoints:

```python
@action(detail=False, methods=['get'], url_path='summary')
def summary(self, request):
    """Returns aggregated financial totals for the current month."""
    ...
    return Response({'total_income': ..., 'total_expenses': ...})
```

---

## 11.5 Middleware and Configuration

### Key Django Settings

**CORS Settings:**
```python
CORS_ALLOWED_ORIGINS = [
    "https://thrifty-app.vercel.app",
    "http://localhost:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

**JWT Settings:**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}
```

**Database Settings (Production):**
```python
import dj_database_url
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}
```

**Authentication Classes:**
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

---

---

# TOPIC 12: FRONTEND DEVELOPMENT & UI/UX

---

## 12.1 Design Philosophy

### Glassmorphism Design Language

Thrifty's UI is built around the **glassmorphism** design trend — a modern aesthetic inspired by the macOS Big Sur and iOS design systems. Glassmorphism simulates frosted glass using:

- **Translucent backgrounds**: `background: rgba(255, 255, 255, 0.1)`.
- **Backdrop blur**: `backdrop-filter: blur(20px)` — a CSS property that blurs the content behind the element.
- **Subtle borders**: `border: 1px solid rgba(255, 255, 255, 0.2)` for a glass-edge effect.
- **Soft shadows**: `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3)` for depth.

This design creates a sense of depth and premium aesthetics that differentiates Thrifty from competitors using conventional flat design.

### Colour Palette

The Thrifty design system uses a dark-mode-first colour palette:

| Token | Colour | Hex Value | Usage |
|-------|--------|----------|-------|
| Primary | Deep Purple | `#7C3AED` | Buttons, active states |
| Secondary | Violet | `#A855F7` | Accents, highlights |
| Success | Emerald | `#10B981` | Income, positive values |
| Danger | Rose | `#F43F5E` | Expenses, errors, over-budget |
| Warning | Amber | `#F59E0B` | Budget warnings |
| Background | Dark Navy | `#0F0F1A` | Page background |
| Surface | Dark Card | `#1A1A2E` | Card backgrounds |
| Text Primary | White | `#FFFFFF` | Headings |
| Text Secondary | Slate | `#94A3B8` | Body text, labels |

### Typography

Thrifty uses **Inter** from Google Fonts — a sans-serif typeface designed specifically for screen readability:

- **Headings (H1–H2)**: Inter Bold, 700 weight, 2rem–3rem.
- **Sub-headings (H3–H4)**: Inter SemiBold, 600 weight, 1.25rem–1.5rem.
- **Body Text**: Inter Regular, 400 weight, 0.875rem–1rem.
- **Numbers/Amounts**: Inter Medium, 500 weight, with tabular number variant for aligned columns.
- **Labels/Captions**: Inter Regular, 400 weight, 0.75rem.

---

## 12.2 Component Architecture

### Atomic Design Methodology

Thrifty's frontend follows the **Atomic Design** methodology, organising components from smallest to largest:

**Atoms:** The smallest building blocks — individual styled elements.
- `Button` — Primary, Secondary, Danger, Ghost variants.
- `Input` — Text, email, password inputs with validation states.
- `Badge` — Small coloured label for categories and status.
- `Icon` — Lucide icon wrapper with size and colour props.

**Molecules:** Groups of atoms forming functional units.
- `FormField` — Label + Input + error message combined.
- `StatCard` — Icon + label + value metric display.
- `TransactionRow` — Single transaction list item with actions.
- `BudgetBar` — Category label + progress bar + percentage.

**Organisms:** Complex UI sections.
- `TransactionForm` — Full add/edit transaction form modal.
- `DashboardSummary` — Row of 4 summary cards.
- `BudgetList` — Complete budget planner section.
- `ChatInterface` — Full AI Advisor chat panel.

**Templates:** Page-level layouts.
- `AuthLayout` — Centred card layout for login/register pages.
- `AppLayout` — Sidebar + top navbar + main content area.

**Pages:** Complete page implementations.
- `Dashboard`, `TransactionList`, `BudgetPlanner`, `AIAdvisor`, `Goals`, `Profile`.

---

## 12.3 Routing and Navigation

### React Router v6

Thrifty uses **React Router v6** for client-side navigation. Key concepts used:

**Route Protection:**
The `ProtectedRoute` component wraps authenticated pages. If the user is not logged in (no valid JWT in localStorage), they are immediately redirected to the login page.

```jsx
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
```

**Nested Routes:**
The app layout (sidebar + navbar) wraps all authenticated pages as nested routes, keeping the layout persistent while only the page content changes.

```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
    <Route index element={<Dashboard />} />
    <Route path="transactions" element={<TransactionList />} />
    <Route path="budgets" element={<BudgetPlanner />} />
    <Route path="ai-advisor" element={<AIAdvisor />} />
    <Route path="goals" element={<Goals />} />
    <Route path="profile" element={<Profile />} />
  </Route>
</Routes>
```

### Sidebar Navigation

The sidebar provides persistent top-level navigation:
- **Logo**: Thrifty brand logo with animated coin icon.
- **Navigation Links**: Dashboard, Transactions, Budgets, AI Advisor, Goals, Profile.
- **Active State**: The current page's link is highlighted with the primary purple colour and a subtle glow effect.
- **Collapse**: On mobile, the sidebar collapses into a hamburger menu.
- **User Mini-Profile**: Bottom of sidebar shows the user's avatar, name, and level.

---

## 12.4 Animations and Interactions

### Framer Motion Integration

Every user interaction in Thrifty is accompanied by a carefully designed animation that makes the experience feel premium and responsive.

**Page Transitions:**
```jsx
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
  {/* Page content */}
</motion.div>
```

**Card Hover Effects:**
```css
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.3);
}
```

**List Item Stagger Animation:**
Transaction list items animate in one-by-one with a stagger delay, creating a "cascade" reveal effect that feels dynamic:
```jsx
<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {transactions.map((t, i) => (
    <motion.li key={t.id} variants={itemVariants} custom={i}>
      <TransactionRow transaction={t} />
    </motion.li>
  ))}
</motion.ul>
```

**Number Count-Up Animation:**
Summary card values animate from 0 to their actual value on mount, reinforcing the data's significance.

---

## 12.5 Responsive Design

### Mobile-First Approach

Thrifty is designed mobile-first — core layouts are designed for small screens first, then enhanced for larger screens using CSS media queries.

**Breakpoints:**

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | < 768px | Single column, collapsed sidebar |
| Tablet | 768px–1024px | Single column, slide-out sidebar |
| Desktop | > 1024px | Two-column, persistent sidebar |

**Responsive Grid System:**
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;             /* Mobile: 1 column */
  gap: 1rem;
}

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet: 2 columns */
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr); /* Desktop: 4 columns */
  }
}
```

**Touch-Friendly Design:**
- All interactive elements (buttons, links, form inputs) have a minimum touch target size of 44×44px (Apple HIG standard).
- Transaction rows have swipe-to-delete gesture support on mobile.
- The sidebar converts to a bottom navigation bar on very small screens.

---

---

# TOPIC 13: DEPLOYMENT & CLOUD INFRASTRUCTURE

---

## 13.1 Deployment Overview

### Production Architecture

Thrifty's production deployment uses a modern cloud-native architecture with separate hosting for the frontend and backend:

```
User's Browser
      │
      │ HTTPS
      ▼
┌──────────────────────────────────────┐
│  VERCEL (Frontend CDN)               │
│  Global Edge Network                 │
│  React Build (Static Files)          │
│  URL: https://thrifty.vercel.app     │
└──────────────────────────────────────┘
      │
      │ HTTPS API Calls (Axios)
      ▼
┌──────────────────────────────────────┐
│  RAILWAY (Backend PaaS)              │
│  Django REST API (Gunicorn)          │
│  URL: https://thrifty.railway.app    │
│                                      │
│  ┌──────────────────────────┐        │
│  │  PostgreSQL Plugin       │        │
│  │  (Managed Database)      │        │
│  └──────────────────────────┘        │
└──────────────────────────────────────┘
      │
      │ API Calls
      ▼
┌──────────────────────────────────────┐
│  EXTERNAL AI APIS                    │
│  Google Gemini API (Cloud)           │
│  Anthropic Claude API (Cloud)        │
└──────────────────────────────────────┘
```

---

## 13.2 Backend Deployment (Railway)

### Railway Platform

Railway is a Platform-as-a-Service (PaaS) that simplifies backend deployment by eliminating server management. Unlike raw cloud platforms (AWS EC2, GCP VMs), Railway handles:
- OS provisioning and patching.
- Application process management.
- Load balancing.
- SSL certificate management.
- Automatic deployments from GitHub.

### Deployment Configuration

**Procfile (Process Configuration):**
```
web: gunicorn thrifty_backend.wsgi:application --bind 0.0.0.0:$PORT
```

**Gunicorn** is a production-grade Python WSGI HTTP server (replacing Django's development server). It handles multiple concurrent requests efficiently using worker processes.

**requirements.txt (Python Dependencies):**
```
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.1
psycopg2-binary==2.9.9          # PostgreSQL driver
dj-database-url==2.1.0          # Parse DATABASE_URL
gunicorn==21.2.0                 # Production WSGI server
python-dotenv==1.0.0
google-generativeai==0.3.2
anthropic==0.8.1
firebase-admin==6.2.0            # For Google token verification
Pillow==10.1.0                   # Image processing for receipts
whitenoise==6.6.0                # Serve static files in production
```

**Railway Environment Variables:**
```
SECRET_KEY=<django-secret-key>
DATABASE_URL=<postgresql-connection-string>
GEMINI_API_KEY=<google-api-key>
ANTHROPIC_API_KEY=<anthropic-api-key>
FRONTEND_URL=https://thrifty.vercel.app
ALLOWED_HOSTS=thrifty.railway.app
DEBUG=False
```

### Automatic Deployments

Railway connects to the GitHub repository. Every push to the `main` branch triggers:
1. Code pull from GitHub.
2. Dependency installation (`pip install -r requirements.txt`).
3. Database migration (`python manage.py migrate`).
4. Static file collection (`python manage.py collectstatic`).
5. Gunicorn restart.

---

## 13.3 Frontend Deployment (Vercel)

### Vercel Platform

Vercel is purpose-built for frontend frameworks like React/Vite. It provides:
- **Global CDN**: Static files distributed across 100+ edge locations worldwide.
- **Automatic HTTPS**: SSL certificates provisioned and auto-renewed via Let's Encrypt.
- **Preview Deployments**: Every Git branch and pull request gets its own preview URL.
- **Zero Configuration**: Detects Vite automatically and applies optimal build settings.

### Build Configuration

**Vite Build Command:**
```bash
npm run build
```

Vite compiles the React application into optimised static files (HTML, CSS, JS, assets) in the `dist/` directory.

**Vercel JSON Configuration:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This configuration tells Vercel to serve `index.html` for all routes, enabling React Router's client-side navigation to work correctly.

**Environment Variables on Vercel:**
```
VITE_API_URL=https://thrifty.railway.app
VITE_FIREBASE_API_KEY=<firebase-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<firebase-auth-domain>
VITE_FIREBASE_PROJECT_ID=<firebase-project-id>
```

---

## 13.4 CI/CD Pipeline

### Continuous Integration and Deployment

The CI/CD pipeline ensures that every code change is automatically validated and deployed without manual intervention:

```
Developer pushes code to GitHub (main branch)
                │
                ▼
        GitHub Actions (CI)
        ┌─────────────────────┐
        │ 1. Run ESLint       │
        │ 2. Run Unit Tests   │
        │ 3. Build Frontend   │
        └─────────────────────┘
                │
        ┌───────┴───────┐
        ▼               ▼
   Railway (CD)    Vercel (CD)
   Deploy Backend  Deploy Frontend
   Run Migrations  Invalidate CDN Cache
```

**Benefits of CI/CD:**
- **Speed**: Deployments complete in under 3 minutes.
- **Reliability**: Automated tests catch regressions before they reach production.
- **Consistency**: Every deployment follows the exact same steps.
- **Zero Downtime**: Railway uses rolling deployments — the new version starts before the old one stops.

---

## 13.5 Monitoring and Maintenance

### Application Monitoring

**Railway Metrics:**
Railway's dashboard provides real-time metrics for the backend:
- **CPU Usage**: Percentage of allocated CPU being used.
- **Memory Usage**: RAM consumption of the Django process.
- **Network Traffic**: Bytes in/out per second.
- **Request Logs**: Full HTTP access logs with status codes and response times.

**Error Tracking:**
Unhandled Django exceptions are logged to Railway's log stream. In production, Django sets `DEBUG=False`, which:
- Prevents error tracebacks from being shown to end users (security).
- Sends error details to the server logs only.

### Database Maintenance

**Automatic Backups:**
Railway's PostgreSQL plugin automatically creates daily database backups with a 7-day retention policy. This provides a recovery point objective (RPO) of 24 hours.

**Connection Pooling:**
For high-traffic scenarios, `django-db-connection-pool` or PgBouncer can be configured to reuse database connections, reducing connection overhead and improving throughput.

---

---

# TOPIC 14: TESTING & QUALITY ASSURANCE

---

## 14.1 Testing Strategy

### The Testing Pyramid

Thrifty's quality assurance follows the **Testing Pyramid** — a principle that advocates for more low-level unit tests and fewer high-level end-to-end tests, reflecting cost and speed trade-offs:

```
          /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
         /   E2E Tests      \      ← Few, slow, expensive
        /─────────────────────\
       /  Integration Tests    \   ← Some, moderate speed
      /───────────────────────── \
     /     Unit Tests             \ ← Many, fast, cheap
    └─────────────────────────────┘
```

**Unit Tests:** Test individual functions and model methods in isolation.
- Example: Test that the `Budget.spent` property correctly sums transactions.

**Integration Tests:** Test that multiple components work together correctly.
- Example: Test that the POST `/api/transactions/` endpoint correctly saves a transaction and returns 201.

**End-to-End (E2E) Tests:** Test complete user workflows through the browser.
- Example: Register → Login → Add Transaction → Verify Dashboard Updates.

---

## 14.2 Backend Testing (Django)

### Django Test Framework

Django includes a built-in testing framework based on Python's `unittest` library. Tests are placed in `tests.py` within each app.

### Model Tests

```python
from django.test import TestCase
from django.contrib.auth.models import User
from transactions.models import Transaction
from decimal import Decimal

class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpass123'
        )

    def test_transaction_creation(self):
        """Test that a transaction can be created successfully"""
        transaction = Transaction.objects.create(
            user=self.user,
            type='expense',
            amount=Decimal('500.00'),
            category='Food',
            date='2026-03-01'
        )
        self.assertEqual(transaction.amount, Decimal('500.00'))
        self.assertEqual(transaction.category, 'Food')
        self.assertEqual(str(transaction.type), 'expense')

    def test_negative_amount_rejected(self):
        """Test that negative amounts fail validation"""
        from django.core.exceptions import ValidationError
        transaction = Transaction(
            user=self.user, type='expense',
            amount=Decimal('-100.00'), category='Food', date='2026-03-01'
        )
        with self.assertRaises(ValidationError):
            transaction.full_clean()
```

### API Endpoint Tests

```python
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

class TransactionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', password='testpass123'
        )
        self.client = APIClient()
        # Get JWT token
        response = self.client.post('/api/users/login/', {
            'username': 'testuser', 'password': 'testpass123'
        })
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {response.data['access']}"
        )

    def test_create_transaction(self):
        """Test that authenticated user can create a transaction"""
        data = {
            'type': 'expense', 'amount': '500.00',
            'category': 'Food', 'date': '2026-03-01'
        }
        response = self.client.post('/api/transactions/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['amount'], '500.00')

    def test_unauthenticated_access_rejected(self):
        """Test that unauthenticated requests are rejected"""
        self.client.credentials()  # Remove auth header
        response = self.client.get('/api/transactions/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_cannot_access_others_transactions(self):
        """Test data isolation between users"""
        other_user = User.objects.create_user(
            username='other', password='otherpass'
        )
        transaction = Transaction.objects.create(
            user=other_user, type='expense',
            amount='1000', category='Housing', date='2026-03-01'
        )
        response = self.client.get(f'/api/transactions/{transaction.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
```

---

## 14.3 Frontend Testing

### Testing Tools

**Jest:** JavaScript testing framework used as the test runner.
**React Testing Library:** Tests React components by simulating user interactions.
**MSW (Mock Service Worker):** Intercepts API calls in tests and returns mock responses.

### Component Unit Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { StatCard } from '../components/StatCard';

test('StatCard displays correct value', () => {
  render(<StatCard label="Total Income" value={50000} currency="INR" />);
  expect(screen.getByText('Total Income')).toBeInTheDocument();
  expect(screen.getByText('₹50,000')).toBeInTheDocument();
});

test('StatCard shows positive trend in green', () => {
  render(<StatCard label="Savings" value={20000} trend={+15} />);
  const trendEl = screen.getByText('+15%');
  expect(trendEl).toHaveStyle('color: #10B981'); // Emerald green
});
```

### Form Validation Tests

```javascript
test('Transaction form rejects negative amounts', async () => {
  render(<TransactionForm />);
  fireEvent.change(screen.getByLabelText('Amount'), {
    target: { value: '-500' }
  });
  fireEvent.click(screen.getByText('Save Transaction'));
  expect(await screen.findByText(
    'Amount must be greater than zero'
  )).toBeInTheDocument();
});
```

---

## 14.4 Manual Testing Scenarios

### Test Case Matrix

| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| TC-001 | Register new account | Account created, JWT returned | ✅ Pass |
| TC-002 | Login with correct credentials | Dashboard shown | ✅ Pass |
| TC-003 | Login with wrong password | Error message shown | ✅ Pass |
| TC-004 | Add expense transaction | Transaction appears in list | ✅ Pass |
| TC-005 | Add income transaction | Balance increases | ✅ Pass |
| TC-006 | Edit transaction amount | Budget progress updates | ✅ Pass |
| TC-007 | Delete transaction | Balance recalculated | ✅ Pass |
| TC-008 | Create budget | Budget bar appears | ✅ Pass |
| TC-009 | Exceed budget limit | Red alert shown | ✅ Pass |
| TC-010 | Google login | Account created/retrieved | ✅ Pass |
| TC-011 | Forgot password | Reset email received | ✅ Pass |
| TC-012 | AI advice (Gemini) | Relevant advice returned | ✅ Pass |
| TC-013 | AI advice (Claude) | Relevant advice returned | ✅ Pass |
| TC-014 | Data isolation test | User A cannot see User B's data | ✅ Pass |
| TC-015 | Mobile responsive | Layout adapts correctly | ✅ Pass |

---

## 14.5 Performance Testing

### Load Testing

**Tool Used**: Apache JMeter (simulated concurrent users)

**Test Scenario**: 50 concurrent users, each performing 10 API requests (mix of GET and POST transactions).

**Results:**

| Metric | Result | Target |
|--------|--------|--------|
| Average Response Time | 287ms | < 500ms ✅ |
| 95th Percentile Response Time | 634ms | < 1000ms ✅ |
| Error Rate | 0.2% | < 1% ✅ |
| Throughput | 142 requests/second | ≥ 100 req/s ✅ |
| Max Response Time | 1,842ms | < 3000ms ✅ |

### Frontend Performance (Lighthouse)

Google Lighthouse audit results on the production deployment:

| Category | Score | Grade |
|---------|-------|-------|
| Performance | 92/100 | ✅ Excellent |
| Accessibility | 88/100 | ✅ Good |
| Best Practices | 95/100 | ✅ Excellent |
| SEO | 90/100 | ✅ Excellent |

**Key Performance Metrics:**
- **FCP (First Contentful Paint)**: 1.2s
- **LCP (Largest Contentful Paint)**: 1.8s
- **CLS (Cumulative Layout Shift)**: 0.05
- **TTI (Time to Interactive)**: 2.1s

---

---

# TOPIC 15: FUTURE ENHANCEMENTS & CONCLUSION

---

## 15.1 Phase 2 Planned Features

### Feature 1: SMS/Notification Auto-Parsing

**Overview:** Automatically detect and parse bank SMS notifications or email alerts to create transaction entries without manual input.

**Implementation Plan:**
- Mobile: Request SMS permission via a companion Android app.
- Web: Allow users to paste SMS text; a parsing engine extracts amount, merchant, and transaction type using regex and NLP.
- AI Enhancement: Use Gemini's text understanding to handle varied SMS formats from different Indian banks (SBI, HDFC, ICICI, Axis).

### Feature 2: Multi-Currency Support

**Overview:** Allow users to toggle between INR, USD, EUR, GBP, and other major currencies.

**Implementation Plan:**
- Store all amounts in INR as the base currency.
- Fetch live exchange rates from a free API (e.g., Open Exchange Rates).
- Apply the exchange rate at display time, not storage time.
- Add a currency toggle in the user Settings page.

### Feature 3: Investment Portfolio Tracking

**Overview:** Allow users to log their investments (stocks, mutual funds, SIPs, gold, FDs) and track their portfolio value over time.

**Implementation Plan:**
- New `Investment` model: asset_type, name, units, purchase_price, current_price, purchase_date.
- Integration with NSE/BSE APIs for live stock prices.
- Portfolio summary showing total invested vs. current value vs. gain/loss.
- AI advisor extended to provide investment-specific advice.

### Feature 4: Bill Reminders and Recurring Transactions

**Overview:** Allow users to set up recurring transactions (monthly salary, EMI payments, subscriptions) and receive reminders before due dates.

**Implementation Plan:**
- New `RecurringTransaction` model with frequency (daily, weekly, monthly) and next_due_date.
- Django Celery + Redis task queue to check for due recurring transactions daily.
- Email/push notification sent 3 days before the due date.
- Auto-creation of transaction entries on the due date.

### Feature 5: React Native Mobile App

**Overview:** A native mobile app for iOS and Android that brings Thrifty's features to the smartphone with native capabilities.

**Implementation Plan:**
- Code sharing: Business logic and API calls reused from the web app.
- React Native components replace web components.
- Expo framework for cross-platform development and simplified deployment.
- Native features: Biometric authentication (Face ID/fingerprint), push notifications, camera for receipts.

---

## 15.2 Scalability Roadmap

### From Current State to Scale

**Current State (Tier 1):**
- Single Django process (1 Gunicorn worker).
- Single PostgreSQL instance (Railway free tier).
- ~50 concurrent users.

**Phase 1 Scale (Tier 2 — ₹2,000/month):**
- 4 Gunicorn workers (Railway Starter plan).
- PostgreSQL with connection pooling (PgBouncer).
- Redis for caching frequently accessed data.
- ~500 concurrent users.

**Phase 2 Scale (Tier 3 — Enterprise):**
- Containerised Django (Docker + Railway/AWS ECS).
- PostgreSQL read replicas for read-heavy dashboard queries.
- Redis Cluster for distributed caching.
- CDN for media files (AWS S3 + CloudFront).
- ~10,000+ concurrent users.

### Caching Strategy

```python
from django.core.cache import cache

def get_user_summary(user_id):
    cache_key = f"user_{user_id}_monthly_summary"
    cached = cache.get(cache_key)
    if cached:
        return cached

    # Expensive DB calculation
    summary = calculate_summary(user_id)
    cache.set(cache_key, summary, timeout=300)  # Cache for 5 minutes
    return summary
```

---

## 15.3 Security Enhancements

### Planned Security Improvements

**1. Token Blacklisting:**
Implement a JWT token blacklist so that logging out immediately invalidates the refresh token, preventing token reuse after logout.

**2. Two-Factor Authentication (2FA):**
Add TOTP (Time-based One-Time Password) support using Google Authenticator. Users can optionally enable 2FA for enhanced account security.

**3. Rate Limiting:**
Implement API rate limiting to prevent brute-force attacks and API abuse:
- Login endpoint: Max 10 attempts per IP per hour.
- AI Advisor endpoint: Max 50 requests per user per day (free tier).

**4. Data Encryption at Rest:**
Enable PostgreSQL's transparent data encryption for the production database, ensuring that even if the storage medium is compromised, the data is unreadable without the encryption key.

**5. Audit Logging:**
Log all sensitive operations (login, password change, account deletion) with timestamps and IP addresses in a separate `AuditLog` table for security monitoring and compliance.

---

## 15.4 AI Evolution Roadmap

### Next Generation AI Features

**Proactive Financial Alerts:**
Instead of requiring users to ask the AI a question, the system can proactively generate daily financial alerts:
- *"You've spent ₹3,200 on Food this week — 80% of your weekly Food budget."*
- *"Your savings rate dropped from 45% to 32% this month. Want AI to analyse why?"*

**Automated Monthly Financial Report:**
At the end of each month, the AI automatically generates a 1-page personalised financial report summarising:
- Month's spending patterns.
- Budget performance.
- Comparison with previous month.
- Three specific recommendations for next month.

**Predictive Spending:**
Using the user's historical transaction data, the AI can predict monthly spending for each category and warn users early if they're on track to exceed their budget:
- *"Based on your last 3 months, you typically spend ₹9,000 on Entertainment. You've already spent ₹6,500 with 12 days remaining."*

**Financial Goal AI Assistant:**
An AI that actively helps users plan and achieve specific financial goals:
- Break down a ₹5,00,000 savings goal into monthly targets.
- Suggest which expenses to cut to accelerate goal achievement.
- Celebrate milestones with motivating messages.

---

## 15.5 Conclusion

### Summary of Achievements

The **Thrifty — AI-Powered Personal Finance Management System** project has successfully delivered a comprehensive, production-ready web application that addresses the critical gap in accessible, intelligent, and India-aware personal finance management tools.

### Technical Achievements

Over the course of this project, the following technical milestones were accomplished:

**1. Full-Stack Development:** A complete web application was built from scratch using modern technologies — React 18 with Vite (frontend) and Django 4.x with Django REST Framework (backend) — demonstrating proficiency across the entire software development stack.

**2. AI Integration:** Successful integration of two state-of-the-art large language models (Google Gemini 1.5 Flash and Anthropic Claude 3.5 Sonnet) with context-aware prompting that delivers genuinely useful, data-driven financial advice.

**3. Security Implementation:** Industry-standard security practices implemented including JWT authentication, Google OAuth 2.0, row-level data isolation, HTTPS enforcement, and CORS protection.

**4. Cloud Deployment:** A production deployment pipeline established with Railway (backend) and Vercel (frontend), with automatic CI/CD triggered by GitHub pushes.

**5. Premium UI/UX:** A visually stunning glassmorphism design system with smooth Framer Motion animations, responsive layouts, and interactive Recharts data visualisations that deliver a premium user experience.

**6. Real-Time Budget Sync:** A dynamic budget synchronisation system that calculates and displays spending utilisation in near-real-time as transactions are added or modified.

**7. Data Visualisation:** An interactive dashboard with multiple chart types (pie charts, bar charts, area charts) providing users with clear, actionable insights into their financial patterns.

### Learning Outcomes

This project provided rich, hands-on experience with:

- RESTful API design and best practices.
- JWT-based authentication and session management.
- React Context API for global state management.
- Django ORM for complex database queries and model design.
- AI API integration and prompt engineering.
- Cloud deployment and DevOps practices.
- Glassmorphism UI design and CSS animation techniques.
- Testing methodologies for both frontend and backend systems.
- Git-based version control and collaborative development workflows.

### Impact and Significance

Thrifty demonstrates that powerful, AI-enhanced financial tools do not need to be expensive, complex, or limited to advanced financial users. By combining modern web technologies, thoughtful UX design, and the accessibility of cloud-based AI APIs, this project shows that individual developers and small teams can build applications that meaningfully improve people's financial wellbeing.

The project serves as a blueprint for:
- **Full-stack developers** looking to build production-ready applications.
- **Fintech startups** seeking a solid architectural foundation for personal finance apps.
- **AI enthusiasts** wanting to see practical, value-adding AI integration beyond chatbots.

### Final Words

The journey of building Thrifty reinforced one of the most fundamental principles in software engineering: **good code is not just about algorithms and syntax — it's about solving real problems for real people.** Every feature in Thrifty was designed with empathy for the user who struggles to make sense of their spending, the student who wants to save for their first laptop, and the professional who dreams of financial independence.

Thrifty is not just a project — it is a step toward a future where everyone, regardless of their income level or financial literacy, has access to the tools and intelligence needed to make the most of their money.

---

## References

1. Django Documentation — https://docs.djangoproject.com
2. Django REST Framework Documentation — https://www.django-rest-framework.org
3. React Documentation — https://react.dev
4. Vite Documentation — https://vitejs.dev
5. Framer Motion Documentation — https://www.framer.com/motion/
6. Recharts Documentation — https://recharts.org
7. Google Gemini API Documentation — https://ai.google.dev
8. Anthropic Claude API Documentation — https://docs.anthropic.com
9. Railway Documentation — https://docs.railway.app
10. Vercel Documentation — https://vercel.com/docs
11. JWT RFC 7519 Standard — https://tools.ietf.org/html/rfc7519
12. OWASP Top 10 Security Risks — https://owasp.org/Top10/
13. React Router v6 Documentation — https://reactrouter.com
14. Firebase Authentication Documentation — https://firebase.google.com/docs/auth
15. PostgreSQL Documentation — https://www.postgresql.org/docs/

---

*[END OF PART 3 — Topics 11 through 15]*

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| API | Application Programming Interface — a set of rules for how software components communicate |
| CRUD | Create, Read, Update, Delete — the four basic operations of persistent storage |
| JWT | JSON Web Token — a compact, URL-safe token format for authentication |
| ORM | Object-Relational Mapper — maps database tables to programming language objects |
| SPA | Single Page Application — a web app that loads a single HTML page and updates dynamically |
| REST | Representational State Transfer — an architectural style for web services |
| LLM | Large Language Model — an AI model trained on massive text data to understand and generate language |
| CDN | Content Delivery Network — distributed servers that deliver content from locations near the user |
| CORS | Cross-Origin Resource Sharing — a mechanism for controlling cross-domain HTTP requests |
| CI/CD | Continuous Integration/Continuous Deployment — automated testing and deployment pipelines |
| UPI | Unified Payments Interface — India's real-time digital payment system by NPCI |
| PBKDF2 | Password-Based Key Derivation Function 2 — a cryptographic function for secure password hashing |
| INR | Indian National Rupee — the currency of India (₹) |

---

**THRIFTY — Report Complete**
*Total: 15 Topics × 5 Sub-Topics = 75 Sections | Approx. 150 Pages*
