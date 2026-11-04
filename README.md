# Kerala Roadways - Construction Management Application (Phase 1: Project Management)

A professional, enterprise-grade Construction Management Application designed for road and highway infrastructure contracting in Kerala, India. Built with React (JavaScript), Firebase Firestore, Firebase Authentication, and Tailwind CSS. Converted into an installable Progressive Web App (PWA).

---

## 🏗️ Phase 1 Architecture Overview

This is Phase 1 of a multi-phase infrastructure enterprise application. Every project is registered with an atomic sequential identifier starting from `PRJ-101`, and all future operational modules (Daily Wages, Daily Expenses, Material Receipts, Fleet Logbooks, and Site Measurement Books) will link to these Project IDs without requiring database migrations.

### Key Capabilities in Phase 1:
- **Enterprise Management Dashboard**: Displays consolidated real-time metrics across all company operations (Total Projects, Ongoing Roadworks, Completed Works, **Active Employees Count**, Total Contract Value, Total Project Expenses, and Workforce Wage Ledger Vitals).
- **Projects Management**:
  - Full CRUD operations with soft-archiving to protect future wage & expense linkages.
  - Search by Project ID (e.g. `PRJ-101`) or Project Name.
  - Multi-filtering by Local Body, Work Type, and Status (Ongoing, Completed, Pending).
  - Sortable table columns with the exact 10 required fields and Indian currency formatting (`₹1,25,00,000`).
- **Employees & Workforce Directory**:
  - Full staff and workforce registry with sequential IDs starting from `EMP-101`.
  - Roles: Supervisor, Driver, Site Engineer, Heavy Machinery Operator, Paver Operator, Mason, Helper / Labourer, etc.
  - Tracking **Pending Wages (₹)**, **Paid Wages (₹)**, and **Total Wages (₹)** with Indian currency formatting.
- **Daily Wages & Muster Roll**:
  - Daily muster roll and attendance tracking (`Present`, `Half Day`, `Absent / On Leave`).
  - Dynamic Employee selector populated from the Employee registry and Project selector populated from the Projects table.
  - Live calculation: `Balance Amount = Wages - Advance`.
  - **Special Leave Advance Scenario Handled**: If a worker is on leave/absent but given an advance (e.g., absent with ₹300 advance given), the system records ₹0 earned wages and creates a `-₹300` balance for payroll ledger reconciliation!
- **Upcoming Modules**: Clearly marked interactive placeholders for Expenses, Site Progress, Materials, Machinery & Vehicles, Reports, and Settings.

---

## 📁 Project Directory Structure

```
├── firebase-applet-config.json    # Live Firebase project credentials & DB ID
├── firebase-blueprint.json        # Firestore schema Intermediate Representation (IR)
├── firestore.rules                # Hardened security rules & schema constraints
├── index.html                     # HTML5 entry with PWA meta tags & Web Manifest
├── manifest.webmanifest           # PWA installation manifest
├── icon-192.svg & icon-512.svg    # PWA application icons
├── package.json                   # Dependencies (React 19, Firebase SDK, Lucide, Tailwind)
├── vite.config.ts                 # Vite bundler configuration
└── src/
    ├── main.jsx                   # React application entry point (JavaScript)
    ├── App.jsx                    # Root coordinator, routing, modals & toast notifications
    ├── index.css                  # Global Tailwind CSS imports & theme styles
    ├── context/
    │   └── AuthContext.jsx        # Firebase Auth context (Google Sign-In & session state)
    ├── firebase/
    │   ├── config.js              # Firebase SDK initialization & FirestoreErrorInfo handler
    │   └── projectService.js      # Atomic transactions, sequential PRJ-101 IDs, queries & CRUD
    ├── utils/
    │   ├── constants.js           # Local Bodies, Work Types, Statuses & navigation items
    │   └── formatters.js          # Indian Rupee (₹) & date formatting (DD/MM/YYYY)
    └── components/
        ├── layout/
        │   ├── Sidebar.jsx        # Enterprise sidebar with active & upcoming phases
        │   ├── TopNav.jsx         # Header with search, status, profile & logout
        │   └── Layout.jsx         # Responsive desktop/mobile viewport container
        ├── dashboard/
        │   ├── MetricCard.jsx     # Visual KPI cards
        │   └── DashboardOverview.jsx # Live stats, financial progress & recent projects table
        ├── projects/
        │   ├── ProjectsList.jsx   # Search, filters, and ProjectTable controller
        │   ├── ProjectTable.jsx   # 10 exact columns, sorting & Indian currency format
        │   ├── ProjectFormModal.jsx # Add/Edit modal with auto ID & budget calculation
        │   ├── ProjectDetails.jsx # Detailed project view & coming-soon phase tabs
        │   └── ArchiveConfirmModal.jsx # Safe soft-archiving modal
        └── common/
            ├── Badge.jsx          # Status badges with pulse indicators
            ├── Modal.jsx          # Accessible dialog modal
            ├── NotificationToast.jsx # Floating success/error feedback toasts
            └── UpcomingModule.jsx # Roadmap preview for upcoming phases
```

---

## ⚡ How to Run the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔒 Firebase Configuration & Deployment

1. The app connects to Firebase Firestore using `firebase-applet-config.json`.
2. The rules in `firestore.rules` protect project records against orphaned writes, enforce schema limits, and prevent accidental hard deletion of linked infrastructure data.
3. If deploying via Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🐙 Connecting to GitHub

To push this repository to GitHub:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all files
git add .

# 3. Commit the changes
git commit -m "feat: complete Phase 1 Project Management module for Kerala Roadways PMS"

# 4. Create repository on GitHub and link remote
git remote add origin https://github.com/<your-username>/kerala-roadways-pms.git

# 5. Push to main branch
git branch -M main
git push -u origin main
```
