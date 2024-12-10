import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../src/components/layout/Sidebar.tsx';
import Navbar from '../../../src/components/layout/Navbar.tsx';
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle} from "@coreui/react";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1">
        <Navbar username={user.username} />
        <main className="p-6">
          <h2 className="text-2xl font-semibold">Welcome, {user.username}!</h2>
          {/* Add your dashboard content here */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;