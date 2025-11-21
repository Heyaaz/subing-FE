import api from './api';

export const optimizationService = {
  // 전체 최적화 제안 조회
  async getOptimizationSuggestions(userId) {
    try {
      const response = await api.get(`/optimization/suggestions?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 중복 서비스 조회
  async getDuplicateServices(userId) {
    try {
      const response = await api.get(`/optimization/duplicates?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 저렴한 대안 조회
  async getCheaperAlternatives(userId) {
    try {
      const response = await api.get(`/optimization/alternatives?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
