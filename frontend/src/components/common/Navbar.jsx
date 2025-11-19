import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const Navbar = () => {
  const { user, isAuthenticated, isModerator, logout, mockLogin } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleMockLogin = (userType) => {
    mockLogin(userType);
    setShowUserMenu(false);
  };

  return (
    <nav className="card" style={{ 
      margin: 0, 
      borderRadius: 0, 
      borderTop: 'none', 
      borderLeft: 'none', 
      borderRight: 'none', 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container">
        <div className="flex justify-between items-center" style={{ padding: '1rem 0' }}>
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                ⭐
              </div>
              <h1 style={{ 
                fontSize: 'var(--font-size-2xl)', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                ReviewHub
              </h1>
            </Link>
          </div>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/"
              className={`btn btn-sm ${isActivePath('/') ? 'btn-primary' : 'btn-outline'}`}
              style={{ textDecoration: 'none' }}
            >
              🏠 Products
            </Link>

            {/* Moderator Navigation */}
            {isModerator() && (
              <>
                <Link
                  to="/moderation/queue"
                  className={`btn btn-sm ${isActivePath('/moderation/queue') ? 'btn-primary' : 'btn-outline'}`}
                  style={{ textDecoration: 'none' }}
                >
                  📋 Queue
                </Link>
                
                <Link
                  to="/moderation/flagged"
                  className={`btn btn-sm ${isActivePath('/moderation/flagged') ? 'btn-warning' : 'btn-outline'}`}
                  style={{ 
                    textDecoration: 'none',
                    borderColor: isActivePath('/moderation/flagged') ? 'var(--warning-color)' : 'var(--primary-color)'
                  }}
                >
                  🚩 Flagged
                </Link>
                
                <Link
                  to="/moderation/stats"
                  className={`btn btn-sm ${isActivePath('/moderation/stats') ? 'btn-success' : 'btn-outline'}`}
                  style={{ 
                    textDecoration: 'none',
                    borderColor: isActivePath('/moderation/stats') ? 'var(--success-color)' : 'var(--primary-color)'
                  }}
                >
                  📊 Stats
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            {isAuthenticated() ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 btn btn-secondary"
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600'
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{user.username}</span>
                    <span className={`badge ${user.role === 'moderator' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.7rem' }}>
                      {user.role === 'moderator' ? '🛡️ Moderator' : '👤 User'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem' }}>▼</span>
                </button>

                {showUserMenu && (
                  <div className="card" style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: 'var(--spacing-2)',
                    width: '200px',
                    zIndex: 60,
                    padding: 'var(--spacing-2)'
                  }}>
                    <div className="text-sm text-gray-600 mb-3 pb-2" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      Signed in as <strong>{user.username}</strong>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="btn btn-danger btn-sm w-full"
                    >
                      🚪 Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="btn btn-primary"
                >
                  🔑 Sign In
                </button>

                {showUserMenu && (
                  <div className="card" style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: 'var(--spacing-2)',
                    width: '200px',
                    zIndex: 60,
                    padding: 'var(--spacing-2)'
                  }}>
                    <div className="text-sm text-gray-600 mb-3 pb-2" style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      Demo Login
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleMockLogin('user')}
                        className="btn btn-outline btn-sm"
                      >
                        👤 Sign in as User
                      </button>
                      
                      <button
                        onClick={() => handleMockLogin('moderator')}
                        className="btn btn-success btn-sm"
                      >
                        🛡️ Sign in as Moderator
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                isActivePath('/') 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Products
            </Link>

            {isModerator() && (
              <>
                <Link
                  to="/moderation/queue"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath('/moderation/queue') 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-100'
                  }`}
                >
                  Queue
                </Link>
                
                <Link
                  to="/moderation/flagged"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath('/moderation/flagged') 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-100'
                  }`}
                >
                  Flagged
                </Link>
                
                <Link
                  to="/moderation/stats"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath('/moderation/stats') 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-100'
                  }`}
                >
                  Stats
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;