<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>주문 템플릿 목록</h2>
        <button @click="closeModal" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="isLoading" class="loading-spinner"></div>
        <div v-else-if="templates.length === 0" class="empty-state">
          사용 가능한 템플릿이 없습니다.
        </div>
        <ul v-else class="template-list">
          <li v-for="template in templates" :key="template.id" @click="selectTemplate(template.id)" class="template-item">
            <div class="template-name">{{ template.name }}</div>
            <div class="template-description">{{ template.description }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from "@/lib/api";

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(['close', 'select-template']);

const templates = ref([]);
const isLoading = ref(false);

const fetchTemplates = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/api/franchise/orders/templates');
    templates.value = response.data;
  } catch (error) {
    console.error('Failed to fetch order templates:', error);
    alert('주문 템플릿을 불러오는 데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    fetchTemplates();
  }
});

const closeModal = () => {
  emit('close');
};

const selectTemplate = (templateId) => {
  emit('select-template', templateId);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.template-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.template-item {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.template-item:hover {
  background-color: #f5faff;
  border-color: #4066fa;
}

.template-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 4px;
}

.template-description {
  font-size: 0.9rem;
  color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    margin: 20px auto;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #4066fa;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style> 