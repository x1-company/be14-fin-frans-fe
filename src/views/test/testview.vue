<script setup>
import { ref } from 'vue'
import NavBar from '@/components/test/testNavBar.vue'
import SideBar from '@/components/test/testSideBar.vue'
import Info from '@/components/test/testInfo.vue'

const selectedCompany = ref({
  id: 'SUP001',
  name: '(주)하림',
  businessNumber: '123-45-67890',
  registrationDate: '2024-01-15',
  address: '서울시 강남구 테헤란로 123, 하림빌딩 10층',
  postalCode: '06142',
  representative: '김영수',
  phone: '02-1234-5678',
  email: 'hong@harim.co.kr'
})

const companies = ref([
  {
    id: 'SUP001',
    name: '(주)하림',
    category: '공급처',
    phone: '010-1234-5678',
    manager: '박대리'
  },
  {
    id: 'SUP002',
    name: '(주)대한제과회사',
    category: '공급처',
    phone: '010-1234-5679',
    manager: '이대리'
  },
  {
    id: 'CJ001',
    name: 'CJ 제일제당',
    category: '공급처',
    phone: '010-1234-5680',
    manager: '이대리'
  },
  {
    id: 'CJ002',
    name: 'CJ 제일제당',
    category: '공급처',
    phone: '010-1234-5681',
    manager: '이대리'
  }
])

const handleCompanySelect = (company) => {
  selectedCompany.value = company
}
</script>

<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <SideBar 
        :companies="companies" 
        :selectedCompany="selectedCompany"
        @select-company="handleCompanySelect"
      />
      <Info :company="selectedCompany" />
    </div>
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>