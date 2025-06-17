import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/auth/Login.vue";
import SupplierInfoView from "@/views/hq/supplier/InfoView.vue";
import PasswordChange from "@/views/auth/PasswordChange.vue";
import ApprovalListView from "@/views/hq/approval/InfoView.vue";
import HRMView from "@/views/hq/user/InfoView.vue"

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
      path: "/hrm",
      name: "hrm",
      component: HRMView,
    }
  ],
});

export default router;
