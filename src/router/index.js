import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/auth/Login.vue";
import SupplierInfoView from "@/views/hq/supplier/InfoView.vue";
import PasswordChange from "@/views/auth/PasswordChange.vue";
import ApprovalListView from "@/views/hq/approval/InfoView.vue";
import WarehouseInfoView from "@/views/hq/warehouse/InfoView.vue";
import OrderDetailPage from "@/views/hq/orders/OrderDetailPage.vue";
import HRMView from "@/views/hq/user/InfoView.vue";
import PurchaseInfoView from "@/views/hq/purchase/InfoView.vue";
import FranchisePage from "@/views/franchise/FranchisePage.vue";
import FrOrderDetailPage from "@/views/franchise/orders/FrOrderDetailPage.vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import notificationService from "@/lib/notificationService";
import FranchiseManagePage from "@/views/hq/franchise/FranchiseManagePage.vue";
// import ApprovalCreateDetail from "@/components/hq/approval/Detail/ApprovalCreateDetail.vue";
import ApprovalCreateDetail from "@/views/hq/approval/InfoView.vue";

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
      beforeEnter: (to, from, next) => {
        // 로그인 페이지 접근 시 토큰과 알림 정리
        const authStore = useAuthStore();
        const notificationStore = useNotificationStore();

        // 토큰이 있지만 유효하지 않은 경우 정리
        if (authStore.accessToken && !authStore.decodedToken) {
          console.log("유효하지 않은 토큰 발견, 정리 중...");
          authStore.clearAccessToken();
          notificationStore.reset();
          notificationService.cleanup();
        }

        // 이미 로그인된 상태라면 적절한 페이지로 리다이렉트
        if (authStore.accessToken && authStore.decodedToken) {
          // 사용자 타입에 따라 리다이렉트
          if (authStore.franchiseId) {
            next("/franchise");
          } else if (authStore.supplierId) {
            next("/supplier");
          } else if (authStore.userType === 'HQ') {
            next("/hq/franchise");
          } else {
            next(); // 기본 경로로 이동
          }
        } else {
          next();
        }
      },
    },
    {
      path: "/password-change",
      name: "password-change",
      component: PasswordChange,
    },
    {
      path: "/hq-supplier",
      name: "hq-supplier",
      component: SupplierInfoView,
    },
    {
      path: "/approval",
      name: "approval",
      component: ApprovalListView,
    },
    {
      path: "/approval/:approvalId",
      name: "approval-detail",
      component: ApprovalListView,
      props: true,
    },
    {
      path: "/approval/create/:approvalId",
      name: "approval-create-detail",
      component: ApprovalCreateDetail,
      props: true,
    },
    {
      path: "/approval/register/:approvalId?",
      name: "approval-register",
      component: ApprovalListView,
      props: true,
    },
    {
      path: "/approval/edit/:id",
      name: "approval-edit",
      component: () => import("@/components/hq/approval/ApprovalEdit.vue"),
      props: true,
    },
    {
      path: "/warehouse",
      name: "warehouse",
      component: WarehouseInfoView,
    },
    {
      path: "/warehouse/product/:id",
      name: "ProductDetail",
      component: WarehouseInfoView,
      props: true,
    },
    {
      path: "/warehouse/product/register",
      name: "ProductRegister",
      component: WarehouseInfoView,
    },
    {
      path: "/hq/franchise",
      name: "FranchiseManagement",
      component: FranchiseManagePage,
    },
    {
      path: "/hq/franchise/orders/:orderId",
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
      path: "/purchase",
      name: "purchase",
      component: PurchaseInfoView,
    },
    {
      path: "/purchase/register",
      name: "PurchaseRegister",
      component: () => import("@/views/hq/purchase/PurchaseRegisterView.vue"),
    },
    {
      path: "/purchase/detail/:id",
      name: "PurchaseRequestDetail",
      component: () =>
        import("@/components/hq/purchase/PurchaseRequestDetail.vue"),
      props: true,
    },
    {
      path: "/franchise",
      name: "franchise",
      component: FranchisePage,
    },
    {
      path: "/franchise/orders/:orderId",
      name: "FranchiseOrderDetail",
      component: FrOrderDetailPage,
      props: true,
    },
    {
      path: "/supplier",
      name: "supplier",
      component: () => import("@/views/auth/supplier/SupplierEntryPoint.vue"),
    },
    {
      path: "/hq/user/info",
      name: "HqUserInfo",
      component: () => import("@/views/hq/user/InfoView.vue"),
    },
    ...(import.meta.env.DEV
      ? [
          {
            path: "/test-notification",
            name: "test-notification",
            component: TestNotificationView,
          },
        ]
      : []),
  ],
});

// 전역 라우터 가드
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 로그인 페이지가 아닌 경우에만 인증 확인
  if (to.name !== "login" && to.name !== "password-change") {
    // 토큰이 없거나 유효하지 않은 경우 로그인 페이지로 리다이렉트
    if (!authStore.accessToken || !authStore.decodedToken) {
      console.log("인증되지 않은 접근, 로그인 페이지로 리다이렉트");
      next("/login");
      return;
    }
  }

  next();
});

export default router;
