<template>
  <nav class="navbar">
    <div class="navbar__logo">FRANS</div>
    <div class="navbar__right">
      <ul class="navbar__menu">
        <li @click="selectMenuItem('대시보드')">대시보드</li>
        <li @click="selectMenuItem('가맹점관리')">가맹점관리</li>
        <li @click="selectMenuItem('공급처관리')">공급처관리</li>
        <li @click="selectMenuItem('구매관리')">구매관리</li>
        <li @click="selectMenuItem('창고관리')">창고관리</li>
        <li @click="selectMenuItem('결재관리')">결재관리</li>
      </ul>
      <img
        src="@/assets/notification.png"
        alt="알림"
        class="notification-icon"
      />
      <span class="navbar__username">황수민 대리</span>
      <span class="navbar__user"></span>
    </div>
  </nav>
</template>

<script setup>
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
.navbar__username {
  font-size: 1rem;
  color: #fff;
  font-weight: 400;
}
.navbar__user {
  width: 32px;
  height: 32px;
  background: #e6f0ff;
  border-radius: 50%;
  display: inline-block;
}
</style>
