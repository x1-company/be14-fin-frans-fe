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

        <!-- 로그아웃 확인 모달 -->
        <div v-if="isLogoutModalVisible" class="modal-overlay" @click="closeLogoutModal">
            <div class="modal-container" @click.stop>
                <div class="modal-header">
                    <h3 class="modal-title">로그아웃</h3>
                </div>
                <div class="modal-body">
                    <p class="modal-message">정말로 로그아웃 하시겠습니까?</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" @click="closeLogoutModal">
                        취소
                    </button>
                    <button class="btn-confirm" @click="confirmLogout">
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
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
const isLogoutModalVisible = ref(false);

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
            isLogoutModalVisible.value = true;
            break;
    }
};

const closeLogoutModal = () => {
    isLogoutModalVisible.value = false;
};

const confirmLogout = async () => {
    try {
        await api.post("/api/auth/logout");
        await auth.clearAccessToken();
        router.push("/login");
    } catch (error) {
        console.error("로그아웃 실패:", error);
    } finally {
        isLogoutModalVisible.value = false;
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

/* 로그아웃 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease-out;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-body {
  padding: 20px 24px;
}

.modal-message {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-confirm {
  padding: 8px 16px;
  border: none;
  background: #dc2626;
  color: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover {
  background: #b91c1c;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>