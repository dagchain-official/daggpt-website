import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Dashboard from './pages/Dashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ContentCreators from './pages/solutions/ContentCreators';
import Marketers from './pages/solutions/Marketers';
import Educators from './pages/solutions/Educators';
import Developers from './pages/solutions/Developers';
import Corporate from './pages/solutions/Corporate';
import Students from './pages/solutions/Students';
import GitHubCallback from './pages/auth/GitHubCallback';
import NetlifyCallback from './pages/auth/NetlifyCallback';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ProfessionalDashboard />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/old-landing" element={<LandingPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/solutions/content-creators" element={<ContentCreators />} />
            <Route path="/solutions/marketers" element={<Marketers />} />
            <Route path="/solutions/educators" element={<Educators />} />
            <Route path="/solutions/developers" element={<Developers />} />
            <Route path="/solutions/corporate" element={<Corporate />} />
            <Route path="/solutions/students" element={<Students />} />
            
            {/* OAuth Callbacks */}
            <Route path="/auth/github/callback" element={<GitHubCallback />} />
            <Route path="/auth/netlify/callback" element={<NetlifyCallback />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ai-chat" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/generate-image" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/generate-video" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/generate-music" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/build-website" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/build-webapp" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/social-media" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/content-creation" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/knowledge-base" element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
