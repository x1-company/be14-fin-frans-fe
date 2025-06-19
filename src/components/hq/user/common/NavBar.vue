<template>
  <nav class="navbar">
    <div class="navbar__logo">FRANS</div>
    <div class="navbar__right">
      <ul class="navbar__menu">
        <li @click="selectMenuItem('대시보드')">인사관리</li>
      </ul>
      <img
        src="@/assets/notification.png"
        alt="알림"
        class="notification-icon"
      />
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
import { useAuthStore } from '@/stores/auth'
import UserInfo from '@/components/hq/common/UserInfo.vue';

const auth = useAuthStore()
const emit = defineEmits(["update-breadcrumb"]);

const selectMenuItem = (itemText) => {
  emit("update-breadcrumb", ["HOME", itemText]);
};
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #4066fa;
  color: #fff;
  padding: 0 32px;
  height: 48px;
  font-family: "NanumSquareOTF", sans-serif;
}
.navbar__logo {
  font-size: 1.3rem;
  font-weight: bold;
  letter-spacing: 2px;
  min-width: 120px;
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
  font-size: 1rem;
  font-weight: 400;
  color: #e6eaff;
  padding: 0 12px;
  transition: color 0.2s, font-weight 0.2s;
}
.navbar__menu li:hover {
  color: #fff;
  font-weight: bold;
}
.notification-icon {
  width: 23px;
  height: 20px;
  object-fit: contain;
}
</style>