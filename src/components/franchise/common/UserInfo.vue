<template>
    <div class="profile-dropdown" ref="dropdownRef">
        <div class="profile-section">
            <span class="navbar__username"> {{ userName }} 점장님 </span>
            <div class="navbar__user" @click="toggleDropdown">
                <img v-if="userProfileUrl" :src="userProfileUrl" alt="user profile" class="navbar__profile-img" />
                <div v-else class="navbar__profile-placeholder">
                    <UserIcon class="w-4 h-4" />
                </div>
            </div>
        </div>

        <!-- 드롭다운 메뉴 -->
        <div v-if="isDropdownOpen" class="dropdown-menu">
            <div class="dropdown-item" @click="handleMenuClick('마이 페이지')">
                내 정보
            </div>
            <div class="dropdown-item" @click="handleMenuClick('로그아웃')">
                로그아웃
            </div>
        </div>

        <!-- 내 정보 모달 -->
        <MyInfo :isVisible="isMyInfoModalVisible" @close="closeMyInfoModal" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/lib/api";
import { useRouter } from "vue-router";
import { UserIcon } from 'lucide-vue-next';
import MyInfo from "./MyInfo.vue";

const router = useRouter();

const props = defineProps({
    userName: {
        type: String,
        required: true,
    },
    userProfileUrl: {
        type: String,
        default: "",
    },
});

const auth = useAuthStore();
const isDropdownOpen = ref(false);
const dropdownRef = ref(null);
const isMyInfoModalVisible = ref(false);

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
};

const handleMenuClick = (menuItem) => {
    isDropdownOpen.value = false;

    switch (menuItem) {
        case "마이 페이지":
            isMyInfoModalVisible.value = true;
            break;
        case "로그아웃":
            // 로그아웃 처리
            handleLogout();
            break;
    }
};

const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
        // 로그아웃 로직
        await api.post("/api/auth/logout");
        auth.clearAccessToken();

        // 로그인 페이지로 리다이렉트
        router.push("/login");
    }
};

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isDropdownOpen.value = false;
    }
};

const closeMyInfoModal = () => {
  isMyInfoModalVisible.value = false;
}

onMounted(() => {
    document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.profile-dropdown {
  position: relative;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar__username {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 1000;
}

.navbar__user {
  width: 28px;
  height: 28px;
  background: #e6f0ff;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
  transition: background-color 0.2s;
}

.navbar__user:hover {
  background: #d1e7ff;
}

.navbar__profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 100px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  padding: 4px 0;
  z-index: 1000;
}

.dropdown-item {
  padding: 12px 16px;
  color: #374151;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item:first-child {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.dropdown-item:last-child {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.navbar__profile-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  background: #e6f0ff;
  border-radius: 50%;
}
</style>
