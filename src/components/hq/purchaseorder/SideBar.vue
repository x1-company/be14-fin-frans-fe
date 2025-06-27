<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/lib/api"; // axios instance가 여기 있다고 가정
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const emit = defineEmits(["select-company"]);

const searchQuery = ref("");
const totalCount = ref(0);
const companies = ref([]);
const selectedCompany = ref(null);

onMounted(async () => {
  if (!authStore.accessToken) return; // 토큰 없을 경우 일단 막기

  try {
    const { data } = await api.get("/api/hq/suppliers/list");
    companies.value = data;
    totalCount.value = data.length;
  } catch (error) {
    console.error("공급처 목록 불러오기 실패", error);
  }
});

const filteredCompanies = computed(() => {
  if (!searchQuery.value) return companies.value;
  return companies.value.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleCompanyClick = (company) => {
  selectedCompany.value = company;
  emit("select-company", company);
};
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-title">공급처 목록</div>
    <!-- 공급처 리스트 및 선택 UI는 추후 구현 -->
    <div class="sidebar-placeholder">공급처를 선택하세요.</div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  padding: 24px 16px;
  margin-bottom: 24px;
}
.sidebar-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: #4066fa;
}
.sidebar-placeholder {
  color: #aaa;
  padding: 32px 0;
  text-align: center;
}
</style>
