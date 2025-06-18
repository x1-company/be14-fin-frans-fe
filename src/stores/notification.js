import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useNotificationStore = defineStore("notification", () => {
  // 상태
  const notifications = ref([]);
  const unreadCount = ref(0);
  const isConnected = ref(false);
  const eventSource = ref(null);

  // 게터
  const hasUnreadNotifications = computed(() => unreadCount.value > 0);
  
  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      // 읽지 않은 알림을 먼저 표시
      if (a.readAt === null && b.readAt !== null) return -1;
      if (a.readAt !== null && b.readAt === null) return 1;
      // 생성 시간 역순으로 정렬
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  });

  // 액션
  const addNotification = (notification) => {
    // 중복 알림 방지
    const exists = notifications.value.some(n => n.id === notification.id);
    if (!exists) {
      notifications.value.unshift(notification);
      if (!notification.readAt) {
        unreadCount.value++;
      }
    }
  };

  const updateNotification = (notificationId, updates) => {
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications.value[index];
      const wasUnread = !notification.readAt;
      
      Object.assign(notification, updates);
      
      // 읽음 상태가 변경된 경우 카운트 업데이트
      if (wasUnread && notification.readAt) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      } else if (!wasUnread && !notification.readAt) {
        unreadCount.value++;
      }
    }
  };

  const removeNotification = (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications.value[index];
      if (!notification.readAt) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
      notifications.value.splice(index, 1);
    }
  };

  const setNotifications = (newNotifications) => {
    notifications.value = newNotifications;
    unreadCount.value = newNotifications.filter(n => !n.readAt).length;
  };

  const markAsRead = (notificationId) => {
    updateNotification(notificationId, {
      readAt: new Date().toISOString()
    });
  };

  const markAllAsRead = () => {
    notifications.value.forEach(notification => {
      if (!notification.readAt) {
        notification.readAt = new Date().toISOString();
      }
    });
    unreadCount.value = 0;
  };

  const clearReadNotifications = () => {
    notifications.value = notifications.value.filter(n => !n.readAt);
  };

  const setConnectionStatus = (status) => {
    isConnected.value = status;
  };

  const setEventSource = (source) => {
    eventSource.value = source;
  };

  const reset = () => {
    notifications.value = [];
    unreadCount.value = 0;
    isConnected.value = false;
    eventSource.value = null;
  };

  return {
    // 상태
    notifications,
    unreadCount,
    isConnected,
    eventSource,
    
    // 게터
    hasUnreadNotifications,
    sortedNotifications,
    
    // 액션
    addNotification,
    updateNotification,
    removeNotification,
    setNotifications,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
    setConnectionStatus,
    setEventSource,
    reset
  };
}); 