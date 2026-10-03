import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorSearch from './pages/DonorSearch';
import EmergencyRequests from './pages/EmergencyRequests';
import RequestDetails from './pages/RequestDetails';
import CreateRequest from './pages/CreateRequest';
import BloodInventoryPage from './pages/BloodInventoryPage';
import DashboardRouter from './pages/DashboardRouter';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/donors" element={<DonorSearch />} />
                <Route path="/requests" element={<EmergencyRequests />} />
                <Route path="/requests/:id" element={<RequestDetails />} />
                <Route path="/inventory" element={<BloodInventoryPage />} />

                {/* Protected Routes */}
                <Route
                  path="/requests/create"
                  element={
                    <ProtectedRoute allowedRoles={['Requester', 'HospitalStaff', 'Admin']}>
                      <CreateRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
