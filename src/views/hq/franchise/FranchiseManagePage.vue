<template>
    <div class="app">
        <NavBar />
        <div class="main-container">
            <OrderSideBar @select-franchise="handleFranchiseSelect" v-model:tab="sidebarTab" />
        <Info 
          :activeTab="activeTab"
          :selectedFranchiseId="selectedFranchiseId"
          :sidebarTab="sidebarTab"
          @tab-change="handleTabChange"
        />
    </div>
</div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from '@/components/hq/common/NavBar.vue';
import OrderSideBar from '@/components/hq/orders/OrderSideBar.vue';
import Info from '@/components/hq/common/Info.vue';

const route = useRoute();
const selectedFranchiseId = ref(null);
const sidebarTab = ref('mine');

const activeTab = computed(() => route.query.tab || '대시보드');

const handleTabChange = (tabValue) => {
    console.log(tabValue)
}

const handleFranchiseSelect = (franchiseId) => {
    if (selectedFranchiseId.value === franchiseId) {
            selectedFranchiseId.value = null;
            console.log('가맹점 선택 해제됨');
        } else {
            selectedFranchiseId.value = franchiseId;
            console.log('선택된 가맹점 ID:', franchiseId);
        }
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