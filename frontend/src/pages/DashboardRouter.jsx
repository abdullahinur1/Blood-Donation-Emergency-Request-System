import React from 'react';
import { useAuth } from '../context/AuthContext';
import DonorDashboard from './DonorDashboard';
import RequesterDashboard from './RequesterDashboard';
import HospitalDashboard from './HospitalDashboard';
import BloodBankDashboard from './BloodBankDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'Donor':
      return <DonorDashboard />;
    case 'Requester':
      return <RequesterDashboard />;
    case 'HospitalStaff':
      return <HospitalDashboard />;
    case 'BloodBankStaff':
      return <BloodBankDashboard />;
    case 'Admin':
      return <AdminDashboard />;
    default:
      return <RequesterDashboard />;
  }
};

export default DashboardRouter;
