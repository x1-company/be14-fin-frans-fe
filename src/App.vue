<template>
  <div>
    <router-view />
    <RealtimeNotificationContainer />
  </div>
</template>

<script setup>
import RealtimeNotificationContainer from '@/components/RealtimeNotificationContainer.vue';
</script>

<style scoped>
/* App 컴포넌트 전용 스타일 */
</style>
