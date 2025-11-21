import api from './api';

export const budgetService = {
  // 예산 설정
  async setBudget(userId, year, month, monthlyLimit) {
    try {
      const response = await api.post(`/budgets?userId=${userId}`, {
        year,
        month,
        monthlyLimit
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 모든 예산 조회
  async getAllBudgets(userId) {
    try {
      const response = await api.get(`/budgets?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 현재 월 예산 조회
  async getCurrentMonthBudget(userId) {
    try {
      const response = await api.get(`/budgets/current?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 특정 년월 예산 조회
  async getBudget(userId, year, month) {
    try {
      const response = await api.get(`/budgets/${year}/${month}?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 예산 삭제
  async deleteBudget(budgetId, userId) {
    try {
      const response = await api.delete(`/budgets/${budgetId}?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
