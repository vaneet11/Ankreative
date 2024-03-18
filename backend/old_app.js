const XLSX = require("xlsx");
const moment = require('moment')
const workbook = XLSX.readFile("./HFDM Report HLN 11th June 2020.xlsx");
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const arr = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  blankrows: false,
  defval: "",
});

let meta = {
  event: [],
  phase: [],
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
};
let str = 'HFDM Report HLN 11th June 2020.xlsx'.split(" ").splice(-3).join(' ')
console.log(str.split('.')[0]);
console.log(moment(str.split('.')[0],'Do MMMM YYYY'))
arr.slice(2).forEach((item) => {
  //for sc
  if (item[8]) {
    let sc = meta.sc.find((i) => i.name == item[8].toString().trim());
    if (sc) sc.value++;
  }

  //for event
  if (item[6]) {
    let ev = meta.event.find((i) => i.name == item[6].toString().trim());
    if (ev) ev.value++;
    else {
      meta.event.push({ name: item[6].toString().trim(), value: 1 });
    }
  }

  //for phase
  if (item[9]) {
    let ph = meta.phase.find((i) => i.name == item[9].toString().trim());
    if (ph) ph.value++;
    else {
      meta.phase.push({ name: item[9].toString().trim(), value: 1 });
    }
  }
});


