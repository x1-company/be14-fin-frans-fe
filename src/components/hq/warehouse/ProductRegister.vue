<template>
  <div class="register-form-card">
    <div class="card-header">
      <div class="register-form-title">자재 등록</div>
      <div class="register-form-btns">
        <button class="btn-outline" @click="goToList">목록으로</button>
        <button class="btn-blue" @click="saveProduct">저장</button>
      </div>
    </div>
    <div class="register-form-grid">
      <div class="form-col">
        <div class="form-row">
          <label>자재번호</label>
          <input type="text" v-model="newProduct.code" placeholder="자재 코드를 입력하세요" />
        </div>
        <div class="form-row">
          <label>규격</label>
          <input type="text" v-model="newProduct.spec" placeholder="규격을 입력하세요" />
        </div>
        <div class="form-row">
          <label>재고단위</label>
          <input type="text" v-model="newProduct.unit" placeholder="재고 단위를 입력하세요" />
        </div>
        <div class="form-row">
          <label>자재 구분</label>
          <select v-model="newProduct.productTypeId" class="form-select">
            <option disabled value="">자재 구분을 선택하세요</option>
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>구매단가</label>
           <input type="number" v-model.number="newProduct.purchasePrice" placeholder="구매 단가를 입력하세요" />
        </div>
         <div class="form-row">
          <label>사용여부</label>
          <select v-model="newProduct.active" class="form-select">
            <option :value="true">Y</option>
            <option :value="false">N</option>
          </select>
        </div>
      </div>
      <div class="form-col">
        <div class="form-row">
          <label>자재명</label>
          <input type="text" v-model="newProduct.name" placeholder="자재명을 입력하세요" />
        </div>
        <div class="form-row">
          <label>구매단위</label>
          <input type="text" v-model="newProduct.purchaseUnit" placeholder="구매 단위를 입력하세요" />
        </div>
        <div class="form-row">
          <label>자재 분류</label>
          <select v-model="newProduct.productGroupId" class="form-select">
            <option disabled value="">자재 분류를 선택하세요</option>
            <option v-for="opt in groupOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>자재 속성</label>
          <select v-model="newProduct.productAttributeId" class="form-select">
            <option disabled value="">자재 속성을 선택하세요</option>
            <option v-for="opt in attrOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="form-row">
          <label>판매단가</label>
          <input type="number" v-model.number="newProduct.salePrice" placeholder="판매 단가를 입력하세요" />
        </div>
        <div class="form-row">
          <label>공급처</label>
          <select v-model="newProduct.supplierId" class="form-select">
            <option disabled value="">공급처를 선택하세요</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
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

const newProduct = ref({
  code: '',
  name: '',
  purchasePrice: null,
  salePrice: null,
  unit: '',
  purchaseUnit: '',
  spec: '',
  active: true,
  supplierId: '',
  productGroupId: '',
  productTypeId: '',
  productAttributeId: '',
});

const suppliers = ref([]);

const PRODUCT_TYPE_MAP = {
  1: '원재료', 2: '상품', 3: '저장품', 4: '소모품',
  5: '시설소모품', 6: '경품', 7: '기타',
};
const PRODUCT_GROUP_MAP = { 1: '상온', 2: '냉장', 3: '냉동', 4: '기타' };
const PRODUCT_ATTRIBUTE_MAP = { 1: '신선식품', 2: '비신선식품', 3: '비식품' };

const typeOptions = computed(() => Object.entries(PRODUCT_TYPE_MAP).map(([value, label]) => ({ value: Number(value), label })));
const groupOptions = computed(() => Object.entries(PRODUCT_GROUP_MAP).map(([value, label]) => ({ value: Number(value), label })));
const attrOptions = computed(() => Object.entries(PRODUCT_ATTRIBUTE_MAP).map(([value, label]) => ({ value: Number(value), label })));

const fetchSuppliers = async () => {
  try {
    const { data } = await api.get('/api/hq/suppliers/list');
    if (Array.isArray(data)) {
      suppliers.value = data.map(s => ({ ...s, id: Number(s.id) }));
    } else {
      console.error('API 응답이 배열이 아닙니다:', data);
      suppliers.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    alert('공급처 목록을 불러오는 데 실패했습니다.');
  }
};

onMounted(fetchSuppliers);

async function saveProduct() {
  // Basic validation
  for (const key in newProduct.value) {
    if (newProduct.value[key] === '' || newProduct.value[key] === null) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
  }

  try {
    const response = await api.post('/api/hq/products', newProduct.value);
    alert('자재가 성공적으로 등록되었습니다.');
    router.push(`/warehouse/product/${response.data}`);
  } catch (error) {
    console.error('Failed to create product:', error);
    alert(`자재 등록에 실패했습니다: ${error.response?.data?.message || error.message}`);
  }
}

function goToList() {
  router.push('/warehouse?tab=1');
}
</script>

<style scoped>
/* Styles adapted from ProductDetail.vue */
.register-form-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 100px 32px 100px;
  margin-top: 0;
  color: #222;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.register-form-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #222;
}
.register-form-grid {
  display: flex;
  gap: 48px;
}
.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-row label {
  font-size: 1rem;
  color: #222;
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
}
.register-form-btns {
  display: flex;
  gap: 16px;
}
.btn-blue, .btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 6px;
  padding: 8px 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.btn-blue {
  background: #4066fa;
  color: #fff;
  border: 1px solid #4066fa;
}
.btn-blue:hover {
  background: #3453c7;
}
.btn-outline {
  background: #fff;
  color: #4066fa;
  border: 1px solid #d1d5db;
}
.btn-outline:hover {
  border-color: #4066fa;
}
</style> 