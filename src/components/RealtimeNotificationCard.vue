<template>
  <Transition name="notification-slide">
    <div
      v-if="isVisible"
      class="realtime-notification-card"
      :class="{ unread: !notification.readAt }"
      @click="handleClick"
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
          <button 
            v-if="notification.readAt" 
            @click.stop="closeCard" 
            class="close-btn" 
            title="닫기"
          >
            ×
          </button>
        </div>

        <div class="card-body">
          <p class="notification-text">{{ notification.content }}</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import notificationService from '@/lib/notificationService';
import { useRouter } from 'vue-router';

const props = defineProps({
  notification: {
    type: Object,
    required: true,
  },
  duration: {
    type: Number,
    default: 4000, // 7초 후 자동으로 사라짐
  },
});

const emit = defineEmits(['close', 'click']);

const notificationStore = useNotificationStore();
const isVisible = ref(true);
const router = useRouter();

let autoHideTimer = null;

onMounted(() => {
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
  // 애니메이션 종료 후 emit
  setTimeout(() => {
    emit('close', props.notification);
  }, 300);
};

const markAsRead = async () => {
  try {
    if (!props.notification.readAt) {
      await notificationService.markAsRead(props.notification.id);
    }
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
};

const handleClick = () => {
  markAsRead();
  handleNotificationNavigation(props.notification);
  emit('click', props.notification);
  closeCard();
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
    // 알림 타입에 따라 적절한 페이지로 이동 (fallback)
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

const getNotificationTypeText = (type) => {
  const typeMap = {
    ABNORMAL_ORDER: '비정상 주문 알림',
    LOW_STOCK: '재고 부족 알림',
    APPROVAL_REQUEST: '결재 요청 알림',
    APPROVAL_RESPONSE: '결재 응답 알림',
    DELIVERY_INFO_RESPONSE: '납품 정보 알림',
    ABNORMAL_PRODUCT: '비정상 상품 알림',
    ORDER_RESPONSE: '주문 응답 알림',
    RETURN_REQUEST: '반품 요청 알림',
    RETURN_RESPONSE: '반품 응답 알림',
  };
  return typeMap[type] || type;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return '방금 전';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}일 전`;
};
</script>

<style scoped>
.realtime-notification-card {
  display: flex;
  align-items: flex-start;
  width: 380px;
  background: #ffffff;
  border: 1px solid #04c975; /* 진한 녹색 테두리 */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden; /* For border-radius to apply to children */
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.realtime-notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.card-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background-color: #04c975; /* 진한 녹색 */
}

.card-icon {
  padding: 16px 12px 16px 18px;
  display: flex;
  align-items: center;
}

.card-main-content {
  flex-grow: 1;
  padding: 16px 16px 16px 0;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #888;
  margin-left: 8px;
  white-space: nowrap;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #aaa;
  cursor: pointer;
  margin-left: auto;
  padding: 0 4px;
}

.close-btn:hover {
  color: #333;
}

.card-body .notification-text {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
  margin: 0;
  /* 여러 줄 자르기 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2; /* 2줄까지 표시 */
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 읽지 않은 알림 스타일 */
.realtime-notification-card.unread {
  border-color: #04C975; 
}

.realtime-notification-card.unread .card-border {
  background-color: #04C975;
}

.realtime-notification-card.unread .notification-time {
  color: #000;
}

/* 애니메이션 */
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.notification-slide-enter-from,
.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style> 