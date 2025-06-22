<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <div class="breadcrumb-container">
        <Breadcrumb :items="['HOME', '구매관리', '구매 등록']" />
      </div>
      <div class="info-content">
        <div class="header-banner">
          <div class="info-group">
            <InfoHeader
              title="구매 관리"
              desc="구매 요청 현황을 확인하고 관리할 수 있습니다."
            />
            <PurchaseRegisterForm />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import NavBar from '@/components/hq/common/NavBar.vue';
import Breadcrumb from '@/components/hq/common/Breadcrumb.vue';
import InfoHeader from '@/components/hq/purchase/InfoHeader.vue';
import PurchaseRegisterForm from '@/components/hq/purchase/PurchaseRegisterForm.vue';
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
  flex-direction: column;
  overflow: hidden;
}
.breadcrumb-container {
  padding: 16px 24px 0 24px;
}
.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 24px 0;
}
.header-banner {
  color: white;
  padding: 32px 24px 0 24px;
}
.info-group {
  background: transparent;
}
</style> 