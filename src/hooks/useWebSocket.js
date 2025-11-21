import { useState, useEffect, useCallback } from 'react';
import webSocketService from '../services/webSocketService';

/**
 * WebSocket 연결 및 상태 관리 커스텀 훅
 * @param {string} userId - 사용자 ID
 * @returns {Object} WebSocket 연결 상태 및 제어 함수
 */
const useWebSocket = (userId) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * WebSocket 연결
   */
  const connect = useCallback(() => {
    if (!userId) {
      console.warn('userId가 없어 WebSocket 연결을 건너뜁니다.');
      return;
    }

    if (connected || connecting) {
      console.log('WebSocket이 이미 연결되었거나 연결 중입니다.');
      return;
    }

    setConnecting(true);
    setError(null);

    webSocketService.connect(
      // 연결 성공 시
      () => {
        console.log('WebSocket 연결 완료');
        setConnected(true);
        setConnecting(false);
        setError(null);
      },
      // 에러 발생 시
      (err) => {
        console.error('WebSocket 연결 실패:', err);
        setConnected(false);
        setConnecting(false);
        setError(err);
      }
    );
  }, [userId, connected, connecting]);

  /**
   * WebSocket 연결 해제
   */
  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setConnected(false);
    setConnecting(false);
    setError(null);
  }, []);

  /**
   * 알림 구독
   * @param {Function} onMessage - 알림 수신 시 콜백
   * @returns {Object} subscription 객체
   */
  const subscribeToNotifications = useCallback((onMessage) => {
    if (!connected) {
      console.warn('WebSocket이 연결되지 않았습니다. 먼저 connect()를 호출하세요.');
      return null;
    }

    return webSocketService.subscribeToNotifications(userId, onMessage);
  }, [userId, connected]);

  /**
   * 읽지 않은 알림 개수 구독
   * @param {Function} onMessage - 읽지 않은 알림 개수 수신 시 콜백
   * @returns {Object} subscription 객체
   */
  const subscribeToUnreadCount = useCallback((onMessage) => {
    if (!connected) {
      console.warn('WebSocket이 연결되지 않았습니다. 먼저 connect()를 호출하세요.');
      return null;
    }

    return webSocketService.subscribeToUnreadCount(userId, onMessage);
  }, [userId, connected]);

  /**
   * 구독 취소
   * @param {string} key - 구독 키
   */
  const unsubscribe = useCallback((key) => {
    webSocketService.unsubscribe(key);
  }, []);

  /**
   * 모든 구독 취소
   */
  const unsubscribeAll = useCallback(() => {
    webSocketService.unsubscribeAll();
  }, []);

  /**
   * 컴포넌트 언마운트 시 WebSocket 연결 해제
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    connecting,
    error,
    connect,
    disconnect,
    subscribeToNotifications,
    subscribeToUnreadCount,
    unsubscribe,
    unsubscribeAll
  };
};

export default useWebSocket;