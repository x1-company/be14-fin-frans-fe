<template>
  <div class="info-form">
    <div
      v-for="(section, sectionIdx) in getFormSections(supplierDetail)"
      :key="sectionIdx"
      class="info-section"
    >
      <div class="info-section__header">
        <img
          v-if="section.icon"
          :src="section.icon"
          class="info-section__icon"
        />
        <span>{{ section.title }}</span>
        <button
          v-if="section.title === '기본 정보'"
          class="info-section__edit-button"
          >수정</button
        >
      </div>
      <div class="info-section__body">
        <div
          v-for="(row, rowIdx) in section.items"
          :key="rowIdx"
          :class="[
            'info-section__row',
            { 'has-underline': row.some((item) => item.underline) },
          ]"
        >
          <div
            v-for="(item, itemIdx) in row"
            :key="itemIdx"
            class="info-section__item"
          >
            <label v-if="item.label">{{ item.label }}</label>
            <div class="info-item-content">
              <img v-if="item.icon" :src="item.icon" class="info-item__icon" />
              <span v-if="item.type === 'badge'" class="info-item__badge">{{
                item.value
              }}</span>
              <template v-else-if="item.label === '주소'">
                <div>
                  <div>{{ item.value }}</div>
                  <div class="info-item__zipcode"
                    >우편번호: {{ item.zipcode }}</div
                  >
                </div>
              </template>
              <span v-else>{{ item.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";

// 아이콘 이미지 임포트
import basicInfoIcon from "@/assets/phone1.png";
import contactInfoIcon from "@/assets/phone.png";
import phoneIcon from "@/assets/phone.png";
import userIcon from "@/assets/user.png";
import calendarIcon from "@/assets/calendar.png";
import addressIcon from "@/assets/address.png";
import mailIcon from "@/assets/email.png";

const props = defineProps({
  supplierId: {
    type: [Number, String],
    required: false,
  },
});

const supplierDetail = ref(null);

// InfoForm이 기대하는 sections 형태로 데이터 변환
function getFormSections(detail) {
  if (!detail) return [];

  return [
    {
      title: "기본 정보",
      icon: basicInfoIcon,
      items: [
        [
          { label: "공급처코드", value: detail.code },
          { label: "사업자번호", value: detail.businessNumber },
        ],
        [
          {
            label: "거래상태",
            value: detail.isActive ? "거래중" : "거래중단",
            type: "badge",
          },
          {
            label: "계약일자",
            value: detail.signedAt ? detail.signedAt.split("T")[0] : "",
            icon: calendarIcon,
          },
        ],
        [
          { label: "공급처명", value: detail.name },
          {
            label: "주소",
            value: detail.address,
            icon: addressIcon,
            zipcode: detail.zipcode,
            span: 2,
          },
        ],
        [{ label: "대표자", value: detail.ceoName }],
      ],
    },
    {
      title: "연락처 정보",
      icon: contactInfoIcon,
      items: [
        [
          {
            label: "회사 연락처",
            value: detail.companyPhone,
            icon: phoneIcon,
            underline: true,
          },
        ],
        [
          {
            label: "담당자 연락처",
            value: detail.supplierPhone || "",
            icon: phoneIcon,
          },
          {
            label: "담당자 이메일",
            value: detail.supplierEmail || "",
            icon: mailIcon,
          },
        ],
        [
          {
            label: "담당자 이름",
            value: detail.supplierName || "",
            icon: userIcon,
          },
        ],
      ],
    },
  ];
}

// 상세 정보 가져오는 함수
async function fetchSupplierDetail(id) {
  if (!id) {
    supplierDetail.value = null;
    return;
  }
  try {
    const res = await axios.get(
      `http://localhost:8080/api/supplier/detail/${id}`
    );
    supplierDetail.value = res.data;
  } catch (e) {
    supplierDetail.value = null;
    console.error(`공급처 상세 조회 실패 (ID: ${id})`, e);
  }
}

// 컴포넌트 마운트 시 초기 데이터 로드
onMounted(() => {
  fetchSupplierDetail(props.supplierId);
});

// supplierId prop이 변경될 때마다 데이터 다시 로드
watch(
  () => props.supplierId,
  (newId) => {
    fetchSupplierDetail(newId);
  },
  { immediate: true }
);
</script>

<style scoped>
.info-form {
  /* background: #f8faff; */
  background: #fff;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px 0 rgba(64, 102, 250, 0.03);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  padding: 24px 32px;
}

.info-section__header {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #222;
  margin-bottom: 20px;
  gap: 10px;
}

.info-section__icon {
  width: 24px;
  height: 24px;
}

.info-section__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-section__row {
  display: flex;
  gap: 40px;
}

.info-section__row.has-underline {
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.info-section__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-section__item label {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 2px;
}

.info-item-content {
  display: flex;
  align-items: center;
  font-size: 1.05rem;
  color: #222;
  font-weight: 500;
}

.info-item__icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  opacity: 0.7;
}

.info-item__badge {
  background: #e3f8ea;
  color: #3bb77e;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 6px;
  padding: 2px 8px;
}

.info-section__edit-button {
  background: none;
  border: 1px solid #ffffffa0; /* 흰색 테두리 */
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  margin-left: auto; /* 기본 정보 타이틀 옆으로 보내기 */
  color: #4066fa; /* 파란색으로 변경 */
  border-color: #4066fa; /* 파란색 테두리 */
  transition: background-color 0.2s, border-color 0.2s;
}
.info-section__edit-button:hover {
  background-color: #4066fa10; /* 호버 시 약간 밝아지게 */
  border-color: #4066fa;
}

.info-item__zipcode {
  color: #b0b8c1;
  font-size: 0.98rem;
  margin-top: 2px;
}
</style>
