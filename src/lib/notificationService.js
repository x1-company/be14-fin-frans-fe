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
    this.isConnecting = false;
    this.isConnected = false;
    this.reconnectTimeout = null;
  }

  // SSE 연결 시작
  async connect() {
    const authStore = useAuthStore();
    const notificationStore = useNotificationStore();

    // 이미 연결 중이거나 연결되어 있으면 중단
    if (this.isConnecting || this.isConnected) {
      return;
    }

    // 토큰이 없거나 유효하지 않으면 연결하지 않음
    if (!authStore.accessToken || !authStore.decodedToken) {
      return;
    }

    this.isConnecting = true;

    try {
      // 기존 연결 해제
      this.disconnect();

      // 마지막 이벤트 ID 가져오기 (로컬 스토리지에서)
      const lastEventId = localStorage.getItem('lastEventId') || '';

      // AbortController 생성
      this.abortController = new AbortController();

      const url = `http://localhost:8080/api/notification/subscribe?lastEventId=${lastEventId}`;

      console.log('SSE 연결 시도:', url);

      // fetch API를 사용한 SSE 연결
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.accessToken}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Last-Event-ID': lastEventId
        },
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`SSE 연결 실패: ${response.status} ${response.statusText}`);
      }

      console.log('SSE 연결 성공');

      this.isConnected = true;
      this.isConnecting = false;
      notificationStore.setConnectionStatus(true);
      this.reconnectAttempts = 0;

      // 스트림 읽기
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // 스트림 처리
      this.processStream(reader, decoder, notificationStore);

    } catch (error) {
      this.isConnecting = false;
      
      if (error.name === 'AbortError') {
        console.log('SSE 연결이 의도적으로 중단됨');
        return;
      }
      
      console.error('SSE 연결 생성 실패:', error);
      notificationStore.setConnectionStatus(false);
      
      // 자동 재연결 시도 (로그인 시에는 재연결하지 않음)
      if (this.reconnectAttempts > 0) {
        this.handleReconnect();
      }
    }
  }

  // 스트림 처리
  async processStream(reader, decoder, notificationStore) {
    try {
      let buffer = '';
      const authStore = useAuthStore();
      
      console.log('SSE 스트림 처리 시작');
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('SSE 스트림 정상 종료');
          this.isConnected = false;
          notificationStore.setConnectionStatus(false);
          
          // 스트림이 정상적으로 종료된 경우 재연결 시도
          if (!this.abortController?.signal.aborted) {
            console.log('SSE 재연결 시도 예정');
            this.handleReconnect();
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split('\n');
        
        // 마지막 라인은 완전하지 않을 수 있으므로 버퍼에 보관
        buffer = lines.pop() || '';

        for (const line of lines) {
          // data: 라인 처리 (공백 제거 후 확인)
          if (line.trim().startsWith('data:')) {
            const data = line.substring(line.indexOf('data:') + 5).trim();
            
            if (data) {
              // JSON 형식인지 확인 (중괄호로 시작하는지)
              if (data.startsWith('{')) {
                try {
                  const parsedData = JSON.parse(data);
                  
                  // 알림 데이터 처리 - 현재 사용자의 알림인지 확인
                  if (parsedData.id && parsedData.content) {
                    // 🚀 하드 삭제 방식: 삭제된 ID 체크 제거
                    // const notificationStore = useNotificationStore();
                    // if (notificationStore.deletedIds.has(parsedData.id)) {
                    //   console.log('삭제된 알림 무시 (SSE):', parsedData.id);
                    //   continue;
                    // }
                    
                    // 사용자 ID가 포함되어 있다면 현재 사용자의 것인지 확인
                    if (parsedData.userId && authStore.decodedToken) {
                      const currentUserId = authStore.decodedToken.sub || authStore.decodedToken.userId;
                      if (parsedData.userId !== currentUserId) {
                        console.log('다른 사용자의 알림 무시:', parsedData.userId, '현재:', currentUserId);
                        continue;
                      }
                    }
                    
                    // 이미 존재하는 알림인지 확인
                    const existingNotifications = notificationStore.notifications;
                    const isDuplicate = existingNotifications.some(n => n.id === parsedData.id);
                    if (isDuplicate) {
                      console.log('중복 알림 무시 (SSE):', parsedData.id);
                      continue;
                    }
                    
                    // 사용자 ID가 없거나 현재 사용자의 것이라면 처리
                    console.log('새 알림 추가 (SSE):', parsedData.id, parsedData.content);
                    notificationStore.addNotification(parsedData);
                  }
                } catch (error) {
                  console.error('SSE 메시지 파싱 오류:', error, '원본 데이터:', data);
                }
              }
            }
          } 
          // id: 라인 처리
          else if (line.trim().startsWith('id:')) {
            const eventId = line.substring(line.indexOf('id:') + 3).trim();
            localStorage.setItem('lastEventId', eventId);
          } 
          // event: 라인 처리
          else if (line.trim().startsWith('event:')) {
            // 이벤트 타입 정보는 필요시 사용
            const eventType = line.substring(line.indexOf('event:') + 6).trim();
            if (eventType === 'heartbeat') {
              console.log('Heartbeat 수신됨');
            }
          } 
          // 빈 라인 처리
          else if (line.trim() === '') {
            // 빈 라인 무시
          }
          // JSON이 별도 라인으로 오는 경우 처리
          else if (line.trim() && line.trim().startsWith('{')) {
            try {
              const parsedData = JSON.parse(line.trim());
              
              // 알림 데이터 처리 - 현재 사용자의 알림인지 확인
              if (parsedData.id && parsedData.content) {
                // 🚀 하드 삭제 방식: 삭제된 ID 체크 제거
                // const notificationStore = useNotificationStore();
                // if (notificationStore.deletedIds.has(parsedData.id)) {
                //   console.log('삭제된 알림 무시 (SSE):', parsedData.id);
                //   continue;
                // }
                
                // 사용자 ID가 포함되어 있다면 현재 사용자의 것인지 확인
                if (parsedData.userId && authStore.decodedToken) {
                  const currentUserId = authStore.decodedToken.sub || authStore.decodedToken.userId;
                  if (parsedData.userId !== currentUserId) {
                    console.log('다른 사용자의 알림 무시 (별도 라인):', parsedData.userId, '현재:', currentUserId);
                    continue;
                  }
                }
                
                // 이미 존재하는 알림인지 확인
                const existingNotifications = notificationStore.notifications;
                const isDuplicate = existingNotifications.some(n => n.id === parsedData.id);
                if (isDuplicate) {
                  console.log('중복 알림 무시 (SSE, 별도 라인):', parsedData.id);
                  continue;
                }
                
                // 사용자 ID가 없거나 현재 사용자의 것이라면 처리
                console.log('새 알림 추가 (SSE, 별도 라인):', parsedData.id, parsedData.content);
                notificationStore.addNotification(parsedData);
              }
            } catch (error) {
              console.error('SSE JSON 라인 파싱 오류:', error, '원본 라인:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('SSE 스트림 처리 오류:', error);
      console.error('오류 타입:', error.name);
      console.error('오류 메시지:', error.message);
      
      this.isConnected = false;
      notificationStore.setConnectionStatus(false);
      
      // AbortError는 정상적인 연결 해제이므로 오류로 처리하지 않음
      if (error.name === 'AbortError') {
        console.log('SSE 스트림이 의도적으로 중단됨');
        return;
      }
      
      // 네트워크 오류인 경우 재연결 시도
      if (error.name === 'TypeError' && error.message.includes('network error')) {
        console.log('네트워크 오류로 인한 재연결 시도');
        this.handleReconnect();
      } else {
        // AbortError가 아닌 경우에만 재연결 시도
        if (error.name !== 'AbortError') {
          console.log('일반 오류로 인한 재연결 시도');
          this.handleReconnect();
        }
      }
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
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
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