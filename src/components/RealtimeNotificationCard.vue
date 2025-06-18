<template>
  <Transition name="notification-slide">
    <div 
      v-if="isVisible" 
      class="realtime-notification-card"
      :class="{ 'unread': !notification.readAt }"
    >
      <div class="card-header">
        <div class="notification-type-badge">
          {{ getNotificationTypeText(notification.type) }}
        </div>
        <button @click="closeCard" class="close-btn" title="닫기">
          ×
        </button>
      </div>
      
      <div class="card-content">
        <p class="notification-text">{{ notification.content }}</p>
        <div class="notification-meta">
          <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
        </div>
      </div>
      
      <div class="card-actions">
        <button @click="markAsRead" class="action-btn read-btn">
          읽음 처리
        </button>
        <button @click="handleClick" class="action-btn view-btn">
          보기
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import notificationService from '@/lib/notificationService';

const props = defineProps({
  notification: {
    type: Object,
    required: true
  },
  duration: {
    type: Number,
    default: 5000 // 5초 후 자동으로 사라짐
  }
});

const emit = defineEmits(['close', 'click']);

const notificationStore = useNotificationStore();
const isVisible = ref(true);

// 자동으로 사라지는 타이머
let autoHideTimer = null;

onMounted(() => {
  // 자동으로 사라지는 타이머 설정
  if (props.duration > 0) {
    autoHideTimer = setTimeout(() => {
      closeCard();
    }, props.duration);
  }
});

const closeCard = () => {
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
  }
  isVisible.value = false;
  emit('close', props.notification);
};

const markAsRead = async () => {
  try {
    await notificationService.markAsRead(props.notification.id);
    closeCard();
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
};

const handleClick = () => {
  if (!props.notification.readAt) {
    markAsRead();
  }
  
  // 알림 타입에 따른 네비게이션 처리
  handleNotificationNavigation(props.notification);
  emit('click', props.notification);
  closeCard();
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
.realtime-notification-card {
  position: relative;
  width: 320px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border-left: 4px solid #4066fa;
  margin-bottom: 12px;
}

.realtime-notification-card.unread {
  border-left-color: #4066fa;
  background: linear-gradient(135deg, #f0f8ff 0%, #fff 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.notification-type-badge {
  background: #4066fa;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
  color: #333;
}

.card-content {
  padding: 12px 16px;
}

.notification-text {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  font-weight: 500;
}

.notification-meta {
  display: flex;
  justify-content: flex-end;
}

.notification-time {
  color: #666;
  font-size: 12px;
}

.card-actions {
  display: flex;
  gap: 8px;
  padding: 8px 16px 12px 16px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.action-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.read-btn {
  background: #e9ecef;
  color: #495057;
}

.read-btn:hover {
  background: #dee2e6;
}

.view-btn {
  background: #4066fa;
  color: white;
}

.view-btn:hover {
  background: #3658d9;
}

/* 애니메이션 */
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.3s ease;
}

.notification-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-slide-enter-to,
.notification-slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style> 