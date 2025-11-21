import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import SubscriptionPage from './pages/SubscriptionPage';
import StatisticsPage from './pages/StatisticsPage';
import ComparisonPage from './pages/ComparisonPage';
import QuizPage from './pages/QuizPage';
import RecommendationResultPage from './pages/RecommendationResultPage';
import StreamingRecommendationPage from './pages/StreamingRecommendationPage';
import RecommendationHistoryPage from './pages/RecommendationHistoryPage';
import NotificationPage from './pages/NotificationPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';
import BudgetPage from './pages/BudgetPage';
import OptimizationPage from './pages/OptimizationPage';
import TierPage from './pages/TierPage';
import ServiceReviewsPage from './pages/ServiceReviewsPage';
import PreferenceTestPage from './pages/preferences/PreferenceTestPage';
import PreferenceResultPage from './pages/preferences/PreferenceResultPage';
import PreferenceProfilePage from './pages/preferences/PreferenceProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import Loading from './components/Loading';

import PageTransition from './components/PageTransition';

// Private Route 컴포넌트
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="인증 확인 중..." />;
  }

  return isAuthenticated ? (
    <PageTransition key={location.pathname}>
      {children}
    </PageTransition>
  ) : (
    <Navigate to="/login" />
  );
};

// Public Route 컴포넌트 (로그인된 사용자는 대시보드로 리다이렉트)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading text="인증 확인 중..." />;
  }

  return !isAuthenticated ? (
    <PageTransition key={location.pathname}>
      {children}
    </PageTransition>
  ) : (
    <Navigate to="/dashboard" />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />

            {/* Private Routes with Header */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <Dashboard />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <SubscriptionPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <StatisticsPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/comparison"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <ComparisonPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/recommendation/quiz"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <QuizPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/recommendation/streaming"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <StreamingRecommendationPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/recommendation/result"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <RecommendationResultPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/recommendation/history"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <RecommendationHistoryPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <NotificationPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/notification-settings"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <NotificationSettingsPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/budget"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <BudgetPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/optimization"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <OptimizationPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/tier"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <TierPage />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/services/:serviceId/reviews"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <ServiceReviewsPage />
                  </div>
                </PrivateRoute>
              }
            />

            {/* Preference Test Routes */}
            <Route
              path="/preferences/test"
              element={
                <PrivateRoute>
                  <PreferenceTestPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/preferences/result"
              element={
                <PrivateRoute>
                  <PreferenceResultPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/preferences/profile"
              element={
                <PrivateRoute>
                  <div className="min-h-screen bg-gray-50">
                    <Header />
                    <PreferenceProfilePage />
                  </div>
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <AdminUsersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <PrivateRoute>
                  <AdminServicesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/plans"
              element={
                <PrivateRoute>
                  <AdminPlansPage />
                </PrivateRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
