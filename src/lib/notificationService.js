import api from './api';
import { useNotificationStore } from '@/stores/notification';
import { useAuthStore } from '@/stores/auth';

class NotificationService {
  constructor() {
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1초
    this.maxReconnectDelay = 30000; // 30초
    this.abortController = null;
  }

  // SSE 연결 시작
  async connect() {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    if (!authStore.accessToken) {
      console.warn('토큰이 없어 SSE 연결을 시작할 수 없습니다.');
      return;
    }

    try {
      // 기존 연결이 있다면 정리
      this.disconnect();

      // 마지막 이벤트 ID 가져오기 (로컬 스토리지에서)
      const lastEventId = localStorage.getItem('lastEventId') || '';

      // AbortController 생성
      this.abortController = new AbortController();

      // fetch API를 사용한 SSE 연결
      const response = await fetch(
        `http://localhost:8080/api/notification/subscribe?lastEventId=${lastEventId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.accessToken}`,
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Last-Event-ID': lastEventId
          },
          signal: this.abortController.signal
        }
      );

      if (!response.ok) {
        throw new Error(`SSE 연결 실패: ${response.status}`);
      }

      console.log('SSE 연결이 성공적으로 열렸습니다.');
      notificationStore.setConnectionStatus(true);
      this.reconnectAttempts = 0;

      // 스트림 읽기
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // 스트림 처리
      this.processStream(reader, decoder, notificationStore);

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('SSE 연결이 중단되었습니다.');
        return;
      }
      
      console.error('SSE 연결 생성 실패:', error);
      notificationStore.setConnectionStatus(false);
      
      // 자동 재연결 시도
      this.handleReconnect();
    }
  }

  // 스트림 처리
  async processStream(reader, decoder, notificationStore) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('SSE 스트림이 종료되었습니다.');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // 'data: ' 제거
            
            if (data.trim()) {
              try {
                const parsedData = JSON.parse(data);
                console.log('SSE 메시지 수신:', parsedData);
                
                // 알림 데이터 처리
                if (parsedData.id && parsedData.content) {
                  notificationStore.addNotification(parsedData);
                }
              } catch (error) {
                console.error('SSE 메시지 파싱 오류:', error);
              }
            }
          } else if (line.startsWith('id: ')) {
            const eventId = line.slice(4);
            localStorage.setItem('lastEventId', eventId);
          }
        }
      }
    } catch (error) {
      console.error('스트림 처리 오류:', error);
      notificationStore.setConnectionStatus(false);
      this.handleReconnect();
    }
  }

  // 재연결 처리
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('최대 재연결 시도 횟수를 초과했습니다.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

    console.log(`${delay}ms 후 재연결을 시도합니다. (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // SSE 연결 해제
  disconnect() {
    const notificationStore = useNotificationStore();
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    
    notificationStore.setConnectionStatus(false);
    console.log('SSE 연결이 해제되었습니다.');
  }

  // 서버에 연결 해제 요청
  async disconnectFromServer() {
    try {
      await api.delete('/api/notification/disconnect');
      console.log('서버에서 SSE 연결이 해제되었습니다.');
    } catch (error) {
      console.error('서버 연결 해제 실패:', error);
    }
  }

  // 알림 목록 조회
  async fetchNotifications() {
    try {
      const response = await api.get('/api/notification/list');
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
      await api.delete('/api/notification/delete/read-all');
      const notificationStore = useNotificationStore();
      notificationStore.clearReadNotifications();
    } catch (error) {
      console.error('읽은 알림 삭제 실패:', error);
      throw error;
    }
  }

  // 특정 알림 삭제
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/api/notification/delete/${notificationId}`);
      const notificationStore = useNotificationStore();
      notificationStore.removeNotification(notificationId);
    } catch (error) {
      console.error('알림 삭제 실패:', error);
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