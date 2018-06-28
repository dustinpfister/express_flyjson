
let fs = require('fs-extra'),
klaw = require('klaw'),
through2 = require('through2'),
path = require('path'),
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
                                resolve(type.reportType);

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

                findReportType(options, item.path).then((reportType) => {

                    item.reportType = reportType;

                    this.push(item);
                    next();

                }).catch ((e) => {

                    console.log(e.message);
                    next();

                });
            }))

        .on('data', (item) => {

            console.log(item);

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
