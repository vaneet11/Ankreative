"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");
const XLSX = require("xlsx");
const moment = require("moment");
const { get, createFile } = require("../../../app");
/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  find: (ctx) => {
    return strapi
      .query("reports")
      .find(ctx.query, [
        "report_file",
        "uploader",
        "aircraft_file.file",
        "aircraft_file",
        "aircraft_file.aircraft",
      ]);
  },
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      const index = files.report_file.findIndex((file) =>
        file.name.includes(".xlsx")
      );
      if (index == null || index == undefined) {
        throw new Error(".xlsx report is required!");
      }
      const workbook = XLSX.readFile(files.report_file[index].path);
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
      data.meta = meta;
      let str = files.report_file[index].name.split(" ").splice(-3).join(" ");
      data.file_date = moment(str.split(".")[0], "Do MMMM YYYY").toDate();

      entity = await strapi.services.reports.create(data, { files });
    } else {
      throw new Error("file is needed!");
    }
    return sanitizeEntity(entity, { model: strapi.models.reports });
  },
  getProducts: async (ctx) => {
    let data = await get(ctx.request.body.id);
    ctx.send(data);
  },
  async getSheet(ctx) {
    let data = createFile(ctx.request.body);
    let payload = ctx.request.body.payload;
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
    if (payload && payload.length > 0) {
      payload.map((item) => {
        if (item.SC === "1" || item.SC === "2" || item.SC === "3") {
          let index = meta.sc.findIndex((ele) => ele.name == item.SC);
          meta.sc[index]["value"] += 1;
        }
        if (item["Event Name"]) {
          let index = meta.event.findIndex(
            (ele) => ele.name === item["Event Name"]
          );
          if (index === -1) {
            meta.event.push({ name: item["Event Name"], value: 1 });
          } else {
            meta.event[index]["value"] += 1;
          }
        }
        if (item["Flight Phase"]) {
          let index = meta.phase.findIndex(
            (ele) => ele.name === item["Flight Phase"]
          );
          if (index === -1) {
            meta.phase.push({ name: item["Flight Phase"], value: 1 });
          } else {
            meta.phase[index]["value"] += 1;
          }
        }
      });
    }
    const updatedField = {
      meta: meta,
    };

    await strapi.services.reports.update(
      { id: ctx.request.body.reportID },
      updatedField
    );

    ctx.send(data);
  },
};
