import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReportLostPage } from './pages/ReportLostPage';
import { WitnessReportPage } from './pages/WitnessReportPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { JourneyPage } from './pages/JourneyPage';
import { MatchesPage } from './pages/MatchesPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { StaffVerificationPage } from './pages/StaffVerificationPage';
import { LoginPage } from './pages/LoginPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-background text-textPrimary selection:bg-primary/20 selection:text-primary">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/report-lost" element={<ReportLostPage />} />
              <Route path="/report-witness" element={<WitnessReportPage />} />
              <Route path="/found-items" element={<FoundItemsPage />} />
              <Route path="/report-found" element={<FoundItemsPage />} />
              <Route path="/journey/:id" element={<JourneyPage />} />
              <Route path="/journey" element={<Navigate to="/journey/1" replace />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
              <Route path="/staff/verification" element={<StaffVerificationPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
