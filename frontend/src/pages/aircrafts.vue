<template>
  <div>
    <Breadcrumbs title="Aircrafts" />
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
              </b-row>
            </div>
            <div class="card-body pt-0">
              <div class="table-responsive">
                <b-table
                  @row-clicked="rowClicked"
                  hover
                  :busy="loading"
                  :items="items"
                  :sort-by.sync="sortBy"
                  :fields="tablefields"
                  :filter="filter"
                  :current-page="currentPage"
                  :tbody-tr-class="rowClass"
                  :per-page="perPage"
                  @filtered="onFiltered"
                >
                <template #cell(index)="data">
                  {{ data.index + 1 }}
                </template>
                <template #cell(healthStatus)="data" >
                  <div>
                    {{ getClassForHealthStatus(data.item.healthStatus) }} Health <span :class=getSpanForHealthStatus(data.item.healthStatus) ></span>
                  </div>
                </template>
                <template #table-busy>
                  <div class="text-center text-danger my-2">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                  </div>
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
  </div>
</template>

<script>
import moment from "moment";
export default {
  data() {
    return {
      maxskill: 100,
      loading: false,
      sortBy:'name',
      tablefields: [
        {
        key: 'index',
        label: '#',
        },
        { key: "name", label: "Aircraft", sortable: true },
        { key: "healthStatus", label: "Health Status"},
        {
          key: "aircraft_serial_number",
          label: "Serial Number",
          sortable: true,
        },
        {
          key: "aircraft_type",
          label: "Type",
          sortable: true,
        },
      ],
      items: [],
      filter: null,
      totalRows: 0,
      currentPage: 1,
      perPage: 20,
    };
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
  },
  methods: {
    rowClass(item, type) {
      if (!item || type !== 'row') return
      var flag=false;
      if (item.aircraft_disabled === true){ return 'disabledclass'}
      // item.aircraft_files.forEach((file)=>{
      //   if(file.last_downloaded===null){
      //     flag=true;
      //   }
      // })
      if(flag){
        return 'table-warning'
      }
    },
    rowClicked(data) {
      return this.$router.push("aircrafts/files/" + data.id);
    },
    getClassForHealthStatus(value){
if(value==1){
  return "Good"
}if(value==2){
  return "Average"
}if(value==3){
  return "Bad"
}
    },
    getSpanForHealthStatus(value){
      if(value==1){
  return "dot bg-success ml-2"
}if(value==2){
  return "dot bg-warning ml-2"
}if(value==3){
  return "dot bg-danger ml-2"
}
    },
    fetchFlights() {
      this.loading = true;
      this.$axios
        .get(
          "aircrafts?users_permissions_users=" + this.$store.state.auth.user.id
        )
        .then((result) => {
          console.log(result,'resultresult')
          const data = result.data;
          this.totalRows = data.length;
          this.items = data.map((flight) => {
            return {
              id: flight.id,
              name: flight.name,
              aircraft_serial_number: flight.aircraft_serial_number,
              updated_at: moment(flight.updated_at).format("DD/MM/YYYY h:mm a"),
              aircraft_disabled: flight.aircraft_disabled,
              aircraft_type:flight.aircraft_type,
              healthStatus:flight.healthStatus
              // aircraft_files:flight.aircraft_files,
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
    onFiltered(filteredItems) {
      this.totalRows = filteredItems.length;
      this.currentPage = 1;
    },
  },
};
</script>
<style>
.disabledclass, .disabledclass>td{
  background-color: rgb(105,105,105,0.3) ;
  opacity : 55%;
}

.Good{
  background-color: #007F00;
}

.Average{
  background-color: #D8971A;
}

.Bad{
  background-color: #FF0000;
}
</style>