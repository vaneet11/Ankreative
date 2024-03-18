const XLSX = require("xlsx");
const XlsxPopulate = require("xlsx-populate");

const reports = require("./api/reports/models/reports.settings.json");

const get = async (id) => {
  const report = await strapi
    .query("reports")
    .findOne({ id: id }, "report_file", "upload_file_morph");
  let workbook;
  let fileName;
  report.report_file.map((item) => {
    console.log(item.hash, item.ext, "item.hash");
    fileName = item.hash;
    workbook = XLSX.readFile(`./public/uploads/${item.hash}${item.ext}`);
  });

  const worksheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[worksheetName];
  const test = XLSX.utils.sheet_to_json(worksheet);
  const styles = workbook.Styles;

  let keys = [];
  Object.keys(test[1]).map((key) => {
    keys.push(key);
  });

  let payload = [];
  test.map((item, index) => {
    if (index > 0) {
      let obj = {};
      keys.map((ele) => {
        obj = { ...obj, [test[0][ele]]: item[ele] };
      });
      payload.push(obj);
    }
  });

  const arr = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  let minDate = new Date();
  let maxDate = new Date();

  const data = arr
    .slice(2)
    .filter((item) => item[2])
    .map((item, i) => {
      itemDate = new Date(item[2]);
      if (i == 0) {
        minDate = itemDate;
        maxDate = itemDate;
      }
      if (minDate > itemDate) {
        minDate = itemDate;
      }
      if (maxDate < itemDate) {
        maxDate = itemDate;
      }

      return {
        date: itemDate.getTime(),
        sc: item[8],
        event: item[6],
        phase: item[9],
      };
    });

  return {
    fileName,
    payload,
    styles,
  };
};

function createFile(data) {
  let top = " RIGHT CHOICE AVIATION PVT. LTD";
  let payload = data.payload;
  return XlsxPopulate.fromBlankAsync()
    .then((workbook) => {
      const sheet = workbook.sheet(0);

      const header = Object.keys(payload[0]);
      const numColumns = header.length;
      console.log(numColumns,"numColumns")
      sheet
        .range(2, 1, 2, numColumns)
        .style({ fill: { type: "solid", color: "fcdbd5" } });
      header.forEach((column, index) => {
        const cell = sheet.cell(2, index + 1);
        cell.value(column);

        cell.style({ border: true, borderColor: "000000", fontSize: 8 });

        sheet.row(1).height(20);
        // Adjusting column widths based on column names
        switch (column) {
          case "Analysed File (For reference)":
            sheet.column(index + 1).width(12);
            break;
          case "Comment":
          case "Event Name":
            sheet.column(index + 1).width(25);
            break;
          case "Parameter":
            sheet.column(index + 1).width(14);
            break;
          case "SC":
            sheet.column(index + 1).width(3);
            break;
        }
      });

      payload.forEach((row, rowIndex) => {
        const rowRange = sheet.row(rowIndex + 3);

        Object.entries(row).forEach(([key, value], columnIndex) => {
          if (columnIndex === 0) {
          }
          const cell = sheet.cell(rowIndex + 3, columnIndex + 1);
          cell.value(value === "" ? "-" : value);

          cell.style({
            border: true,
            borderColor: "000000",
            fontSize: 8,
            horizontalAlignment: "center",
          });

          sheet.column(columnIndex + 1).style({ wrapText: true });
          const cellHeight = Math.ceil((value.toString().length * 7) / 4);
          const currentHeight = rowRange.height();
          if (cellHeight > currentHeight) {
            rowRange.height(cellHeight);
          }

          if (key === "SC") {
            const cellValue = Number(value);
            switch (cellValue) {
              case 1:
                rowRange.style({ fontColor: "3e9431" }); // Green
                break;
              case 2:
                rowRange.style({ fontColor: "ec9927" }); // Yellow
                break;
              case 3:
                rowRange.style({ fontColor: "FF0000" }); // Red
                break;
            }
          }

          if (
            key === "A/C Tail" &&
            value ===
              "Min value & Max value columns stand reversed in cases of negative numbers."
          ) {
            sheet
              .range(
                rowIndex + 3,
                columnIndex + 1,
                rowIndex + 3,
                columnIndex + numColumns
              )
              .merged(true);

            const rowRange = sheet.range(
              rowIndex + 3,
              columnIndex + 1,
              rowIndex + 3,
              columnIndex + numColumns
            );

            rowRange.style({
              border: true,
              borderColor: "000000",
              // fontSize: 7,
              horizontalAlignment: "center",
            });
          }
        });
      });

      const numColumns1 = payload.length + 2;

      sheet.range(1, 1, 1, numColumns).merged(true).style({
        horizontalAlignment: "center",
        verticalAlignment: "center",
        border: true,
        fontSize: 16,
        borderColor: "000000",
        fontColor: "c96f0e",
      });
      sheet.cell(1, 1).value(top);

      sheet.usedRange().style({
        bold: true,
        // fontSize: 7,
        // fill: { type: "solid", color: "ffffff" },
        horizontalAlignment: "center",
        verticalAlignment: "center",
      });

      return workbook.toFileAsync(`./public/uploads/${data.fileName}.xlsx`);
    })
    .then(() => {
      console.log("Excel file created successfully.");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// function createFile(data) {
//   let top = "RIGHT CHOICE AVIATION PVT. LTD";
//   let payload = data.payload;
//   return XlsxPopulate.fromBlankAsync()
//     .then((workbook) => {
//       const sheet = workbook.sheet(0);

//       const header = Object.keys(payload[0]);
//       const numColumns = header.length;
//       sheet
//         .range(2, 1, 2, numColumns)
//         .style({ fill: { type: "solid", color: "fcdbd5" } });
//       header.forEach((column, index) => {
//         const cell = sheet.cell(2, index + 1);
//         cell.value(column);

//         cell.style({ border: true, borderColor: "000000", fontSize: 8 });

//         sheet.row(1).height(20);
//         // Adjusting column widths based on column names
//         switch (column) {
//           case "Flight File (For Reference)": // Adjusted case name to match JSON data
//             sheet.column(index + 1).width(12);
//             break;
//           case "Comment":
//           case "Event Name":
//             sheet.column(index + 1).width(25);
//             break;
//           case "Parameter":
//             sheet.column(index + 1).width(14);
//             break;
//           case "SC":
//             sheet.column(index + 1).width(3);
//             break;
//         }
//       });

//       payload.forEach((row, rowIndex) => {
//         const rowRange = sheet.row(rowIndex + 3);

//         Object.entries(row).forEach(([key, value], columnIndex) => {
//           if (columnIndex === 0) {
//           }
//           const cell = sheet.cell(rowIndex + 3, columnIndex + 1);
//           cell.value(value === "" ? "-" : value);

//           cell.style({
//             border: true,
//             borderColor: "000000",
//             fontSize: 8,
//             horizontalAlignment: "center",
//           });

//           sheet.column(columnIndex + 1).style({ wrapText: true });
//           const cellHeight = Math.ceil((value.toString().length * 7) / 4);
//           const currentHeight = rowRange.height();
//           if (cellHeight > currentHeight) {
//             rowRange.height(cellHeight);
//           }

//           if (key === "SC") {
//             const cellValue = Number(value);
//             switch (cellValue) {
//               case 1:
//                 rowRange.style({ fontColor: "3e9431" }); // Green
//                 break;
//               case 2:
//                 rowRange.style({ fontColor: "ec9927" }); // Yellow
//                 break;
//               case 3:
//                 rowRange.style({ fontColor: "FF0000" }); // Red
//                 break;
//             }
//           }

//           if (
//             key === "A/C Tail" &&
//             value ===
//               "Min value & Max value columns stand reversed in cases of negative numbers."
//           ) {
//             sheet
//               .range(
//                 rowIndex + 3,
//                 columnIndex + 1,
//                 rowIndex + 3,
//                 columnIndex + numColumns
//               )
//               .merged(true);

//             const rowRange = sheet.range(
//               rowIndex + 3,
//               columnIndex + 1,
//               rowIndex + 3,
//               columnIndex + numColumns
//             );

//             rowRange.style({
//               border: true,
//               borderColor: "000000",
//               // fontSize: 7,
//               horizontalAlignment: "center",
//             });
//           }
//         });
//       });

//       const numColumns1 = payload.length + 2;

//       sheet.range(1, 1, 1, numColumns1).merged(true).style({
//         horizontalAlignment: "center",
//         verticalAlignment: "center",
//         border: true,
//         fontSize: 16,
//         borderColor: "000000",
//         fontColor: "c96f0e",
//       });
//       sheet.cell(1, 1).value(top);

//       sheet.usedRange().style({
//         bold: true,
//         // fontSize: 7,
//         // fill: { type: "solid", color: "ffffff" },
//         horizontalAlignment: "center",
//         verticalAlignment: "center",
//       });

//       return workbook.toFileAsync(`./public/uploads/${data.fileName}.xlsx`);
//     })
//     .then(() => {
//       console.log("Excel file created successfully.");
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//     });
// }


module.exports = { get, createFile };
