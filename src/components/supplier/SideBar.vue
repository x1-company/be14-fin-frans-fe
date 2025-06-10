<template>
  <aside class="sidebar">
    <div class="sidebar__top">
      <div class="sidebar__favorites">
        <span class="star">★</span>
        즐겨찾기
        <span class="plus">+</span>
      </div>
      <div class="sidebar__menu">
        <img
          src="@/assets/menu-supplier.png"
          alt="공급처 관리"
          class="sidebar__icon"
        />
        공급처 관리
      </div>
    </div>
    <div class="sidebar__count"
      >전체
      <span class="sidebar__count-num">{{ supplierList.length }}</span></div
    >
    <div class="sidebar__search">
      <input type="text" placeholder="공급처 검색" />
    </div>
    <SideBarList
      :list="supplierList"
      :selectedIndex="selectedIndex"
      @select="handleSelect"
    />
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import SideBarList from "./SideBarList.vue";
import menuSupplierIcon from "@/assets/menu-supplier-2.png";

const supplierList = ref([]);
const selectedIndex = ref(0);

// emit 정의 추가
const emit = defineEmits(["selectSupplier"]);

onMounted(async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/supplier/list");
    supplierList.value = res.data.map((item) => ({
      icon: menuSupplierIcon,
      name: item.name,
      phone: item.companyPhone,
      manager: item.ceoName,
      id: item.id, // API 응답에서 id 필드도 포함시키기
    }));
    // 초기 로딩 시 첫 번째 공급처의 상세 정보를 가져오도록 호출
    if (supplierList.value.length > 0) {
      handleSelect(0);
    }
  } catch (e) {
    console.error("공급처 리스트 불러오기 실패", e);
  }
});

function handleSelect(idx) {
  selectedIndex.value = idx;
  // 선택된 공급처의 id를 App.vue로 emit
  if (supplierList.value[idx] && supplierList.value[idx].id !== undefined) {
    emit("selectSupplier", supplierList.value[idx].id);
  } else {
    console.warn(
      "선택된 공급처의 ID가 유효하지 않습니다:",
      supplierList.value[idx]
    );
  }
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 200px;
  background: #fff;
  border-right: 2px solid #e6eaff;
  border-left: 2px solid #e6eaff;
  border-bottom: 2.5px solid #e6eaff;
  height: 100%;
  padding: 18px 8px 0 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.sidebar__top {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sidebar__favorites {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: bold;
  gap: 6px;
  color: #222;
}
.sidebar__favorites .star {
  color: #ffd600;
  font-size: 1.1rem;
}
.sidebar__favorites .plus {
  margin-left: auto;
  font-size: 1.1rem;
  color: #888;
  cursor: pointer;
}
.sidebar__menu {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 500;
  color: #222;
}
.sidebar__icon {
  width: 20px;
  height: 20px;
}
.sidebar__count {
  margin: 10px 0 0 0;
  font-size: 0.95rem;
  color: #888;
}
.sidebar__count-num {
  color: #4066fa;
  font-weight: bold;
  margin-left: 4px;
}
.sidebar__search {
  margin: 6px 0 0 0;
}
.sidebar__search input {
  width: 90%;
  padding: 7px 10px;
  border: 1px solid #e6eaff;
  border-radius: 7px;
  font-size: 0.98rem;
  outline: none;
}
</style>
