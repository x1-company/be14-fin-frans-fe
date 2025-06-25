import { EventSourcePolyfill } from 'event-source-polyfill';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import api from './api';

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.isConnecting = false;
  }

  // SSE 연결 시작
  connect() {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    if (!authStore.accessToken) {
      console.log('SSE 연결 실패: 토큰이 없습니다.');
      return;
    }
    if (this.isConnecting) {
      console.log('SSE 연결이 이미 진행 중입니다.');
      return;
    }
    this.isConnecting = true;

    // 기존 연결이 있다면 명확하게 종료
    this.disconnect();

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const lastEventId = localStorage.getItem(`lastEventId_${authStore.decodedToken?.sub}`) || '';
    const url = `${API_BASE_URL}/api/notification/subscribe?lastEventId=${lastEventId}`;

    console.log('SSE 연결 시도:', url);

    this.eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
      heartbeatTimeout: 60000, // 1분
    });

    // 연결 성공
    this.eventSource.onopen = () => {
      console.log('SSE 연결 성공');
      this.isConnecting = false;
      notificationStore.setConnectionStatus(true);
    };

    // 'sse' 타입의 메시지만 처리
    this.eventSource.addEventListener('sse', event => {
      if (event.lastEventId) {
        localStorage.setItem(`lastEventId_${authStore.decodedToken?.sub}`, event.lastEventId);
      }
      try {
        if (event.data && event.data.startsWith('{')) {
          const parsedData = JSON.parse(event.data);
          notificationStore.addNotification(parsedData);
        }
      } catch (error) {
        console.error('SSE 메시지 파싱 오류:', error);
      }
    });

    this.eventSource.addEventListener('heartbeat', event => {
      console.debug('Heartbeat 수신:', event.data); // 보통 'ping'이 옴
    });

    // 에러 처리 (단순화된 로직)
    this.eventSource.onerror = async error => {
      console.error('SSE 연결 오류:', error);
      this.isConnecting = false;
      notificationStore.setConnectionStatus(false);
      this.disconnect(); // 오류 발생 시 현재 연결은 무조건 종료

      console.log('토큰 갱신 및 SSE 재연결을 시도합니다...');

      try {
        // ping을 통해 accessToken 재발급 시도
        await api.get('/api/auth/ping');
        console.log('토큰 재발급 성공. 1초 후 SSE 재연결을 시도합니다.');
        setTimeout(() => this.connect(), 1000);
      } catch (reissueError) {
        console.error(
          'API 호출을 통한 토큰 재발급 최종 실패. 재연결을 중단합니다.',
          reissueError,
        );
        // api.js의 인터셉터가 로그아웃을 처리하므로 여기서는 추가 작업 없음
      }
    };
  }

  // SSE 연결 해제
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('기존 SSE 연결을 종료했습니다.');
    }
    // isConnecting 상태도 초기화
    this.isConnecting = false;
    const notificationStore = useNotificationStore();
    if (notificationStore) {
      notificationStore.setConnectionStatus(false);
    }
  }

  // 알림 목록 조회 및 스토어 업데이트
  async fetchNotifications() {
    const notificationStore = useNotificationStore();
    try {
      const response = await api.get('/api/notification/list');
      notificationStore.setNotifications(response.data);
    } catch (error) {
      console.error('알림 목록 조회 실패:', error);
      throw error;
    }
  }

  // 특정 알림 읽음 처리
  async markAsRead(notificationId) {
    try {
      await api.patch(`/api/notification/${notificationId}/read`);
      // 성공 시 스토어 상태 직접 업데이트
      const notificationStore = useNotificationStore();
      notificationStore.markAsRead(notificationId);
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      throw error;
    }
  }

  // 전체 알림 읽음 처리
  async markAllAsRead() {
    const notificationStore = useNotificationStore();
    try {
      await api.patch('/api/notification/read-all');
      notificationStore.markAllAsRead();
    } catch (error) {
      console.error('전체 알림 읽음 처리 실패:', error);
      throw error;
    }
  }

  // 읽은 알림 전체 삭제
  async deleteAllRead() {
    const notificationStore = useNotificationStore();
    try {
      await api.delete('/api/notification/delete/read-all');
      notificationStore.clearReadNotifications();
    } catch (error) {
      console.error('읽은 알림 삭제 실패:', error);
      throw error;
    }
  }

  // 특정 알림 삭제
  async deleteNotification(notificationId) {
    const notificationStore = useNotificationStore();
    try {
      await api.delete(`/api/notification/delete/${notificationId}`);
      notificationStore.removeNotification(notificationId);
    } catch (error) {
      console.error('알림 삭제 실패:', error);
      throw error;
    }
  }
  
  // 로그아웃 시 정리
  cleanup() {
    this.disconnect();
    const notificationStore = useNotificationStore();
    notificationStore.reset();
    
    // lastEventId도 정리
    const authStore = useAuthStore();
    if (authStore.decodedToken?.sub) {
      localStorage.removeItem(`lastEventId_${authStore.decodedToken.sub}`);
    }
  }
}

// 싱글톤 인스턴스 생성
const notificationService = new NotificationService();

export default notificationService;