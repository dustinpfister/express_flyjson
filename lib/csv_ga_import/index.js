
let fs = require('fs-extra'),
klaw = require('klaw'),
through2 = require('through2'),
path = require('path'),
csv = require('csvtojson');

// Find out a report type by given CSV Path
let findReportType = function (csvPath) {

    return csv().fromFile(csvPath)

    /*
    return csv().fromFile(csvPath).then((rows) => {

    let i = 0,
    reportType = 'none',
    len = rows.length;
    while (i < len) {

    let row = rows[i],
    keys = Object.keys(row);

    // if day index
    if (row[keys[0]].toLowerCase() === 'day index') {

    // if users then the type is users
    if (row[keys[1]].toLowerCase() === 'users') {

    reportType = 'users';
    break;

    }

    }

    i += 1;

    }

    return reportType;

    });
     */

};

let buildFiles = function (options) {

    return new Promise((resolve, reject) => {

        klaw(options.dir_csv)

        .pipe(through2.obj((item, enc, next) => {

                if (!item.stats.isDirectory()) {
                    this.push(item);
                }

                next();

            }));

        .on('data', (item) => {

            console.log(item);

        })

        .on('end', () => {

            resolve();

        })

    });

    /*
    let index = 0,
    len = obj.files.length,

    // tick file index
    tick = function () {

    index += 1;
    return index < len;

    },

    // read each file
    readFiles = function () {

    return new Promise((resolve, reject) => {

    console.log(obj.files[index]);

    let csvPath = path.join(obj.dir_csv, obj.files[index]);

    findReportType(csvPath).then((reportType) => {

    console.log(reportType);


    if (tick()) {

    readFiles();

    } else {

    resolve();

    }

    }).catch ((e) => {

    reject(e.message);

    });

    });

    };

    return readFiles();
     */

};

let checkCSV = (options) => {

    // ensure csv folder
    return fs.ensureDir(options.dir_csv).then(() => {

        // ensure db folder
        return fs.ensureDir(options.dir_db);

    }).then(() => {

        return buildFiles(options);

    });

    /*
    // ensure csv folder
    return fs.ensureDir(options.dir_csv).then(() => {

    // ensure db folder
    return fs.ensureDir(options.dir_db);

    }).then(() => {

    // read csv folder
    return fs.readdir(options.dir_csv);

    }).then((files) => {

    options.files = files;
    return buildFiles(options);

    });
     */

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
