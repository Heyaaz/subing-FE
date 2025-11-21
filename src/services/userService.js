import api from './api';

export const userService = {
  // 사용자 티어 정보 조회
  async getUserTierInfo(userId) {
    try {
      const response = await api.get(`/users/${userId}/tier-info`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 티어 업그레이드
  async upgradeTier(userId, newTier) {
    try {
      const response = await api.put(`/users/${userId}/upgrade-tier`, null, {
        params: { newTier }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
