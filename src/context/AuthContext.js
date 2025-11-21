import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

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
  const [error, setError] = useState(null);

  // 컴포넌트 마운트 시 로컬스토리지에서 사용자 정보 확인
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 로그인 함수
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials);
      const userData = response.data; // 백엔드에서 직접 사용자 정보 반환
      
      setUser(userData);
      return response;
    } catch (error) {
      setError(error.message || '로그인에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 함수
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.signup(userData);
      return response;
    } catch (error) {
      setError(error.message || '회원가입에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  // 에러 초기화 함수
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
