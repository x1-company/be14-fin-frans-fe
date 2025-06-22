<template>
    <div class="app">
        <NavBar />
        <div class="main-container">
            <OrderSideBar />
        <Info 
          :activeTab="activeTab"
          @tab-change="handleTabChange"
        />
    </div>
</div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '@/components/hq/common/NavBar.vue';
import OrderSideBar from '@/components/hq/orders/OrderSideBar.vue';
import Info from '@/components/hq/common/Info.vue';

const route = useRoute();
const router = useRouter();

const activeTab = computed(() => route.query.tab || '대시보드');

const handleTabChange = (tabValue) => {
    router.push({ query: { tab: tabValue } });
}
</script>

<style scoped>
.app {
    height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.main-container {
    flex: 1;
    display: flex;
    background: #f8f9fa;
    overflow: auto;
    max-width: 1800px;
    width: 100%;
    margin: 0 auto;
}
</style>