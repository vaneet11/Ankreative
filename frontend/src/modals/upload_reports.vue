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
                  <label><strong>Upload Report files - {{aircraft_name}}</strong></label>
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
            <br>
            <div class="row">
              <div class="col" md="6">
                <div class="Toggle" align="center">
                    <label align="center">Level 3 Detected :</label>
                    <br>
                  <toggle-button
                    id="changed-font"
                    @change="level3 = $event.value"
                    :width="110"
                    :height="30"
                    :speed="40"
                    :color="{checked: '#DC3545'}"/>
                    <!-- :labels="{checked: 'Detected', unchecked: 'Undetected'}" -->
                </div>
              </div>
              <div class="col" md="6">
                <div class="Toggle" align="center">
                  <label align="center">Bad File Bits :</label>
                  <br>
                  <toggle-button
                    id="changed-font"
                    @change="file_bits = $event.value"
                    :width="110"
                    :height="30"
                    :speed="40"
                    :color="{checked: '#DC3545'}"/>
                    <!-- :labels="{checked: 'Bad File Bits', unchecked: 'Good File Bits'}" -->
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
      level3:false,
      file_bits:false,
      aircraft_name:"",
      isOpened: false,
      fileId: null,
      comment: "",
      pendingTask: false,
      singledropzoneOptions: {
        url: "localhost:5000",
        autoProcessQueue: false,
        thumbnailWidth: 150,
        maxFiles: 5,
        addRemoveLinks: true,
        dictDefaultMessage:
          "<i class='icon-cloud-up'></i><h6>Drop files here or click to upload.</h6>",
      },
    };
  },
  methods: {
    open(fileId,aircraft_name) {
      this.aircraft_name=aircraft_name;
      this.comment = "";
      this.file_bits=false,
      this.level3=false,
      this.fileId = null;
      if (fileId) {
        this.fileId = fileId;
        this.isOpened = true;
      }
    },
    doUpload() {
      if (!this.fileId) {
        alert("fileId is not defined");
        this.isOpened = false;
      }
      const files = this.$refs.filesdropZone.dropzone.files;
      let formData = new FormData();

      if (files.length < 1) {
        return alert("Atleast one file is required.");
      }
      files.map((file) => formData.append("files.report_file", file, file.name));

      formData.append(
        "data",
        JSON.stringify({
          aircraft_file: this.fileId,
          file_bits:this.file_bits,
          level3:this.level3,
          comment: this.comment,
          uploader: this.$store.state.auth.user.id,
        })
      );
      this.pendingTask = true;
      this.$axios
        .post("reports", formData)
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
