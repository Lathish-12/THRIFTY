# THRIFTY PROJECT REPORT — PART 2
## Topics 6 through 10

*Continued from THRIFTY_REPORT_PART1.md*

---

# TOPIC 6: TRANSACTION MANAGEMENT MODULE

---

## 6.1 Data Model Design

### Overview of the Transaction Model

The **Transaction Module** is the core engine of the Thrifty application. It handles the recording, categorisation, and tracking of every financial movement made by the user. A robust data model is essential for ensuring data integrity, supporting complex queries, and providing the foundation for analytical insights across the dashboard, budget planner, and AI advisor.

In Thrifty, a `Transaction` is any individual record of income or expense. Each transaction is tied to a specific `User` and contains metadata that allows for granular tracking and powerful searching.

### Schema Definition

The `Transaction` model is implemented using Django's ORM and maps to an underlying database table. Below is the complete schema:

| Field | Data Type | Constraints | Description |
|-------|-----------|-------------|-------------|
| `id` | AutoField | Primary Key | Auto-incrementing unique identifier |
| `user` | ForeignKey | NOT NULL, CASCADE | Links to the User who owns this transaction |
| `type` | CharField(10) | choices=['income','expense'] | Whether money was received or spent |
| `amount` | DecimalField(10,2) | NOT NULL, positive | The monetary value in INR |
| `category` | CharField(50) | NOT NULL | Pre-defined category label |
| `payment_method` | CharField(20) | choices=[...] | Cash, Card, UPI, Net Banking |
| `description` | CharField(200) | blank=True | Short memo/note |
| `receipt` | ImageField | null=True, blank=True | Optional photo of physical receipt |
| `date` | DateField | NOT NULL | When the transaction occurred |
| `created_at` | DateTimeField | auto_now_add=True | When it was entered into Thrifty |
| `source_message` | TextField | blank=True | Raw SMS text for auto-parsed transactions |

### Entity Relationship Diagram

```
USER ──────────────── TRANSACTION
 │  (one-to-many)       │
 │                      ├── belongs to ──► CATEGORY
 │                      └── uses ──────► PAYMENT_METHOD
 │
 ├── sets ──────────── BUDGET
 ├── tracks ─────────── GOAL
 └── earns ──────────── BADGE
```

### Ordering and Indexing

Transactions are ordered by `-date, -created_at` (newest first) by default. The `user` and `date` fields are indexed for fast query performance when filtering a user's transactions for a specific month.

---

## 6.2 CRUD Workflows

### Create: Capturing Financial Events

The **Create** workflow is the primary entry point for financial data in Thrifty.

**User Interface Flow:**
1. User clicks the "Add Transaction" button on the Dashboard or Transaction List page.
2. A modal/form appears with fields: Type (Income/Expense), Amount, Category, Payment Method, Description, Date, and optional Receipt upload.
3. Upon form submission, client-side validation checks for required fields and valid amount.
4. An Axios POST request is sent to `/api/transactions/` with the form data.
5. Django validates, saves the transaction, and returns the created object.
6. The frontend adds the new transaction to the local state without needing a full page reload.

**Post-Creation Logic:**
After a transaction is saved, Django's `post_save` signal triggers:
- **Point Awarding**: +10 points added to the user's profile for consistent tracking.
- **Budget Check**: If the transaction is an expense in a budgeted category, the budget's utilisation is recalculated in real-time.
- **Goal Check**: If the transaction category matches a savings goal, the goal's progress is updated.

### Read: Accessing Historical Data

**List View:**
Returns all transactions for the authenticated user, ordered by newest first. Supports query parameters for filtering:
- `?type=expense` — filter by transaction type.
- `?category=Food` — filter by category.
- `?start_date=2026-01-01&end_date=2026-01-31` — filter by date range.

**Detail View:**
Returns a single transaction by its ID. If the transaction does not belong to the requesting user, returns HTTP 404.

**Analytics Aggregation:**
The Dashboard queries an aggregated summary endpoint `/api/transactions/summary/` which returns pre-calculated totals (total income, total expense, net savings) for the current month — optimised using Django ORM's `aggregate()` and `annotate()` functions.

### Update: Maintaining Accuracy

Financial tracking often requires corrections after the fact. The Update workflow allows users to modify any field of an existing transaction.

**Edit Flow:**
1. User clicks the edit icon on a transaction row.
2. The form pre-fills with existing values.
3. User modifies the desired fields and submits.
4. An Axios PATCH request is sent to `/api/transactions/{id}/`.
5. Django validates, updates the record, and the frontend updates its local state.

**Dynamic Budget Recalculation:**
When an expense transaction's `amount` or `category` is changed, the associated budget's utilisation percentage is automatically recalculated. For example, changing a Food expense from ₹500 to ₹800 will immediately update the Food budget progress bar to reflect the new total.

### Delete: Data Control

**Delete Flow:**
1. User clicks the delete (trash) icon and confirms the action.
2. An Axios DELETE request is sent to `/api/transactions/{id}/`.
3. Django deletes the record from the database.
4. The frontend removes the transaction from local state.
5. All affected budget totals and dashboard summaries refresh automatically.

**Balance Reversal:**
When a transaction is deleted, the budget spending totals are recalculated by re-summing all remaining transactions. This ensures no phantom expenses remain in the budget after deletion.

---

## 6.3 Category Logic

### Hierarchical Category Structure

Thrifty uses a standardised set of categories to ensure consistency and enable cross-user analytics benchmarking:

**Expense Categories:**
| Category | Icon | Typical Use |
|----------|------|-------------|
| Food & Dining | 🍕 | Restaurants, groceries, takeout |
| Transport | 🚗 | Fuel, Uber, bus, auto-rickshaw |
| Shopping | 🛍️ | Clothing, electronics, Amazon |
| Health | 💊 | Medicines, doctor visits, gym |
| Entertainment | 🎬 | Movies, streaming, games |
| Education | 📚 | Courses, books, tuition |
| Bills & Utilities | ⚡ | Electricity, internet, phone |
| Housing | 🏠 | Rent, maintenance |
| Investment | 📈 | SIPs, stocks (expense type) |
| Other | 📦 | Uncategorised expenses |

**Income Categories:**
| Category | Icon | Typical Use |
|----------|------|-------------|
| Salary | 💼 | Monthly employment income |
| Freelance | 💻 | Project-based income |
| Investment Returns | 📊 | Dividends, interest |

### Transaction-to-Budget Matching

The intelligence of the module lies in how it links a transaction's category to a budget entry. This is a dynamic calculation, not a hard database link.

**Two-Tier Matching Algorithm:**
1. **Exact Match**: The system first checks if a budget's `category` field exactly matches the transaction's `category` (case-insensitive).
2. **Partial/Shorthand Match**: If no exact match is found, it checks if the budget category *contains* the transaction category as a substring (e.g., transaction category `"Food"` matches budget `"Food & Dining"`).

This flexible matching ensures users don't need to name their budgets exactly as the predefined categories.

---

## 6.4 Filtering and Search

### Advanced Filtering Capabilities

The transaction module provides robust filtering to help users find specific records:

**Date-Based Filtering:**
- Today's transactions
- This week's transactions
- This month's transactions (default view)
- Custom date range picker

**Category-Based Filtering:**
Dropdown to filter transactions by a single or multiple categories, enabling users to see exactly how much they spent on, say, "Food" over the last three months.

**Amount-Based Filtering:**
- Minimum and maximum amount range sliders.
- Useful for finding large irregular expenses.

**Payment Method Filtering:**
Filter by Cash, Card, UPI, or Net Banking to reconcile specific payment streams.

### Search Functionality

A text search input queries the `description` field, allowing users to find transactions by memo (e.g., searching "Netflix" finds all Netflix subscription charges).

---

## 6.5 Pagination and Performance

### Pagination Strategy

For users with large transaction histories (hundreds or thousands of records), loading all transactions at once would be slow and inefficient. Thrifty implements **page-based pagination** using DRF's `PageNumberPagination`:

```
GET /api/transactions/?page=1       → Items 1–20
GET /api/transactions/?page=2       → Items 21–40
GET /api/transactions/?page=3       → Items 41–60
```

The API response includes:
- `count`: Total number of transactions.
- `next`: URL to the next page (null if last page).
- `previous`: URL to the previous page (null if first page).
- `results`: Array of transaction objects for the current page.

### Database Query Optimisation

Django's ORM uses `select_related()` to perform JOIN queries rather than N+1 queries:

```python
queryset = Transaction.objects.filter(
    user=self.request.user
).select_related('user').order_by('-date', '-created_at')
```

This ensures that user data is fetched in a single SQL query alongside transaction data, rather than making a separate database call for each transaction's user details.

---

---

# TOPIC 7: BUDGET PLANNING & GOAL SETTING

---

## 7.1 Budget Model and Design

### What is a Budget in Thrifty?

A **Budget** in Thrifty represents a spending limit that a user sets for a particular category for a given month. The budget system is the most powerful accountability tool in the application — it transforms raw transaction data into actionable financial guardrails.

### Budget Model Schema

| Field | Data Type | Description |
|-------|-----------|-------------|
| `id` | AutoField | Unique identifier |
| `user` | ForeignKey | Owner of the budget |
| `category` | CharField(50) | The spending category this budget covers |
| `limit` | DecimalField(10,2) | The maximum amount allowed to spend |
| `month` | IntegerField | Month number (1–12) |
| `year` | IntegerField | Year (e.g., 2026) |
| `color` | CharField(7) | Hex color for the progress bar (e.g., #FF6B6B) |
| `created_at` | DateTimeField | When the budget was created |

### The `spent` Property (Dynamic Calculation)

The `spent` amount is **not stored** in the database. Instead, it is a dynamically calculated Python property:

```python
@property
def spent(self):
    from transactions.models import Transaction
    transactions = Transaction.objects.filter(
        user=self.user,
        type='expense',
        category__icontains=self.category,
        date__month=self.month,
        date__year=self.year
    )
    return transactions.aggregate(total=Sum('amount'))['total'] or 0
```

**Why dynamic?** Storing `spent` as a field would require updating it every time a transaction is added, edited, or deleted — creating complex synchronisation challenges. A calculated property is always up-to-date and never out of sync.

### Budget Utilisation Percentage

The utilisation percentage determines the visual colour of the progress bar:

```
utilisation = (spent / limit) × 100

0%   – 74%  → Green  (Safe)
75%  – 89%  → Yellow (Warning)
90%  – 99%  → Orange (Alert)
100%+        → Red   (Exceeded / Critical)
```

---

## 7.2 Real-Time Budget Synchronisation

### How Sync Works

Budget synchronisation is one of Thrifty's most impressive technical features. When a user adds, edits, or deletes a transaction, the budget progress bars update **in real-time without a page refresh**.

**Implementation Detail:**
The frontend does not wait for a separate budget API call after a transaction change. Instead:
1. Adding a transaction triggers `AppContext.refreshBudgets()`.
2. `refreshBudgets()` makes a single GET request to `/api/budgets/`.
3. The backend recalculates all `spent` values dynamically.
4. The frontend state is updated and React re-renders the progress bars.

**Response Time:** The entire sync cycle (transaction save → budget refresh → UI update) completes in under 1 second on a standard internet connection, creating a seamless real-time feel.

### Budget Breach Alerts

When a budget's utilisation exceeds threshold values, Thrifty displays alerts:

**75% Alert:** A soft warning: *"You've used 75% of your Food budget. Consider slowing down spending in this category."*

**90% Alert:** An orange alert: *"Warning: You're near your Transport budget limit. Only ₹200 remaining!"*

**100%+ Critical Alert:** A red banner: *"Budget Exceeded! You've overspent your Shopping budget by ₹1,200. Click here for AI advice."*

The critical breach alert includes a direct link to the AI Advisor with a pre-filled prompt asking for advice specific to the over-budget category.

---

## 7.3 Budget CRUD Operations

### Creating a Budget

Users create budgets through a form on the Budget Planner page:
1. Select a category (dropdown matches transaction categories).
2. Enter a limit amount in INR.
3. Choose a colour for the progress bar (for personalisation).
4. Click "Create Budget".

The system checks for duplicate budgets (same user, category, month, year) and rejects duplicates with a meaningful error message.

### Editing a Budget

Users can adjust their budget limits at any time — for example, increasing their Food budget mid-month if they unexpectedly hosted a dinner party. The progress bar immediately reflects the new limit.

### Deleting a Budget

Deleting a budget removes the spending guardrail for that category but does **not** delete any transactions. The transaction history remains intact for reporting purposes.

### Monthly Budget Reset

Budgets are month-specific. At the start of each new month:
- Previous month's budgets are archived (still accessible in ??historical reports).
- Users can choose to "Copy Last Month's Budgets" — a convenience feature that duplicates all budget entries for the new month with the same limits.

---

## 7.4 Goal Setting

### Financial Goals in Thrifty

Beyond monthly budgeting, Thrifty allows users to set **financial goals** — specific savings targets with deadlines. Goals provide long-term financial motivation beyond the month-to-month budget cycle.

### Goal Model Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | AutoField | Unique identifier |
| `user` | ForeignKey | Goal owner |
| `name` | CharField(100) | Goal name (e.g., "Emergency Fund") |
| `target_amount` | DecimalField | The total amount to save |
| `current_amount` | DecimalField | Amount saved so far |
| `deadline` | DateField | Target completion date |
| `category` | CharField | Goal category (e.g., Savings, Travel, Home) |
| `is_completed` | BooleanField | Whether the goal has been achieved |
| `created_at` | DateTimeField | When the goal was created |

### Goal Progress Tracking

Progress is calculated as:
```
progress = (current_amount / target_amount) × 100
```

Users manually update `current_amount` as they save money toward the goal. In future versions, specific income transactions (e.g., "Goal: Emergency Fund" category) will automatically increment the goal's current amount.

### Goal Completion and Badges

When a goal is marked complete (`current_amount >= target_amount`), the system:
1. Sets `is_completed = True`.
2. Awards the user a "Goal Achiever" badge.
3. Adds bonus points to the user's profile.
4. Displays a congratulatory animation on the Goals page.

---

## 7.5 Gamification: Points, Levels, and Badges

### The Gamification System

Thrifty incorporates a gamification layer to transform financial tracking from a chore into a rewarding habit. The system is grounded in behavioural psychology — the "variable reward" mechanism used by successful habit-forming apps.

### Points System

Users earn points for positive financial behaviours:

| Action | Points Earned |
|--------|-------------|
| Add a transaction | +10 points |
| Complete a goal | +100 points |
| Stay under budget for a month | +50 points |
| Log in on 7 consecutive days | +25 points |
| Complete profile setup | +20 points |
| First transaction ever | +30 points |

### Level System

Points accumulate to unlock user levels:

| Level | Name | Points Required | Perks |
|-------|------|----------------|-------|
| 1 | Novice Saver | 0–100 | Basic budgets |
| 2 | Budget Builder | 101–500 | Custom themes |
| 3 | Finance Watcher | 501–1,500 | Advanced analytics |
| 4 | Money Master | 1,501–5,000 | AI priority access |
| 5 | Thrifty Champion | 5,001+ | All features unlocked |

### Badge System

Badges are one-time achievements awarded for specific milestones:

| Badge | Condition |
|-------|-----------|
| 🏆 First Step | Added first transaction |
| 📊 Data Driven | Added 10 transactions |
| 💰 Saver Starter | First completed goal |
| 🎯 Budget Keeper | Stayed under all budgets in a month |
| 🔥 Hot Streak | Logged in 30 consecutive days |
| 👑 Thrifty Legend | Reached Level 5 |

---

---

# TOPIC 8: AI FINANCIAL ADVISOR

---

## 8.1 AI Architecture and Design

### The Role of AI in Thrifty

The AI Financial Advisor is the differentiating feature that elevates Thrifty from a simple budgeting app to a true personal finance platform. Unlike static dashboards that show data, the AI interprets the data and communicates insights, warnings, and actionable advice in natural language — behaving like a personal financial coach available 24/7.

### Dual AI Engine

Thrifty integrates two leading AI large language models (LLMs):

**Google Gemini 1.5 Flash:**
- Developed by Google DeepMind.
- Optimised for speed and efficiency.
- Uses a 1 million token context window.
- Best for quick queries and conversational interactions.
- Accessed via the `google-generativeai` Python SDK.

**Anthropic Claude 3.5 Sonnet:**
- Developed by Anthropic.
- Optimised for deep reasoning and instruction following.
- Trained with Constitutional AI for safer, more aligned outputs.
- Best for complex multi-step financial analysis.
- Accessed via the `anthropic` Python SDK.

**Why Two AIs?**
Having two AI engines provides redundancy (if one API is down, switch to the other), caters to different user preferences, and demonstrates the system's flexibility in integrating multiple AI services through a common interface.

---

## 8.2 Context-Aware Prompting

### The System Prompt Architecture

The quality of an AI response is fundamentally determined by the quality of the prompt. Thrifty's AI integration uses a sophisticated **two-part prompt architecture**:

**Part 1: System Prompt (Context)**
Before the user's question is sent to the AI, the backend constructs a detailed system prompt containing the user's real financial data:

```python
system_prompt = f"""
You are a helpful and empathetic personal finance advisor for Thrifty.
Your user's current financial situation:

FINANCIAL SUMMARY:
- Total Income this month: ₹{total_income:,.2f}
- Total Expenses this month: ₹{total_expenses:,.2f}
- Net Savings: ₹{net_savings:,.2f}
- Savings Rate: {savings_rate:.1f}%

TOP SPENDING CATEGORIES:
{category_breakdown}

ACTIVE BUDGETS:
{budget_status}

RECENT TRANSACTIONS (last 5):
{recent_transactions}

Based on this REAL data, provide specific, actionable, and empathetic
financial advice. Be direct, use INR currency, and provide numbered
action steps whenever possible.
"""
```

**Part 2: User Message**
The user's actual typed question or selected quick prompt.

This architecture ensures the AI never gives generic advice — every response is grounded in the user's actual financial reality.

---

## 8.3 AI API Integration (Backend)

### Django AI Advisor View

The AI advisor is implemented as a Django API view at `/api/ai-advisor/`. The flow is:

1. Frontend sends: `POST /api/ai-advisor/` with `{ message, ai_model }`.
2. Backend retrieves the user's financial data from the database.
3. Constructs the system prompt with real financial context.
4. Calls either Gemini or Claude API based on `ai_model` parameter.
5. Returns the AI's text response to the frontend.

### Gemini Integration Code Pattern

```python
import google.generativeai as genai

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

response = model.generate_content(
    system_prompt + "\n\nUser Question: " + user_message
)
return response.text
```

### Claude Integration Code Pattern

```python
import anthropic

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    system=system_prompt,
    messages=[{"role": "user", "content": user_message}]
)
return message.content[0].text
```

### Error Handling

The AI view implements robust error handling:
- **API Timeout**: Returns a friendly error if the AI API takes more than 30 seconds.
- **Rate Limit**: Returns a "Please try again in a moment" message if the API quota is exceeded.
- **API Key Missing**: Returns a configuration error with setup instructions.
- **Network Error**: Falls back gracefully with a helpful message.

---

## 8.4 Chat Interface (Frontend)

### Chat UI Design

The AI Advisor page features a chat interface inspired by modern messaging apps:

**Message Bubbles:**
- User messages appear on the right with a purple gradient background.
- AI responses appear on the left with a dark card background and the AI model's icon.
- Messages animate in using Framer Motion with a slide-up effect.

**AI Model Toggle:**
A toggle switch at the top of the chat allows users to switch between Gemini and Claude without losing their chat history. Subsequent messages use the newly selected model.

**Quick Prompts:**
Pre-built prompt buttons for common financial questions:
- *"Analyse my spending this month"*
- *"How can I save more money?"*
- *"Where am I overspending?"*
- *"Give me a savings plan for this month"*
- *"How do I build an emergency fund?"*

**Loading State:**
While waiting for the AI response, an animated "thinking" indicator (three pulsing dots) is shown, setting clear user expectations about processing time.

---

## 8.5 AI Use Cases and Sample Interactions

### Use Case 1: Monthly Spending Analysis

**User:** *"Analyse my spending this month"*

**AI Response:**  
*"Based on your October 2026 data, here's my analysis:*
- *You've spent ₹24,500 against an income of ₹55,000, giving you a healthy 55.5% savings rate.*
- *Your top expense is Food & Dining at ₹8,200 — that's 33% of all expenses. Consider meal prepping or reducing restaurant visits.*
- *Your Transport budget has been exceeded by ₹600. Next month, try using public transport twice a week to reduce this.*
- *Great news: Your Shopping budget is only at 40% utilisation!*

*Recommendation: You're doing well overall! Focus on reducing Food spending by ₹2,000 next month to hit ₹30,000 in savings."*

### Use Case 2: Budget Breach Advice

**User:** *"My Rent budget has been exceeded. What should I do?"*

**AI Response:**
*"Housing costs exceeding your budget is stressful. Here's a practical action plan:*
1. *Review if this is a one-time excess (e.g., deposits, repairs) or structural — meaning your rent limit needs adjustment.*
2. *If structural: Increase your Rent budget limit and reduce another category (e.g., Entertainment) to compensate.*
3. *If one-time: Note it in the description field so you remember why next month looks different.*
4. *Consider your current Rent-to-Income ratio. Ideally, housing should be under 30% of gross income. Yours is currently at 35% — you may want to explore options.*"

### Use Case 3: Savings Goal Planning

**User:** *"I want to save ₹1,00,000 in 6 months. Is that realistic?"*

**AI Response:**
*"Based on your current finances:*
- *Current monthly savings: ₹30,500*
- *Target savings needed monthly: ₹16,667 (₹1,00,000 ÷ 6)*
- *Verdict: YES, this is achievable! You're already saving ₹30,500/month — nearly double what you need.*

*To make it official:*
1. *Create a Goal on your Goals page: "Emergency Fund - ₹1,00,000 by October 2026"*
2. *Set up a separate savings account and transfer ₹16,667 on salary day.*
3. *Track your goal monthly in Thrifty.'*"

---

---

# TOPIC 9: DASHBOARD & DATA VISUALIZATION

---

## 9.1 Dashboard Overview

### The Central Hub

The **Dashboard** is the first page a user sees after logging in. It serves as the financial command centre — a single-screen overview of the user's entire financial health. A well-designed dashboard eliminates the need to navigate to multiple pages to understand one's financial situation.

Thrifty's dashboard is designed on the principle of **progressive disclosure**: high-level summaries are visible immediately, with the ability to drill down into details.

### Dashboard Sections

The dashboard is organised into the following sections:

1. **Welcome Banner** — Personalised greeting with the user's name, current date, and a motivational financial quote.
2. **Summary Cards** — Four animated metric cards (Total Income, Total Expenses, Net Savings, Savings Rate).
3. **Spending Breakdown Chart** — Donut/pie chart showing category-wise expense distribution.
4. **Monthly Trend Chart** — Bar chart comparing income vs. expenses for the last 6 months.
5. **Budget Status Panel** — Mini-view of all active budgets with progress bars.
6. **Recent Transactions** — The 5 most recent transaction entries with quick-action icons.
7. **AI Advisor Quick Access** — A call-to-action card prompting the user to consult the AI.

---

## 9.2 Summary Cards

### Design and Data

The four summary cards are the most prominent UI elements on the dashboard. Each card features:
- **Icon**: A relevant Lucide icon (e.g., TrendingUp for Income, ArrowDown for Expenses).
- **Label**: The metric name.
- **Value**: The calculated amount, formatted as ₹XX,XXX.
- **Trend Indicator**: Percentage change compared to last month (green = improvement, red = worsening).
- **Glassmorphism Background**: A frosted-glass card with a subtle gradient border.
- **Hover Animation**: Cards lift slightly with a shadow effect on hover.

### Card Data Calculation

| Card | Formula | Colour |
|------|---------|--------|
| Total Income | Sum of all income transactions this month | Green |
| Total Expenses | Sum of all expense transactions this month | Red |
| Net Savings | Total Income − Total Expenses | Blue/Purple |
| Savings Rate | (Net Savings / Total Income) × 100 | Purple |

### Real-Time Updates

Summary cards are not static — they update automatically whenever:
- A new transaction is added.
- An existing transaction is edited or deleted.
- The user switches between different month views.

The update is driven by React's state management: when `AppContext.transactions` state changes, the dashboard component re-renders and recalculates all summary values instantly.

---

## 9.3 Spending Breakdown Chart

### PieChart / DonutChart

The spending breakdown chart visualises which categories consume the most of the user's budget. It is implemented using **Recharts' PieChart** component.

**Chart Features:**
- **Donut Style**: A hole in the centre shows the total expense amount.
- **Custom Colours**: Each category has a designated colour from a curated palette.
- **Tooltip**: Hovering over a slice shows the category name, amount spent, and percentage.
- **Legend**: A scrollable legend below the chart lists all categories with their amounts.
- **Animation**: Segments animate in with a drawing effect on page load.
- **Empty State**: If no expense transactions exist, displays a friendly "No expenses yet!" illustration.

### Category Colour Palette

| Category | Colour | Hex |
|----------|--------|-----|
| Food & Dining | Coral | #FF6B6B |
| Transport | Sky Blue | #4ECDC4 |
| Shopping | Purple | #A855F7 |
| Health | Green | #22C55E |
| Entertainment | Orange | #F97316 |
| Education | Yellow | #EAB308 |
| Bills & Utilities | Pink | #EC4899 |
| Housing | Indigo | #6366F1 |
| Other | Gray | #6B7280 |

---

## 9.4 Monthly Trend Chart

### BarChart: Income vs. Expenses

The Monthly Trend Chart provides a historical view of the user's financial patterns over the past 6 months. This is critical for identifying trends (e.g., "my expenses increase every December due to festivals") and tracking improvement over time.

**Chart Implementation (Recharts BarChart):**
- **X-Axis**: Month labels (e.g., "Oct", "Nov", "Dec", "Jan", "Feb", "Mar").
- **Y-Axis**: Amount in INR, automatically scaled to the highest value.
- **Income Bars**: Green bars representing total monthly income.
- **Expense Bars**: Red bars representing total monthly expenses.
- **Grouped Layout**: Income and Expense bars placed side-by-side for each month.
- **Reference Line**: A dashed horizontal line at the average monthly expense.
- **Tooltip**: Hovering shows the exact income and expense values for that month.

### Data Fetching Logic

The dashboard fetches the last 6 months of data in a single API call to `/api/transactions/monthly-summary/`. The backend uses Django ORM's `TruncMonth` and `annotate()` functions to group transactions by month and calculate totals:

```python
from django.db.models.functions import TruncMonth
from django.db.models import Sum

monthly_data = Transaction.objects.filter(
    user=request.user,
    date__gte=six_months_ago
).annotate(
    month=TruncMonth('date')
).values('month', 'type').annotate(
    total=Sum('amount')
).order_by('month')
```

---

## 9.5 Dashboard Performance and UX

### Performance Optimisation Strategies

**1. Parallel Data Fetching:**
On page mount, the dashboard fires multiple API requests in parallel (using `Promise.all()`) rather than sequentially:
- `/api/transactions/summary/` — current month totals.
- `/api/transactions/?page=1` — recent transactions.
- `/api/budgets/` — all budgets with calculated spent values.
- `/api/transactions/monthly-summary/` — 6-month trend data.

Parallel fetching reduces the total dashboard load time from the sum of all request times to the maximum of any single request time.

**2. Skeleton Loading States:**
While data is loading, the dashboard shows skeleton/placeholder cards (animated grey bars) instead of a blank screen or loading spinner. This gives users immediate visual feedback and makes the page feel faster.

**3. Memoisation:**
Expensive calculations (like summing all transactions by category for the pie chart) are wrapped in `useMemo()` hooks in React. This ensures the calculation only runs when `transactions` data changes — not on every re-render.

**4. Responsive Design:**
The dashboard layout is fully responsive:
- **Desktop (>1024px)**: Two-column layout with charts side by side.
- **Tablet (768px–1024px)**: Single column with stacked sections.
- **Mobile (<768px)**: Compact card view, charts resize to full width.

### UX Design Principles Applied

**Visual Hierarchy:** The most important information (net savings) is placed at the top and given the largest visual weight.

**Colour Semantics:** Green consistently means positive/income; red means negative/expense. These colour assignments are applied consistently across all charts, cards, and budget indicators.

**Empty States:** When the user has no data yet (e.g., new account), Thrifty shows friendly empty state illustrations with clear call-to-action buttons ("Add your first transaction") rather than empty tables or blank charts.

**Micro-Animations:** Subtle fade and count-up animations on the summary card numbers create a premium feel and draw attention to the key metrics.

---

---

# TOPIC 10: DATABASE DESIGN

---

## 10.1 Database Overview and Selection

### Development vs. Production

Thrifty uses two database systems depending on the environment:

**SQLite (Development):**
- Zero-configuration file-based database.
- Included with Python's standard library.
- Perfect for rapid local development without infrastructure setup.
- File stored as `backend/db.sqlite3`.

**PostgreSQL (Production):**
- Enterprise-grade relational database.
- Hosted as a managed service via Railway's PostgreSQL plugin.
- Supports concurrent users, complex queries, and large datasets.
- Connected via the `DATABASE_URL` environment variable using `dj-database-url`.

Django's ORM abstracts the difference — the same Python code works with both databases, and switching between them requires only a settings change.

---

## 10.2 Entity-Relationship Diagram

### Complete ERD

The Thrifty database consists of the following main entities and their relationships:

```
┌─────────────────┐       ┌─────────────────────┐
│  AUTH_USER      │       │  USERS_USERPROFILE  │
│─────────────────│1     1│─────────────────────│
│ id (PK)         ├───────┤ user (FK, OneToOne)  │
│ username        │       │ avatar              │
│ email           │       │ points              │
│ password        │       │ level               │
│ first_name      │       │ bio                 │
│ last_name       │       │ created_at          │
└────────┬────────┘       └─────────────────────┘
         │
         │ 1:M
         ├──────────────────────────────────────────┐
         │                                          │
         ▼                                          ▼
┌─────────────────────┐              ┌─────────────────────┐
│  TRANSACTIONS       │              │  BUDGETS            │
│─────────────────────│              │─────────────────────│
│ id (PK)             │              │ id (PK)             │
│ user (FK)           │              │ user (FK)           │
│ type                │              │ category            │
│ amount              │              │ limit               │
│ category            │              │ month               │
│ payment_method      │              │ year                │
│ description         │              │ color               │
│ receipt             │              │ created_at          │
│ date                │              └─────────────────────┘
│ created_at          │
│ source_message      │              ┌─────────────────────┐
└─────────────────────┘              │  GOALS              │
                                     │─────────────────────│
┌─────────────────────┐              │ id (PK)             │
│  BADGES             │              │ user (FK)           │
│─────────────────────│              │ name                │
│ id (PK)             │              │ target_amount       │
│ user (FK)           │              │ current_amount      │
│ name                │              │ deadline            │
│ description         │              │ category            │
│ icon                │              │ is_completed        │
│ awarded_at          │              │ created_at          │
└─────────────────────┘              └─────────────────────┘
```

---

## 10.3 Table Definitions

### Users Table (auth_user — Django Built-in)

Django's built-in `AbstractUser` model provides the core user table. Thrifty uses it as-is without modification, relying on the extended `UserProfile` model for additional fields.

**Key Fields:**
- `id`: Auto-incrementing primary key.
- `username`: Unique username (typically the email address).
- `email`: Email address (used for login and password reset).
- `password`: PBKDF2-hashed password string.
- `is_active`: Boolean — inactive users cannot log in.
- `date_joined`: Timestamp of account creation.

### UserProfile Table

One-to-one extension of the auth_user table:

```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE,
                                related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Transactions Table

The central data table of the application:

```python
class Transaction(models.Model):
    TRANSACTION_TYPES = [('income', 'Income'), ('expense', 'Expense')]
    PAYMENT_METHODS = [('cash', 'Cash'), ('card', 'Card'),
                       ('upi', 'UPI'), ('net_banking', 'Net Banking')]

    user = models.ForeignKey(User, on_delete=models.CASCADE,
                             related_name='transactions')
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50)
    payment_method = models.CharField(max_length=20,
                                      choices=PAYMENT_METHODS, default='cash')
    description = models.CharField(max_length=200, blank=True)
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    source_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-date', '-created_at']
```

---

## 10.4 Data Integrity and Constraints

### Foreign Key Constraints

All relationships use Django's `models.CASCADE` delete rule, ensuring referential integrity:

- **Delete User → Deletes**: UserProfile, all Transactions, all Budgets, all Goals, all Badges.
- This prevents orphaned records (transactions with no owner) in the database.

### Validation Constraints

**Amount Validation:**
```python
from django.core.validators import MinValueValidator

amount = models.DecimalField(
    max_digits=10,
    decimal_places=2,
    validators=[MinValueValidator(Decimal('0.01'))]
)
```

This database-level constraint prevents zero or negative transaction amounts.

**Unique Budget Constraint:**
```python
class Meta:
    unique_together = ['user', 'category', 'month', 'year']
```

Prevents duplicate budgets for the same category in the same month.

---

## 10.5 Database Migrations and Version Control

### Django Migrations

Django migrations are Python scripts that describe database schema changes. Every model change (adding a field, changing a constraint) generates a new migration file. This provides:

**Version History:**
The `migrations/` folder contains a chronological history of every schema change, like a version control system for the database structure.

**Rollback Capability:**
Migrations can be reversed (`python manage.py migrate app 0001`) to undo a schema change if it causes problems — providing a safety net during development.

**Team Synchronisation:**
When multiple developers work on the project, migrations ensure all team members' databases are in sync with the latest schema.

### Production Migration Workflow

In production (Railway), migrations run automatically before the application starts:

```bash
# In Railway's start command:
python manage.py migrate && python manage.py runserver
```

This ensures the production database schema is always up-to-date with the latest code changes without manual intervention.

### Seed Data

For demonstration and testing purposes, Thrifty includes a management command to seed the database with realistic sample data:

```bash
python manage.py seed_demo_data
```

This creates a demo user with 30 transactions, 5 budgets, and 2 goals — allowing immediate exploration of all dashboard features without manual data entry.

---

*[END OF PART 2 — Topics 6 through 10]*
*[Continue with THRIFTY_REPORT_PART3.md for Topics 11 through 15]*
