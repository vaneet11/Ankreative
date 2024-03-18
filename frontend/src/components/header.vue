<template>
  <div class="header-wrapper row m-0">
    <div class="header-logo-wrapper">
      <div class="logo-wrapper">
        <router-link to="/">
          <img class="img-fluid" src="../assets/images/logo/logo.png" alt />
        </router-link>
      </div>
    </div>
    <div class="header-logo-wrapper">
      <div class="logo-wrapper">
        <router-link to="/">
          <img class="img-fluid" src="../assets/images/logo/logo.png" alt />
        </router-link>
      </div>
      <div class="toggle-sidebar" @click="toggle_sidebar">
        <feather
          class="status_toggle middle sidebar-toggle"
          type="sliders"
          id="sidebar-toggle"
        ></feather>
      </div>
    </div>
    <div class="left-header col horizontal-wrapper pl-0"></div>
    <div class="nav-right col-8 pull-right right-header p-0">
      <ul class="nav-menus">
        <li>
          <div class="mode">
            <i
              class="fa fa-moon-o"
              v-show="mixLayout == 'light-only'"
              @click="customizeMixLayout('dark-only')"
            ></i>
            <i
              class="fa fa-lightbulb-o"
              v-show="mixLayout == 'dark-only'"
              @click="customizeMixLayout('light-only')"
            ></i>
          </div>
        </li>
        <li v-if="notifications.length" class="onhover-dropdown">
          <div class="notification-box">
            <feather type="bell"></feather
            ><span class="badge badge-pill badge-secondary">{{
              notifications.length
            }}</span>
          </div>
          <ul class="notification-dropdown onhover-show-div">
            <li>
              <feather type="bell"></feather>
              <h6 class="f-18 mb-0">Notitications</h6>
            </li>
            <li :key="nt.id" v-for="nt in notifications" @click="goToFiles(nt)">
              <p>
                <i class="fa fa-circle-o mr-2 font-primary"> </i>File uploaded
                for {{ nt.aircraft.name }}
                <span class="pull-right">{{ fromNow(nt.created_at) }}</span>
              </p>
            </li>
          </ul>
        </li>
        <li v-else class="onhover-dropdown">
          <div class="notification-box">
            <feather type="bell"></feather
            ><span class="badge badge-pill badge-secondary">0</span>
          </div>
          <ul class="notification-dropdown onhover-show-div">
            <li>
              <feather type="bell"></feather>
              <h6 class="f-18 mb-0">Notitications</h6>
            </li>
            <li>
               Notifications are empty.
            </li>
          </ul>
        </li>
        <li class="maximize">
          <a
            class="text-dark"
            href="javascript:void(0)"
            @click="toggle_fullscreen()"
          >
            <feather type="maximize"></feather
          ></a>
        </li>
        <li class="profile-nav onhover-dropdown p-0 mr-0">
          <div class="media profile-media">
            <img
              class="b-r-10"
              src="../assets/images/dashboard/profile.jpg"
              alt=""
            />
            <div class="media-body">
              <span>{{ username }}</span>
              <p class="mb-0 font-roboto">
                {{ role }} <i class="middle fa fa-angle-down"></i>
              </p>
            </div>
          </div>
          <ul class="profile-dropdown onhover-show-div">
            <!-- <li>
              <a href="#"
                ><feather type="user"></feather><span>Account </span></a
              > -->
            <!-- </li>
            <li>
              <a href="#"><feather type="mail"></feather><span>Inbox</span></a>
            </li>
            <li>
              <a href="#"
                ><feather type="file-text"></feather><span>Taskboard</span></a
              >
            </li>
            <li>
              <a href="#"
                ><feather type="settings"></feather><span>Settings</span></a
              >
            </li> -->
            <li @click="logout">
              <a><feather type="log-in"></feather><span>Log out</span></a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
var body = document.getElementsByTagName("body")[0];
import { mapState } from "vuex";
import moment from "moment";
export default {
  name: "Search",
  data() {
    return {
      terms: "",
      notifications: [],
      searchOpen: false,
      searchResult: false,
      searchResultEmpty: false,
      close_sidebar_var: false,
      clicked: false,
      mobile_toggle: false,
      mobile_search: false,
      openbonusUI: false,
      openLevelmenu: false,
      openlanguage: false,
      mobile_accordian: false,
      mixLayout: "light-only",
    };
  },
  computed: {
    ...mapState({
      menuItems: (state) => state.menu.searchData,
      username: (state) => state.auth.user.username,
      role: (state) => state.auth.role,
      megamenuItems: (state) => state.menu.megamenu,
    }),
  },
  mounted() {
    if (this.$store.state.auth.role === "admin") {
      this.fetchNotifications();
      setInterval(() => {
        this.fetchNotifications();
      }, 5000);
    }
  },
  methods: {
    toggle_sidebar() {
      this.$store.dispatch("menu/opensidebar");
    },
    fromNow(date) {
      return moment(date).fromNow();
    },
    goToFiles(nt) {
      this.$router.push({ name: 'admin-aircraft-files', params: { id: nt.aircraft.id } });
    },
    fetchNotifications() {
      this.$axios
        .get("aircraft-files/?_sort=id:DESC&last_downloaded_null=true")
        .then((res) => {
          this.notifications = res.data;
        })
        .catch(console.error);
    },
    setNavActive(item) {
      this.$store.dispatch("menu/setBonusNavActive", item);
    },
    openlangpicker() {
      this.openlanguage = !this.openlanguage;
    },
    openlevelmenu() {
      this.openLevelmenu = !this.openLevelmenu;
    },
    openmegamenu() {
      this.openbonusUI = !this.openbonusUI;
    },
    changeLocale(locale) {
      this.setLang(locale);
    },
    mobileaccordian() {
      this.mobile_accordian = !this.mobile_accordian;
    },
    logout: function () {
      this.$store.dispatch("logout").then(() => {
        this.$router.replace("/login");
      });
    },
    addFix() {
      body.classList.add("offcanvas");
      this.searchResult = true;
    },
    removeFix() {
      body.classList.remove("offcanvas");
      this.searchResult = false;
      this.terms = "";
    },
    toggle_fullscreen() {
      if (
        (document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)
      ) {
        if (document.documentElement.requestFullScreen) {
          document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
          document.documentElement.webkitRequestFullScreen(
            Element.ALLOW_KEYBOARD_INPUT
          );
        }
      } else {
        if (document.cancelFullScreen) {
          document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        }
      }
    },
    customizeMixLayout(val) {
      this.mixLayout = val;
      this.$store.dispatch("layout/setLayout", val);
    },
  },
  watch: {
    "$i18n.locale"(to, from) {
      if (from !== to) {
        this.$router.go(this.$route.path);
      }
    },
    menuItems: function () {
      this.terms ? this.addFix() : this.removeFix();
      if (!this.menuItems.length) this.searchResultEmpty = true;
      else this.searchResultEmpty = false;
    },
  },
};
</script>
