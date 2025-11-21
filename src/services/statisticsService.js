import api from './api';

export const statisticsService = {
  // 월별 지출 통계 조회
  async getMonthlyExpense(userId, year, month) {
    try {
      const response = await api.get(`/statistics/monthly/${userId}?year=${year}&month=${month}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 지출 분석 조회
  async getExpenseAnalysis(userId) {
    try {
      const response = await api.get(`/statistics/analysis/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 카테고리별 지출 통계
  async getCategoryExpenses(userId, year, month) {
    try {
      const monthlyData = await this.getMonthlyExpense(userId, year, month);
      return monthlyData.data?.categoryExpenses || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 연간 지출 트렌드
  async getYearlyTrend(userId, year) {
    try {
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyResponses = await Promise.all(
        months.map(async (month) => {
          const data = await this.getMonthlyExpense(userId, year, month);
          return {
            month,
            data,
          };
        })
      );

      return monthlyResponses.map(({ month, data }) => ({
        month,
        totalAmount: data.data?.totalAmount || 0,
        activeSubscriptions: data.data?.activeSubscriptions || 0,
      }));
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
