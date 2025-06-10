<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  companies: Array,
  selectedCompany: Object
})

const emit = defineEmits(['select-company'])

const searchQuery = ref('')
const totalCount = ref(100)

const filteredCompanies = computed(() => {
  if (!searchQuery.value) return props.companies
  return props.companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleCompanyClick = (company) => {
  emit('select-company', company)
}
</script>

<template>
  <div class="sidebar">
    <!-- Fixed Header -->
    <div class="sidebar-header">
      <div class="header-item">
        <span class="star-icon">⭐</span>
        <span>즐겨찾기</span>
        <button class="add-btn">+</button>
      </div>
      
      <div class="header-item">
        <span class="folder-icon">📁</span>
        <span>공급처 관리</span>
      </div>
      
      <div class="count-info">
        <span>전체 {{ totalCount }}</span>
      </div>
      
      <div class="search-container">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="공급처 검색"
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>
    </div>
    
    <!-- Scrollable Content -->
    <div class="sidebar-content">
      <div 
        v-for="company in filteredCompanies" 
        :key="company.id"
        class="company-item"
        :class="{ active: selectedCompany?.id === company.id }"
        @click="handleCompanyClick(company)"
      >
        <div class="company-header">
          <span class="company-icon">🏢</span>
          <span class="company-name">{{ company.name }}</span>
          <span class="company-category">{{ company.category }}</span>
        </div>
        <div class="company-details">
          <div class="detail-row">
            <span class="phone-icon">📞</span>
            <span>{{ company.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="person-icon">👤</span>
            <span>{{ company.manager }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 300px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.add-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #6c757d;
}

.count-info {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 16px;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.company-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.company-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.company-item.active {
  border-color: #667eea;
  background: #f8f9ff;
}

.company-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.company-name {
  font-weight: 600;
  color: #212529;
}

.company-category {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: auto;
}

.company-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6c757d;
}
</style>