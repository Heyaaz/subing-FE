import api from './api';

// 리뷰 작성
export const createReview = async (data) => {
  const response = await api.post('/api/v1/reviews', data);
  return response.data;
};

// 서비스별 리뷰 목록 조회
export const getReviewsByService = async (serviceId) => {
  const response = await api.get(`/api/v1/reviews/service/${serviceId}`);
  return response.data;
};

// 내 리뷰 목록 조회
export const getMyReviews = async () => {
  const response = await api.get('/api/v1/reviews/my');
  return response.data;
};

// 리뷰 수정
export const updateReview = async (reviewId, data) => {
  const response = await api.put(`/api/v1/reviews/${reviewId}`, data);
  return response.data;
};

// 리뷰 삭제
export const deleteReview = async (reviewId) => {
  await api.delete(`/api/v1/reviews/${reviewId}`);
};

// 서비스 평균 평점 조회
export const getServiceRating = async (serviceId) => {
  const response = await api.get(`/api/v1/reviews/service/${serviceId}/rating`);
  return response.data;
};

// 사용자가 리뷰를 작성했는지 확인
export const checkUserReviewed = async (serviceId) => {
  const response = await api.get(`/api/v1/reviews/service/${serviceId}/check`);
  return response.data;
};