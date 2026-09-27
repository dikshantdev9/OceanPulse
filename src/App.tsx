import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { SignUp } from './pages/auth/SignUp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { Detection } from './pages/Detection';
import { SatelliteImagery } from './pages/SatelliteImagery';
import { VesselTracking } from './pages/VesselTracking';
import { VesselCorrelation } from './pages/VesselCorrelation';
import { VesselDetail } from './pages/VesselDetail';
import { DriftBacktracking } from './pages/DriftBacktracking';
import { DetectionHistory } from './pages/DetectionHistory';
import { Analytics } from './pages/Analytics';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Direct Named Alias Routes (Protected) */}
          <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/app" replace /></ProtectedRoute>} />
          <Route path="/live-monitoring" element={<ProtectedRoute><Navigate to="/app/live" replace /></ProtectedRoute>} />
          <Route path="/oil-spill-detection" element={<ProtectedRoute><Navigate to="/app/detection" replace /></ProtectedRoute>} />
          <Route path="/satellite-imagery" element={<ProtectedRoute><Navigate to="/app/imagery" replace /></ProtectedRoute>} />
          <Route path="/ais-tracking" element={<ProtectedRoute><Navigate to="/app/ais" replace /></ProtectedRoute>} />
          <Route path="/vessel-analysis" element={<ProtectedRoute><Navigate to="/app/correlation" replace /></ProtectedRoute>} />
          <Route path="/detection-history" element={<ProtectedRoute><Navigate to="/app/history" replace /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Navigate to="/app/analytics" replace /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Navigate to="/app/reports" replace /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Navigate to="/app/settings" replace /></ProtectedRoute>} />

          {/* Protected Main Application Shell */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="live" element={<LiveMonitoring />} />
            <Route path="detection" element={<Detection />} />
            <Route path="imagery" element={<SatelliteImagery />} />
            <Route path="ais" element={<VesselTracking />} />
            <Route path="correlation" element={<VesselCorrelation />} />
            <Route path="vessels/:vesselId" element={<VesselDetail />} />
            <Route path="drift" element={<DriftBacktracking />} />
            <Route path="history" element={<DetectionHistory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}