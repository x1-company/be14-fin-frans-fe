<template>
    <div class="order-actions">
      <button
        v-if="props.status === 'WAITING_FOR_RECEIPT'"
        class="btn cancel"
        @click="openCancelModal"
      >
        주문 취소
      </button>
        <button class="btn print" @click="handlePrint"><span class="icon">&#128424;</span> 주문서 출력</button>
        <button class="btn close" @click="handleClose"><span class="icon">&#10005;</span> 닫기</button>
        <div v-if="showCancelModal" class="modal-overlay">
          <div class="modal">
            <div class="modal-title danger">
              <span style="font-size:22px; margin-right:8px;">&#8635;</span> 주문 취소
            </div>
            <div class="modal-body">
              <div class="modal-message">
                주문을 취소하시겠습니까?<br />
                <span class="modal-desc">이 작업은 되돌릴 수 없습니다.</span>
              </div>
            </div>
            <div class="modal-actions">
              <button class="modal-btn" @click="showCancelModal = false">취소</button>
              <button class="modal-btn danger" @click="handleCancelConfirm">주문 취소</button>
            </div>
          </div>
        </div>
    </div>
  </template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/lib/api';
import { useToast } from '@/composables/useToast';

const props = defineProps({
  orderId: {
    type: [String, Number],
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const router = useRouter();
const route = useRoute();
const showCancelModal = ref(false);
const toast = useToast();

watch(
  () => route.query.orderId,
  (newOrderId, oldOrderId) => {
    if (!newOrderId) {
      // orderId가 없어지면(=상세 닫기) 목록 새로고침
      fetchOrderList();
    }
  }
);

function handleClose() {
  router.replace({ path: '/franchise', query: { tab: '주문관리' } });
}

function handlePrint() {
  // 주문서 출력 기능은 아직 구현되지 않았습니다.
  toast.error('주문서 출력 기능은 준비 중입니다.');
}

function openCancelModal() {
  showCancelModal.value = true;
}

async function handleCancelConfirm() {
  try {
    await api.patch(`/api/franchise/orders/${props.orderId}/cancel`);
    toast.error('주문이 취소되었습니다.');
    showCancelModal.value = false;
    // 새로고침 또는 콜백
    window.location.reload();
  } catch (e) {
    toast.error('주문 취소에 실패했습니다.');
  }
}

</script>

<style scoped>
.order-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  /* margin: 40px 55px -70px 0; */
}
.btn {
  padding: 6px 13px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
  display: flex;
  align-items: center;
  margin-top: -10px;
  gap: 7px;
}
.btn.print,
.btn.close{
  color: #1976d2;
  border-color: #bbdefb;
}
.btn.cancel {
  color: #d32f2f;
  border-color: #bbdefb;
}
.btn.cancel:hover{
  color: #d32f2f;
  background: #f5faff;
  border-color: #bbdefb;
}
.btn:hover {
  color: #1976d2;
  background: #f5faff;
  border-color: #bbdefb;
}
.icon {
  font-size: 18px;
  vertical-align: middle;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.12);
  padding: 32px 32px 24px 32px;
  min-width: 340px;
  max-width: 90vw;
}
.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  color: #222;
}
.modal-title.danger {
  color: #e53935;
}
.modal-body {
  margin-bottom: 24px;
}
.modal-message {
  background: #ffeaea;
  color: #b71c1c;
  border-radius: 8px;
  padding: 18px 16px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
}
.modal-desc {
  color: #888;
  font-size: 14px;
  font-weight: 400;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.modal-btn {
  padding: 8px 22px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border 0.15s;
}
.modal-btn.danger {
  background: #e53935;
  color: #fff;
  border: none;
}
.modal-btn:hover {
  background: #f5faff;
}
.modal-btn.danger:hover {
  background: #b71c1c;
}
</style>