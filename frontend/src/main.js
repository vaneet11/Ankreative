import Vue from "vue";
import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import router from "./router";
import Toasted from "vue-toasted";
import Breadcrumbs from "./components/bread_crumbs";
import { store } from "./store";
import VueFeather from "vue-feather";
import DateRangePicker from 'vue2-daterange-picker';
import VueSweetalert2 from 'vue-sweetalert2';
import vSelect from "vue-select";
import axios from "axios";
import VueApexCharts from 'vue-apexcharts';
import vue2Dropzone from 'vue2-dropzone'
import ToggleButton from 'vue-js-toggle-button'

const axiosConfig = {
  // baseURL: "https://admin.rcafdm-afro.com",
  // baseURL:"https://admin.rcafoqa.com",
  //baseURL: "https://admin.rcs.com",
  baseURL: "http://localhost:1337",
  timeout: 30000
};
import vClickOutside from 'v-click-outside'
Vue.use(vClickOutside)
import PxCard from "./components/Pxcard.vue";
Vue.use(ToggleButton)
Vue.component(PxCard.name, PxCard);
Vue.component("vue-dropzone",vue2Dropzone)
// Import Theme scss
import "./assets/scss/app.scss";
Vue.use(VueApexCharts);
Vue.component("Apexchart", VueApexCharts);
Vue.component("v-select", vSelect);
Vue.use(VueFeather);
Vue.use(BootstrapVue);
Vue.use(Toasted, {
  iconPack: "fontawesome"
});
Vue.use(VueSweetalert2);
Vue.component("DateRangePicker",  DateRangePicker);
Vue.component("Breadcrumbs", Breadcrumbs);

Vue.prototype.$axios = axios.create(axiosConfig);

new Vue({
  router,
  store,
  created() {
    Vue.prototype.$axios.interceptors.request.use(
      (config) => {
        let token = store.state.auth.token;
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  },
  render: (h) => h(App)
}).$mount("#app");
