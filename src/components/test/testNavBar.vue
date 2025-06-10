<script setup>
import { ref } from 'vue'

const user = ref({
  name: '홍길동 대리',
  avatar: '/placeholder.svg?height=32&width=32'
})
</script>

<template>
  <nav class="navbar">
    <div class="navbar-left">
      <h1 class="logo">FRANS</h1>
    </div>
    
    <div class="navbar-center">
      <div class="nav-links">
        <a href="#" class="nav-link">대시보드</a>
        <a href="#" class="nav-link">거래정보관리</a>
        <a href="#" class="nav-link active">공급처관리</a>
        <a href="#" class="nav-link">구매관리</a>
        <a href="#" class="nav-link">창고관리</a>
        <a href="#" class="nav-link">결제관리</a>
      </div>
    </div>
    
    <div class="navbar-right">
      <button class="search-btn">🔍</button>
      <div class="user-profile">
        <span class="user-name">{{ user.name }}</span>
        <img :src="user.avatar" :alt="user.name" class="user-avatar" />
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-left .logo {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.navbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.active {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 14px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}
</style>