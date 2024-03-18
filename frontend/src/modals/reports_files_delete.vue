<template>
  <b-modal
    size="lg"
    title="Delete Reports"
    @cancel="$emit('cancel')"
    @close="$emit('close')"
    v-model="isOpened"
    centered
  >
    <div class="container-fluid mt-4 mb-4">
      <div class="text-right" style="padding-right:10px;">
        <button @click="deleteAll(data)" class="btn btn-sm btn-danger">
          DELETE ALL
        </button>
      </div>
      <b-list-group flush tag="ul">
        <b-list-group-item
          v-for="file in data.report_file"
          :key="file.id"
          @click="deleteFile(data,file.id)"
          action
          role="button"
          tag="li"
          class="d-flex justify-content-between align-items-center cursor-pointer"
          >{{ file.name }}
          <span>
            <button type="button" class="btn btn-sm btn-primary" variant="default" 
              >DELETE </button
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
    deleteFile(file,id) {
      if(file.report_file.length==1){
          this.deleteAll(file);
      }
      else{
        this.$swal({
          text: "Are you sure you want to do this?",
          showCancelButton: true,
          confirmButtonText: "I am sure!",
          confirmButtonColor: "#4466f2",
          cancelButtonText: "No!",
          cancelButtonColor: "#efefef",
          reverseButtons: true,
        }).then((_data) => {
          if (_data.value !== true) {
            return;
          }
          const new_file=file.report_file.filter(file1 => file1.id!=id)
          file.report_file=new_file;
          this.$axios
          .put("reports/" + file.id, {
              report_file:new_file
          })
          .then((data)=>{
            this.$emit('deleted')
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
        });
      }
    },
    deleteAll(data) {
      this.$swal({
        text: "Are you sure you want to do this?",
        showCancelButton: true,
        confirmButtonText: "I am sure!",
        confirmButtonColor: "#4466f2",
        cancelButtonText: "No!",
        cancelButtonColor: "#efefef",
        reverseButtons: true,
      }).then((_data) => {
        if (_data.value !== true) {
          return;
        }
        this.$axios
          .delete(`reports/${data.id}`)
          .then(() => {
            this.isOpened= false;
            this.$emit('deleted')
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
          });
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