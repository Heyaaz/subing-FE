import api from './api';

export const serviceService = {
  // 모든 서비스 목록 조회
  async getAllServices() {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 서비스 ID로 조회
  async getServiceById(serviceId) {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 카테고리별 서비스 조회
  async getServicesByCategory(category) {
    try {
      const response = await api.get(`/services/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 서비스 비교
  async compareServices(serviceIds) {
    try {
      const response = await api.post('/services/compare', {
        serviceIds: serviceIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
