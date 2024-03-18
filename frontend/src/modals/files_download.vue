<template>
  <b-modal
    size="lg"
    title="Download Files"
    @cancel="$emit('cancel')"
    @close="$emit('close')"
    v-model="isOpened"
    centered
  >
    <div class="container-fluid mt-4 mb-4">
      <div class="text-right">
        <button @click="downloadAll()" class="btn btn-sm btn-primary">
          DOWNLOAD ALL
        </button>
      </div>
      <b-list-group flush tag="ul">
        <b-list-group-item
          v-for="file in data.file"
          :key="file.id"
          @click="downloadFile(file)"
          action
          role="button"
          tag="li"
          class="d-flex justify-content-between align-items-center cursor-pointer"
          >{{ file.name }}
          <span>
            <b-badge variant="default" class="counter digits"
              >DOWNLOAD {{ prettyBytes(file.size * 1024) }}</b-badge
            >
          </span>
        </b-list-group-item>
      </b-list-group>
    </div>
    <template #modal-footer="props">
      <div class="row">
        <div class="col">
          <div class="form-group mb-0">
            <button @click="props.cancel" class="btn btn-danger mr-3">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import prettyBytes from "pretty-bytes";
export default {
  data() {
    return {
      isOpened: false,
      data: {},
      prettyBytes,
      pendingTask: false,
    };
  },
  methods: {
    downloadAs(url, name){
    this.$axios.get(url, {
    headers: {
      "Content-Type": "application/octet-stream"
    },
    responseType: "blob"
  })
    .then(response => {
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(response.data);
      a.href = url;
      a.download = name;
      a.click();
    })
    .catch(err => {
      console.log("error", err);
    });
  },
    downloadFile(file) {
      this.downloadAs(this.$axios.defaults.baseURL + file.url, file.name);
      this.downloaded().then(() => {
        this.$emit('close');
      });
    },
    downloadAll() {
      var count = 0;
      this.downloaded().then(() => {
        this.data.file.forEach((file) => {
          count++;
          //console.log("download :" +count + " "+ this.$axios.defaults.baseURL + file.url, file.name);
          setTimeout(()=>{
            this.downloadAs(this.$axios.defaults.baseURL + file.url, file.name);
          },count*300);
        });
        this.$emit('close');
      });
    },
    downloaded() {
      return this.$axios.put("aircraft-files/" + this.data.id, {
        last_downloaded: this.$store.state.auth.user.id,
      });
    },
    open(data) {
      this.data = {};
      if (data) {
        this.data = data;
        this.isOpened = true;
      }
    },
  },
};
</script>