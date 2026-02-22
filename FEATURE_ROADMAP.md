# Thrifty Feature Roadmap

This document outlines the planned features for the Thrifty project and their implementation status.

## Phase 1: Core Currency & Gamification
- [ ] **1. Currency Changeable (INR/USD)**
    - Implement global currency state in `AppContext`.
    - Create usage utilities for formatting currency.
    - Add UI toggle in Settings/Navbar.
    - Note: This is purely a display preference toggle.
- [ ] **2. Leveling System (Max 5 Levels)**
    - Enhance `UserProfile` model to support levels.
    - Define logic: Level up based on points (e.g., Lvl 1: 0-100, Lvl 2: 101-500).
    - Add visual level indicator in user profile.
- [ ] **3. Reward System**
    - Define rewards for reaching levels (e.g., unlocking badges, themes).
    - Expand `Badge` system.

## Phase 2: Market Data Integration
- [ ] **4. Currency Comparison**
    - Comparison tool for INR vs major currencies.
    - Requires external API or static mock data.
- [ ] **5. Crypto Currency List**
    - Live/Mock list of major crypto prices.
- [ ] **6. Gold & Silver Rates**
    - Daily rates display.

## Phase 3: Financial Tools
- [ ] **7. Loan, Health Insurance, EMI**
    - Calculators for EMI.
    - Information pages for Loans/Insurance concepts.
- [ ] **8. UPI Implementation**
    - Add "Pay via UPI" deep links or QR code generator for transactions.
    - Note: Actual payment processing requires merchant setup; this will likely be a simulation or redirect.

## Phase 4: External Integrations & Stability
- [ ] **9. Offers Menu (Flipkart/Amazon)**
    - A section listing curated financial offers or affiliate links.
- [ ] **10. Error Management System**
    - Global Error Boundary in React.
    - Unified error logging service (Frontend -> Backend).

---
## Implementation Plan for Current Session

### Step 1: Currency Toggle (Frontend)
1.  Update `AppContext.jsx` to manage `currency` ('INR' | 'USD') and `exchangeRate` (fixed for now, e.g., 1 USD = 83 INR).
2.  Add a helper function `formatCurrency(amount)` in `AppContext`.
3.  Update key components (`Dashboard`, `TransactionList`) to use `formatCurrency`.
4.  Add a toggle switch in the UI (e.g., User Menu).

### Step 2: Leveling System (Backend + Frontend)
1.  Update `UserProfile` model in `backend/users/models.py` to add `level` field.
2.  Update `levels` logic in `users/signals.py` (create if needed) or `views.py` to auto-update level when points change.
3.  Display level in `Dashboard`/`Sidebar`.
