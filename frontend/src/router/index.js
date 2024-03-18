import Vue from "vue";
import Router from "vue-router";
import { store } from "../store";

import Layout from "../components/layout";

import Aircrafts from "../pages/aircrafts.vue";
import AircraftFiles from "../pages/aircraft_files.vue";
import Reports from "../pages/reports.vue";
import Insights from "../pages/insights.vue";

import Login from "../pages/login.vue";
import NotFound from "../pages/not_found";

Vue.use(Router);

const routes = [
  {
    path: "",
    redirect: () => {
      console.log(store.getters.role);
      if (store.getters.role) {
       
        if (["client", "admin","uploader"].includes(store.getters.role)) {
          return store.getters.role;
        }
        store.dispatch("logout");
        return "login";
      }
      return "login";
    }
  },
  {
    path: "/client",
    component: Layout,
    beforeEnter: (to, from, next) => {
      if (["client"].includes(store.getters.role)) {
        return next();
      }
      return next("/");
    },
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: "",
        redirect: "aircrafts"
      },
      {
        path: "aircrafts",
        name: "aircrafts",
        component: Aircrafts,
        meta: {
          title: "Aircrafts | Client"
        }
      },
      {
        path: "aircrafts/files/:id",
        name: "aircraft-files",
        component: AircraftFiles,
        meta: {
          title: "Aircraft Files | Client"
        }
      },
      {
        path: "reports",
        name: "reports",
        component: Reports,
        meta: {
          title: "Aircraft Reports | Client"
        }
      },
      {
        path: "insights",
        name: "insights",
        component: Insights,
        meta: {
          title: "Report Insights | Client"
        }
      }
    ]
  },
  {
    path: "/uploader",
    component: Layout,
    beforeEnter: (to, from, next) => {
      if (["uploader"].includes(store.getters.role)) {
        return next();
      }
      return next("/");
    },
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: "",
        redirect: "aircrafts"
      },
      {
        path: "aircrafts",
        name: "uploader-aircrafts",
        component: Aircrafts,
        meta: {
          title: "Aircrafts | Uploader"
        }
      },
      {
        path: "aircrafts/files/:id",
        name: "uploader-aircraft-files",
        component: AircraftFiles,
        meta: {
          title: "Aircraft Files | Uploader"
        }
      }
    ]
  },
  {
    path: "/admin",
    component: Layout,
    beforeEnter: (to, from, next) => {
      console.log(store.getters.role);
      if (["admin"].includes(store.getters.role)) {
        return next();
      }
      return next("/");
    },
    meta: {
      requiresAuth: true,
      role: ["admin"]
    },
    children: [
      {
        path: "",
        redirect: "aircrafts"
      },
      {
        path: "aircrafts",
        name: "admin-aircrafts",
        component: Aircrafts,
        meta: {
          title: "Aircrafts | Admin"
        }
      },
      {
        path: "aircrafts/files/:id",
        name: "admin-aircraft-files",
        component: AircraftFiles,
        meta: {
          title: "Aircraft Files | Admin"
        }
      },
      {
        path: "reports",
        name: "admin-reports",
        component: Reports,
        meta: {
          title: "Aircraft Reports | Admin"
        }
      },
      {
        path: "insights",
        name: "admin-insights",
        component: Insights,
        meta: {
          title: "Report Insights | Admin"
        }
      }
    ]
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      title: "Login",
      hideForAuth: true,
      requiresAuth: false
    }
  },
  {
    path: "*",
    name: "not-found",
    component: NotFound
  }
];

const router = new Router({
  routes,
  base: "/",
  mode: "history",
  linkActiveClass: "active",
  scrollBehavior() {
    return { x: 0, y: 0 };
  }
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) document.title = to.meta.title;
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters.loggedIn) {
      next({
        path: "/login",
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    if (to.matched.some((record) => record.meta.hideForAuth)) {
      if (store.getters.loggedIn) {
        return next("/");
      }
    }
    next();
  }
});

export default router;
