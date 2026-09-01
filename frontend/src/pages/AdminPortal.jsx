import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/admin/AdminLogin';
import ReportsQueue from '../components/admin/ReportsQueue';
import CapDispatchModal from '../components/admin/CapDispatchModal';

export default function AdminPortal() {
  const [authToken, setAuthToken] = useState(null);
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_jwt');
    if (token) {
      setAuthToken(token);
    }
  }, []);

  const handleLoginSuccess = (token) => {
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_jwt');
    setAuthToken(null);
  };

  return (
    <main className="dashboard-container" style={{ gridTemplateColumns: '1fr' }}>
      {!authToken ? (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onOpenCapModal={() => setIsCapModalOpen(true)}
        />
      ) : (
        <ReportsQueue onLogout={handleLogout} />
      )}

      <CapDispatchModal
        isOpen={isCapModalOpen}
        onClose={() => setIsCapModalOpen(false)}
      />
    </main>
  );
}
