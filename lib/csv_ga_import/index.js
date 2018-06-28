
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
                                    headerIndex: dataI,
                                    typeIndex: typeIndex
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
// it will create options.filename if it is not there
// if it is there it will be updated
let cvsToJson = function (options, item) {

    let adapt = new FileAsync(path.join(options.dir_db, options.filename + '.json')),
    type = options.types[item.typeIndex];

    return low(adapt).then((db) => {

        // ensure default db state of empty days array
        return db.defaults({
            days: []

        }).write().then(function () {

            // return the db (not the value)
            return db;

        })

    }).then((db) => {

        // get the data from csv
        return csv().fromFile(item.path).then((data) => {

            return new Promise((resolve, reject) => {

                let rowI = item.headerIndex + 1,
                rowLen = data.length,
                row,
                days = [],
                cell;

                rowLoop: while (rowI < rowLen) {

                    row = data[rowI];

                    let headerI = 0,
                    obj = {}, // the object to use in json
                    headerLen = type.csvHeaders.length;
                    while (headerI < headerLen) {

                        let cell = row[Object.keys(row)[headerI]],
                        cellTest = type.cellTest[headerI];

                        if (cellTest) {

                            if (cellTest(cell)) {

                                obj[type.map[headerI]] = cell;

                            } else {

                                // continue with next row if test fails
                                rowI += 1;
                                continue rowLoop;

                            }

                        } else {

                            // just copy it then
                            obj[type.map[headerI]] = cell;

                        }

                        headerI += 1;
                    }

                    days.push(obj);

                    rowI += 1;
                }

                // resolve with days
                resolve(days);

            });

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
                    item.typeIndex = res.typeIndex;

                    this.push(item);
                    next();

                }).catch ((e) => {

                    console.log(e.message);
                    next();

                });
            }))

        .pipe(through2.obj(function (item, enc, next) {

                console.log(item);

                cvsToJson(options, item).then((days) => {

                    let dIndex = 0,
                    dLen = days.length,
                    adapt = new FileAsync(path.join(options.dir_db, options.filename + '.json')),
                    type = options.types[item.typeIndex];

                    low(adapt).then(function (db) {

                        let nextDay = function () {

                            dIndex += 1;
                            if (dIndex === dLen) {

                                next();

                            } else {

                                writeDay();

                            }

                        };

                        let writeDay = function () {

                            let query = {},
                            obj = days[dIndex];

                            query[type.setBy] = obj[type.setBy];

                            if (type.forObj) {

                                type.forObj.call(obj);

                            }

                            if (db.get('days').find(query).value()) {

                                db.get('days').find(query).assign(obj).write().then(function () {

                                    console.log('updated record for ' + obj[type.setBy]);

                                    nextDay();

                                });

                            } else {

                                db.get('days').push(obj).write().then(function () {

                                    console.log('new record for ' + obj[type.setBy]);

                                    nextDay();

                                });
                            }

                        };

                        writeDay();

                    });

                }).catch ((e) => {

                    console.log(e.message);
                    next();

                });

            }))

        .on('data', (item) => {})

        .on('error', (e, item) => {

            reject(e.message);

        })

        .on('end', () => {

            //console.log();

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
    options.filename = options.filename || 'db';
    options.types = options.types || [

            // type 'day-users'
            {
                reportType: 'day-users', // name of the report type
                csvHeaders: ['Day Index', 'Users'], // the headers in csv that must be present

                // set data in json by the maped value
                setBy: 'date',

                // map what headers to what (corresponds with csvHeaders)
                map: ['date', 'users'],

                // test the sanity of cells (corresponds with csvHeaders)
                cellTest: [

                    // 'Day Index' cell data should follow this pattern
                    function (cell) {

                        return !!cell.match(/\d+\/\d+\/\d+/);

                    },

                    // users cell should be a Number greater than or equal to zero
                    function (cell) {

                        return Number(cell) >= 0;

                    }

                ],

                forObj: function () {

                    let str = this.date.split('/');

                    this.timeStamp = new Date('20' + str[2], str[0] - 1, str[1]);

                    if (!this.pages) {

                        this.pages = [];

                    }

                }

            }
        ];

    return checkCSV(options);

};
