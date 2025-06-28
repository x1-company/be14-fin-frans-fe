<template>
  <div class="modal-overlay">
    <div class="modal-content horizontal">
      <!-- 왼쪽: 검색/결과 -->
      <div class="left-panel">
        <div class="modal-title">자재 검색 및 등록</div>
        <div class="search-bar">
          <input v-model="searchInput" placeholder="자재명 또는 코드로 검색" @keyup.enter="doSearch" />
          <span class="search-icon">🔍</span>
        </div>
        <div class="result-title">검색 결과 ({{ filteredProducts.length }}개)</div>
        <div class="result-list">
          <div v-for="product in filteredProducts" :key="product.id" class="result-card" :class="{ selected: selectedIds.includes(product.id) }">
            <span class="result-code">{{ product.code }}</span>
            <span class="result-name">{{ product.name }}</span>
            <span class="result-spec">{{ product.spec }}</span>
            <div class="result-actions">
              <template v-if="selectedIds.includes(product.id)">
                <span class="badge-selected">선택됨({{ quantities[product.id] }})</span>
                <button class="qty-btn" @click="increaseQty(product.id)">+</button>
                <span class="plus-label">추가</span>
              </template>
              <template v-else>
                <button class="select-btn" @click="addSelected(product.id)">+ 선택</button>
              </template>
            </div>
          </div>
        </div>
      </div>
      <!-- 오른쪽: 선택된 자재/버튼/뱃지 (패널 밖으로) -->
      <div class="right-panel-outer">
        <div class="selected-header-out">
          <span class="selected-title">선택된 자재</span>
          <span class="cart-badge">🛒 {{ selectedProducts.length }}개</span>
        </div>
        <div class="selected-box-out">
          <div v-if="selectedProducts.length === 0" class="empty-selected">선택된 자재가 없습니다. <br> 왼쪽에서 자재를 선택해주세요</div>
          <div v-for="p in selectedProducts" :key="p.id" class="selected-card">
            <span class="selected-code">{{ p.code }}</span>
            <span class="selected-name">{{ p.name }}</span>
            <span class="selected-spec">{{ p.spec }}</span>
            <div class="qty-box">
              <button @click="decreaseQty(p.id)">-</button>
              <span>{{ quantities[p.id] }}</span>
              <button @click="increaseQty(p.id)">+</button>
            </div>
            <button class="remove-btn" @click="removeSelected(p.id)">×</button>
          </div>
        </div>
        <div class="modal-footer-out">
          <button class="reset-btn" @click="resetSelected" :disabled="selectedProducts.length === 0">선택 초기화</button>
          <button class="register-btn" @click="registerSelected" :disabled="selectedProducts.length === 0">
            🛒 자재 등록 ({{ selectedProducts.length }})
          </button>
        </div>
      </div>
      <button class="close-btn" @click="close">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  products: Array,
  visible: Boolean
})
const emit = defineEmits(['close', 'register'])

const search = ref('')
const searchInput = ref('')
const quantities = ref({})
const selectedIds = ref([])

watch(() => props.products, (list) => {
  list.forEach(p => {
    if (!quantities.value[p.id]) quantities.value[p.id] = 1
  })
}, { immediate: true })

const filteredProducts = computed(() => {
  if (!search.value.trim()) return props.products
  const q = search.value.trim().toLowerCase()
  return props.products.filter(
    p => (p.name && p.name.toLowerCase().includes(q)) || (p.code && p.code.toLowerCase().includes(q))
  )
})

const selectedProducts = computed(() =>
  props.products.filter(p => selectedIds.value.includes(p.id))
)

function doSearch() {
  search.value = searchInput.value
}
function close() { emit('close') }
function addSelected(id) {
  if (!selectedIds.value.includes(id)) selectedIds.value.push(id)
}
function removeSelected(id) {
  selectedIds.value = selectedIds.value.filter(i => i !== id)
}
function increaseQty(id) {
  quantities.value[id] = (quantities.value[id] || 1) + 1
}
function decreaseQty(id) {
  if ((quantities.value[id] || 1) > 1) quantities.value[id]--
}
function resetSelected() {
  selectedIds.value = []
}
function registerSelected() {
  const selected = selectedProducts.value.map(p => ({
    ...p,
    quantity: quantities.value[p.id] || 1
  }))
  emit('register', selected)
  selectedIds.value = []
  selected.forEach(p => { quantities.value[p.id] = 1 })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal-content.horizontal {
  background: #fff;
  border-radius: 14px;
  padding: 25px 25px 25px 25px;
  min-width: 700px;
  max-width: 90vw;
  max-height: 80vh;
  box-shadow: 0 4px 24px rgba(0,0,0,0.13);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  gap: 40px;
}
.left-panel {
  flex: 2 1 0;
  width: 400px;
  display: flex;
  flex-direction: column;
}
.right-panel-outer {
  flex: 1 1 0;
  min-width: 410px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  margin-top: 30px;
}
.selected-header-out {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
}
.selected-title {
  font-size: 14px;
  font-weight: 700;
  color: #1976d2;
}
.cart-badge {
  background: #eaf3ff;
  color: #4066fa;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  padding: 2px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.selected-box-out {
  background: #fafdff;
  border-radius: 10px;
  padding: 20px 6px 300px 6px;
  min-height: 80px;
  border: 1.5px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}
.empty-selected {
  color: #b0b8c1;
  text-align: center;
  font-size: 13px;
  padding: 110px 0 50px 0;
}
.selected-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(64,102,250,0.06);
  padding: 12px 10px;
  gap: 10px;
  border: 1.5px solid #bbdefb;
  font-size: 13px;
  /* min-height: 36px; */
  max-width: 100%;
}
.selected-code {
  font-weight: 700;
  color: #4066fa;
  background: #e6f0ff;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 12px;
}
.selected-name {
  font-weight: 500;
  color: #222;
  min-width: 40px;
}
.selected-spec {
  color: #6c757d;
  font-size: 12px;
  min-width: 28px;
}
.qty-box {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.qty-box button {
  background: #eaf3ff;
  border: none;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  font-size: 14px;
  color: #4066fa;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.qty-box span {
  min-width: 16px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}
.remove-btn {
  background: none;
  border: none;
  color: #b0b8c1;
  font-size: 18px;
  margin-left: 6px;
  cursor: pointer;
  transition: color 0.15s;
}
.remove-btn:hover {
  color: #4066fa;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
}
.search-bar {
  display: flex;
  align-items: center;
  background: #f6f7fa;
  border-radius: 7px;
  padding: 0 8px;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
  height: 34px;
}
.search-bar input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 13px;
  padding: 8px 0;
  outline: none;
  height: 32px;
}
.search-icon {
  font-size: 15px;
  color: #b0b8c1;
  margin-left: 4px;
}
.result-title {
  font-size: 13px;
  font-weight: 600;
  color: #888;
  margin-bottom: 10px;
}
.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  max-height: 320px;
  overflow-y: auto;
}
.result-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(64,102,250,0.04);
  padding: 12px 10px;
  gap: 8px;
  border: 1.5px solid #e0e0e0;
  font-size: 13px;
  transition: border 0.15s, background 0.15s;
}
.result-card.selected {
  border: 1.5px solid #5d7dfd;
  background: #f5faff;
}
.result-code {
  font-weight: 700;
  color: #4066fa;
  background: #e6f0ff;
  border-radius: 6px;
  padding: 2px 7px;
  font-size: 12px;
}
.result-name {
  font-weight: 500;
  color: #222;
}
.result-spec {
  color: #6c757d;
  font-size: 12px;
}
.result-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.badge-selected {
  background: #4066fa;
  color: #fff;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  padding: 2px 10px;
  display: flex;
  align-items: center;
  gap: 2px;
}
.qty-btn {
  background: #eaf3ff;
  border: none;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  font-size: 14px;
  color: #4066fa;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.qty-btn:hover {
  background: #d0e3ff;
}
.plus-label {
  font-size: 13px;
  color: #4066fa;
  font-weight: 600;
  margin-left: 1px;
}
.select-btn {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 5px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.select-btn:hover {
  background: #4066fa;
  color: #fff;
}
.modal-footer-out {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
  padding-bottom: 0;
}
.reset-btn {
  background: #fff;
  color: #222;
  border: 1.5px solid #e0e0e0;
  border-radius: 7px;
  padding: 7px 65px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border 0.15s;
}
.reset-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  border: 1.5px solid #f5f5f5;
  cursor: not-allowed;
}
.register-btn {
  background: #4066fa;
  color: white;
  border: none;
  padding: 7px 50px;
  min-width: 50px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.register-btn:disabled {
  background: #b0b8c1;
  cursor: not-allowed;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  z-index: 10;
}
.close-btn:hover {
  color: #4066fa;
}
</style> 