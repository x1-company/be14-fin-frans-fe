import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/auth/Login.vue";
import SupplierInfoView from "@/views/hq/supplier/InfoView.vue";
import PasswordChange from "@/views/auth/PasswordChange.vue";
import ApprovalListView from "@/views/hq/approval/InfoView.vue";
import WarehouseInfoView from "@/views/hq/warehouse/InfoView.vue";
import OrderInfoView from "@/views/hq/orders/OrderInfoView.vue";
import OrderDetailPage from "@/views/hq/orders/OrderDetailPage.vue";
import HRMView from "@/views/hq/user/InfoView.vue";
import FranchisePage from "@/views/franchise/FranchisePage.vue";
import SupplierPage from "@/views/auth/supplier/SupplierPage.vue";

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
      path: "/warehouse",
      name: "warehouse",
      component: WarehouseInfoView,
    },
    {
      path: "/orders",
      name: "orders",
      component: OrderInfoView,
    },
    {
      path: "/orders/:orderId",
      name: "OrderDetail",
      component: OrderDetailPage,
      props: true,
    },
    {
      path: "/hrm",
      name: "hrm",
      component: HRMView,
    },
    {
      path: "/franchise",
      name: "franchise",
      component: FranchisePage,
    },
    {
      path: "/supplier",
      name: "supplier",
      component: SupplierPage,
    },
    ...(import.meta.env.DEV ? [{
      path: "/test-notification",
      name: "test-notification",
      component: TestNotificationView,
    }] : [])
  ],
});

export default router;
