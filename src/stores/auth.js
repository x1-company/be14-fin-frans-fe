import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import { departmentMap, dutyMap, positionMap } from "@/enums/hqEnums";

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
      return departmentMap[this.departmentId] || "";
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
      // localStorage.setItem("accessToken", token); // ✅ 저장
    },
    clearAccessToken() {
      this.accessToken = "";
      // localStorage.removeItem("accessToken"); // ✅ 삭제
    },
  },
});
