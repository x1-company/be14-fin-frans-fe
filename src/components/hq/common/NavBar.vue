<template>
  <nav class="navbar">
    <div class="navbar__logo">
      <img src="@/assets/FRANS_bar_logo.png" alt="FRANS Logo" style="height: 28px;" />
    </div>
    <div class="navbar__right">
      <ul class="navbar__menu">
        <li :class="{ active: activeMenu === '가맹점관리' }" @click="navigateToHqFranchise">가맹점관리</li>
        <li :class="{ active: activeMenu === '공급처관리' }" @click="navigateToSupplier">공급처관리</li>
        <li :class="{ active: activeMenu === '구매관리' }" @click="navigateToPurchase">구매관리</li>
        <li :class="{ active: activeMenu === '결재관리' }" @click="navigateToApproval">결재관리</li>
      </ul>
      <div class="notification-wrapper" ref="notificationWrapper">
        <img
          src="@/assets/notification.png"
          alt="알림"
          class="notification-icon"
          @click="toggleNotificationBell"
        />
        <NotificationBell
          :isOpen="isNotificationBellOpen"
          @close="isNotificationBellOpen = false"
        />
      </div>
      <UserInfo
        :userName="auth.userName"
        :positionName="auth.positionName"
        :userProfileUrl="auth.userProfileUrl"
        :userSignUrl="auth.userSignUrl"
      />
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from "vue-router";
import UserInfo from "./UserInfo.vue";
import NotificationBell from "@/components/NotificationBell.vue";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const emit = defineEmits(["update-breadcrumb"]);

const isNotificationBellOpen = ref(false);
const notificationWrapper = ref(null);

const activeMenu = computed(() => {
  const path = route.path;
  if (path.startsWith('/hq/franchise')) return '가맹점관리';
  if (path.startsWith('/hq-supplier')) return '공급처관리';
  if (path.startsWith('/purchase')) return '구매관리';
  if (path.startsWith('/approval')) return '결재관리';
  return '';
});

const navigateToWarehouse = () => {
  router.push("/warehouse");
  emit("update-breadcrumb", ["HOME", "창고관리"]);
};

const navigateToApproval = () => {
  router.push("/approval");
  emit("update-breadcrumb", ["HOME", "결재관리"]);
};

const navigateToSupplier = () => {
  router.push("/hq-supplier");
  emit("update-breadcrumb", ["HOME", "공급처관리"]);
};

const navigateToPurchase = () => {
  router.push('/purchase');
  emit('update-breadcrumb', ['HOME', '구매관리']);
};

const navigateToHqFranchise = () => {
  router.push('/hq/franchise');
  emit('update-breadcrumb', ['HOME', '가맹점관리']);
}

const toggleNotificationBell = () => {
  isNotificationBellOpen.value = !isNotificationBellOpen.value;
};

const handleClickOutside = (event) => {
  if (
    notificationWrapper.value &&
    !notificationWrapper.value.contains(event.target)
  ) {
    isNotificationBellOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #4066fa;
  color: #fff;
  padding: 0 15px;
  height: 42px;
  /* font-family: "NanumSquareOTF", sans-serif; */
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  justify-content: flex-end;
}
.navbar__menu {
  display: flex;
  align-items: center;
  gap: 24px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.navbar__menu li {
  cursor: pointer;
  font-size: 0.98rem;
  font-weight: 600;
  color: #b2c5ff;
  padding: 0 12px;
  /* transition: color 0.2s; */
}
.navbar__menu li:hover {
  color: #fff;
  font-weight: 750;
}
.navbar__menu li.active {
  color: #fff;
  font-weight: 750;
}
.notification-icon {
  width: 23px;
  height: 19px;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s;
}

.notification-wrapper {
  position: relative;
  cursor: pointer;
}

.notification-wrapper:hover .notification-icon {
  opacity: 0.8;
}

.notification-icon.has-notifications {
  filter: brightness(1.2);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff6b6b;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 9px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #4066fa;
}

/* 알림 드롭다운 스타일 */
.notification-container {
  position: relative;
  display: inline-block;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-height: 420px;
  background: #fff;
  border: 1.5px solid #e0e0e0;
  border-radius: 14px;
  box-shadow: 0 6px 24px 0 rgba(0, 0, 0, 0.13);
  z-index: 1000;
  overflow: hidden;
  margin-top: 12px;
  padding: 0;
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
  font-size: 13px;
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
  padding: 32px 16px;
  text-align: center;
  color: #666;
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
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.07);
}

.notification-item:hover {
  background-color: #f0f4ff;
  box-shadow: 0 4px 16px 0 rgba(64, 102, 250, 0.1);
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
  font-size: 12px;
  line-height: 1.5;
  color: #222;
  font-weight: 500;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: #666;
}

.notification-type {
  background-color: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  color: #4066fa;
  font-weight: 600;
}

.notification-time {
  color: #999;
  font-size: 10px;
}

.mark-read-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 8px;
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