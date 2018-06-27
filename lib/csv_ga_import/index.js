
let fs = require('fs-extra'),
path = require('path'),
csv = require('csvtojson');

// find the report type of the csv file
let findReportType = function (csvPath) {

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

};

let buildFiles = function (obj) {

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

                //csvToJson(csvPath).then((json) => {

                //return fs.writeFile(path.join(obj.dir_json, path.basename(obj.files[index], '.csv') + '.json'), json);

                //return printJSON(json);

                //}).then(() => {

                //console.log(json);

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

};

let checkCSV = (options) => {

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

};

module.exports = (options) => {

    // these should be set in the main app.js
    options.dir_db = options.dir_db || 'db';
    options.dir_csv = options.dir_csv || 'csv';

    return checkCSV(options);

};
