import api from './api';

export const notificationService = {
  // 모든 알림 조회
  async getNotifications(userId) {
    try {
      const response = await api.get(`/notifications?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 읽지 않은 알림 조회
  async getUnreadNotifications(userId) {
    try {
      const response = await api.get(`/notifications/unread?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 읽지 않은 알림 개수 조회
  async getUnreadCount(userId) {
    try {
      const response = await api.get(`/notifications/unread-count?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 알림 읽음 처리
  async markAsRead(notificationId, userId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 모든 알림 읽음 처리
  async markAllAsRead(userId) {
    try {
      const response = await api.put(`/notifications/read-all?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};
