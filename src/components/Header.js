import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useWebSocket from '../hooks/useWebSocket';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadCount } = useWebSocket();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { path: '/dashboard', label: '대시보드' },
    { path: '/subscriptions', label: '구독 관리' },
    { path: '/statistics', label: '통계' },
    { path: '/comparison', label: '비교' },
    { path: '/recommendation/quiz', label: '추천' },
    { path: '/budget', label: '예산' },
    { path: '/optimization', label: '최적화' },
    { path: '/tier', label: '티어' },
  ];

  // ADMIN 사용자에게만 관리자 메뉴 추가
  const isAdmin = user?.role === 'ADMIN';
  const allNavigationItems = isAdmin
    ? [...navigationItems, { path: '/admin', label: '관리자', isAdmin: true }]
    : navigationItems;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg transition-all duration-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* 로고 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                S
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">Subing</span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          {isAuthenticated && (
            <>
              <nav className="hidden md:flex items-center space-x-1">
                {allNavigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2.5 rounded-xl text-[15px] font-semibold transition-all duration-200 ${
                      location.pathname.startsWith(item.path)
                        ? 'bg-primary-50 text-primary-600'
                        : item.isAdmin
                        ? 'text-error-600 hover:text-error-700 hover:bg-error-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:flex items-center space-x-3 pl-6">
                {/* 알림 아이콘 */}
                <button
                  onClick={() => navigate('/notifications')}
                  className="relative p-2.5 text-gray-500 hover:text-gray-900 transition-colors duration-200 rounded-full hover:bg-gray-100"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <span className="text-[15px] text-gray-800 font-semibold px-2">
                  {user?.name}님
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-[14px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                >
                  로그아웃
                </button>
              </div>
            </>
          )}

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 bg-white/95 backdrop-blur-sm absolute left-0 right-0 px-4 shadow-lg rounded-b-2xl">
            <nav className="space-y-1">
              {allNavigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors duration-200 ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : item.isAdmin
                      ? 'text-error-600 hover:text-error-700 hover:bg-error-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-3.5 text-[15px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl"
              >
                <span>알림</span>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <div className="px-4 py-2 text-sm text-gray-500 font-medium">
                {user?.name}님으로 로그인됨
              </div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3.5 text-[15px] text-red-600 hover:bg-red-50 rounded-xl font-semibold"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
