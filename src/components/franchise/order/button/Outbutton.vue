<template>
    <!-- <div class="order-actions"> -->
        <button class="btn close" @click="handleClose"><span class="icon">&#10005;</span> 닫기</button>
    <!-- </div> -->
  </template>

<script setup>
const emit = defineEmits(['close']);

function handleClose() {
  emit('close');
}
</script>

<style scoped>
/* .order-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin: 60px -30px -70px 0;
} */
.btn {
    padding: 6px 13px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: #fff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border 0.15s;
    display: flex;
    align-items: center;
    gap: 5px;
    color: #1976d2;
    border-color: #bbdefb;
    margin-top: -20px;
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
  font-size: 16px;
  vertical-align: middle;
}
</style>