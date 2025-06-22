<template>
  <div class="detail-form-card">
    <div class="card-header">
      <div class="detail-form-title">자재 등록</div>
      <div class="detail-form-btns">
        <button class="btn-outline" @click="cancelRegister">취소</button>
        <button class="btn-blue" @click="saveProduct">등록</button>
      </div>
    </div>
    <div class="detail-form-supplier">
      공급처
      <select v-model="formData.supplierId" class="form-select">
        <option value="">공급처를 선택하세요</option>
        <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>
    <div class="detail-form-grid">
      <div class="form-col">
        <div class="form-row">
          <label>자재번호</label>
          <input type="text" v-model="formData.code" placeholder="자재번호를 입력하세요" />
        </div>
        <div class="form-row">
          <label>규격</label>
          <input type="text" v-model="formData.spec" placeholder="규격을 입력하세요" />
        </div>
        <div class="form-row">
          <label>재고단위</label>
          <input type="text" v-model="formData.unit" placeholder="재고단위를 입력하세요" />
        </div>
        <div class="form-row">
          <label>자재 구분</label>
          <select v-model="formData.productTypeId" class="form-select">
            <option value="">자재 구분을 선택하세요</option>
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>구매단가</label>
          <input type="number" v-model.number="formData.purchasePrice" placeholder="구매단가를 입력하세요" />
        </div>
        <div class="form-row">
          <label>사용여부</label>
          <select v-model="formData.isActive" class="form-select">
            <option :value="true">Y</option>
            <option :value="false">N</option>
          </select>
        </div>
      </div>
      <div class="form-col">
        <div class="form-row">
          <label>자재명</label>
          <input type="text" v-model="formData.name" placeholder="자재명을 입력하세요" />
        </div>
        <div class="form-row">
          <label>구매단위</label>
          <input type="text" v-model="formData.purchaseUnit" placeholder="구매단위를 입력하세요" />
        </div>
        <div class="form-row">
          <label>자재 분류</label>
          <select v-model="formData.productGroupId" class="form-select">
            <option value="">자재 분류를 선택하세요</option>
            <option v-for="opt in groupOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>자재 속성</label>
          <select v-model="formData.productAttributeId" class="form-select">
            <option value="">자재 속성을 선택하세요</option>
            <option v-for="opt in attrOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>판매단가</label>
          <input type="number" v-model.number="formData.salePrice" placeholder="판매단가를 입력하세요" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/lib/api';

const router = useRouter();

const formData = ref({
  code: '',
  name: '',
  spec: '',
  unit: '',
  purchaseUnit: '',
  purchasePrice: null,
  salePrice: null,
  isActive: true,
  supplierId: null,
  productGroupId: null,
  productTypeId: null,
  productAttributeId: null,
});

const suppliers = ref([]);

const PRODUCT_TYPE_MAP = {
  1: '원재료',
  2: '상품',
  3: '저장품',
  4: '소모품',
  5: '시설소모품',
  6: '경품',
  7: '기타',
};
const PRODUCT_GROUP_MAP = { 1: '상온', 2: '냉장', 3: '냉동', 4: '기타' };
const PRODUCT_ATTRIBUTE_MAP = {
  1: '신선식품',
  2: '비신선식품',
  3: '비식품',
};

const typeOptions = computed(() => Object.entries(PRODUCT_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label })));
const groupOptions = computed(() => Object.entries(PRODUCT_GROUP_MAP).map(([value, label]) => ({ value: Number(value), label })));
const attrOptions = computed(() => Object.entries(PRODUCT_ATTRIBUTE_MAP).map(([value, label]) => ({ value: Number(value), label })));

const fetchSuppliers = async () => {
  try {
    const { data } = await api.get('/api/hq/suppliers/list');
    suppliers.value = data.map(s => ({ ...s, id: Number(s.id) }));
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    alert('공급처 목록을 불러오는 데 실패했습니다.');
  }
};

function cancelRegister() {
  if (confirm('등록을 취소하시겠습니까?')) {
    router.push('/warehouse?tab=1');
  }
}

async function saveProduct() {
  // 필수 필드 검증
  if (!formData.value.code || !formData.value.name) {
    alert('자재번호와 자재명은 필수 입력 항목입니다.');
    return;
  }

  if (!formData.value.supplierId) {
    alert('공급처를 선택해주세요.');
    return;
  }

  const payload = {
    code: formData.value.code,
    name: formData.value.name,
    purchasePrice: formData.value.purchasePrice || 0,
    salePrice: formData.value.salePrice || 0,
    unit: formData.value.unit || '',
    spec: formData.value.spec || '',
    purchaseUnit: formData.value.purchaseUnit || '',
    active: formData.value.isActive,
    supplierId: formData.value.supplierId,
    productGroupId: formData.value.productGroupId || null,
    productTypeId: formData.value.productTypeId || null,
    productAttributeId: formData.value.productAttributeId || null,
  };
  
  try {
    await api.post('/api/hq/products', payload);
    alert('자재가 성공적으로 등록되었습니다.');
    router.push('/warehouse?tab=1');
  } catch (error) {
    console.error('Failed to create product:', error);
    alert(`자재 등록에 실패했습니다: ${error.response?.data?.message || error.message}`);
  }
}

onMounted(async () => {
  await fetchSuppliers();
});
</script>

<style scoped>
.detail-form-card {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 100px 32px 100px;
  margin-top: 0;
  margin-bottom: 0;
  color: #222;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.detail-form-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0;
  color: #222;
}
.detail-form-supplier {
  font-size: 1.1rem;
  margin-bottom: 40px;
  color: #222;
}
.detail-form-supplier .form-select {
  margin-left: 8px;
  width: 250px;
  height: 36px;
  font-size: 1rem;
}
.detail-form-grid {
  display: flex;
  gap: 48px;
  margin-bottom: 24px;
}
.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: #222;
  font-family: inherit;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-row label {
  font-size: 1rem;
  color: #222;
  margin-bottom: 2px;
  font-weight: 500;
}
.form-row input, .form-select {
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 1rem;
  background: #fff;
  color: #222;
  font-family: inherit;
}
.detail-form-btns {
  display: flex;
  gap: 16px;
}
.btn-blue {
  background: #4066fa;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-blue:hover {
  background: #3453c7;
}
.btn-outline {
  background: #fff;
  color: #4066fa;
  border: 1px solid #4066fa;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-outline:hover {
  background: #4066fa10;
  color: #3453c7;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
</style> 