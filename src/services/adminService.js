import api from './api';

// 통계 API
export const getAdminStatistics = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};

// 사용자 관리 API
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId, data) => {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data;
};

export const deleteUser = async (userId) => {
  await api.delete(`/admin/users/${userId}`);
};

// 서비스 관리 API
export const getAllServices = async () => {
  const response = await api.get('/admin/services');
  return response.data;
};

export const getServiceById = async (serviceId) => {
  const response = await api.get(`/admin/services/${serviceId}`);
  return response.data;
};

export const createService = async (data) => {
  const response = await api.post('/admin/services', data);
  return response.data;
};

export const updateService = async (serviceId, data) => {
  const response = await api.put(`/admin/services/${serviceId}`, data);
  return response.data;
};

export const deleteService = async (serviceId) => {
  await api.delete(`/admin/services/${serviceId}`);
};

// 플랜 관리 API
export const getAllPlans = async () => {
  const response = await api.get('/admin/plans');
  return response.data;
};

export const getPlansByServiceId = async (serviceId) => {
  const response = await api.get(`/admin/plans/service/${serviceId}`);
  return response.data;
};

export const getPlanById = async (planId) => {
  const response = await api.get(`/admin/plans/${planId}`);
  return response.data;
};

export const createPlan = async (data) => {
  const response = await api.post('/admin/plans', data);
  return response.data;
};

export const updatePlan = async (planId, data) => {
  const response = await api.put(`/admin/plans/${planId}`, data);
  return response.data;
};

export const deletePlan = async (planId) => {
  await api.delete(`/admin/plans/${planId}`);
};