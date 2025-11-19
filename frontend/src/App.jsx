import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/common/Navbar.jsx';
import ProductList from './components/products/ProductList.jsx';
import ProductDetail from './components/products/ProductDetail.jsx';
import ModerationQueue from './components/moderation/ModerationQueue.jsx';
import FlaggedReviews from './components/moderation/FlaggedReviews.jsx';
import ModerationStats from './components/moderation/ModerationStats.jsx';
import { useAuth } from './hooks/useAuth.js';
import './index.css';

// Protected Route component for moderator-only pages
const ModeratorRoute = ({ children }) => {
  const { isModerator, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  
  return isModerator() ? children : <Navigate to="/" replace />;
};

// Main App Routes component (needs to be inside AuthProvider)
const AppRoutes = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mt-8">
        <div className="fade-in">
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          
          {/* Moderator Routes */}
          <Route 
            path="/moderation/queue" 
            element={
              <ModeratorRoute>
                <ModerationQueue />
              </ModeratorRoute>
            } 
          />
          <Route 
            path="/moderation/flagged" 
            element={
              <ModeratorRoute>
                <FlaggedReviews />
              </ModeratorRoute>
            } 
          />
          <Route 
            path="/moderation/stats" 
            element={
              <ModeratorRoute>
                <ModerationStats />
              </ModeratorRoute>
            } 
          />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App