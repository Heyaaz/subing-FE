import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Alert } from '../components/common';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const { signup, loading, error, clearError } = useAuth();
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

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 해요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 해요';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문, 숫자, 특수문자를 포함해야 해요';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않아요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      clearError();
      await signup({
        email: formData.email,
        name: formData.name,
        password: formData.password
      });
      navigate('/login');
    } catch (error) {
      console.error('Signup error:', error);
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
          회원가입
        </h2>
        <p className="text-center text-gray-600">
          구독 관리를 시작해보세요
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
              label="이름"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="이름을 입력하세요"
            />

            <Input
              label="비밀번호"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              error={errors.password}
              placeholder="비밀번호를 입력하세요"
            />

            <Input
              label="비밀번호 확인"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              error={errors.confirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
            />

            <Button
              type="submit"
              variant="primary"
              size="base"
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              {loading ? '가입하는 중...' : '가입하기'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  이미 계정이 있으신가요?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/login">
                <Button
                  type="button"
                  variant="secondary"
                  size="base"
                  className="w-full"
                >
                  로그인하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
