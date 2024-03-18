<template>
  <div>
    <Breadcrumbs title="Insights" />
    <!-- Container-fluid starts-->
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <b-row>
                <b-col md="6">
                  <b-row>
                    <b-col>
                      <label> Select Aircraft: </label>
                    </b-col>
                  </b-row>
                  <v-select
                    v-on:input="change"
                    multiple
                    :placeholder="(this.aircrafts && this.aircrafts.length>0) ? this.aircrafts[0].name : ''"
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
                    </b-col>
                  </b-row>
                  <b-row> 
                    <b-col>
                      <div class="form-group flex">   
                        <date-range-picker
                          :linkedCalendars="linkedCalendars"
                          class="ml-1"
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
              <div style="font-size:11px; color: #dc3545; margin-top: 3px; margin-bottom: 32px; font-style: italic;">
               * ALL INSIGHTS ARE BASED ON THE REPORT DATE AS MENTIONED IN THE EXCEL
              </div>
              <b-row class="mt-4">
                <b-col md="12">
                  <div class="card text-center">
                    <strong class="text-center pt-1 pl-2" for="">Sc</strong>
                    <b-row class="mt-2">
                      <b-col v-for="sc in meta.sc" :key="sc.name"
                        ><h5>
                          {{ sc.value || 0 }}
                          <span
                            class="dot"
                            :class="{
                              'bg-danger': sc.name == '3',
                              'bg-warning': sc.name == '2',
                              'bg-success': sc.name == '1',
                            }"
                          ></span></h5
                      ></b-col>
                    </b-row>
                    <br>
                    <Apexchart idx=2 ref="graphs" v-bind:aircraft_change="this.selected" :max_d="this.max_date" :min_d="this.min_date"/>
                    <hr />
                    <br>
                    <Apexchart idx=1 ref="graphs2" v-bind:aircraft_change="this.selected" :max_d="this.max_date" :min_d="this.min_date"/>
                    <strong class="text-center pt-1 pl-2" for="">Phases</strong>
                    <ul
                      v-for="event in meta.phase"
                      :key="event.name"
                      class="list-group text-left list-group-flush"
                    >
                      <li class="list-group-item">
                        {{ event.name }}
                        <strong class="h6 float-right">{{
                          event.value
                        }}</strong>
                      </li>
                    </ul>
                  </div>
                </b-col>
                <b-col md="12">
                 <Apexchart idx=3 ref="graphs3" v-bind:aircraft_change="this.selected" :max_d="this.max_date" :min_d="this.min_date" :event_lines="this.dataLines"/>
                <div class="table-responsive">
                <b-table
                  hover
                  :items="items"
                  :fields="tablefields"
                  :filter="filter"
                  @filtered="onFiltered"
                >
                <template #cell(hideEvent)="data">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="data.item.showLine" @change="toggleLine(data.item)">
                    <label class="form-check-label" for="flexCheckDefault">
                      {{ data.item.showLine ? 'Hide' : 'Show'}}
                    </label>
                  </div>
                </template>
                <template v-slot:cell(eventName)="data">
                    <span
                      v-if="data.item.eventName.endsWith('Lvl 3')==true"
                      class="dot bg-danger"
                    >&nbsp;&nbsp;</span>
                    <span
                      v-else-if="data.item.eventName.endsWith('Lvl 2')==true"
                      class="dot bg-warning"
                    >&nbsp;&nbsp;</span>
                    <span
                      v-else-if="data.item.eventName.endsWith('Lvl 1')==true"
                      class="dot bg-success"
                    >&nbsp;&nbsp;</span>
                    {{data.item.eventName}}
                  </template>
                </b-table>
              </div>
            </b-col>
          </b-row>
        </div>
      </div>
    </div>
  </div>
</div>
    <!-- Container-fluid Ends-->
</div>
</template>
<script>
import moment from "moment";
import qs from "qs";
import Apexchart from "../components/graph.vue"
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css';
import DateRangePicker from 'vue2-daterange-picker';
import 'vue-select/dist/vue-select.css';
export default {
  data() {
    return {
      selected:[],
      options:[],
      maxskill: 100,
      loading: false,
      aircraft: null,
      tablefields: [
      {key:"eventName", label:"Events", sortable:true},
      {key:"eventValue",label:"Count"},
      {key:"hideEvent", label:"Show Event"},
      ],
      items: [],
      aircrafts: [],
      filter: null,
      min_date: moment().subtract(2, "days").toDate(),
      max_date: new Date(),
      meta: {
        sc: [],
        event: [],
        phase: [],
      },
      totalRows: 0,
      currentPage: 1,
      perPage: 20,
      opens: 'center',
      minDate: '1950-05-02 04:00:00',
      maxDate: '2050-12-26 14:00:00',
      dateRange: {
        startDate:moment().subtract(2, "days"),
        endDate: moment(),
      },
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
      dataLines:[],
    };
  },
  components: {
    Apexchart,
    DateRangePicker,
  },
  watch: {
    currentPage() {
      this.fetchReports();
    },
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
  filters: {
    truncate(text, length, clamp) {
      clamp = clamp || "...";
      var node = document.createElement("div");
      node.innerHTML = text;
      var content = node.textContent;
      return content.length > length
        ? content.slice(0, length) + clamp
        : content;
    },
    date (value) {
      if (!value)
        return ''
      return Intl.DateTimeFormat(['ban', 'id']).format(value);
    }
  },
  mounted() {
    this.fetchFlights();
    window.document.getElementsByClassName("apexcharts-toolbar").length>0
    && 
    setTimeout(()=>{
      if(window.document.getElementsByClassName("apexcharts-toolbar") && window.document.getElementsByClassName("apexcharts-toolbar").length>0){
        window.document.getElementsByClassName("apexcharts-toolbar")[0].style.zIndex="0";
      }
      },2000)
  },
  methods: {
    toggleLine(item){
      if(item.showLine){
        this.dataLines.push(item.eventName);
      }
      else{
        this.dataLines=this.dataLines.filter((name)=>{return name!=item.eventName});
      }
      this.$refs.graphs3.graphopen(3,this.max_date,this.min_date);
    },

    change(){
      this.fetchReports();
      this.min_date=new Date(this.dateRange.startDate);
      this.max_date=new Date(this.dateRange.endDate);
      setTimeout(()=>{this.$refs.graphs.graphopen(2,this.max_date,this.min_date);
      this.$refs.graphs2.graphopen(1,this.max_date,this.min_date);
      this.$refs.graphs3.graphopen(3,this.max_date,this.min_date);
      })
    },
    updateValues (values) {
      this.min_date=values.startDate;
      this.max_date=values.endDate;
      this.fetchReports();
      // setTimeout(()=>{
      //   window.document.getElementsByClassName("apexcharts-toolbar")[0].style.zIndex="0";},1000)
      this.$refs.graphs3.graphopen(3,this.max_date,this.min_date);
      this.$refs.graphs.graphopen(2,this.max_date,this.min_date);
      this.$refs.graphs2.graphopen(1,this.max_date,this.min_date);
    },
    fetchReports() {
      this.min_date=new Date(this.dateRange.startDate)
      this.max_date=new Date(this.dateRange.endDate)
      this.meta = {
        sc: [
          {
            name: "1",
            value: 0,
          },
          {
            name: "2",
            value: 0,
          },
          {
            name: "3",
            value: 0,
          },
        ],
        event: [],
        phase: [],
      };
    this.selected.forEach((itr_aircraft)=>{
      var aircraft=itr_aircraft.id
      this.$axios
        .get(
          `reports/count?${qs.stringify({
            _sort: "id:DESC",
            _where: {
              "aircraft_file.aircraft.id": aircraft,
              file_date_gt: this.min_date.toISOString(),
              file_date_lte: moment(this.max_date)
                .set("hour", 23)
                .toISOString(),
            },
          })}`
        )
        .then(({ data }) => {
          this.totalRows = parseInt(data);
        });
      this.loading = true;
      const query = qs.stringify({
        _sort: "id:DESC",
        _start: (this.currentPage - 1) * this.perPage,
        _where: {
          "aircraft_file.aircraft.id": aircraft,
          file_date_gt: moment(this.min_date).startOf('day').toISOString(),
          file_date_lte: moment(this.max_date).endOf('day').toISOString(),
        },
      });
      this.$axios
        .get(`reports/?${query}`)
        .then((result) => {
          const data = result.data;
          data.forEach(({ meta }) => {
            if (meta) {
              meta.sc.forEach((i) => {
                let sc = this.meta.sc.find((j) => j.name == i.name);
                if (sc) sc.value += i.value;
                else {
                  this.meta.sc.push(i);
                }
              });
              meta.event.forEach((i) => {
              let event = this.meta.event.find((j) => j.name == i.name);
                if (event) event.value += i.value;
                else {
                  this.meta.event.push(i);
                }
              });
              meta.phase.forEach((i) => {
                let event = this.meta.phase.find((j) => j.name == i.name);
                if (event) event.value += i.value;
                else {
                  this.meta.phase.push(i);
                }
              });
            }
          });
          this.items = this.meta.event.map((event) => {
            return {
              eventName: event && event.name,
              eventValue: event.value,
              showLine: false,
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
    })
    },
    fetchFlights() {
      this.loading = true;
      this.$axios
        .get(
          "aircrafts?users_permissions_users=" + this.$store.state.auth.user.id
        )
        .then((result) => {
          const data = result.data;
          console.log(data,'foihqjwiefl')
          this.aircrafts = data;
          for (let index = 0; index < this.aircrafts.length; index++) {
            this.options.push(this.aircrafts[index]);
          }
          if (data.length) {
            this.selected.push(data[0]);
            this.change();
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
    download(data) {
      this.$refs.reportsDownload.open(data);
    },
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
};
</script>

<style>
.dot {
  height: 15px;
  width: 15px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block !important;
}
.form-control {
  display: block;
  max-width: 100%;
  padding: .3rem .75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: .25rem;
}

.flex {
  display: flex;
  align-items: center;
}
</style>