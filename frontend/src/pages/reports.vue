<template>
  <div>
    <Breadcrumbs title="Reports" />
    <!-- Container-fluid starts-->
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <b-row>
                <b-col md="6">
                  <label> Select Aircraft: </label>
                  <v-select
                    v-on:input="change"
                    multiple
                    label="name"
                    v-model="selected"
                    :options="options"
                    :selectable="() => selected.length<7"
                  />
                 </b-col>
                <b-col md="6">
                  <b-row>
                    <b-col>
                      <label> Select Range: </label>
                      <div class="form-group flex">
                        <date-range-picker
                          :linkedCalendars="linkedCalendars"
                          ref="dateRange"
                          :opens="opens"
                          :minDate="minDate" :maxDate="maxDate"
                          :singleDatePicker="singleDatePicker"
                          :showWeekNumbers="showWeekNumbers"
                          :showDropdowns="showDropdowns"
                          :autoApply="autoApply"
                          v-model="dateRange"
                          :ranges="show_ranges ? undefined : false"
                          @update="updateValues"
                          :always-show-calendars="false"
                          :alwaysShowCalendars="alwaysShowCalendars"
                          :append-to-body="appendToBody"
                          :closeOnEsc="closeOnEsc">
                          <template #input="picker" style="min-width: 350px;">
                            {{picker.startDate | date}} - {{picker.endDate | date}}
                          </template>
                        </date-range-picker>
                      </div>
                    </b-col>
                  </b-row>
                </b-col>
              </b-row>
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
              </b-row>
            </div>
            <div class="card-body pt-0">
              <div class="table-responsive">
                <b-table
                  hover
                  :busy="loading"
                  :items="fetchReports"
                  :fields="tablefields"
                  :filter="filter"
                  :current-page="currentPage"
                >
                  <template #table-busy>
                    <div class="text-center text-danger my-2">
                      <b-spinner class="align-middle"></b-spinner>
                      <strong>Loading...</strong>
                    </div>
                  </template>
                  <template v-slot:cell(file_bits)="data">
                    <div v-if="data.item.created_at>=august">
                      <span
                        v-if="data.item.file_bits===true || data.item.file_bits===false"
                        class="dot"
                        :class="{
                          'bg-danger': data.item.file_bits===true,
                          'bg-success': data.item.file_bits===false || data.item.file_bits===null,
                        }"
                      ></span>
                    </div>
                  </template>
                  <template v-slot:cell(level3)="data">
                    <div v-if="data.item.created_at>=august">
                      <span
                        v-if="data.item.file_bits===true || data.item.file_bits===false"
                        class="dot"
                        :class="{
                          'bg-danger': data.item.level3===true,
                          'bg-success': data.item.level3===false || data.item.level3===null,
                        }"
                      ></span>
                    </div>
                  </template>
                  <template #cell(index)="data">
                    {{ data.index + ((currentPage-1)*perPage) + 1 }}
                  </template>
                  <template #cell(comment)="data" >
                    <b-form-input v-click-outside="onClickOutside" v-if="selectedRow[data.index] && selectedCell === 'comment'" type="text" v-model="items[data.index].comment" @keydown.enter.native="onChange(data)">
                    </b-form-input>
                    <span v-bind:style="{cursor: selectedcursor}" style="z-index:1000" v-else @click="handleEditCell(data, 'comment')">{{data.value || "NA"}}</span>
                  </template>
                  <template v-slot:cell(files)="data">
                    <div v-if="(data && data.item && data.item.meta &&  data.item.meta.event && data.item.meta.event.length!=0) || (data && data.item && data.item.meta && data.item.meta.phase && data.item.meta.phase.length!=0)">
                      <a
                      href="javascript:void(0)"
                      class="text-primary"
                      @click="downloadReport(data.item)">{{ data.item.files }}</a>
                    </div>
                    <div v-else style="display : flex;">
                      <div style="width : 85%" >
                        <a
                      href="javascript:void(0)"
                      class="text-primary"
                      @click="downloadReport(data.item)">{{ data.item.files }}</a>
                      </div>
                      <div  style="width : 5%;padding-left: 5%;padding-top: 2%;">
                        <img src="../assets/images/report_cancel.png"  style="height: 20px; "/>
                      </div>
                    </div>
                  </template>
                  <template v-slot:cell(action)="data">
                    <b-dropdown right  variant="light">
                      <b-dropdown-item @click="downloadReport(data.item)"
                        >Download Report</b-dropdown-item
                      >
                      <b-dropdown-item @click="editReport(data.item)"
                        >Edit Report</b-dropdown-item
                      >
                      <b-dropdown-item
                        @click="downloadFiles(data.item.aircraft_file)"
                        >Aircraft Files</b-dropdown-item
                      >
                      <b-dropdown-item
                        v-if="$store.state.auth.role == 'admin'"
                        @click="deleteReport(data.item)"
                        variant="danger"
                        >Delete</b-dropdown-item
                      >
                    </b-dropdown>
                  </template>
                </b-table>
              </div>
              <b-col md="6">
                <b-pagination
                  v-model="currentPage"
                  :per-page="perPage"
                  :total-rows="totalRows"
                  class="my-0"
                ></b-pagination>
              </b-col>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Container-fluid Ends-->
    <filesDownload ref="filesDownload"/>
    <filesEditModal ref="filesEditModal" />
    <reportsDownload ref="reportsDownload" />
    <filesDelete ref="filesDelete" @deleted="fetchReportsAfterDelete"/>
    <!--  <uploadFilesModal @close="fetchFlightsFiles()" ref="uploadFilesModal" />
    <filesDownload
      @cancel="fetchFlightsFiles()"
      @close="alert('hello')"
      ref="filesDownload"
    />
    <uploadReportsModal @close="goToReports" ref="uploadReportsModal" /> -->
  </div>
</template>

<script>
import filesDelete from "../modals/reports_files_delete.vue"
import filesEditModal from "../modals/edit_report.vue"
import moment from "moment";
import prettyBytes from "pretty-bytes";
import qs from "qs";
import filesDownload from "../modals/files_download";
import reportsDownload from "../modals/reports_download";
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css';
import DateRangePicker from 'vue2-daterange-picker';
import 'vue-select/dist/vue-select.css';
export default {
  data() {
    return {
      selectedcursor: `url("data:image/svg+xml,%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='15px' height='15px' fill='lapis' viewBox='0 0 16 16' style='enable-background:new 0 0 50 50;' xml:space='preserve'%3E %3Cpath d='M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z'/%3E %3C/svg%3E"), pointer`,
      selected:[],
      options:[],
      selected_aircrafts:[],
      aircraft: null,
      aircrafts: [],
      flag:0,
      august:'2021-08-02 14:00:00',
      maxskill: 100,
      loading: false,
      tablefields: [
        {
        key: 'index',
        label: '#',
        },
        // { key: "id", label: "Sr", sortable: true },
        { key: "files", label: "Report", sortable: true },
        { key: "aircraft", label: "Aircraft" },
        { key: "size", label: "Size" },
        {
          key: "comment",
          label: "Comment",
          sortable: true,
        },
        { key: "createdAt", label: "CreatedAt" },
        { key: "file_bits", label: "Bits", sortable:false},
        { key: "level3", label: "Lvl_3", sortable:false},
        { key: "action", label: "Action" },
      ],
      items: [],
      filter: null,
      min_date: moment().subtract(2, "days").toDate(),
      max_date: new Date(),
      totalRows: 0,
      currentPage: 1,
      perPage: 20,
      opens: 'center',
      minDate: '1950-05-02 04:00:00',
      maxDate: '2050-12-26 14:00:00',
      dateRange: {
        startDate:moment().subtract(1095, "days"),
        endDate: moment(),
      },
      ctx: {},
      single_range_picker: false,
      show_ranges: true,
      singleDatePicker: false,
      showDropdowns: true,
      autoApply: true,
      showWeekNumbers: false,
      linkedCalendars: false,
      alwaysShowCalendars: true,
      appendToBody: false,
      closeOnEsc: true,
      selectedRow: {},
      selectedCell: null,
    };
  },
  components: {
    filesDownload,
    reportsDownload,
    DateRangePicker,
    filesDelete,
    filesEditModal
  },
  filters:{
    date (value) {
      if (!value)
        return ''
      return Intl.DateTimeFormat(['ban', 'id']).format(value);
    }
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
  mounted() {
    this.fetchFlights();
    this.$axios
      .get(
        "reports/count?_sort=id:DESC&aircraft_file.aircraft.users_permissions_users=" +
          this.$store.state.auth.user.id
      )
      .then(({ data }) => {
        this.totalRows = parseInt(data);
      });
    if (this.$store.state.auth.role === "admin") {
      this.tablefields.splice(5, 0, { key: "uploader", lable: "Uploader" });
    }
  },
  methods: {
    deleteReport(data){
      this.$refs.filesDelete.open(data);
    },
    onClickOutside(data) {
      this.selectedRow = {
          [data.index]: false
      }
    },
    handleEditCell(data, name) {
      this.selectedCell = name;
      this.selectedRow = {
        [data.index]: true
      }
    },
    onChange(data){
      this.selectedRow = {
          [data.index]: false
        }
      this.$axios
        .put("reports/" + data.item.id, {
        comment: data.value
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
    },
    change(){
      this.selected_aircrafts=[]
      this.flag=2;
      this.selected.forEach(itr => {
        this.selected_aircrafts.push(itr.name);
      });
      this.fetchReports(this.ctx,this.callback);
    },
    updateValues (values) {
        this.flag=1
        this.min_date=values.startDate;
        this.max_date=values.endDate;
        this.fetchReports(this.ctx,this.callback);
      },
    fetchReportsAfterDelete(){
      this.fetchReports(this.ctx,this.callback);
    },
    fetchFlights() {
      this.loading = true;
      this.$axios
        .get(
          "aircrafts?users_permissions_users=" + this.$store.state.auth.user.id
        )
        .then((result) => {
          const data = result.data;
          this.aircrafts = data;
          for (let index = 0; index < this.aircrafts.length; index++) {
            this.options.push(this.aircrafts[index]);
          }
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
    callback(){},
    fetchReports(ctx, callback) {
      this.min_date=new Date(this.dateRange.startDate);
      this.max_date=new Date(this.dateRange.endDate);
      this.loading = true;
      var query=""
      if(this.currentPage==1){
        if(this.flag==0){
        query = qs.stringify({
          _sort: "id:DESC",
          _where: {
            "aircraft_file.aircraft.users_permissions_users": this.$store.state.auth.user.id,
            "comment_contains": ctx.filter,
            file_date_gt: moment(this.min_date).startOf('day').toISOString(),
            file_date_lte: moment(this.max_date).endOf('day').toISOString(),
          },
        });
      }
      else if(this.flag==1){
        query = qs.stringify({
        _sort: "id:DESC",
        _where: {
          "comment_contains": ctx.filter,
          "aircraft_file.aircraft.name_contains": this.selected_aircrafts,
          file_date_gt: moment(this.min_date).startOf('day').toISOString(),
          file_date_lte: moment(this.max_date).endOf('day').toISOString(),
          "aircraft_file.aircraft.users_permissions_users": this.$store.state.auth.user.id,
        },
      });
      }
      else if(this.flag==2){
        query = qs.stringify({
        _sort: "id:DESC",
        _where: {
          "aircraft_file.aircraft.users_permissions_users": this.$store.state.auth.user.id,
          "comment_contains": ctx.filter,
          "aircraft_file.aircraft.name_contains": this.selected_aircrafts,
          file_date_gt: moment(this.min_date).startOf('day').toISOString(),
          file_date_lte: moment(this.max_date).endOf('day').toISOString(),
        },
      });
      }
      else {
        console.log("error")
      }
      this.$axios
        .get("reports/count?" + query)
        .then(({data}) => {
          this.totalRows = parseInt(data);
        })
        .catch((err) => {
            console.log(err);
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
      }
      if(this.flag==0){
        query = qs.stringify({
          _sort: "id:DESC",
          _limit: this.perPage,
          _start: (this.currentPage - 1) * this.perPage,
          _where: {
            "aircraft_file.aircraft.users_permissions_users": this.$store.state.auth.user.id,
            "comment_contains": ctx.filter,
            file_date_gt: moment(this.min_date).startOf('day').toISOString(),
            file_date_lte: moment(this.max_date).endOf('day').toISOString(),
          },
        });
      }
      else if(this.flag==1){
        query = qs.stringify({
        _sort: "id:DESC",
        _limit: this.perPage,
        _start: (this.currentPage - 1) * this.perPage,
        _where: {
          "comment_contains": ctx.filter,
          "aircraft_file.aircraft.name_contains": this.selected_aircrafts,
          file_date_gt: moment(this.min_date).startOf('day').toISOString(),
          file_date_lte: moment(this.max_date).endOf('day').toISOString(),
          "aircraft_file.aircraft.users_permissions_users": this.$store.state.auth.user.id,
        },
      });
      }
      else if(this.flag==2){
        query = qs.stringify({
        _sort: "id:DESC",
        _limit: this.perPage,
        _start: (this.currentPage - 1) * this.perPage,
        _where: {
          "aircraft_file.aircraft.users_permissions_users": this.$store.state.auth.user.id,
          "comment_contains": ctx.filter,
          "aircraft_file.aircraft.name_contains": this.selected_aircrafts,
          file_date_gt: moment(this.min_date).startOf('day').toISOString(),
          file_date_lte: moment(this.max_date).endOf('day').toISOString(),
        },
      });
      }
      else {
        console.log("error")
      }
      this.$axios
        .get("reports/?" + query)
        .then((result) => {
          const data = result.data;
          this.items = data.map((report) => {
            return {
              ...report,
              uploader: report.uploader ? report.uploader.username : "UNKNOWN",
              aircraft: report.aircraft_file.aircraft.name || "UNKNOWN",
              files: report.report_file.map((file) => file.name).join(", "),
              _rowVariant: report.last_download ? "" : "warning",
              size: prettyBytes(
                report.report_file.reduce((acc, curr) => acc + curr.size, 0) *
                  1024
              ),
              createdAt: moment(report.created_at).format("DD/MM/YY h:mm a"),
            };
          });
          this.ctx = ctx;
          this.callback=callback;
          callback(this.items);
        })
        .catch((err) => {
          console.log(err);
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
    downloadReport(data) {
      this.$refs.reportsDownload.open(data);
    },
    downloadFiles(data) {
      this.$refs.filesDownload.open(data);
    },
    editReport(data){
      this.$refs.filesEditModal.open(data);
    },
  },
};
</script>
