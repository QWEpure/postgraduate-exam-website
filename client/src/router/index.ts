import { createRouter, createWebHistory } from "vue-router";

export default createRouter({
  history: createWebHistory(),
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return undefined
    return { top: 0 }
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/HomePage.vue"),
    },
    {
      path: "/search",
      name: "search",
      component: () => import("@/views/SearchPage.vue"),
    },
    {
      path: "/knowledge/:bookId?/:sectionId?",
      name: "knowledge",
      component: () => import("@/views/KnowledgePage.vue"),
    },
    {
      path: "/knowledge-editor/:pointId?",
      name: "knowledge-editor",
      component: () => import("@/views/KnowledgeEditorPage.vue"),
    },
    {
      path: "/exams",
      name: "exams",
      component: () => import("@/views/ExamPage.vue"),
    },
  ],
});
