import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import { useAuthStore } from "@/stores/auth";

// 사용자별 삭제된 알림 ID를 관리하는 함수들
const getDeletedIdsKey = () => {
  const authStore = useAuthStore();
  return authStore.userName ? `deleted_notifications_${authStore.userName}` : null;
};

const getDeletedIdsFromStorage = (key) => {
  if (!key) return new Set();
  try {
    const storedIds = localStorage.getItem(key);
    return storedIds ? new Set(JSON.parse(storedIds)) : new Set();
  } catch (e) {
    console.error("삭제된 알림 ID 파싱 실패:", e);
    return new Set();
  }
};

const saveDeletedIdsToStorage = (key, ids) => {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.error("삭제된 알림 ID 저장 실패:", e);
  }
};

export const useNotificationStore = defineStore("notification", () => {
  // --- STATE ---
  const _notifications = ref([]);
  const _unreadCount = ref(0);
  const _isConnected = ref(false);
  const _showRealtimeNotifications = ref(true);
  const _deletedIds = ref(new Set());

  // --- GETTERS ---
  const notifications = readonly(_notifications);
  const unreadCount = readonly(_unreadCount);
  const isConnected = readonly(_isConnected);
  const showRealtimeNotifications = readonly(_showRealtimeNotifications);
  const hasUnreadNotifications = computed(() => _unreadCount.value > 0);
  const deletedIds = readonly(_deletedIds);

  const sortedNotifications = computed(() => {
    return [..._notifications.value].sort((a, b) => {
      if (a.readAt === null && b.readAt !== null) return -1;
      if (a.readAt !== null && b.readAt === null) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  });

  const setNotifications = (freshNotifications) => {
    
    // 개발 환경에서만 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 서버에서 받은 알림 개수:', freshNotifications.length);
    }
    
    // 서버에서 이미 삭제된 알림은 반환되지 않으므로 필터링 불필요
    const validNotifications = freshNotifications;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 표시할 알림 개수:', validNotifications.length);
    }
    
    _notifications.value = validNotifications;
    _unreadCount.value = validNotifications.filter((n) => !n.readAt).length;
  };

  const addNotification = (notification) => {

    const existingNotification = _notifications.value.find(n => n.id === notification.id);
    if (existingNotification) {
      console.log('중복 알림 무시:', notification.id);
      return;
    }
    
    console.log('새 알림 추가:', notification.id, notification.content);
    _notifications.value.unshift(notification);
    if (!notification.readAt) {
      _unreadCount.value++;
    }
  };

  const removeNotification = (notificationId) => {

    console.log('알림 삭제됨:', notificationId);

    const index = _notifications.value.findIndex(
      (n) => n.id === notificationId
    );
    if (index !== -1) {
      if (!_notifications.value[index].readAt) {
        _unreadCount.value = Math.max(0, _unreadCount.value - 1);
      }
      _notifications.value.splice(index, 1);
    }
  };

  const clearReadNotifications = () => {
    const readNotifications = _notifications.value.filter(n => n.readAt);
    if (readNotifications.length === 0) return;
    
    console.log('읽은 알림들 삭제됨:', readNotifications.length, '개');

    _notifications.value = _notifications.value.filter(n => !n.readAt);
  };

  const markAsRead = (notificationId) => {
    const notification = _notifications.value.find(
      (n) => n.id === notificationId
    );
    if (notification && !notification.readAt) {
      notification.readAt = new Date().toISOString();
      _unreadCount.value = Math.max(0, _unreadCount.value - 1);
    }
  };

  const markAllAsRead = () => {
    _notifications.value.forEach((notification) => {
      if (!notification.readAt) {
        notification.readAt = new Date().toISOString();
      }
    });
    _unreadCount.value = 0;
  };

  const reset = () => {
    _notifications.value = [];
    _unreadCount.value = 0;
    _isConnected.value = false;
    _showRealtimeNotifications.value = true;
  };

  const setConnectionStatus = (status) => {
    _isConnected.value = status;
  };
  
  const toggleRealtimeNotifications = () => {
    _showRealtimeNotifications.value = !_showRealtimeNotifications.value;
  };

  return {
    notifications,
    unreadCount,
    isConnected,
    showRealtimeNotifications,
    hasUnreadNotifications,
    sortedNotifications,
    deletedIds,
    setNotifications,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
    setConnectionStatus,
    toggleRealtimeNotifications,
    reset,
  };
}); 