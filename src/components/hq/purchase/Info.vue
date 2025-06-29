<script setup>
import { ref } from 'vue';
import Breadcrumb from '@/components/hq/common/Breadcrumb.vue';
import InfoHeader from './InfoHeader.vue';
import InfoForm from './InfoForm.vue';

const breadcrumbItems = ref(["HOME", "구매관리"]);
const activeTab = ref(0);
</script>

<template>
  <div class="info-container">
    <div class="breadcrumb-container">
      <Breadcrumb :items="breadcrumbItems" />
    </div>
    <div class="info-content">
      <div class="header-banner">
        <div class="info-group">
          <InfoHeader
            title="구매관리"
            desc="구매 요청 현황을 확인하고 관리할 수 있습니다."
          />
          <InfoForm />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f8f9fa;
}
.breadcrumb-container {
  padding: 16px 24px 16px 24px;
}
.info-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 24px 0;
}
.header-banner {
  /* color: white; */
  padding: 10px 24px 0 24px;
}
.info-group {
  background: transparent;
}
</style> 