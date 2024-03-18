<template>
  <div>
    <!-- page-wrapper Start-->
    <div class="container-fluid p-0">
      <div class="row m-0">
        <div class="col-12 p-0">
          <div class="login-card">
            <div>
              <div>
                <a class="logo">
                  <img style="max-height: 200px;"
                    class="img-fluid for-light"
                    src="../assets/images/logo-RCA.png"
                    alt="looginpage"
                  />
                  <img style="max-height: 200px;"
                    class="img-fluid for-dark"
                    src="../assets/images/logo-RCA.png"
                    alt="looginpage"
                  />
                </a>
              </div>
              <div class="login-main">
                <b-card no-body>
                  <b-tabs pills vertical>
                    <b-card-text>
                      <form class="theme-form" @submit.prevent="login">
                        <h4>Sign in to account</h4>
                        <p>Enter your email & password to login</p>
                        <div class="form-group">
                          <label class="col-form-label">Email Address</label>
                          <input
                            v-model="email"
                            class="form-control"
                            type="email"
                            required=""
                            placeholder="Test@gmail.com"
                            :class="{
                              'is-invalid': submitted && !email,
                            }"
                          />
                          <div
                            v-show="submitted && !email"
                            class="invalid-feedback"
                          >
                            Email is required
                          </div>
                        </div>
                        <div class="form-group">
                          <label class="col-form-label">Password</label>
                          <input
                            v-model="password"
                            autocomplete=""
                            class="form-control"
                            :type="type"
                            name="login[password]"
                            required=""
                            placeholder="*********"
                            :class="{
                              'is-invalid': submitted && !email,
                            }"
                          />
                          <div
                            v-show="submitted && !password"
                            class="invalid-feedback"
                          >
                            Email is required
                          </div>
                          <div class="show-hide" @click="showPassword">
                            <span class="show"></span>
                          </div>
                        </div>
                        <div class="form-group mb-0">
                          <button
                            class="btn mt-3 btn-primary btn-block"
                            type="submit"
                          >
                            Login
                          </button>
                        </div>

                        <!--  <p class="mt-4 mb-0">
                            Don't have account?
                            <router-link
                              class="ml-2"
                              tag="a"
                              to="/auth/register"
                            >
                              Create Account
                            </router-link>
                          </p> -->
                      </form>
                    </b-card-text>
                  </b-tabs>
                </b-card>
              </div>
              <div>
                <a class="logo">
                  <img style="bottom: 50px; width: 150px;"
                    class="img-fluid for-light"
                    src="../assets/images/logo.png"
                    alt="looginpage"
                  />
                  <img style="bottom: 50px; width: 150px;"
                    class="img-fluid for-dark"
                    src="../assets/images/logo.png"
                    alt="looginpage"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- latest jquery-->
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      type: "password",
      email: "",
      password: "",
      submitted: false,
    };
  },
  methods: {
    // show/hide password
    showPassword: function () {
      if (this.type === "password") {
        this.type = "text";
      } else {
        this.type = "password";
      }
    },

    login() {
      this.submitted = true;
      this.$axios
        .post("/auth/local", {
          identifier: this.email,
          password: this.password,
        })
        .then((result) => {
          const data = result.data;
          this.$store.dispatch("login", data).then(() => {
            this.$router.push("/");
          }).catch(console.error);
        })
        .catch((err) => {
          if (err.response.data.message.length) {
            console.log(
              err.response.data.message.length &&
                err.response.data.message[0].messages
            );
            return this.$toasted.show(
              err.response.data.message[0].messages[0].message,
              {
                theme: "outline",
                position: "top-right",
                type: "default",
                duration: 4000,
              }
            );
          }
          this.$toasted.show(" Unable to login ", {
            theme: "outline",
            position: "top-right",
            type: "default",
            duration: 4000,
          });
        })
        .finally(() => {
          this.submitted = false;
        });
    },
  },
};
</script>