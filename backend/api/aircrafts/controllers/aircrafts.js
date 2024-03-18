'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */



module.exports = {
    find: async (ctx) => {
        var aircrafts = await strapi
            .query("aircrafts")
            .find(ctx.query, [
                "name",
                "aircraft_type",
                "meta",
                "aircraft_serial_number",
                "aicraft_image"
            ]);

        // Using Promise.all() to wait for all async operations to complete
        let result = await Promise.all(aircrafts.map(async (item) => {
            const meta = await strapi
                .query("reports")
                .findOne({
                    _where: {
                        'aircraft_file.aircraft.id': item.id
                    }
                }, [
                    "report_file",
                    "uploader",
                    "aircraft_file.file",
                    "aircraft_file",
                    "aircraft_file.aircraft",
                ])
            let healthStatus = 0
            if (meta) {
                meta.meta.sc.map(ele => {
                    if (ele.value > 0 && healthStatus < Number(ele.name)) {
                        healthStatus = Number(ele.name)
                    }
                })
            }
            return {
                ...item,
                healthStatus: healthStatus
            };
        }));
        return result
    },
};

