import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Alert } from '../components/common';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 필드별 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // IME 조합 중 이벤트 방지
  const handleCompositionStart = (e) => {
    e.target.composing = true;
  };

  const handleCompositionEnd = (e) => {
    e.target.composing = false;
    handleChange(e);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      clearError();
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 로고 */}
        <div className="flex justify-center">
          <img
            src="/Subing-logo.png"
            alt="Subing"
            className="h-48 w-auto object-contain"
          />
        </div>

        <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
          로그인
        </h2>
        <p className="text-center text-gray-600">
          구독 서비스를 쉽고 편하게 관리하세요
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border border-gray-100">
          {error && (
            <div className="mb-6">
              <Alert variant="error" onClose={clearError}>
                {error}
              </Alert>
            </div>
          )}

          {/* 간편 로그인 */}
          <button
            type="button"
            onClick={() => {
              const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
              const redirectUri = `${window.location.origin}/login/google/callback`;
              const scope = 'openid email profile';
              const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
              window.location.href = url;
            }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google로 로그인
          </button>

          {/* 구분선 */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  또는 이메일로 로그인
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="이메일"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="이메일을 입력하세요"
            />

            <Input
              label="비밀번호"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              error={errors.password}
              placeholder="비밀번호를 입력하세요"
            />

            <Button
              type="submit"
              variant="primary"
              size="base"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? '로그인하는 중...' : '로그인하기'}
            </Button>
          </form>

          {/* 회원가입 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  아직 계정이 없으신가요?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/signup">
                <Button
                  type="button"
                  variant="secondary"
                  size="base"
                  className="w-full"
                >
                  회원가입하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
