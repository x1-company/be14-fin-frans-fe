<template>
  <div v-if="isVisible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h2>구매 요청 선택</h2>
        <button class="close-button" @click="close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>요청 번호</th>
                <th>제목</th>
                <th>요청일</th>
                <th>납기희망일</th>
                <th>담당자</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5">로딩 중...</td>
              </tr>
              <tr v-else-if="purchaseRequests.length === 0">
                <td colspan="5">선택할 수 있는 구매 요청이 없습니다.</td>
              </tr>
              <tr v-for="request in purchaseRequests" :key="request.id" class="clickable-row" @click="selectRequest(request)">
                <td>{{ request.id }}</td>
                <td>{{ request.title }}</td>
                <td>{{ request.createdAt?.split('T')[0] || '-' }}</td>
                <td>{{ request.requestedDeliveryDate?.split('T')[0] || '-' }}</td>
                <td>{{ request.userName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '@/lib/api';
import { useToast } from '@/composables/useToast';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['close', 'request-selected']);

const purchaseRequests = ref([]);
const loading = ref(false);
const { showToast } = useToast();

async function fetchPurchaseRequests() {
  loading.value = true;
  try {
    const response = await api.get('/api/hq/purchase/requests', {
      params: { status: 'APPROVED' }
    });
    purchaseRequests.value = response.data.content || [];
  } catch (error) {
    console.error('Failed to fetch purchase requests:', error);
    // showToast('구매 요청 목록을 불러오는 데 실패했습니다.', 'error');
  } finally {
    loading.value = false;
  }
}

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    fetchPurchaseRequests();
  }
});

function selectRequest(request) {
  emit('request-selected', request);
}

function close() {
  emit('close');
}
</script>

<style scoped>
/* Basic Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.table-container {
  max-height: 500px;
  overflow-y: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: center;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-primary:hover {
  background-color: #0056b3;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s;
}
.clickable-row:hover {
  background: #f0f4ff;
}
</style> 