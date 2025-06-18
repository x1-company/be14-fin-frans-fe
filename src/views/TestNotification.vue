<template>
  <div class="test-notification">
    <h1>알림 시스템 테스트</h1>
    
    <div class="test-section">
      <h2>연결 상태</h2>
      <div class="status-info">
        <p>SSE 연결 상태: 
          <span :class="{ 'connected': isConnected, 'disconnected': !isConnected }">
            {{ isConnected ? '연결됨' : '연결 끊김' }}
          </span>
        </p>
        <p>읽지 않은 알림: {{ unreadCount }}개</p>
        <p>전체 알림: {{ notifications.length }}개</p>
      </div>
    </div>

    <div class="test-section">
      <h2>실시간 알림 테스트</h2>
      <div class="realtime-test">
        <div class="status-info">
          <p>실시간 알림 상태: 
            <span :class="{ 'enabled': showRealtimeNotifications, 'disabled': !showRealtimeNotifications }">
              {{ showRealtimeNotifications ? '활성화' : '비활성화' }}
            </span>
          </p>
        </div>
        <div class="action-buttons">
          <button @click="toggleRealtimeNotifications" class="btn btn-primary">
            {{ showRealtimeNotifications ? '실시간 알림 끄기' : '실시간 알림 켜기' }}
          </button>
          <button @click="addTestNotification" class="btn btn-success">
            테스트 알림 추가
          </button>
          <button @click="simulateSSENotification" class="btn btn-warning">
            SSE 시뮬레이션
          </button>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>알림 관리</h2>
      <div class="action-buttons">
        <button @click="refreshNotifications" class="btn btn-primary">
          알림 새로고침
        </button>
        <button @click="markAllAsRead" class="btn btn-success" :disabled="!hasUnreadNotifications">
          모두 읽음 처리
        </button>
        <button @click="deleteAllRead" class="btn btn-warning" :disabled="!hasReadNotifications">
          읽은 알림 삭제
        </button>
        <button @click="reconnectSSE" class="btn btn-info">
          SSE 재연결
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>알림 목록</h2>
      <div class="notification-list">
        <div v-if="notifications.length === 0" class="empty-state">
          <p>알림이 없습니다.</p>
        </div>
        
        <div 
          v-for="notification in sortedNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.readAt }"
        >
          <div class="notification-content">
            <h4>{{ notification.content }}</h4>
            <p class="notification-meta">
              <span class="type">{{ getNotificationTypeText(notification.type) }}</span>
              <span class="time">{{ formatTime(notification.createdAt) }}</span>
              <span class="status">{{ notification.readAt ? '읽음' : '읽지 않음' }}</span>
            </p>
          </div>
          
          <div class="notification-actions">
            <button 
              v-if="!notification.readAt"
              @click="markAsRead(notification.id)"
              class="btn btn-sm btn-success"
            >
              읽음
            </button>
            <button 
              @click="deleteNotification(notification.id)"
              class="btn btn-sm btn-danger"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import notificationService from '@/lib/notificationService';

const notificationStore = useNotificationStore();

// 계산된 속성
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const hasUnreadNotifications = computed(() => notificationStore.hasUnreadNotifications);
const sortedNotifications = computed(() => notificationStore.sortedNotifications);
const isConnected = computed(() => notificationStore.isConnected);
const showRealtimeNotifications = computed(() => notificationStore.showRealtimeNotifications);

const hasReadNotifications = computed(() => {
  return notifications.value.some(n => n.readAt);
});

// 메서드
const refreshNotifications = async () => {
  try {
    await notificationService.fetchNotifications();
  } catch (error) {
    console.error('알림 새로고침 실패:', error);
  }
};

const markAsRead = async (notificationId) => {
  try {
    await notificationService.markAsRead(notificationId);
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead();
  } catch (error) {
    console.error('전체 알림 읽음 처리 실패:', error);
  }
};

const deleteNotification = async (notificationId) => {
  try {
    await notificationService.deleteNotification(notificationId);
  } catch (error) {
    console.error('알림 삭제 실패:', error);
  }
};

const deleteAllRead = async () => {
  try {
    await notificationService.deleteAllRead();
  } catch (error) {
    console.error('읽은 알림 삭제 실패:', error);
  }
};

const reconnectSSE = async () => {
  try {
    await notificationService.connect();
  } catch (error) {
    console.error('SSE 재연결 실패:', error);
  }
};

const toggleRealtimeNotifications = () => {
  notificationStore.toggleRealtimeNotifications();
};

const addTestNotification = () => {
  const testNotification = {
    id: Date.now().toString(),
    content: `테스트 알림 ${new Date().toLocaleTimeString()}`,
    type: 'ORDER_RESPONSE',
    createdAt: new Date().toISOString(),
    readAt: null
  };
  
  notificationStore.addNotification(testNotification);
};

const simulateSSENotification = () => {
  // SSE로 받은 것처럼 시뮬레이션
  const testNotification = {
    id: `sse-${Date.now()}`,
    content: `SSE 시뮬레이션 알림 ${new Date().toLocaleTimeString()}`,
    type: 'ORDER_RESPONSE',
    createdAt: new Date().toISOString(),
    readAt: null
  };
  
  console.log('SSE 시뮬레이션 알림 생성:', testNotification);
  notificationStore.addNotification(testNotification);
};

const getNotificationTypeText = (type) => {
  const typeMap = {
    'ABNORMAL_ORDER': '비정상 주문',
    'LOW_STOCK': '재고 부족',
    'APPROVAL_REQUEST': '결재 요청',
    'APPROVAL_RESPONSE': '결재 응답',
    'DELIVERY_INFO_RESPONSE': '납품 정보',
    'ABNORMAL_PRODUCT': '비정상 상품',
    'ORDER_RESPONSE': '주문 응답',
    'RETURN_REQUEST': '반품 요청',
    'RETURN_RESPONSE': '반품 응답'
  };
  return typeMap[type] || type;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR');
};
</script>

<style scoped>
.test-notification {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.test-notification h1 {
  color: #333;
  margin-bottom: 32px;
  text-align: center;
}

.test-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h2 {
  color: #555;
  margin-bottom: 16px;
  font-size: 18px;
}

.status-info p {
  margin: 8px 0;
  font-size: 14px;
}

.status-info .connected {
  color: #28a745;
  font-weight: bold;
}

.status-info .disconnected {
  color: #dc3545;
  font-weight: bold;
}

.status-info .enabled {
  color: #28a745;
  font-weight: bold;
}

.status-info .disabled {
  color: #dc3545;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #1e7e34;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background-color: #117a8b;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #666;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.notification-content h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.notification-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.notification-meta .type {
  background-color: #e9ecef;
  padding: 2px 6px;
  border-radius: 12px;
}

.notification-meta .status {
  font-weight: bold;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.realtime-test {
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .test-notification {
    padding: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .notification-actions {
    align-self: flex-end;
  }
}
</style> 