<template>
    <div class="order-actions">
        <button class="btn print" @click="handlePrint"><span class="icon">&#128424;</span> 주문서 출력</button>
        <button class="btn close" @click="handleClose"><span class="icon">&#10005;</span> 닫기</button>
    </div>
  </template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function handleClose() {
  router.push({ path: '/franchise', query: { tab: '주문관리' } });
}

function handlePrint() {
  // 주문서 출력 기능은 아직 구현되지 않았습니다.
  alert('주문서 출력 기능은 준비 중입니다.');
}

</script>

<style scoped>
.order-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin: 60px -30px -70px 0;
}
.btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn.print,
.btn.close {
  color: #1976d2;
  border-color: #bbdefb;
}
.btn:hover {
  background: #f5faff;
}
.icon {
  font-size: 18px;
  vertical-align: middle;
}
</style>