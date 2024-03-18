<template>
  <b-modal
    size="lg"
    hide-header
    @close="$emit('close')"
    v-model="isOpened"
    centered
  >
    <div class="container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="p-3">
            <div class="row">
              <div class="col">
                <div class="form-group">
                  <label><strong>Upload Aircraft files - {{aircraft_name}}</strong></label>
                  <vue-dropzone
                    ref="filesdropZone"
                    id="singledropzone"
                    :options="singledropzoneOptions"
                    class="dropzone digits"
                  >
                  </vue-dropzone>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="form-group">
                  <label>Base</label>
                  <input
                    v-model="base"
                    class="form-control"
                    type="text"
                    placeholder=""
                  />
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col">
                <div class="form-group">
                  <label>Comment</label>
                  <textarea
                    v-model="comment"
                    class="form-control"
                    id="exampleFormControlTextarea4"
                    rows="1"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #modal-footer="props">
      <div class="row">
        <div class="col">
          <div class="form-group mb-0">
            <button @click="props.cancel" class="btn btn-danger mr-3">
              Cancel
            </button>
            <button
              :disabled="pendingTask"
              @click="doUpload"
              class="btn btn-success"
            >
              {{ pendingTask ? "Uploading..." : "Upload" }}
              <b-spinner v-if="pendingTask" small label="Spinning"></b-spinner>
            </button>
          </div>
        </div>
      </div>
    </template>
  </b-modal>
</template>
<script>
import vue2Dropzone from "vue2-dropzone";
export default {
  data() {
    return {
      aircraft_name:"",
      isOpened: false,
      flightId: null,
      flag: false,
      base: "",
      comment: "",
      pendingTask: false,
      singledropzoneOptions: {
        url: "localhost:5000",
        autoProcessQueue: false,
        thumbnailWidth: 150,
        maxFiles: 20,
        addRemoveLinks: true,
        dictDefaultMessage:
          "<i class='icon-cloud-up'></i><h6>Drop files here or click to upload.</h6>",
      },
    };
  },
  methods: {
    open(flightId,aircraft_name) {
      this.aircraft_name=aircraft_name;
      this.comment = "";
      this.base = "";
      this.flightId = null;
      if (flightId) {
        this.flightId = flightId;
        this.isOpened = true;
      }
    },
    doUpload() {
      if (!this.flightId) {
        alert("fileId is not defined");
        this.isOpened = false;
      }
      const files = this.$refs.filesdropZone.dropzone.files;
      files.forEach((file)=>{
        if(file.name.startsWith(this.aircraft_name.substring(3,6))==false && file.name.startsWith(this.aircraft_name.substring(0,6))==false){
          this.flag=true;
        }
      })
      if(this.flag){
        return alert("Only "+this.aircraft_name+" files are allowed")
      }
      let formData = new FormData();
      if (!this.base) {
        return alert("Base is required");
      }
      if (files.length < 1) {
        return alert("Atleast one file is required.");
      }
      files.map((file) => formData.append("files.file", file, file.name));
      formData.append(
        "data",
        JSON.stringify({
          aircraft: this.flightId,
          comment: this.comment,
          base: this.base,
        })
      );
      this.pendingTask = true;
      this.$axios
        .post("aircraft-files", formData)
        .then(() => {
          this.isOpened = false;
          this.$emit("close");
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
          this.$toasted.show("Something went wrong", {
            theme: "outline",
            position: "top-right",
            type: "default",
            duration: 4000,
          });
        })
        .finally(() => {
          this.pendingTask = false;
        });
    },
  },
  components: {
    vueDropzone: vue2Dropzone,
  },
};
</script>