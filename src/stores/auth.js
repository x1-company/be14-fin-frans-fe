import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import { getDepartmentNameById, dutyMap, positionMap } from "@/enums/hqEnums";

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
  },
  actions: {
    setAccessToken(token) {
      this.accessToken = token;
      // 개발 편의를 위한 로컬 스토리지 저장
      localStorage.setItem("accessToken", token); // ✅ 저장
    },
    clearAccessToken() {
      this.accessToken = "";
      // 개발 편의를 위한 로컬 스토리지 저장
      localStorage.removeItem("accessToken"); // ✅ 삭제
    },
  },
});
