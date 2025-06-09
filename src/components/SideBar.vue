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
      >전체 <span class="sidebar__count-num">100</span></div
    >
    <div class="sidebar__search">
      <input type="text" placeholder="공급처 검색" />
    </div>
    <SideBarList :list="supplierList" :selectedIndex="0" />
  </aside>
</template>

<script setup>
import SideBarList from "./SideBarList.vue";
import menuSupplierIcon from "@/assets/menu-supplier.png";

const supplierList = [
  {
    icon: "/src/assets/menu-supplier.png",
    name: "(주)하림",
    phone: "010-1234-5678",
    manager: "박지원",
  },
  {
    icon: "/src/assets/menu-supplier.png",
    name: "(주)영우에프비",
    phone: "010-1234-5678",
    manager: "이예원",
  },
  {
    icon: "/src/assets/menu-supplier.png",
    name: "CJ 제일제당",
    phone: "010-1234-5678",
    manager: "이예원",
  },
];
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 200px;
  background: #fff;
  /* border-right: 2px solid #e6eaff; */
  /* border-left: 2px solid #e6eaff; */
  /* border-bottom: 2.5px solid #e6eaff; */
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
  gap: 20px;
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
  /* width: 100%; */
  padding: 7px 10px;
  border: 1px solid #e6eaff;
  border-radius: 7px;
  font-size: 0.98rem;
  outline: none;
}
</style>
