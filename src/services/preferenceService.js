import api from './api';

/**
 * 성향 테스트 관련 API 서비스
 */
const preferenceService = {
  /**
   * 질문 목록 조회
   * @returns {Promise} 질문 목록
   */
  getQuestions: () => {
    return api.get('/preferences/questions');
  },

  /**
   * 답변 제출 및 분석
   * @param {number} userId - 사용자 ID
   * @param {Object} data - 답변 데이터
   * @param {Array} data.answers - [{questionId: 1, optionId: 2}, ...]
   * @returns {Promise} 분석 결과 (프로필 타입, 점수 등)
   */
  submitAnswers: (userId, data) => {
    return api.post(`/preferences/submit?userId=${userId}`, data);
  },

  /**
   * 내 성향 프로필 조회
   * @param {number} userId - 사용자 ID
   * @returns {Promise} 프로필 데이터
   */
  getProfile: (userId) => {
    return api.get(`/preferences/profile?userId=${userId}`);
  },

  /**
   * 성향 프로필 삭제 (재검사 준비)
   * @param {number} userId - 사용자 ID
   * @returns {Promise}
   */
  deleteProfile: (userId) => {
    return api.delete(`/preferences/profile?userId=${userId}`);
  }
};

export default preferenceService;
