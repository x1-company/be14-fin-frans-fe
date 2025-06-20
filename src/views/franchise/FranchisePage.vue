<template>
    <div class="app">
        <TopBar />
        <Info 
          :activeTab="activeTab"
          @tab-change="handleTabChange"
        />
    </div>
</template>

<script setup>
import { ref } from 'vue'
import TopBar from '@/components/franchise/common/TopBar.vue'
import Info from '@/components/franchise/common/Info.vue'

const activeTab = ref('대시보드')

const handleTabChange = (tabValue) => {
    activeTab.value = tabValue
    console.log('Active tab changed to:', tabValue)
}
</script>

<style scoped>
.app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>