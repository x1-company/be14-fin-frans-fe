import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import { getDepartmentNameById, departmentMap, dutyMap, positionMap } from "@/enums/hqEnums";
import notificationService from "@/lib/notificationService";
import { useNotificationStore } from "@/stores/notification";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || "",
  }),
  getters: {
    decodedToken(state) {
      try {
        return state.accessToken ? jwtDecode(state.accessToken) : null;
      } catch (e) {
        return null;
      }
    },
    userId() {
      return this.decodedToken?.userId || null
    },
    userName() {
      return this.decodedToken?.userName || "";
    },
    userProfileUrl() {
      return this.decodedToken?.userProfileUrl || "";
    },
    userSignUrl() {
      return this.decodedToken?.userSignUrl || "";
    },
    departmentId() {
      return this.decodedToken?.departmentId || null;
    },
    departmentName() {
      return getDepartmentNameById(this.departmentId);
    },
    dutyId() {
      return this.decodedToken?.dutyId || null;
    },
    dutyName() {
      return dutyMap[this.dutyId] || "";
    },
    positionId() {
      return this.decodedToken?.positionId || null;
    },
    positionName() {
      return positionMap[this.positionId] || "";
    },
    franchiseId() {
      return this.decodedToken?.franchiseId || null;
    },
    franchiseName() {
      return this.decodedToken?.franchiseName || "";
    },
    supplierId() {
      return this.decodedToken?.supplierId || null;
    },
    supplierName() {
      return this.decodedToken?.supplierName || "";
    },
  },
  actions: {
    async setAccessToken(token) {
      this.accessToken = token;

      // 개발 편의를 위한 로컬 스토리지 저장
      localStorage.setItem("accessToken", token);

      // 토큰이 설정되고 유효한 경우에만 SSE 연결 시작
      if (token && this.decodedToken) {
        try {
          console.log('SSE 연결 시도 중...');
          await notificationService.connect();
          console.log('SSE 연결 성공');

          // 알림 목록도 함께 로드
          console.log('알림 목록 로드 중...');
          await notificationService.fetchNotifications();
          console.log('알림 목록 로드 완료');
        } catch (error) {
          console.error('SSE 연결 실패:', error);
          // SSE 연결 실패해도 로그인은 계속 진행
        }
      } else {
        console.log('토큰이 유효하지 않아 SSE 연결을 건너뜁니다.');
      }
    },
    async clearAccessToken() {
      // 로그아웃 시 SSE 연결 정리
      try {
        await notificationService.cleanup();
        console.log('SSE 연결 정리 완료');
      } catch (error) {
        console.error('SSE 연결 정리 실패:', error);
      }

      this.accessToken = "";
      localStorage.removeItem("accessToken");

      // 알림 스토어도 명시적으로 리셋
      const notificationStore = useNotificationStore();
      notificationStore.reset();
    },
  },
});
