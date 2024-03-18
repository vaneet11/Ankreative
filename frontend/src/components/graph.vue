<template>
<div v-if="id">
    <div>     
      <apexchart ref= "chart1" type="line" height="450" :options="chartOptions" :series= "series"></apexchart>
    </div>
</div>
</template>    
<script> 
import VueApexCharts from 'vue-apexcharts';
import moment from "moment";
import qs from "qs";
export default{
  props: {
    idx:String,
    aircraft_change:Array,
    max_d: {
    type: Date,
    default: function () { return new Date() }
  },
  min_d: {
    type: Date,
    default: function () { return new Date() }
  },
  event_lines: {
    type: Array,
  },
  },
  data(){
    return {
        combineData:[],
        selected:[],
        aircraft:1,
        id:1,
        meta: {
            sc: [],
            event: [],
            phase: [],
        },
        min_date: moment().subtract(2, "days").toDate(),
        max_date: new Date(),
        data:{},
        series: [],
        max_value: 0,
        chartOptions: {
            chart: {
                height: 400,
                type: 'line',
                dropShadow: {
                    enabled: true,
                    color: '#000',
                    top: 18,
                    left: 7,
                    blur: 10,
                    opacity: 0.2
                },
                toolbar: {
                show: true,
                }
            },
            tickAmount: 5,
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                },
            },
            markers: {
                size: 1
            },
            xaxis: {
                labels: {
                    rotate: -45,
                },
                categories: [],
                title: {
                    text: 'Timeline'
                }
            },
            yaxis: {
                title: {
                    text: 'Severity Codes',
                },
                min: 0,
                max: 20
            },

        },
    };
},  
  methods: {
    graphopen(idx,min_date,max_date){
      this.combineData=[];
      var graphid=Number(this.idx);
      try{
      this.id=graphid;
      this.max_date=this.max_d;
      this.min_date=this.min_d;
      this.id=idx;
      this.max_date=min_date;
      this.min_date=max_date;
      this.selected=this.aircraft_change;}
      catch{

      }
      this.loading = true;
      this.min_date=new Date(this.min_date);
      this.max_date=new Date(this.max_date);
      const result=[];
      var totalDataCount = 0;
      this.selected.forEach((itr_aircraft)=>{
      var aircraft=itr_aircraft.id
      const query = qs.stringify({
        _sort: "id:DESC",
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
          data.forEach(({ meta },itr) => {
            if (meta) {
              let filedate_equal = this.combineData.find((j) => j.filedate == data[itr].file_date);
              if (typeof(filedate_equal)==="object"){
                this.combineData.forEach((k)=>{   
                  if(k.filedate==data[itr].file_date) {
                    meta.sc.forEach((i) => {
                    let sc = k.meta.sc.find((j) => j.name == i.name);
                    if (sc) sc.value += i.value;
                    else {
                      this.meta.sc.push(i);
                    }
                    });
                    meta.event.forEach((i) => {
                    let event = k.meta.event.find((j) => j.name == i.name);
                      if (event) event.value += i.value;
                      else {
                        this.meta.event.push(i);
                      }
                    });
                    meta.phase.forEach((i) => {
                      let event = k.meta.phase.find((j) => j.name == i.name);
                      if (event) event.value += i.value;
                      else {
                        k.meta.phase.push(i);
                      }
                    });
                  }
                }) }
            else{
              this.combineData.push({meta:meta,filedate:data[itr].file_date})
          }}})
                totalDataCount ++;
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
          if(this.selected.length == totalDataCount) {
              this.combineData.sort(function(a,b){
                return new Date(a.filedate) - new Date(b.filedate);
            });
            this.opengraph(this.id,result,this.min_date,this.max_date);
          }
          this.loading = false;
        });
    });
    },
    phaseWiseTrending(){
      const category=[];
      this.max_value=0;
      this.series=[{
            name: "Ground/Deck",
            data: []
            },
            {
            name: "Hover",
            data: []
            },
            {
            name: "Take Off",
            data: []
            },
            {
            name: "Climb",
            data: []
            },
            {
            name: "Cruise",
            data: []
            },
            {
            name: "Descent",
            data: []
            },
            {
            name: "Approach",
            data: []
            }];
            this.combineData.forEach(({meta}, itr ) => {
            var filedate=new Date(this.combineData[itr].filedate);
                var dd = filedate.getDate();
                var mm = filedate.getMonth()+1; 
                if(dd<10) 
                {
                    dd='0'+dd;
                } 
                if(mm<10) 
                {
                    mm='0'+mm;
                } 
                filedate = dd+'/'+mm;
                category.push(filedate);
                if (meta) {
                    const visited=[];
                    meta.phase.forEach((i) => {
                        this.max_value = (i.value >= this.max_value) ? i.value : this.max_value ; 
                        this.series.forEach((j)=>{
                            if(i.name==j.name){
                                j.data.push(i.value);
                                visited.push(j.name);
                            }
                        });
                    })
                    this.series.forEach((j)=>{
                        if(!visited.includes(j.name)){
                            j.data.push(0);
                        }
                    });
                }
            });
        this.$refs.chart1.updateOptions({
        xaxis: {
          type:"datetime",  
          categories: category,
           labels: {
          },
        },
        yaxis: {
          title: {
            text: 'Phases',
          },
          min: 0,
          max: this.max_value+5,
        },
    })
    },
    eventWiseTrending(){
      const category=[];
      this.series=[];
      this.max_value=0;
      this.combineData.forEach(({meta})=>{
        meta.event.forEach((i)=>{
          let event = this.series.find((j) => j.name == i.name);
          if(!event){
            this.series.push({name:i.name,data:[]});
          }
        })
      })
            this.combineData.forEach(({meta}, itr ) => {
            var filedate=new Date(this.combineData[itr].filedate);
                var dd = filedate.getDate();
                var mm = filedate.getMonth()+1;
                if(dd<10)
                {
                    dd='0'+dd;
                }
                if(mm<10)
                {
                    mm='0'+mm;
                }
                filedate = dd+'/'+mm;
                category.push(filedate);
                if (meta) {
                    const visited=[];
                    meta.event.forEach((i) => {
                        this.max_value = (i.value >= this.max_value) ? i.value : this.max_value;
                        this.series.forEach((j)=>{
                            if(i.name==j.name){
                                j.data.push(i.value);
                                visited.push(j.name);
                            }
                        });
                    })
                    this.series.forEach((j)=>{
                        if(!visited.includes(j.name)){
                            j.data.push(0);
                        }
                    });
                }
            });
        const temp=this.series;
        this.series=[];
        this.event_lines.forEach((i)=>{
          temp.forEach((j)=>{
            if(i==j.name){
              this.series.push(j);
            }
          })
        })
        this.$refs.chart1.updateOptions({
          legend:{
            show:false,
          },
        xaxis: {
          type:"datetime",
          categories: category,
           labels: {
          },
        },
        yaxis: {
          title: {
            text: 'Events',
          },
          min: 0,
          max: this.max_value+5,
        },
    })
    },
    severityCodeWiseTrending(){
        const category=[];
        this.max_value=0;
        this.series=[{
            name: "green",
            data: []
            },
            {
            name: "yellow",
            data: []
            },
            {
            name: "red",
            data: []
            }];
        this.combineData.forEach(({meta}, itr ) => {
          var filedate=new Date(this.combineData[itr].filedate);
          var dd = filedate.getDate();
          var mm = filedate.getMonth()+1;
          if(dd<10)
          {
              dd='0'+dd;
          }
          if(mm<10)
          {
              mm='0'+mm;
          }
          filedate = dd+'/'+mm;
          category.push(filedate);
          if (meta) {
            let x = 0 ;
            meta.sc.forEach((i) => {
                this.max_value = (i.value >= this.max_value) ? i.value : this.max_value ;
                this.series[x].data.push(parseInt(i.value));
                x+=1;
            });
          }
        });
      this.$refs.chart1.updateOptions({
        colors:['#51bb25','#f8d62b','#dc3545'],
        xaxis: {  
          categories: category,
          labels:{
          }
        },
        yaxis: {
          title: {
            text: 'Severity Codes',
          },
          min: 0,
          max: this.max_value+5,
        },
    })
  },
    opengraph( id, result, min_date, max_date) {
      switch (id) {
        case 0:
          break;
        case 1:
          this.phaseWiseTrending();
          break;
        case 2:
          this.severityCodeWiseTrending();
          break;
        case 3:
          this.eventWiseTrending();
          break;
        default:
          break;
      }
    },
  },
    components: {
        apexChart : VueApexCharts,
    }, 
}
</script>
