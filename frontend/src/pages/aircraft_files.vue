<template>
  <div>
    <Breadcrumbs :title="'Aircraft Files | ' + aircraft_name" />
    <!-- Container-fluid starts-->
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <b-row>
                <b-col md="6">
                  <b-input-group class="datatable-btn w-100">
                    <b-form-input
                      v-model="filter"
                      placeholder="Type to Search"
                    ></b-form-input>
                    <b-input-group-append>
                      <b-button :disabled="!filter" @click="filter = ''"
                        >Clear</b-button
                      >
                    </b-input-group-append>
                  </b-input-group>
                </b-col>

                <b-col md="6" class="text-right">
                  <b-button @click="upload" variant="primary"
                    >Upload Files</b-button
                  >
                </b-col>
              </b-row>
            </div>
            <div class="card-body pt-0">
              <div class="table-responsive">
                <b-table
                  show-empty
                  hover
                  :busy="loading"
                  :items="items"
                  :fields="tablefields"
                  :filter="filter"
                  :filter-included-fields="filterIncludedFields"
                  :current-page="currentPage"
                  :per-page="perPage"
                  @filtered="onFiltered"
                >
                  <template #table-busy>
                    <div class="text-center text-danger my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong>Loading...</strong>
                    </div>
                  </template>
                  <template #cell(index)="data">
                    {{ data.index + ((currentPage-1)*perPage) + 1 }}
                  </template>
                  <template v-slot:cell(files)="data">
                    <div v-if="data.item.reports.length==0">
                      <small>{{ data.item.files }}</small>
                    </div>
                    <div v-else style="display : flex;">
                      <div style="width : 75%" >
                        <small>{{ data.item.files }}</small>
                      </div>
                      <div  style="width : 5%;padding-left: 20%;padding-top: 2%;">
                        <img src="../assets/images/report_upload.png"  style="height: 20px; "/>
                      </div>
                    </div>
                  </template>
                  <template v-slot:cell(action)="data">
                    <b-dropdown right variant="light">
                      <b-dropdown-item @click="downloadFiles(data.item)"
                        >Download</b-dropdown-item
                      >
                      <b-dropdown-item @click="uploadReport(data.item)"
                        >Upload Report</b-dropdown-item
                      >
                      <b-dropdown-item
                        @click="deleteFile(data.item)"
                        variant="danger"
                        >Delete</b-dropdown-item
                      >
                    </b-dropdown>
                  </template>
                  <template v-slot:cell(client_action)="data">
                    <b-dropdown right text="Action" variant="light">
                      <b-dropdown-item @click="downloadFiles(data.item)"
                        >Download</b-dropdown-item
                      >
                    </b-dropdown>
                  </template>
                </b-table>
              </div>
              <b-col md="6">
                <b-pagination
                  v-model="currentPage"
                  :total-rows="totalRows"
                  :per-page="perPage"
                  class="my-0"
                ></b-pagination>
              </b-col>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Container-fluid Ends-->
    <uploadFilesModal @close="fetchFlightsFiles()" ref="uploadFilesModal" />
    <filesDownload
      @cancel="fetchFlightsFiles()"
      @close="fetchFlightsFiles()"
      ref="filesDownload"
    />
    <filesDelete ref="filesDelete" @deleted="fetchReportsAfterDelete" />
    <uploadReportsModal @close="goToReports" ref="uploadReportsModal" />
  </div>
</template>

<script>
import filesDelete from "../modals/aircraft_files_delete.vue"
import moment from "moment";
import prettyBytes from "pretty-bytes";
import uploadFilesModal from "../modals/upload_aircraft_files";
import filesDownload from "../modals/files_download";
import uploadReportsModal from "../modals/upload_reports";
export default {
  data() {
    return {
      aircraft_name: "",
      tablefields: [
        {
        key: 'index',
        label: '#',
        },
        // { key: "id", label: "Sr", sortable: true },
        { key: "files", label: "File Name", sortable: true },
        { key: "size", label: "Size", sortable: true },
        { key: "count", label: "Count", sortable: true },
        { key: "base", label: "Base", sortable: true },
        { key: "comment", label: "Comment", sortable: true },
        { key: "createdAt", label: "CreatedAt", sortable: true },
      ],
      items: [],
      loading: false,
      filter: null,
      filterIncludedFields: ["files", "comment", "base"],
      totalRows: 0,
      currentPage: 1,
      perPage: 20,
    };
  },
  beforeRouteUpdate(to, from, next) {
    this.fetchFlights();
    this.fetchFlightsFiles();
    next();
  },
  computed: {
    sortOptions() {
      return this.tablefields
        .filter((f) => f.sortable)
        .map((f) => {
          return { text: f.label, value: f.key };
        });
    },
  },
  created() {
    this.fetchFlights()
  },
  components: {
    uploadFilesModal,
    filesDownload,
    uploadReportsModal,
    filesDelete
  },
  mounted() {
    if (this.$store.state.auth.role === "admin") {
      this.tablefields.push({
        key: "last_downloaded",
        label: "Last downloaded",
      });
      this.tablefields.push({ key: "action", label: "Action" });
    }
    if (this.$store.state.auth.role === "client") {
      this.tablefields.push({ key: "client_action", label: "Action" });
    }
    this.fetchFlightsFiles();
  },
  methods: {
    deleteFile(data){
      this.$refs.filesDelete.open(data);
    },
    fetchReportsAfterDelete(){
      this.fetchFlightsFiles();
    },
    fetchFlights() {
      this.$axios.get(`aircrafts/${this.$route.params.id}`).then(({ data }) => {
        if (data) {
          this.aircraft_name = `${data.name} (${data.aircraft_serial_number})`;
        }
      });
    },
    fetchFlightsFiles() {
      this.loading = true;
      this.$axios
        .get(
          "aircraft-files/?_sort=id:DESC&aircraft_in=" + this.$route.params.id
        )
        .then((result) => {
          const data = result.data;
          this.totalRows = data.length;
          this.items = data.map((item) => {
            return {
              ...item,
              files: item.file.map((file) => file.name).join(", "),
              count: item.file.length,
              last_downloaded: item.last_downloaded
                ? item.last_downloaded.username
                : "",
              _rowVariant: item.last_downloaded ? "" : "warning",
              size: prettyBytes(
                item.file.reduce((acc, curr) => acc + curr.size, 0) * 1024
              ),
              createdAt: moment(item.created_at).format("DD/MM/YYYY h:mm a"),
            };
          });
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
          this.loading = false;
        });
    },
    upload() {
      this.$refs.uploadFilesModal.open(this.$route.params.id,this.aircraft_name);
    },
    goToReports() {
      this.$router.push("/admin/reports");
    },
    uploadReport(data) {
      this.$refs.uploadReportsModal.open(data.id,this.aircraft_name);
    },
    downloadFiles(data) {
      this.$refs.filesDownload.open(data);
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
};
</script>