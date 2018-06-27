
let fs = require('fs-extra');

let checkCSV = (options) => {

    // ensure csv folder
    return fs.ensureDir(options.dir_csv).then(() => {

        // ensure db folder
        return fs.ensureDir(options.dir_db);

    }).then(() => {

        return fs.readdir(options.dir_csv);

    });

};

module.exports = (options) => {

    // these should be set in the main app.js
    options.dir_db = options.dir_db || 'db';
    options.dir_csv = options.dir_csv || 'csv';

    return checkCSV(options);

};
