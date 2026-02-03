import api from './api';

export const recommendationService = {
  // AI 추천 요청
  async getAIRecommendations(userId, quizData) {
    try {
      const response = await api.post(`/recommendations/ai?userId=${userId}`, quizData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 추천 기록 조회
  async getRecommendationHistory(userId) {
    try {
      const response = await api.get(`/recommendations/history/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 피드백 제출
  async submitFeedback(recommendationId, userId, isHelpful, comment = '') {
    try {
      const response = await api.post(
        `/recommendations/${recommendationId}/feedback`,
        null,
        {
          params: { userId, isHelpful, comment }
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // 추천 클릭 추적
  async trackClick(recommendationId, userId, serviceId) {
    try {
      const response = await api.post(
        `/recommendations/${recommendationId}/click`,
        null,
        {
          params: { userId, serviceId }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Click tracking error:', error);
      // 클릭 추적 실패는 사용자에게 보여주지 않음 (UX 저해 방지)
    }
  },

  // AI 추천 스트리밍 (실시간 타이핑 효과)
  async getAIRecommendationsStream(userId, quizData, onChunk, onComplete, onError, signal) {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_BASE_URL}/recommendations/ai/stream?userId=${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(quizData),
          signal
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'message';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // 마지막 라인은 불완전할 수 있으므로 버퍼에 보관
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            const data = line.slice(5).trim();

            if (currentEvent === 'done') {
              if (onComplete) onComplete();
            } else if (currentEvent === 'error') {
              if (onError) onError(data);
            } else {
              if (onChunk) onChunk(data);
            }
            currentEvent = 'message';
          }
        }
      }

      return { success: true };
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Stream error:', error);
      if (onError) onError(error.message);
      throw error;
    }
  }
};