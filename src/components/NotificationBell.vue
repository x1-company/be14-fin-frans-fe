<template>
  <!-- 알림 드롭다운 오버레이 -->
  <div v-if="isOpen" class="notification-overlay" @click="closeDropdown">
    <div class="notification-dropdown-container" @click.stop>
      <!-- 알림 드롭다운 -->
      <div class="notification-dropdown">
        <div class="dropdown-header">
          <h3>알림</h3>
          <div class="header-actions">
            <button 
              v-if="hasUnreadNotifications"
              @click="markAllAsRead" 
              class="action-btn"
              title="모두 읽음 처리"
            >
              모두 읽음
            </button>
            <button 
              v-if="notifications.length > 0"
              @click="deleteAllRead" 
              class="action-btn"
              title="읽은 알림 삭제"
            >
              읽은 알림 삭제
            </button>
          </div>
        </div>

        <!-- 알림 목록 -->
        <div class="notification-list">
          <div v-if="notifications.length === 0" class="empty-state">
            <p>새로운 알림이 없습니다.</p>
          </div>
          
          <div 
            v-for="notification in sortedNotifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.readAt }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-content">
              <p class="notification-text">{{ notification.content }}</p>
              <div class="notification-meta">
                <span class="notification-type">{{ getNotificationTypeText(notification.type) }}</span>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
            </div>
            
            <!-- 읽음 처리 버튼 -->
            <button 
              v-if="!notification.readAt"
              @click.stop="markAsRead(notification.id)"
              class="mark-read-btn"
              title="읽음 처리"
            >
              ✓
            </button>
            
            <!-- 삭제 버튼 -->
            <button 
              v-if="notification.readAt"
              @click.stop="deleteNotification(notification.id)"
              class="delete-btn"
              title="삭제"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import notificationService from '@/lib/notificationService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const notificationStore = useNotificationStore();

// 계산된 속성
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const hasUnreadNotifications = computed(() => notificationStore.hasUnreadNotifications);
const sortedNotifications = computed(() => notificationStore.sortedNotifications);
const isConnected = computed(() => notificationStore.isConnected);

const closeDropdown = () => {
  emit('close');
};

// ESC 키로 닫기
const onEsc = (e) => {
  if (e.key === 'Escape') {
    closeDropdown();
  }
};

// 라이프사이클 훅
onMounted(() => {
  document.addEventListener('keydown', onEsc);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onEsc);
});

const handleNotificationClick = (notification) => {
  if (!notification.readAt) {
    markAsRead(notification.id);
  }
  
  // 알림 타입에 따른 네비게이션 처리
  handleNotificationNavigation(notification);
};

const handleNotificationNavigation = (notification) => {
  // 알림 타입에 따라 적절한 페이지로 이동
  switch (notification.type) {
    case 'ORDER_RESPONSE':
      // 주문 관련 페이지로 이동
      console.log('주문 페이지로 이동');
      break;
    case 'APPROVAL_REQUEST':
      // 결재 관련 페이지로 이동
      console.log('결재 페이지로 이동');
      break;
    case 'LOW_STOCK':
      // 재고 관련 페이지로 이동
      console.log('재고 페이지로 이동');
      break;
    default:
      console.log('기본 페이지로 이동');
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
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  return date.toLocaleDateString();
};
</script>

<style scoped>
/* 오버레이 스타일 */
.notification-overlay {
  position: fixed;
  top: 0;
  right: 0;
  width: 18vw;
  min-width: 280px;
  max-width: 360px;
  height: 100vh;
  z-index: 2000;
  background: rgba(240, 242, 245, 0.7);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.notification-dropdown-container {
  width: 100%;
  margin: 20px;
}

/* 드롭다운 스타일 */
.notification-dropdown {
  width: 100%;
  max-height: 420px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 14px;
  box-shadow: 0 6px 24px 0 rgba(0,0,0,0.13);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #4066fa;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #4066fa;
  font-weight: 600;
}

.action-btn:hover {
  background-color: #e6eaff;
}

.notification-list {
  flex: 1;
  max-height: 340px;
  overflow-y: auto;
  background: #f7f9fb;
  padding: 0 0 8px 0;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.empty-state p {
  margin: 0;
  color: #888;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
  background: #fff;
  border-radius: 10px;
  margin: 8px 12px;
  box-shadow: 0 2px 8px 0 rgba(64,102,250,0.07);
}

.notification-item:hover {
  background-color: #f0f4ff;
  box-shadow: 0 4px 16px 0 rgba(64,102,250,0.10);
}

.notification-item.unread {
  border-left: 4px solid #4066fa;
  background-color: #f0f8ff;
}

.notification-item.unread:hover {
  background-color: #e6f3ff;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-text {
  margin: 0 0 4px 0;
  font-size: 15px;
  line-height: 1.5;
  color: #222;
  font-weight: 500;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.notification-type {
  background-color: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #4066fa;
  font-weight: 600;
}

.notification-time {
  color: #999;
  font-size: 12px;
}

.mark-read-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 15px;
  margin-left: 8px;
  transition: background-color 0.2s;
}

.mark-read-btn {
  color: #28a745;
}

.mark-read-btn:hover {
  background-color: #d4edda;
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background-color: #f8d7da;
}

/* 스크롤바 항상 보이게 */
.notification-list {
  scrollbar-width: thin;
  scrollbar-color: #b3b3b3 #f1f1f1;
}
.notification-list::-webkit-scrollbar {
  width: 8px;
  background: #f1f1f1;
}
.notification-list::-webkit-scrollbar-thumb {
  background: #b3b3b3;
  border-radius: 4px;
}
.notification-list::-webkit-scrollbar-thumb:hover {
  background: #888;
}
.notification-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}
</style> 