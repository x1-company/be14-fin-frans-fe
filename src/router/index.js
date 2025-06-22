import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/auth/Login.vue";
import SupplierInfoView from "@/views/hq/supplier/InfoView.vue";
import PasswordChange from "@/views/auth/PasswordChange.vue";
import ApprovalListView from "@/views/hq/approval/InfoView.vue";
import WarehouseInfoView from "@/views/hq/warehouse/InfoView.vue";
import OrderInfoView from "@/views/hq/orders/OrderInfoView.vue";
import OrderDetailPage from "@/views/hq/orders/OrderDetailPage.vue";
import HRMView from "@/views/hq/user/InfoView.vue";
import PurchaseInfoView from "@/views/hq/purchase/InfoView.vue";
import FranchisePage from "@/views/franchise/FranchisePage.vue";
import FrOrderDetailPage from "@/views/franchise/orders/FrOrderDetailPage.vue";
import SupplierPage from "@/views/auth/supplier/SupplierPage.vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import notificationService from "@/lib/notificationService";
import FranchiseManagePage from "@/views/hq/franchise/FranchiseManagePage.vue";

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
          console.log('유효하지 않은 토큰 발견, 정리 중...');
          authStore.clearAccessToken();
          notificationStore.reset();
          notificationService.cleanup();
        }

        // 이미 로그인된 상태라면 적절한 페이지로 리다이렉트
        if (authStore.accessToken && authStore.decodedToken) {
          // 사용자 타입에 따라 리다이렉트
          if (authStore.franchiseId) {
            next('/franchise');
          } else if (authStore.supplierId) {
            next('/supplier');
          } else {
            next('/approval'); // 추후 부서에 따라 수정 필요함
          }
        } else {
          next();
        }
      }
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
      path: '/hq/franchise',
      name: 'FranchiseManagement',
      component: FranchiseManagePage,
    },
    
    // {
    //   path: "/orders",
    //   name: "orders",
    //   component: OrderInfoView,
    // },
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
      path: "/purchase",
      name: "purchase",
      component: PurchaseInfoView,
    },
    {
      path: "/purchase/register",
      name: "PurchaseRegister",
      component: () => import('@/views/hq/purchase/PurchaseRegisterView.vue')
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
      component: SupplierPage,
    },
    ...(import.meta.env.DEV ? [{
      path: "/test-notification",
      name: "test-notification",
      component: TestNotificationView,
    }] : [])
  ],
});

// 전역 라우터 가드
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // 로그인 페이지가 아닌 경우에만 인증 확인
  if (to.name !== 'login' && to.name !== 'password-change') {
    // 토큰이 없거나 유효하지 않은 경우 로그인 페이지로 리다이렉트
    if (!authStore.accessToken || !authStore.decodedToken) {
      console.log('인증되지 않은 접근, 로그인 페이지로 리다이렉트');
      next('/login');
      return;
    }
  }

  next();
});

export default router;
