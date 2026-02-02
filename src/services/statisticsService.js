import api from './api';

function unwrapData(response) {
  const raw = response?.data;
  if (raw && typeof raw === 'object' && 'data' in raw) return raw.data;
  return raw;
}

export const statisticsService = {
  // 월별 지출 통계 조회
  async getMonthlyExpense(userId, year, month) {
    try {
      const response = await api.get(`/statistics/monthly?year=${year}&month=${month}`);
      return unwrapData(response);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 지출 분석 조회
  async getExpenseAnalysis(userId, year, month) {
    try {
      const response = await api.get(`/statistics/analysis?year=${year}&month=${month}`);
      return unwrapData(response);
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 카테고리별 지출 통계
  async getCategoryExpenses(userId, year, month) {
    try {
      const monthlyData = await this.getMonthlyExpense(userId, year, month);
      return monthlyData?.categoryExpenses || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 연간 지출 트렌드 (선택 연도가 올해면 현재 월까지만, 과거 연도면 1~12월)
  async getYearlyTrend(userId, year) {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const endMonth = year === currentYear ? currentMonth : 12;
      const months = Array.from({ length: endMonth }, (_, i) => i + 1);

      const results = await Promise.allSettled(
        months.map((month) => this.getMonthlyExpense(userId, year, month))
      );

      return results.map((result, index) => {
        const month = index + 1;
        const data = result.status === 'fulfilled' ? result.value : null;
        return {
          month,
          totalAmount: data?.totalAmount ?? 0,
          activeSubscriptions: data?.activeSubscriptions ?? 0,
        };
      });
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
