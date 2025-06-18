import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/auth/Login.vue";
import SupplierInfoView from "@/views/hq/supplier/InfoView.vue";
import PasswordChange from "@/views/auth/PasswordChange.vue";
import ApprovalListView from "@/views/hq/approval/InfoView.vue";
import OrderInfoView from "@/views/hq/orders/OrderInfoView.vue";
import HRMView from "@/views/hq/user/InfoView.vue"

// 개발 환경에서만 테스트 페이지 import
let TestNotificationView = null;
if (import.meta.env.DEV) {
  TestNotificationView = () => import("@/views/TestNotification.vue");
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || "/"),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/password-change",
      name: "password-change",
      component: PasswordChange,
    },
    {
      path: "/supplier",
      name: "supplier",
      component: SupplierInfoView,
    },
    {
      path: "/approval",
      name: "approval",
      component: ApprovalListView,
    },
    {
      path: "/orders",
      name: "orders",
      component: OrderInfoView,
    },
    {
      path: "/hrm",
      name: "hrm",
      component: HRMView,
    },
    // 개발 환경에서만 테스트 페이지 라우트 추가
    ...(import.meta.env.DEV ? [{
      path: "/test-notification",
      name: "test-notification",
      component: TestNotificationView,
    }] : [])
  ],
});

export default router;
