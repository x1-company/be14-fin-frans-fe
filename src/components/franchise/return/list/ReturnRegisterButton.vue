<template>
  <button class="return-register-btn" @click="$emit('click')">
    📦 반품 등록하기
  </button>
</template>

<script setup>
defineEmits(['click']);
</script>

<style scoped>
.return-register-btn {
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.return-register-btn:hover {
  background: #2746b6;
}
</style>