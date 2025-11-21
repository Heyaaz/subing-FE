import api from './api';

export const notificationSettingService = {
  // 모든 알림 설정 조회
  async getNotificationSettings(userId) {
    try {
      const response = await api.get(`/notification-settings?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 알림 설정 업데이트
  async updateNotificationSetting(userId, notificationType, isEnabled) {
    try {
      const response = await api.put(`/notification-settings?userId=${userId}`, {
        notificationType,
        isEnabled
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};