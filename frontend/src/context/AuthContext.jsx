import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    if (userId && userRole && username) {
      setUser({
        id: parseInt(userId),
        username,
        role: userRole,
      });
    }
    setLoading(false);
  }, []);

  // Login function (mock implementation)
  const login = (userData) => {
    const userObj = {
      id: userData.id,
      username: userData.username,
      role: userData.role,
    };

    setUser(userObj);
    
    // Store in localStorage
    localStorage.setItem('userId', userData.id.toString());
    localStorage.setItem('userRole', userData.role);
    localStorage.setItem('username', userData.username);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null;
  };

  // Check if user is a moderator
  const isModerator = () => {
    return user && user.role === 'moderator';
  };

  // Check if user is a regular user
  const isUser = () => {
    return user && user.role === 'user';
  };

  // Mock login with predefined users for demo purposes
  const mockLogin = (userType = 'user') => {
    const mockUsers = {
      user: {
        id: 1,
        username: 'alice_johnson',
        role: 'user',
      },
      moderator: {
        id: 11,
        username: 'mod_sarah',
        role: 'moderator',
      },
    };

    const userData = mockUsers[userType] || mockUsers.user;
    login(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    mockLogin,
    isAuthenticated,
    isModerator,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;