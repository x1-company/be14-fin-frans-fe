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

  // --- ACTIONS ---

  const setNotifications = (freshNotifications) => {
    // 현재 사용자의 삭제된 ID 목록 로드
    const key = getDeletedIdsKey();
    _deletedIds.value = getDeletedIdsFromStorage(key);
    
    console.log('삭제된 알림 ID 목록:', Array.from(_deletedIds.value));
    console.log('서버에서 받은 알림 개수:', freshNotifications.length);
    
    // 삭제된 알림을 제외하고 필터링
    const validNotifications = freshNotifications.filter(
      (n) => !_deletedIds.value.has(n.id)
    );
    
    console.log('필터링된 알림 개수:', validNotifications.length);
    
    _notifications.value = validNotifications;
    _unreadCount.value = validNotifications.filter((n) => !n.readAt).length;
  };

  const addNotification = (notification) => {
    // 이미 존재하는 알림이거나 삭제된 알림인지 확인
    const existingNotification = _notifications.value.find(n => n.id === notification.id);
    if (existingNotification || _deletedIds.value.has(notification.id)) {
      console.log('중복 또는 삭제된 알림 무시:', notification.id);
      return;
    }
    
    console.log('새 알림 추가:', notification.id, notification.content);
    _notifications.value.unshift(notification);
    if (!notification.readAt) {
      _unreadCount.value++;
    }
  };

  const removeNotification = (notificationId) => {
    // 삭제된 ID 목록에 추가하고 저장
    _deletedIds.value.add(notificationId);
    const key = getDeletedIdsKey();
    saveDeletedIdsToStorage(key, _deletedIds.value);
    
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
    
    // 읽은 알림들을 삭제된 ID 목록에 추가
    readNotifications.forEach(n => _deletedIds.value.add(n.id));
    const key = getDeletedIdsKey();
    saveDeletedIdsToStorage(key, _deletedIds.value);
    
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
    // 삭제된 ID 목록은 유지 (사용자별로 영구 저장)
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