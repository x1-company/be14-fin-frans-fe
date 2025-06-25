<template>
  <div>
    <router-view />
    <!-- <RealtimeNotificationContainer /> -->
    <ToastContainer />
  </div>
</template>

<script setup>
import RealtimeNotificationContainer from "@/components/RealtimeNotificationContainer.vue";
import ToastContainer from "./components/common/ToastContainer.vue";
</script>

<style scoped>
/* App 컴포넌트 전용 스타일 */
</style>
