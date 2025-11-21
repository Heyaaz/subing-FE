import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// 환경 변수에서 WebSocket URL 가져오기
const WS_URL = process.env.REACT_APP_WS_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3초
    this.subscriptions = new Map();
  }

  /**
   * WebSocket 연결
   * @param {Function} onConnected - 연결 성공 시 콜백
   * @param {Function} onError - 에러 발생 시 콜백
   */
  connect(onConnected, onError) {
    if (this.connected) {
      console.log('WebSocket이 이미 연결되어 있습니다.');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${WS_URL}/ws`),

      connectHeaders: {},

      debug: (str) => {
        console.log('[WebSocket Debug]', str);
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame) => {
        console.log('WebSocket 연결 성공:', frame);
        this.connected = true;
        this.reconnectAttempts = 0;

        if (onConnected) {
          onConnected();
        }
      },

      onStompError: (frame) => {
        console.error('STOMP 에러:', frame);
        this.connected = false;

        if (onError) {
          onError(frame);
        }
      },

      onWebSocketClose: (event) => {
        console.log('WebSocket 연결 종료:', event);
        this.connected = false;
        this.handleReconnect(onConnected, onError);
      },

      onWebSocketError: (event) => {
        console.error('WebSocket 에러:', event);
        this.connected = false;

        if (onError) {
          onError(event);
        }
      }
    });

    this.client.activate();
  }

  /**
   * 재연결 처리
   */
  handleReconnect(onConnected, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`WebSocket 재연결 시도 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect(onConnected, onError);
      }, this.reconnectDelay);
    } else {
      console.error('WebSocket 재연결 최대 시도 횟수 초과');
      if (onError) {
        onError(new Error('재연결 실패'));
      }
    }
  }

  /**
   * 특정 사용자의 알림 구독
   * @param {string} userId - 사용자 ID
   * @param {Function} onMessage - 메시지 수신 시 콜백
   * @returns {Object} subscription 객체
   */
  subscribeToNotifications(userId, onMessage) {
    if (!this.client || !this.connected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return null;
    }

    const destination = `/user/${userId}/queue/notifications`;

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('알림 수신:', notification);

        if (onMessage) {
          onMessage(notification);
        }
      } catch (error) {
        console.error('알림 파싱 에러:', error);
      }
    });

    this.subscriptions.set('notifications', subscription);
    console.log(`알림 구독 완료: ${destination}`);

    return subscription;
  }

  /**
   * 읽지 않은 알림 개수 구독
   * @param {string} userId - 사용자 ID
   * @param {Function} onMessage - 메시지 수신 시 콜백
   * @returns {Object} subscription 객체
   */
  subscribeToUnreadCount(userId, onMessage) {
    if (!this.client || !this.connected) {
      console.error('WebSocket이 연결되지 않았습니다.');
      return null;
    }

    const destination = `/user/${userId}/queue/unread-count`;

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const unreadCount = parseInt(message.body, 10);
        console.log('읽지 않은 알림 개수 수신:', unreadCount);

        if (onMessage) {
          onMessage(unreadCount);
        }
      } catch (error) {
        console.error('읽지 않은 알림 개수 파싱 에러:', error);
      }
    });

    this.subscriptions.set('unread-count', subscription);
    console.log(`읽지 않은 알림 개수 구독 완료: ${destination}`);

    return subscription;
  }

  /**
   * 구독 취소
   * @param {string} key - 구독 키 ('notifications' 또는 'unread-count')
   */
  unsubscribe(key) {
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(key);
      console.log(`구독 취소: ${key}`);
    }
  }

  /**
   * 모든 구독 취소
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe();
      console.log(`구독 취소: ${key}`);
    });
    this.subscriptions.clear();
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect() {
    if (this.client) {
      this.unsubscribeAll();
      this.client.deactivate();
      this.connected = false;
      this.reconnectAttempts = 0;
      console.log('WebSocket 연결 해제');
    }
  }

  /**
   * 연결 상태 확인
   * @returns {boolean}
   */
  isConnected() {
    return this.connected;
  }
}

// 싱글톤 인스턴스
const webSocketService = new WebSocketService();

export default webSocketService;