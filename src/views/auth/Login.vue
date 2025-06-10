<script setup>
import TopBar from '@/components/auth/TopBar.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <div class="app">
    <TopBar />
    <LoginForm />
  </div>
</template>

<style>
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