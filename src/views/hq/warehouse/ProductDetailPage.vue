<template>
  <div class="app">
    <NavBar />
    <div class="main-container">
      <div class="content-container">
        <div class="breadcrumb-container">
          <Breadcrumb :items="['HOME', '창고관리', '자재관리', '자재상세']" />
        </div>
        <div class="info-content">
          <div class="header-banner">
            <div class="info-group">
              <InfoHeader
                :title="'자재 상세'"
                :desc="''"
                :tabs="['자재관리', '재고관리', '입출고현황']"
                :activeTab="0"
                @change-tab="onTabClick"
              />
              <div class="detail-form-card">
                <div class="detail-form-title">자재 상세</div>
                <div class="detail-form-supplier">
                  공급처
                  <span class="supplier-name">{{
                    detail?.supplierName || '-'
                  }}</span>
                </div>
                <div class="detail-form-grid">
                  <div class="form-col">
                    <div class="form-row">
                      <label>자재번호</label>
                      <input type="text" :value="detail?.code || ''" readonly />
                    </div>
                    <div class="form-row">
                      <label>규격</label>
                      <input type="text" :value="detail?.spec || ''" readonly />
                    </div>
                    <div class="form-row">
                      <label>재고단위</label>
                      <input
                        type="text"
                        :value="detail?.unit || ''"
                        readonly
                      />
                    </div>
                    <div class="form-row">
                      <label>자재 구분</label>
                      <input
                        type="text"
                        :value="typeLabel(detail?.productTypeId)"
                        readonly
                      />
                    </div>
                    <div class="form-row">
                      <label>구매단가</label>
                      <input
                        type="text"
                        :value="
                          detail?.purchasePrice
                            ? detail.purchasePrice + '원'
                            : ''
                        "
                        readonly
                      />
                    </div>
                  </div>
                  <div class="form-col">
                    <div class="form-row">
                      <label>자재명</label>
                      <input
                        type="text"
                        :value="detail?.name || ''"
                        readonly
                      />
                    </div>
                    <div class="form-row">
                      <label>구매단위</label>
                      <input
                        type="text"
                        :value="detail?.purchaseUnit || ''"
                        readonly
                      />
                    </div>
                    <div class="form-row">
                      <label>자재 분류</label>
                      <input
                        type="text"
                        :value="groupLabel(detail?.productGroupId)"
                        readonly
                      />
                    </div>
                    <div class="form-row">
                      <label>자재 속성</label>
                      <input
                        type="text"
                        :value="attrLabel(detail?.productAttributeId)"
                        readonly
                      />
                    </div>
                    <div class="form-row">
                      <label>판매단가</label>
                      <input
                        type="text"
                        :value="
                          detail?.salePrice ? detail.salePrice + '원' : ''
                        "
                        readonly
                      />
                    </div>
                  </div>
                </div>
                <div class="detail-form-btns">
                  <button class="btn-blue">재고 확인</button>
                  <button class="btn-outline">수정</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/lib/api';
import NavBar from '@/components/hq/common/NavBar.vue';
import Breadcrumb from '@/components/hq/common/Breadcrumb.vue';
import InfoHeader from '@/components/hq/warehouse/InfoHeader.vue';ㅇ

const route = useRoute();
const router = useRouter();
const detail = ref(null);

const PRODUCT_TYPE_MAP = { 1: '원재료', 2: '상품', 3: '저장품', 4: '소모품', 5: '시설소모품', 6: '경품', 7: '기타' };
const PRODUCT_GROUP_MAP = { 1: '상온', 2: '냉장', 3: '냉동', 4: '기타' };
const PRODUCT_ATTRIBUTE_MAP = { 1: '신선식품', 2: '비신선식품', 3: '비식품' };
function typeLabel(val) { return PRODUCT_TYPE_MAP[val] || val; }
function groupLabel(val) { return PRODUCT_GROUP_MAP[val] || val; }
function attrLabel(val) { return PRODUCT_ATTRIBUTE_MAP[val] || val; }

function onTabClick(idx) {
  if (idx === 0) {
    router.push('/warehouse');
  }
  // 추후 다른 탭(재고관리, 입출고현황) 구현 시 else if 추가
}

onMounted(async () => {
  const id = route.params.id;
  if (!id) return;
  const { data } = await api.get(`/api/hq/products/details/${id}`);
  detail.value = data;
});
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'NanumSquareOTF_acR', 'NanumSquareOTF_acB', 'NanumSquareOTF_acEB', 'NanumSquareOTF_acL', 'Apple SD Gothic Neo', Arial, sans-serif !important;
}
.main-container {
  flex: 1;
  display: flex;
  background: #f8f9fa;
  overflow: auto;
}
.content-container {
  flex: 1;
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
  padding: 0;
}
.breadcrumb-container {
  padding: 16px 24px 0 24px;
}
.info-content {
  padding: 0 0 24px 0;
}
.header-banner {
  color: white;
  padding: 32px 24px 0 24px;
}
.info-group {
  background: transparent;
}
.detail-form-card {
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 48px 32px 48px;
  margin-top: 0;
  margin-bottom: 0;
}
.detail-form-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 18px;
  color: #222;
}
.detail-form-supplier {
  font-size: 1.1rem;
  margin-bottom: 18px;
  color: #222;
}
.supplier-name {
  font-weight: bold;
  margin-left: 8px;
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
.form-row input {
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 1rem;
  background: #f8f9fa;
  color: #222;
  font-family: inherit;
}
.detail-form-btns {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 18px;
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
</style> 