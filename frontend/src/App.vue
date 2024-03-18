<template>
  <div id="app">
    <div class="loader-wrapper" :class="{ loderhide: !show }">
      <div class="loader-index">
        <span></span>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
  data() {
    return {
      show: true,
    };
  },
  created: function () {
   /*  this.$axios.interceptors.response.use(undefined, (err) => {
      return new Promise(function () {
        if (err.status === 401 && err.config && !err.config.__isRetryRequest) {
          // if you ever get an unauthorized, logout the user
          this.$store.dispatch("logout");
          this.$router.replace("/login");
        }
      });
    }); */
  },
  mounted() {
    this.timeOut();
  },
  methods: {
    timeOut() {
      var self = this;
      setTimeout(function () {
        self.show = false;
      }, 1000);
    },
  },
};
</script>

<style lang="scss" scoped>
.loader-wrapper.loderhide {
  display: none;
}
</style>
