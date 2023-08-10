import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import LayoutHeader from "@/views/LayoutHeader.vue";
import ProposalList from "@/views/ProposalList.vue";
import ProposalDetail from "@/views/ProposalDetail.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: LayoutHeader,
    children: [
      {
        path: "",
        component: ProposalList,
        name: "proposalList",
        sensitive: true,
      },
      {
        path: "/proposal/:id",
        component: ProposalDetail,
        name: "proposal",
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
