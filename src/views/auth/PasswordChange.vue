<script setup>
import TopBar from '@/components/auth/TopBar.vue'
import PasswordChangeForm from '@/components/auth/PasswordChangeForm.vue'
</script>

<template>
  <div class="app">
    <TopBar />
    <PasswordChangeForm />
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Arial', sans-serif;
  overflow: hidden
}

.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>