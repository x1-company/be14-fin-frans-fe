<template>
    <div class="order-actions">
        <button class="order-register-btn">주문 등록</button>
    </div>
  </template>

<!-- <script setup>
const emit = defineEmits(['show-register-view']);

function goToOrderRegister () {
emit('show-register-view');
}
</script> -->

<style>
.order-register-btn {
    height: 36px;
    background: #4066fa;
    color: #fff;
    border-radius: 8px;
    padding: 0 22px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
</style>