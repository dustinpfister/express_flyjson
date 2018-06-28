
let fs = require('fs-extra'),
klaw = require('klaw'),
through2 = require('through2'),
path = require('path'),
FileAsync = require('lowdb/adapters/FileAsync'),
low = require('lowdb'),
csv = require('csvtojson');

// Find out a report type by given CSV Path
let findReportType = function (options, csvPath) {

    return csv().fromFile(csvPath).then((data) => {

        return new Promise((resolve, reject) => {

            let typeIndex = 0,
            typeLen = options.types.length,
            type;

            outer: while (typeIndex < typeLen) {

                type = options.types[typeIndex];

                let dataI = 0,
                headerCount = 0;
                dataLen = data.length;
                while (dataI < dataLen) {

                    let row = data[dataI];

                    type.csvHeaders.forEach((header, i) => {

                        let cell = row[Object.keys(row)[i]];

                        if (cell === header) {

                            headerCount += 1;

                            if (headerCount === type.csvHeaders.length) {

                                // then resolve with the know type
                                resolve({
                                    reportType: type.reportType,
                                    headerIndex: dataI
                                });

                            }

                        }

                    });

                    dataI += 1;

                }

                typeIndex += 1;

            }

            // reject the unknown type
            reject('type not found');

        });

    });

};

// this should be used after the type has been found
// it will create db.json if it is not there
// if it is there it will be updated
let cvsToJson = function (options, item) {

    let adapt = new FileAsync(path.join(options.dir_db, 'db.json'));

    return low(adapt).then((db) => {

        // ensure default db state of empty days array
        return db.defaults({
            days: []
        }).write();

    }).then((db) => {

        // get the data from csv
        return csv().fromFile(item.path).then((data) => {

            //console.log(data);

        });

    });

};

// build the files
let buildFiles = function (options) {

    return new Promise((resolve, reject) => {

        klaw(options.dir_csv)

        // filter dirs
        .pipe(through2.obj(function (item, enc, next) {

                if (!item.stats.isDirectory()) {
                    this.push(item);
                }

                next();
            }))

        // find type
        .pipe(through2.obj(function (item, enc, next) {

                findReportType(options, item.path).then((res) => {

                    item.reportType = res.reportType;
                    item.headerIndex = res.headerIndex;

                    this.push(item);
                    next();

                }).catch ((e) => {

                    console.log(e.message);
                    next();

                });
            }))

        // create or update json
        /*
        .pipe(through2.obj(function (item, enc, next) {

        cvsToJson(options, item).then(() => {



        next();

        }).catch ((e) => {

        cosnole.log(e.message);
        next();

        });

        }))
         */

        .on('data', (item) => {

            console.log(item);

            cvsToJson(options, item).then(() => {}).catch ((e) => {

                cosnole.log(e.message);

            });

        })

        .on('error', (e, item) => {

            reject(e.message);

        })

        .on('end', () => {

            resolve();

        })

    });

};

// start the process
let checkCSV = (options) => {

    // ensure csv folder
    return fs.ensureDir(options.dir_csv).then(() => {

        // ensure db folder
        return fs.ensureDir(options.dir_db);

    }).then(() => {

        return buildFiles(options);

    });

};

module.exports = (options) => {

    // these should be set in the main app.js
    options.dir_db = options.dir_db || 'db';
    options.dir_csv = options.dir_csv || 'csv';
    options.types = options.types || [

            // type 'day-users'
            {
                reportType: 'day-users', // name of the report type
                csvHeaders: ['Day Index', 'Users'], // the headers in csv that must be present

                // set data in json by matching 'Day Index' in csv to 'date' in json
                setBy: {
                    csv: 'Day Index',
                    json: 'date'
                },

                // map what headers to what
                map: [{
                        csv: 'Day Index',
                        json: 'date'
                    }, {
                        csv: 'Users',
                        json: 'users'
                    }
                ]

            }
        ];

    return checkCSV(options);

};
