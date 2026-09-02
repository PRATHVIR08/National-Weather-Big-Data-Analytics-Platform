import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ConnectionProvider } from './context/ConnectionContext';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import ReportIncident from './pages/ReportIncident';
import AdminPortal from './pages/AdminPortal';
import './styles/global.css';
import './styles/map.css';

export default function App() {
  return (
    <ThemeProvider>
      <ConnectionProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report" element={<ReportIncident />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ConnectionProvider>
    </ThemeProvider>
  );
}
