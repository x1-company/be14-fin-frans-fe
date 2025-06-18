<template>
  <div class="realtime-notification-container">
    <RealtimeNotificationCard
      v-for="notification in activeNotifications"
      :key="notification.id"
      :notification="notification"
      :duration="5000"
      @close="removeNotification"
      @click="handleNotificationClick"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notification';
import RealtimeNotificationCard from './RealtimeNotificationCard.vue';

const notificationStore = useNotificationStore();
const activeNotifications = ref([]);
const processedNotificationIds = ref(new Set());

// 컴포넌트 마운트 시 초기화
onMounted(() => {
  // 기존 알림 ID들을 처리된 것으로 마킹
  notificationStore.notifications.forEach(notification => {
    processedNotificationIds.value.add(notification.id);
  });
});

// 새로운 알림이 추가될 때 실시간 알림으로 표시
watch(
  () => notificationStore.notifications,
  (newNotifications) => {
    // 실시간 알림이 비활성화되어 있으면 표시하지 않음
    if (!notificationStore.showRealtimeNotifications) {
      return;
    }

    // 새로운 알림 찾기 (처리되지 않은 알림)
    const newNotificationsList = newNotifications.filter(notification => 
      !processedNotificationIds.value.has(notification.id)
    );

    if (newNotificationsList.length > 0) {
      newNotificationsList.forEach(notification => {
        // 이미 표시 중인 알림이 아닌 경우에만 추가
        if (!activeNotifications.value.some(n => n.id === notification.id)) {
          activeNotifications.value.unshift(notification);
          
          // 최대 3개까지만 표시
          if (activeNotifications.value.length > 3) {
            activeNotifications.value = activeNotifications.value.slice(0, 3);
          }
        }
        
        // 처리된 것으로 마킹
        processedNotificationIds.value.add(notification.id);
      });
    }
  },
  { immediate: true, deep: true }
);

// 실시간 알림 설정 변경 감지
watch(
  () => notificationStore.showRealtimeNotifications,
  (enabled) => {
    if (!enabled) {
      // 실시간 알림이 비활성화되면 모든 활성 알림 제거
      activeNotifications.value = [];
    }
  }
);

const removeNotification = (notification) => {
  if (!notification || !notification.id) {
    return;
  }
  
  const index = activeNotifications.value.findIndex(n => n.id === notification.id);
  if (index !== -1) {
    activeNotifications.value.splice(index, 1);
  }
};

const handleNotificationClick = (notification) => {
  // 알림 클릭 시 처리 (필요시 추가 로직)
};
</script>

<style scoped>
.realtime-notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 3000;
  pointer-events: none;
}

.realtime-notification-container > * {
  pointer-events: auto;
}
</style> 