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
import TopBar from '@/components/supplier/common/TopBar.vue'
import Info from '@/components/supplier/common/Info.vue'

const activeTab = ref('납품등록')

const handleTabChange = (tabValue) => {
    activeTab.value = tabValue
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