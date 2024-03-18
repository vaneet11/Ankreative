  <template>
    <div>
      <b-modal size="xl" title="Edit Report" v-model="isOpened" centered>
          <div class="card-body pt-0">
              <div class="table-responsive">
                  <b-table hover :items="tableData" :fields="tablefields"  >
                      <template #cell(index)="data">
                          <div class="d-flex">
                              <input type="checkbox" v-model="data.item.selected" @change="toggleSelection(data.index)"/>
                              {{ (data.index)+1 }}
                          </div>
                      </template>
                      <template #cell(Remarks)="data">
                        <div >
                          <input v-model="data.item.Remarks" />
                        </div>
                      </template>
                  </b-table>
              </div>
          </div>
          <template #modal-footer="props">
              <div class="row">
                  <div class="col">
                      <div class="form-group mb-0">
                          <button @click="props.cancel" class="btn btn-secondary mr-3">
                              Cancel
                          </button>
                          <button @click="pop()" class="btn btn-danger mr-3" :disabled="selectedItems.length===0">
                              Delete
                          </button>
                          <button class="btn btn-primary mr-3" @click="updateFile()">
                              Update
                          </button>
                      </div>
                  </div>
              </div>
          </template>
      </b-modal>
      <deleteModal ref="deleteModal" :deleterows="deleteRows"/>
    </div>
  </template>

  <script>
  import axios from 'axios';
  import deleteModal from './delete_modal.vue';

  export default {
    data() {
      return {
        isOpened: false,
        selectedItems: [],
        fileName:"",
        reportId:null,
        tablefields: [
          { key: 'index', label: '#' },
          { key: 'A/C Tail', label: 'A/C Tail' },
          { key: 'Flight #', label: 'Flight' },
          { key: 'Flight Date (MM/DD/YYYY)', label: 'Flight Date' },
          // { key: 'analysedFile', label: 'Analysed File' },
          { key: 'Departure', label: 'Departure' },
          { key: 'Arrival', label: 'Arrival' },
          { key: 'Event Name', label: 'Event Name' },
          { key: 'Duration', label: 'Duration' },
          { key: 'SC', label: 'SC' },
          { key: 'Flight Phase', label: 'Flight Phase' },
          { key: 'Location', label: 'Location' },
          { key: 'Comment', label: 'Comment' },
          { key: 'Parameter', label: 'Parameter' },
          { key: 'Min', label: 'Min' },
          { key: 'Max', label: 'Max' },
          { key: 'Average', label: 'Average' },
          { key: 'Remarks', label: 'Remarks' }
        ],
        tableData:[]
      }
    },
    components:{
      deleteModal
    },
    props: {
      fileId: {
        type: Number,
        required: true
      }
    },
    methods: {
      open(data) {
        this.data = {};
        if (data) {
          this.data = data;
          this.isOpened = true;
          this.callApi(this.data.id);
        }
      },
      async callApi(id) {
        this.$axios 
        .post("reports/getProducts", { id: id }).then((res)=>{
          const data = res.data
                  this.reportId = id
                  this.fileName = data.fileName
                  // this.tableData = []
                  data.payload.map((result)=>{
                    if (result[`SC`] && result[`SC`]>0){
                      this.tableData.push ({
                        'A/C Tail':result[`A/C Tail`] ? result[`A/C Tail`] : "",
                        'Flight #':result[`Flight #`] ? result[`Flight #`]:"",
                        'Flight Date (MM/DD/YYYY)':result[`Flight Date (MM/DD/YYYY)`] ? result[`Flight Date (MM/DD/YYYY)`] :"",
                          'Flight File (For Reference)':result[`Flight File (For Reference)`] ? result[`Flight File (For Reference)`] :"",
                          'Departure':result[`Departure`] ? result[`Departure`] :"",
                          'Arrival':result[`Arrival`] ? result[`Arrival`] :"",
                          'Event Name':result[`Event Name`] ? result[`Event Name`]:"",
                          'Duration':result[`Duration`] ? result[`Duration`] :"",
                          'SC':result[`SC`] ? result[`SC`] :"",
                          'Flight Phase':result[`Flight Phase`] ? result[`Flight Phase`] :"",
                          'Location':result[`Location`] ? result[`Location`] :"",
                          'Comment':result[`Comment`] ? result[`Comment`] :"",
                          'Parameter':result[`Parameter`] ? result[`Parameter`] :"",
                          'Min':result[`Min`] ? result[`Min`] : "",
                          'Max':result[`Max`] ? result[`Max`] :"",
                          'Average':result[`Average`] ? result[`Average`] :"",
                          'Remarks':result[`Remarks`] ? result[`Remarks`] : "",
                          _rowVariant: result[`SC`] ? result[`SC`] == 3 ? "red" : result[`SC`] == 2 ? "yellow" : result[`SC`]== 1 ?"green" : "":""
                        })
                      }
                  })
              })
      },
      toggleSelection(id) {
        if (this.selectedItems.includes(id)) {
          let indexOf = this.selectedItems.indexOf(id);
          this.selectedItems.splice(indexOf, 1);
        } else {
          this.selectedItems.push(id);
        }
      },
      updateFile() {
        this.tableData = this.tableData.filter((item, index) => !this.selectedItems.includes(index));
        this.tableData = this.tableData.map((item)=>{
          delete item.selected
          delete item._rowVariant
          return item
        })
        const payload = {
          reportID:this.reportId,
          fileName: this.fileName,
          payload: this.tableData
        }
        this.$axios
        .post("reports/getSheet",payload).then((res)=>{
          if(res.status===200){
          this.isOpened = false
          }
      })
      },
      deleteRows(){
        this.tableData = this.tableData.filter((item, index) => !this.selectedItems.includes(index));
        this.selectedItems = []
      },
      pop(){
        this.$refs.deleteModal.open();
      }
    }
  };
  </script>

  <style>
  .table-green td{
      color: #007F00!important;
  }
  .table-yellow td{
      color: #D8971A!important;
  }
  .table-red td{
      color: #FF0000!important;
  }
  </style>