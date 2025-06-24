import api from './api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';
import { EventSourcePolyfill } from 'event-source-polyfill';

class NotificationService {
  constructor() {
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1초
    this.maxReconnectDelay = 30000; // 30초
    this.abortController = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectTimeout = null;
    this.eventSource = null;
  }

  // SSE 연결 시작
  async connect() {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    // 이미 연결 중이거나 연결되어 있으면 중단
    if (this.isConnecting || this.isConnected) {
      console.log('SSE 이미 연결 중이거나 연결됨, 중단');
      return;
    }

    // 토큰이 없거나 유효하지 않으면 연결하지 않음
    if (!authStore.accessToken || !authStore.decodedToken) {
      console.log('SSE 연결 실패: 토큰이 없거나 유효하지 않음');
      return;
    }

    // 토큰 만료 확인
    if (authStore.decodedToken.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= authStore.decodedToken.exp) {
        console.log('SSE 연결 실패: 토큰이 만료됨');
        authStore.clearAccessToken();
        return;
      }
    }

    this.isConnecting = true;

    try {
      // 기존 연결 해제
      this.disconnect();

      // 마지막 이벤트 ID 가져오기 (사용자별로 구분)
      const currentUserId = authStore.decodedToken.sub || authStore.decodedToken.userId;
      const lastEventIdKey = `lastEventId_${currentUserId}`;
      const lastEventId = localStorage.getItem(lastEventIdKey) || '';

      // 환경변수에서 API URL 가져오기 (개발/배포 환경 구분)
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const url = `${API_BASE_URL}/api/notification/subscribe?lastEventId=${lastEventId}`;

      console.log('SSE 연결 시도:', url);
      console.log('현재 사용자 ID:', currentUserId);
      console.log('마지막 이벤트 ID:', lastEventId);

      // EventSourcePolyfill을 사용한 SSE 연결
      this.eventSource = new EventSourcePolyfill(url, {
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Last-Event-ID': lastEventId
        },
        withCredentials: true,
        heartbeatTimeout: 30000, // 30초
        connectionTimeout: 10000  // 10초
      });

      // 연결 성공 이벤트
      this.eventSource.onopen = (event) => {
        console.log('SSE 연결 성공');
        this.isConnected = true;
        this.isConnecting = false;
        notificationStore.setConnectionStatus(true);
        this.reconnectAttempts = 0;
      };

      // 메시지 수신 이벤트
      this.eventSource.onmessage = (event) => {
        try {
          if (event.data) {
            const parsedData = JSON.parse(event.data);
            this.handleNotificationMessage(parsedData, notificationStore, authStore);
          }
        } catch (error) {
          console.error('SSE 메시지 파싱 오류:', error, '원본 데이터:', event.data);
        }
      };

      // 에러 처리
      this.eventSource.onerror = (event) => {
        console.error('SSE 연결 오류:', event);
        this.isConnected = false;
        this.isConnecting = false;
        notificationStore.setConnectionStatus(false);

        // 401 에러인 경우 토큰 만료로 간주
        if (event.status === 401) {
          console.log('토큰 만료로 인한 SSE 연결 해제');
          authStore.clearAccessToken();
          this.disconnect();
          return;
        }

        // 네트워크 오류인 경우 재연결 시도
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.handleReconnect();
        }
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('SSE 연결 생성 실패:', error);
      notificationStore.setConnectionStatus(false);
      
      // 자동 재연결 시도 (로그인 시에는 재연결하지 않음)
      if (this.reconnectAttempts > 0) {
        this.handleReconnect();
      }
    }
  }

  // 알림 메시지 처리
  handleNotificationMessage(parsedData, notificationStore, authStore) {
    // 알림 데이터 처리 - 현재 사용자의 알림인지 확인
    if (parsedData.id && parsedData.content) {
      // 사용자 ID가 포함되어 있다면 현재 사용자의 것인지 확인
      if (parsedData.userId && authStore.decodedToken) {
        const currentUserId = authStore.decodedToken.sub || authStore.decodedToken.userId;
        if (parsedData.userId !== currentUserId) {
          console.log('다른 사용자의 알림 무시:', parsedData.userId, '현재:', currentUserId);
          return;
        }
      }
      
      // 이미 존재하는 알림인지 확인
      const existingNotifications = notificationStore.notifications;
      const isDuplicate = existingNotifications.some(n => n.id === parsedData.id);
      if (isDuplicate) {
        console.log('중복 알림 무시:', parsedData.id);
        return;
      }
      
      // 사용자 ID가 없거나 현재 사용자의 것이라면 처리
      console.log('새 알림 추가:', parsedData.id, parsedData.content);
      notificationStore.addNotification(parsedData);
    }
  }

  // 재연결 처리
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('최대 재연결 시도 횟수를 초과했습니다.');
      return;
    }

    // 이미 재연결 타이머가 있다면 취소
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    console.log(`SSE 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts} (${delay}ms 후)`);

    this.reconnectTimeout = setTimeout(() => {
      // 재연결 시도 전에 연결 상태 확인
      if (!this.isConnected && !this.isConnecting) {
        console.log('SSE 재연결 시도 중...');
        this.connect();
      }
    }, delay);
  }

  // SSE 연결 해제
  disconnect() {
    const notificationStore = useNotificationStore();
    
    // 재연결 타이머가 있다면 취소
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
    notificationStore.setConnectionStatus(false);
  }

  // 서버에 연결 해제 요청
  async disconnectFromServer() {
    try {
      await api.delete('/api/notification/disconnect');
      console.log('서버에서 SSE 연결이 해제되었습니다.');
    } catch (error) {
      // 401 오류는 토큰이 이미 만료되었거나 로그아웃된 상태이므로 무시
      if (error.response && error.response.status === 401) {
        console.log('토큰이 만료되어 서버 연결 해제를 건너뜁니다.');
        return;
      }
      console.error('서버 연결 해제 실패:', error);
    }
  }

  // 알림 목록 조회
  async fetchNotifications() {
    try {
      const response = await api.get('/api/notification/list');
      console.log('서버에서 받은 알림 목록:', response.data);
      
      const notificationStore = useNotificationStore();
      notificationStore.setNotifications(response.data);
      return response.data;
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      throw error;
    }
  }

  // 특정 알림 읽음 처리
  async markAsRead(notificationId) {
    try {
      await api.patch(`/api/notification/${notificationId}/read`);
      const notificationStore = useNotificationStore();
      notificationStore.markAsRead(notificationId);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      throw error;
    }
  }

  // 전체 알림 읽음 처리
  async markAllAsRead() {
    try {
      await api.patch('/api/notification/read-all');
      const notificationStore = useNotificationStore();
      notificationStore.markAllAsRead();
    } catch (error) {
      console.error('전체 알림 읽음 처리 실패:', error);
      throw error;
    }
  }

  // 읽은 알림 전체 삭제
  async deleteAllRead() {
    try {
      console.log('읽은 알림 전체 삭제 API 호출 시작');
      const response = await api.delete('/api/notification/delete/read-all');
      console.log('읽은 알림 전체 삭제 API 응답:', response);
      
      const notificationStore = useNotificationStore();
      notificationStore.clearReadNotifications();
    } catch (error) {
      console.error('읽은 알림 삭제 실패:', error);
      console.error('에러 응답:', error.response);
      throw error;
    }
  }

  // 특정 알림 삭제
  async deleteNotification(notificationId) {
    try {
      console.log('알림 삭제 API 호출 시작:', notificationId);
      const response = await api.delete(`/api/notification/delete/${notificationId}`);
      console.log('알림 삭제 API 응답:', response);
      
      const notificationStore = useNotificationStore();
      notificationStore.removeNotification(notificationId);
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      console.error('에러 응답:', error.response);
      throw error;
    }
  }

  // 로그아웃 시 정리
  async cleanup() {
    this.disconnect();
    await this.disconnectFromServer();
    
    const notificationStore = useNotificationStore();
    notificationStore.reset();
    
    // 로컬 스토리지 정리
    localStorage.removeItem('lastEventId');
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService();

export default notificationService;