import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { consumePostLoginRedirect } from '../utils/authFlow';

const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const hasCalledRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setErrorMessage('Google 로그인이 취소되었습니다.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (!code) {
      setErrorMessage('인증 코드를 찾을 수 없습니다.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const redirectUri = `${window.location.origin}/login/google/callback`;

    googleLogin(code, redirectUri)
      .then((response) => {
        const isNewUser = response?.data?.isNewUser || response?.data?.newUser;
        const redirectPath = consumePostLoginRedirect();
        navigate(redirectPath || (isNewUser ? '/recommendation/quiz' : '/dashboard'), { replace: true });
      })
      .catch((err) => {
        console.error('Google login error:', err);
        setErrorMessage(err?.data?.message || 'Google 로그인에 실패했습니다.');
        setTimeout(() => navigate('/login'), 3000);
      });
  }, [googleLogin, navigate]);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-red-500 text-lg mb-2">{errorMessage}</p>
          <p className="text-gray-500 text-sm">잠시 후 로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loading size="large" text="Google 로그인 중..." />
    </div>
  );
};

export default GoogleCallbackPage;
