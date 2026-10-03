# LifePulse — Blood Donation & Emergency Request Management System

A web application designed to bridge the gap between voluntary blood donors, patients in critical emergencies, hospitals, and blood banks with intelligent compatibility matching, real-time inventory tracking, and role-based workflows.

---

## 🌟 Technology Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Lucide Icons, Axios, React Router v7
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Express-Validator
- **Database:** MongoDB & Mongoose ODM

---

## 👥 Supported User Roles & Features

### 1. `Donor`
- Create and manage donor profile (blood group, age, gender, weight, location, contact, emergency contact).
- Toggle real-time availability for emergency donation requests.
- Automatic blood compatibility matching (matrix-based).
- View and pledge units to compatible emergency requests.
- Track verified donation history and view issued certificate codes (e.g., `DON-WA-901842`).

### 2. `Requester`
- Submit emergency blood requests with blood group, quantity needed, hospital name & address, urgency level (`Critical`, `Urgent`, `Standard`), and required deadline.
- Real-time status tracking (`Pending`, `Approved`, `Matched`, `Fulfilled`, `Cancelled`).
- View donor pledges and blood bank responses.
- Cancel requests with reason if no longer needed.

### 3. `HospitalStaff`
- Create verified requests directly on behalf of patients.
- Review and verify pending patient blood requests in the hospital verification queue.
- Track requests submitted by their medical facility.
- Update request status when blood is received and mark transfusions as `Fulfilled`.

### 4. `BloodBankStaff`
- Manage blood inventory across all 8 blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
- Automated low-stock alerts (< 5 units threshold).
- Allocate inventory stock directly to approved hospital emergency requests.
- Record walk-in / blood drive donations and issue official certificates.
- Restock and dispatch adjustments.

### 5. `Admin`
- Manage all registered users: activate/deactivate accounts, change user roles, and verify staff.
- Manage hospital and blood bank directory (CRUD).
- High-level system statistics and blood reserve metrics.
- Comprehensive system audit trail and activity log.

---

## 🔑 Pre-Configured Demo Accounts

For testing, all demo accounts share the password: **`password123`**.  
The app also includes a **1-Click Demo Switcher** directly in the top navigation bar!

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@example.com` | `password123` | Full governance, user management, audit logs |
| **Hospital Staff** | `hospital@example.com` | `password123` | Harborview Medical Center staff, verifies requests |
| **Blood Bank Staff** | `bloodbank@example.com` | `password123` | Northwest Regional Blood Bank, stock & fulfillment |
| **Requester** | `requester@example.com` | `password123` | Active emergency request tracker |
| **Donor** | `donor@example.com` | `password123` | O- Universal Donor with history & certificates |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017`

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Populates sample accounts, inventory, and emergency requests
npm start        # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite React dev server on http://127.0.0.1:5173
```

---

## 📁 Project Structure

```text
Blood Donation & Emergency Request MS/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── donorController.js
│   │   │   ├── requestController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── donationController.js
│   │   │   ├── hospitalController.js
│   │   │   ├── userController.js
│   │   │   ├── notificationController.js
│   │   │   └── statsController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── DonorProfile.js
│   │   │   ├── BloodRequest.js
│   │   │   ├── BloodInventory.js
│   │   │   ├── DonationRecord.js
│   │   │   ├── Hospital.js
│   │   │   ├── Notification.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── donorRoutes.js
│   │   │   ├── requestRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── donationRoutes.js
│   │   │   ├── hospitalRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── statsRoutes.js
│   │   ├── utils/
│   │   │   ├── bloodCompatibility.js
│   │   │   └── seedData.js
│   │   ├── seeder.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── BloodGroupBadge.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── NotificationDropdown.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── DonorSearch.jsx
│   │   │   ├── EmergencyRequests.jsx
│   │   │   ├── RequestDetails.jsx
│   │   │   ├── CreateRequest.jsx
│   │   │   ├── BloodInventoryPage.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── RequesterDashboard.jsx
│   │   │   ├── HospitalDashboard.jsx
│   │   │   ├── BloodBankDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DashboardRouter.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotificationsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🔒 Security & Privacy Features

- Passwords securely hashed with `bcryptjs` (salt rounds: 10).
- Stateless authentication using signed `jsonwebtoken` (JWT).
- Role-based authorization (`authorize(...)` middleware) protecting sensitive hospital/admin routes.
- Sanitized patient identifiers (support for clinical reference codes TC-889, ONC-441 to protect sensitive personal records).
- All audit actions, role modifications, and inventory stock changes recorded in the AuditLog collection.
