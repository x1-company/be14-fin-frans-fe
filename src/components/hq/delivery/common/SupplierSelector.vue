<template>
  <div class="selector-container">
    <label for="supplier-select">공급처 선택:</label>
    <select id="supplier-select" v-model="selectedSupplier" @change="onSupplierChange" class="form-select">
      <option :value="null">전체 공급처</option>
      <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
        {{ supplier.name }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useToast } from "@/composables/useToast";

const toast = useToast();

const emit = defineEmits(['supplier-selected']);
const auth = useAuthStore()

const suppliers = ref([]);
const selectedSupplier = ref(null);

const fetchSuppliers = async () => {
  if (!auth.isAuthenticated) {
    return;
  }
  try {
    const response = await api.get('/api/hq/suppliers/list'); // 본사에서 사용하는 전체 공급처 목록 API
    suppliers.value = response.data;
  } catch (error) {
    console.error('공급처 목록 조회 실패:', error);
    toast.error('공급처 목록을 불러오는데 실패했습니다.');
  }
};

const onSupplierChange = () => {
  emit('supplier-selected', selectedSupplier.value);
};

onMounted(() => {
  fetchSuppliers();
  emit('supplier-selected', null); // 최초 진입 시 '전체' 선택으로 이벤트 발생
});
</script>

<style scoped>
.selector-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.selector-container label {
  font-size: 14px;
  font-weight: 500;
}
.form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}
</style> 