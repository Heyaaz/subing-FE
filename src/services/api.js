import axios from 'axios';
import { setPostLoginRedirect } from '../utils/authFlow';

// Axios 인스턴스 생성
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - JWT 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const hasToken = !!localStorage.getItem('token');

    if (error.response?.status === 401 && hasToken && !error.config?.skipAuthRedirect) {
      // 토큰 및 사용자 정보 제거
      setPostLoginRedirect(`${window.location.pathname}${window.location.search}`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
