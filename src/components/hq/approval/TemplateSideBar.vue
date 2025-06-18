<template>
  <div class="template-sidebar">
    <!-- 검색창 -->
    <div class="search-container">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="템플릿 검색..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 템플릿 목록 -->
    <div class="template-list">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id"
        :class="['template-card', { 'selected': selectedTemplateId === template.id }]"
        @click="selectTemplate(template)"
      >
        <div class="template-header">
          <h3 class="template-name">{{ template.name }}</h3>
        </div>
        <p class="template-description">{{ template.description }}</p>
        <div class="template-footer">
          <div class="template-users">
          </div>
        </div>
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>템플릿을 불러오는 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchTemplates" class="retry-button">다시 시도</button>
    </div>

    <!-- 빈 상태 -->
    <div v-if="!loading && !error && templates.length === 0" class="empty-container">
      <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14,2 14,8 20,8"></polyline>
      </svg>
      <p>등록된 템플릿이 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/lib/api'

// props로 외부에서 선택된 템플릿 받기
const props = defineProps({
  selectedTemplate: Object
})

// 반응형 데이터
const templates = ref([])
const selectedTemplateId = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')

// 이벤트 정의
const emit = defineEmits(['select-template'])

// 외부에서 선택된 템플릿이 변경될 때 내부 상태 업데이트
watch(() => props.selectedTemplate, (newTemplate) => {
  if (newTemplate?.id) {
    selectedTemplateId.value = newTemplate.id
  }
}, { immediate: true })

// 계산된 속성 - 검색 필터링
const filteredTemplates = computed(() => {
  if (!searchQuery.value.trim()) {
    return templates.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return templates.value.filter(template => 
    template.name.toLowerCase().includes(query) ||
    template.description?.toLowerCase().includes(query)
  )
})

// 템플릿 목록 조회
const fetchTemplates = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { data } = await api.get('/api/hq/approvals/templates')
    templates.value = data
    
    // 첫 번째 템플릿을 기본 선택 (이미 선택된 템플릿이 없을 경우에만)
    if (data.length > 0 && !selectedTemplateId.value) {
      selectTemplate(data[0])
    } else if (selectedTemplateId.value) {
      // 이미 선택된 템플릿이 있으면 해당 템플릿 다시 선택
      const selectedTemplate = data.find(t => t.id === selectedTemplateId.value)
      if (selectedTemplate) {
        emit('select-template', selectedTemplate)
      } else if (data.length > 0) {
        // 선택된 템플릿이 목록에 없으면 첫 번째 템플릿 선택
        selectTemplate(data[0])
      }
    }
  } catch (err) {
    console.error('템플릿 목록 조회 실패:', err)
    error.value = '템플릿 목록을 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

// 템플릿 선택
const selectTemplate = (template) => {
  selectedTemplateId.value = template.id
  emit('select-template', template)
}

// 컴포넌트 마운트 시 데이터 로드
onMounted(() => {
  fetchTemplates()
})

// 활성 탭이 변경될 때 템플릿 목록 다시 로드하기 위한 함수 노출
defineExpose({
  refreshTemplates: fetchTemplates
})
</script>

<style scoped>
.template-sidebar {
  width: 320px;
  height: 100%;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-container {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  background: white;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6c757d;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #adb5bd;
}

.template-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.template-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.template-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.template-card.selected {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.template-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: inherit;
}

.template-description {
  font-size: 14px;
  color: #6c757d;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-users {
  display: flex;
  align-items: center;
  gap: 4px;
}

.loading-container,
.error-container,
.empty-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin: 0 0 16px 0;
  color: #dc3545;
}

.retry-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.retry-button:hover {
  background: #5a67d8;
}

.empty-icon {
  color: #adb5bd;
  margin-bottom: 16px;
}

/* 스크롤바 스타일링 */
.template-list::-webkit-scrollbar {
  width: 6px;
}

.template-list::-webkit-scrollbar-track {
  background: transparent;
}

.template-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>