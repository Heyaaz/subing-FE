import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Alert } from '../components/common';
import Loading from '../components/Loading';

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
