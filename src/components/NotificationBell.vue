<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import notificationService from '@/lib/notificationService';
import { useRouter } from 'vue-router';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close']);

const notificationStore = useNotificationStore();
const router = useRouter();

// 계산된 속성
const notifications = computed(() => notificationStore.notifications);
const unreadCount = computed(() => notificationStore.unreadCount);
const hasUnreadNotifications = computed(() => notificationStore.hasUnreadNotifications);
const sortedNotifications = computed(() => notificationStore.sortedNotifications);
const isConnected = computed(() => notificationStore.isConnected);
const showRealtimeNotifications = computed(() => notificationStore.showRealtimeNotifications);

const closeDropdown = () => {
  emit('close');
};

// 실시간 알림 토글
const toggleRealtimeNotifications = () => {
  notificationStore.toggleRealtimeNotifications();
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
  
  handleNotificationNavigation(notification);
};

const handleNotificationNavigation = (notification) => {
  if (notification.url) {
    // url이 /로 시작하지 않고, status=...&url=... 형태라면 파싱
    if (!notification.url.startsWith('/') && notification.url.includes('url=')) {
      const params = new URLSearchParams(notification.url);
      const url = params.get('url');
      params.delete('url');
      const query = params.toString();
      router.push(query ? `${url}?${query}` : url);
      return;
    }
    router.push(notification.url);
  } else {
    // 알림 타입에 따라 적절한 페이지로 이동 (기존 fallback)
    switch (notification.type) {
      case 'ORDER_RESPONSE':
        console.log('주문 페이지로 이동');
        break;
      case 'APPROVAL_REQUEST':
        if (notification.approvalId) {
          router.push(`/approval/${notification.approvalId}`);
        } else {
          router.push('/approval');
        }
        break;
      case 'LOW_STOCK':
        console.log('재고 페이지로 이동');
        break;
      default:
        console.log('기본 페이지로 이동');
    }
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

<template>
  <!-- 알림 드롭다운 오버레이 -->
  <div v-if="isOpen" class="notification-overlay" @click="closeDropdown">
    <div class="notification-dropdown-container" @click.stop>
      <!-- 알림 드롭다운 -->
      <div class="notification-dropdown">
        <div class="dropdown-header">
          <!-- 실시간 알림 토글 스위치 (레이블이 위로 가는 구조) -->
          <div class="realtime-toggle-wrapper">
            <span class="toggle-label">실시간 알림</span>
            <div
              class="toggle-switch"
              :class="{ active: showRealtimeNotifications }"
              @click="toggleRealtimeNotifications"
              :title="
                showRealtimeNotifications
                  ? '실시간 알림 끄기'
                  : '실시간 알림 켜기'
              "
            >
              <div class="toggle-thumb"></div>
            </div>
          </div>

          <!-- 텍스트 액션 버튼 -->
          <div class="text-actions-wrapper">
            <span
              v-if="hasUnreadNotifications"
              @click="markAllAsRead"
              class="text-action"
              title="모두 읽음 처리"
            >
              모두 읽음
            </span>
            <span
              v-if="notifications.length > 0"
              @click="deleteAllRead"
              class="text-action"
              title="읽은 알림 삭제"
            >
              읽은 알림 삭제
            </span>
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
            :class="[
              'notification-item',
              notification.readAt ? 'read' : 'unread',
            ]"
            @click="handleNotificationClick(notification)"
          >
            <div class="card-border"></div>
            <div class="card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="#04C975" />
                <path
                  d="M12 7V13"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <circle cx="12" cy="17" r="1" fill="white" />
              </svg>
            </div>
            <div class="card-main-content">
              <div class="card-header">
                <span class="notification-time">{{
                  formatTime(notification.createdAt)
                }}</span>
              </div>
              <div class="card-body">
                <p class="notification-text">{{ notification.content }}</p>
              </div>
            </div>
            <!-- 삭제 버튼 (읽은 알림에만 표시) -->
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
  justify-content: flex-start; /* 왼쪽 정렬로 변경 */
  align-items: center;
  padding: 16px;
  gap: 24px; /* 요소 간 간격 */
  border-bottom: 1px solid #e9ecef;
}

/* 토글 스위치 */
.realtime-toggle-wrapper {
  display: flex;
  flex-direction: column; /* 라벨을 위로 올림 */
  align-items: center;
  gap: 4px;
}

.toggle-label {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  white-space: nowrap; /* 텍스트가 세로로 깨지는 현상 방지 */
}

.toggle-switch {
  position: relative;
  width: 44px; /* 크기 줄임 */
  height: 24px; /* 크기 줄임 */
  background-color: #e9e9eb;
  border-radius: 12px; /* 반지름도 비율에 맞게 */
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  flex-shrink: 0;
}

.toggle-switch.active {
  background-color: #04c975; /* 활성 상태 배경색 */
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px; /* 크기 줄임 */
  height: 20px; /* 크기 줄임 */
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease-in-out;
}

.toggle-switch.active .toggle-thumb {
  transform: translateX(20px); /* 이동 거리도 맞게 수정 */
}

/* 텍스트 액션 */
.text-actions-wrapper {
  display: flex;
  gap: 16px;
  margin-left: auto; /* 오른쪽으로 밀어냄 */
}

.text-action {
  font-size: 12px;
  font-weight: 500;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: font-weight 0.2s, color 0.2s;
}

.text-action:hover {
  font-weight: 700; /* 볼드체로 변경 */
  color: #000;
}

.notification-list {
  flex: 1;
  max-height: 400px;
  overflow-y: auto;
  background: #fdfdff;
  padding: 8px;
}

.empty-state {
  padding: 40px 16px;
  text-align: center;
  color: #888;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #888;
}

.notification-item {
  display: flex;
  align-items: flex-start; /* 세로 정렬 기준 */
  background-color: #fff;
  border: 1px solid #04c975; /* 진한 녹색 테두리 */
  border-radius: 8px;
  margin-bottom: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  overflow: hidden; /* For border-radius to apply to children */
}

.notification-item:hover {
  background-color: #f7f7f7;
}

.notification-item.unread {
  background-color: #f7fffd;
}

.notification-item.read {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.notification-item.read:hover {
  opacity: 1;
}

.card-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px; /* 두께 통일 */
  background-color: #04c975; /* 진한 녹색 */
  /* 둥근 모서리는 item에서 overflow:hidden으로 처리 */
}

.card-icon {
  padding: 16px 12px 16px 18px; /* 아이콘 주변 여백 원복 */
  display: flex;
  align-items: center;
  align-self: stretch; /* 아이콘 영역이 전체 높이를 차지하도록 */
}

.card-main-content {
  flex-grow: 1;
  padding: 16px 16px 16px 4px; /* 본문 여백 조정 */
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 10px;
  color: #888;
  margin-left: 8px;
  white-space: nowrap;
}

.card-body .notification-text {
  font-size: 12px;
  line-height: 1.5;
  color: #555;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 16px;
  color: #aaa;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
}

.delete-btn:hover {
  background-color: #396726;
  color: #333;
}
</style> 